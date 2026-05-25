
# Outventura Backend

API REST per a la gestió d'activitats d'aventura i lloguer de material esportiu, desenvolupada amb **NestJS**, **Prisma** i **PostgreSQL**.

---
<br>

## 📋 Descripció

Outventura és el backend d'una aplicació mòbil (Flutter) orientada a organitzar excursions i activitats d'aventura, així com al lloguer de material esportiu. Permet la gestió centralitzada d'usuaris, guies, activitats, material i reserves amb un sistema complet d'autenticació JWT i autorització per rols.

---
<br>

## 🛠️ Tecnologies

- **Node.js** >= 18 (recomanat 20 LTS)
- **NestJS** — Framework modular amb TypeScript natiu
- **Prisma ORM** — Migracions robustes i tipat automàtic
- **PostgreSQL** >= 14 — Base de dades relacional
- **TypeScript** — Tipat estàtic en tot el projecte
- **JWT + Passport** — Autenticació stateless
- **Swagger** — Documentació interactiva de l'API
- **@nestjs/schedule** — Cron Job per a canvis d'estat automàtics

---
<br>

## 🚀 Instal·lació i ús

### Requisits previs

- Node.js >= 18 (recomanat 20 LTS)
- npm >= 9
- PostgreSQL >= 14

### 1. Clonar el repositori

```bash
git clone https://github.com/adminoutventura-dot/Outventura-Backend.git
cd Outventura-Backend
git checkout develop
```

### 2. Instal·lar dependències

```bash
npm install
```

### 3. Configurar les variables d'entorn

Crear un fitxer `.env` a l'arrel del projecte:

```env
DATABASE_URL="postgresql://USUARI:CONTRASENYA@localhost:5432/outventura_db"
JWT_SECRET="el_teu_secret_jwt_segur"
PORT=3000
MAINTENANCE_MODE=false
```

Crear la base de dades manualment:

```bash
createdb outventura_db
```

O des de psql:

```sql
CREATE DATABASE outventura_db;
```

### 4. Generar el Prisma Client

```bash
npx prisma generate
```

### 5. Executar les migracions

```bash
npx prisma migrate dev
```

### 6. Executar el seeder

```bash
npx prisma db seed
```

Usuaris de prova creats:

| Rol   | Email                   | Contrasenya |
|-------|-------------------------|-------------|
| SUPER | <carolina@superadmin.com> | superadmin  |
| SUPER | <miriam@superadmin.com>   | superadmin  |
| ADMIN | <paco@admin.com>          | adminadmin  |
| GUIDE | <carlos@guide.com>        | guideguide  |
| GUIDE | <sandra@guide.com>        | guideguide  |
| USER  | <lola@user.com>           | useruser    |
| USER  | <marc@user.com>           | useruser    |

### 7. Arrancar el servidor

```bash
# Desenvolupament (amb hot reload)
npm run start:dev

# Mode normal
npm run start

# Producció
npm run build
npm run start:prod
```

### 8. Accedir al Swagger

```
http://localhost:3000/api
```

Per provar endpoints protegits:

1. Fer `POST /auth/login` amb les credencials d'un usuari de prova
2. Copiar el camp `access_token` de la resposta
3. Clicar **Authorize** al Swagger i enganxar el token

### 9. Visualitzar la base de dades (opcional)

```bash
npx prisma studio
```

Obre una interfície visual a `http://localhost:5555` per explorar les dades.

---
<br>

## 🔐 Rols del sistema

| Rol   | Accés |
|-------|-------|
| GUEST | Consulta del catàleg públic |
| USER  | Reserves i perfil propi |
| GUIDE | Gestió de les seves activitats |
| ADMIN | Gestió general del sistema |
| SUPER | Accés i control total |

---
<br>

## 📁 Estructura del projecte

```
src/
├── auth/             # JWT, Guards, Decoradors, Estratègies
├── user/             # Gestió d'usuaris
├── role/             # Gestió de rols
├── guide/            # Perfils de guia
├── category/         # Categories
├── equipment/        # Material d'alquiler
├── equipment-status/ # Estats del material
├── activity/         # Excursions
├── booking/          # Reserves (capçalera)
├── booking-line/     # Reserves (detall)
├── booking-status/   # Estats de reserva
├── middleware/       # 4 middlewares globals
└── prisma/           # Servei de BD

prisma/
├── schema.prisma     # Model de dades
└── seed.ts           # Dades inicials
```

---
<br>

## 🔧 Mode manteniment

Per activar el mode manteniment sense aturar el servidor, canvia al `.env`:

```env
MAINTENANCE_MODE=true
```

Totes les peticions retornaran `503 Service Unavailable`.

---
<br>

## 📄 Llicència

Projecte acadèmic — DAM 2025/2026. Basat en NestJS (MIT License).

```
