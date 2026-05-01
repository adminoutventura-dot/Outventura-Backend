import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

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
    .setDescription('API per a la gestió d\'activitats i material de l\'app Outventura')
    .setVersion('1.0')
    .addTag('Auth', 'Accés i seguretat')
    .addTag('Roles (for User Management)', 'Rols i permisos')
    .addTag('Users', 'Usuaris del sistema')
    .addTag('Categories', 'Categories d\'activitats i material')
    .addTag('Activities', 'Catàleg d\'activitats')
    .addTag('Equipment', 'Inventari de material')
    .addTag('Equipment Status', 'Estat del material')
    // .addBearerAuth()
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