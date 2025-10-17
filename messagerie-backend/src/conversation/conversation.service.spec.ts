import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

interface MockPrisma {
  user: {
    findUnique: jest.Mock<Promise<{ id: string; clerkId: string } | null>, [any]>;
    findMany: jest.Mock<Promise<Array<{ id: string; clerkId: string }>>, [any]>;
  };
  conversation: {
    findMany: jest.Mock<Promise<any[]>, [any]>;
    create: jest.Mock<Promise<{ id: string; title: string | null }>, [any]>;
  };
}

describe('ConversationService', () => {
  let service: ConversationService;
  let prisma: MockPrisma;

  beforeEach(async () => {
    const mockPrisma: MockPrisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      conversation: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
    prisma = mockPrisma;
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  it('affiche un UnauthorizedException si admin introuvable', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(
        service.createConversation('adminClerk', ['friendClerk']),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('crée une conversation avec admin et ami', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: '1', clerkId: 'adminClerk' });
    prisma.user.findMany.mockResolvedValueOnce([{ id: '2', clerkId: 'friendClerk' }]);
    prisma.conversation.findMany.mockResolvedValueOnce([]);
    prisma.conversation.create.mockResolvedValueOnce({
      id: 'conv1',
      title: 'Nouvelle conversation',
    });

    const result: { id: string; title: string | null } = await service.createConversation(
        'adminClerk',
        ['friendClerk'],
    );

    expect(result).toEqual({ id: 'conv1', title: 'Nouvelle conversation' });

    expect(prisma.conversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Nouvelle conversation',
            users: {
              create: [
                { userId: '1', role: 'admin' },
                { userId: '2', role: 'member' },
              ],
            },
          }),
        }),
    );
  });
});