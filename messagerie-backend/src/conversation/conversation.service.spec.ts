import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

describe('ConversationService', () => {
  let service: ConversationService;


  const mockPrisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: '1', clerkId: 'adminClerk' }),
      findMany: jest.fn().mockResolvedValue([{ id: '2', clerkId: 'friendClerk' }]),
    },
    conversation: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'conv1', title: 'Nouvelle conversation' }),
    },
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  it('affiche un UnauthorizedException si admin introuvable', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(
        service.createConversation('adminClerk', ['friendClerk']),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('crée une conversation avec admin et ami', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: '1', clerkId: 'adminClerk' });
    mockPrisma.user.findMany.mockResolvedValueOnce([{ id: '2', clerkId: 'friendClerk' }]);
    mockPrisma.conversation.findMany.mockResolvedValueOnce([]);
    mockPrisma.conversation.create.mockResolvedValueOnce({
      id: 'conv1',
      title: 'Nouvelle conversation',
    });



    const result: { id: string; title: string | null } = await service.createConversation(
        'adminClerk',
        ['friendClerk'],
    );
    expect(result).toEqual({ id: 'conv1', title: 'Nouvelle conversation' });


    expect(mockPrisma.conversation.create).toHaveBeenCalledWith(
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