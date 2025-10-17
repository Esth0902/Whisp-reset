import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

describe('MessageService', () => {
  let service: MessageService;
  let prisma: any;
  let realtime: jest.Mocked<RealtimeGateway>;

  beforeEach(async () => {
    const mockPrisma = {
      user: { findUnique: jest.fn() },
      conversation: { findFirst: jest.fn(), create: jest.fn() },
      message: { create: jest.fn() },
      conversationUser: { findMany: jest.fn() },
      notification: { create: jest.fn() },
    } as any;

    const mockRealtime = { notifyUser: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RealtimeGateway, useValue: mockRealtime },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    prisma = module.get(PrismaService);
    realtime = module.get(RealtimeGateway);
  });

  it('doit afficher une erreur si auteur introuvable', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(
        service.sendMessage('unknownClerk', { content: 'Salut !' }),
    ).rejects.toThrow('Utilisateur non trouvé');
  });

  it('créer un message si tout est valide', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: '1', clerkId: 'userClerk', name: 'Alice' }); // auteur
    prisma.message.create.mockResolvedValueOnce({ id: 'msg1', content: 'Salut !' });
    prisma.conversationUser.findMany.mockResolvedValueOnce([
      { user: { id: '2', clerkId: 'friendClerk', name: 'Bob' } },
    ]);

    const result = await service.sendMessage('userClerk', {
      content: 'Salut !',
      conversationId: 'conv1',
    });

    expect(result).toEqual({ id: 'msg1', content: 'Salut !' });
    expect(prisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: 'Salut !',
            authorId: '1',
            conversationId: 'conv1',
          }),
        }),
    );
    expect(realtime.notifyUser).toHaveBeenCalledWith(
        'friendClerk',
        'message.new',
        expect.any(Object),
    );
  });
});
