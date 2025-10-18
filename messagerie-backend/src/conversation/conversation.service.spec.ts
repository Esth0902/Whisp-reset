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
});