import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: ['http://localhost:3000', 'http://192.168.129.60:3000', 'https://whisp-reset.onrender.com/'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Authorization,Content-Type',
        credentials: true,
    });

    await app.listen(4000);
    console.log(`Backend running on http://localhost:4000`);
}
bootstrap();
