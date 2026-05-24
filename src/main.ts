import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));


  const config = new DocumentBuilder()
    .setTitle('Outventura API')
    .setDescription('API REST per a la gestió d\'activitats d\'aventura i alquiler de material, desenvolupada amb NestJS i Prisma sobre PostgreSQL. Aquesta API permet gestionar usuaris, guies, categories, activitats, material i reserves, amb un sistema de rols i permisos per garantir la seguretat i l\'accés adequat a les diferents funcionalitats del sistema.')
    .setVersion('1.0')
    .addTag('Auth', 'Accés i seguretat')
    .addTag('Roles (for User Management)', 'Rols i permisos')
    .addTag('Users', 'Usuaris del sistema')
    .addTag('Guides', 'Guies del sistema')
    .addTag('Categories', 'Categories d\'activitats i material')
    .addTag('Activities', 'Catàleg d\'activitats')
    .addTag('Equipment', 'Inventari de material')
    .addTag('Equipment Status', 'Estat del material')
    .addTag('Bookings', 'Reserves del sistema')
    .addTag('Booking Status', 'Estat de les reserves')
    .addTag('Booking Lines', 'Línies de les reserves')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Introdueix el token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
    },
  });

  await app.listen(3000);
  console.log(`🚀 API funcionant en: http://localhost:3000/api`);
}
bootstrap();