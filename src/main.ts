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

    .setDescription(`
#### API REST per a la gestió d'activitats d'aventura i alquiler de material, desenvolupada amb NestJS i Prisma sobre PostgreSQL.

---

#### 📋 Funcionalitats principals

- 👤 **Usuaris i rols**: gestió d'usuaris amb rols SUPER, ADMIN, GUIDE i USER
- 🧭 **Guies**: perfils de guia associats a usuaris
- 🏷️ **Categories**: classificació d'activitats i material
- 🏕️ **Activitats**: excursions i aventures guiades
- 🥾 **Material**: equipament disponible per a lloguer
- 📅 **Reserves**: sistema complet de reserves amb màquina d'estats

---

#### 🔐 Accés a l'API

Alguns endpoints són **públics** i no requereixen autenticació (catàleg d'activitats, material, guies i categories).

Els endpoints protegits requereixen un **Bearer Token JWT**.
Obtén el token a \`POST /auth/login\` i afegeix-lo amb el botó **Authorize** 🔒

| Rol | Accés |
|-----|-------|
| GUEST | Consulta del catàleg públic |
| USER | Reserves i perfil propi |
| GUIDE | Gestió de les seves activitats |
| ADMIN | Gestió general del sistema |
| SUPER | Accés i control total |
`)
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
    .addTag('Activity Log', 'Registre d\'activitat del sistema')
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

  await app.listen(3000, '0.0.0.0');
  console.log(`🚀 API funcionant en: http://localhost:3000/api`);
}
bootstrap();