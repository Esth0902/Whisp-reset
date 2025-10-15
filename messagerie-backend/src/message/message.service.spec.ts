import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MessageService', () => {
  let service: MessageService;
  let prisma: PrismaService;

  const mockPrisma = {
    conversation: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    message: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a message in an existing conversation', async () => {
    mockPrisma.conversation.findFirst.mockResolvedValue({ id: 'conv123' });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user123' });
    mockPrisma.message.create.mockResolvedValue({
      content: 'Hello',
      author: { name: 'Test', clerkId: 'user123' },
    });

    const result = await service.sendMessage('user123', {
      content: 'Hello',
      recipientId: 'user456',
    });

    expect(mockPrisma.conversation.findFirst).toHaveBeenCalled();
    expect(mockPrisma.message.create).toHaveBeenCalled();
    expect(result.content).toBe('Hello');
  });

  it('should create a new conversation if none exists', async () => {
    mockPrisma.conversation.findFirst.mockResolvedValue(null);
    mockPrisma.conversation.create.mockResolvedValue({ id: 'newConv123' });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user123' });
    mockPrisma.message.create.mockResolvedValue({
      content: 'Bonjour',
      author: { name: 'Test', clerkId: 'user123' },
    });

    const result = await service.sendMessage('user123', {
      content: 'Bonjour',
      recipientId: 'user456',
    });

    expect(mockPrisma.conversation.create).toHaveBeenCalled();
    expect(result.content).toBe('Bonjour');
  });

  it('should throw an error if user not found', async () => {
    mockPrisma.conversation.findFirst.mockResolvedValue({ id: 'conv123' });
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
        service.sendMessage('invalidUser', {
          content: 'Test',
          recipientId: 'user456',
        }),
    ).rejects.toThrow('Utilisateur non trouvé');
  });
});