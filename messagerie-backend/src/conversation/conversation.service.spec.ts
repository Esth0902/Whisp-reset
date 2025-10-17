import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('ConversationService', () => {
  let service: ConversationService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = {
      user: { findUnique: jest.fn(), findMany: jest.fn() },
      conversation: { findMany: jest.fn(), create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('doit afficher un UnauthorizedException si admin introuvable', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(service.createConversation('adminClerk', ['friendClerk']))
        .rejects.toThrow(UnauthorizedException);
  });

  it('crée une conversation avec admin et ami', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: '1', clerkId: 'adminClerk' });
    prisma.user.findMany.mockResolvedValueOnce([{ id: '2', clerkId: 'friendClerk' }]);
    prisma.conversation.findMany.mockResolvedValueOnce([]);
    prisma.conversation.create.mockResolvedValueOnce({ id: 'conv1', title: 'Nouvelle conversation' });

    const result = await service.createConversation('adminClerk', ['friendClerk']);

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
