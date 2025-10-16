import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

describe('MessageService', () => {
  let service: MessageService;
  let prisma: PrismaService;

  const mockRealtimeGateway = {
    handleNewMessage: jest.fn(), // mock d'une méthode fictive si elle est appelée
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        PrismaService,
        { provide: RealtimeGateway, useValue: mockRealtimeGateway }, // ✅ ajout important
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
