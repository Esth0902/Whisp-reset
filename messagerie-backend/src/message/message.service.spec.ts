import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

type MockPrisma = {
  user: {
    findUnique: jest.Mock;
  };
  conversation: {
    findFirst: jest.Mock;
    create: jest.Mock;
  };
  message: {
    create: jest.Mock;
  };
  notification: {
    create: jest.Mock;
  };
  conversationUser: {
    findMany: jest.Mock;
  };
};

type MockRealtime = {
  notifyUser: jest.Mock;
};

describe('MessageService', () => {
  let service: MessageService;
  let prisma: MockPrisma;
  let realtime: MockRealtime;

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      conversation: { findFirst: jest.fn(), create: jest.fn() },
      message: { create: jest.fn() },
      notification: { create: jest.fn() },
      conversationUser: { findMany: jest.fn() },
    };

    realtime = {
      notifyUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: PrismaService, useValue: prisma },
        { provide: RealtimeGateway, useValue: realtime },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  it('envoie une erreur si l’auteur est introuvable', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(
        service.sendMessage('fakeClerk', { content: 'Hello!' }),
    ).rejects.toThrow('Utilisateur non trouvé');
  });

  it('envoyer un message dans une conversation existante', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: '1', clerkId: 'author' });
    prisma.conversation.findFirst.mockResolvedValueOnce({ id: 'conv1' });
    prisma.message.create.mockResolvedValueOnce({
      id: 'msg1',
      content: 'Hello!',
      author: { name: 'Alice', clerkId: 'author' },
    });
    prisma.conversationUser.findMany.mockResolvedValueOnce([
      { user: { id: '2', clerkId: 'friend', name: 'Bob' } },
    ]);

    const result = await service.sendMessage('author', {
      content: 'Hello!',
      recipientId: 'friend',
    });

    expect(result).toEqual({
      id: 'msg1',
      content: 'Hello!',
      author: { name: 'Alice', clerkId: 'author' },
    });

    expect(prisma.message.create).toHaveBeenCalled();
    expect(realtime.notifyUser).toHaveBeenCalledWith(
        'friend',
        'message.new',
        expect.objectContaining({
          fromClerkId: 'author',
          content: 'Hello!',
        }),
    );
  });
});
