FROM node:22-alpine

WORKDIR /app

# 1. Copia los package.json para instalar dependencias
COPY package*.json ./
RUN npm install

# 2. Copia la carpeta prisma y genera el cliente
COPY prisma ./prisma/
RUN npx prisma generate

# 3. Copia todo el código fuente y COMPILA NestJS
COPY . .
RUN npm run build

# NestJS usa el puerto 3000 por defecto
EXPOSE 3000

# 4. Arranca la app en modo producción
CMD ["node", "dist/src/main.js"]