# Projecte NestJS + Prisma

Aquest projecte utilitza el framework NestJS per al desenvolupament del backend i Prisma com ORM per a la gestió de la base de dades.

--------------------------------------------------
Tecnologies principals
--------------------------------------------------
- Node.js
- NestJS
- Prisma ORM
- PostgreSQL
- TypeScript

--------------------------------------------------
Instal·lació
--------------------------------------------------
Instal·lar dependències:

    npm install

--------------------------------------------------
Prisma
--------------------------------------------------
El projecte utilitza Prisma per a definir el model de dades i gestionar les migracions.

Comandes principals:

- Generar Prisma Client:

    npx prisma generate

- Executar migracions:

    npx prisma migrate dev

- Obrir Prisma Studio (visualitzar la base de dades):

    npx prisma studio

Els models es definixen en el fitxer:

    prisma/schema.prisma

--------------------------------------------------
Execució del projecte
--------------------------------------------------
Mode desenvolupament:

    npm run start:dev

Mode normal:

    npm run start

Mode producció:

    npm run start:prod

--------------------------------------------------
Tests
--------------------------------------------------
Tests unitaris:

    npm run test

Tests e2e:

    npm run test:e2e

Cobertura:

    npm run test:cov

--------------------------------------------------
Estructura bàsica del projecte
--------------------------------------------------
    src/
      app.module.ts
      ...
    prisma/
      schema.prisma

--------------------------------------------------
Llicència
--------------------------------------------------
Projecte basat en NestJS (MIT License).
