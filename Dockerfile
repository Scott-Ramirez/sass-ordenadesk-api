# ==========================================
# Etapa 1: Construcción (Builder)
# ==========================================
FROM node:20-slim AS builder

WORKDIR /app

# Dependencias del sistema para Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copiar paquetes y schema Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias y generar cliente Prisma
RUN npm install
RUN npx prisma generate

# Copiar código fuente
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Compilar NestJS
RUN npm run build

# Mantener únicamente dependencias de producción
RUN npm prune --omit=dev
RUN npx prisma generate

# ==========================================
# Etapa 2: Producción (Runner)
# ==========================================
FROM node:20-slim AS runner

WORKDIR /app

# OpenSSL para runtime de Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

# Usuario sin privilegios por seguridad
USER node

# Copiar binarios y código compilado
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

EXPOSE 3000

# Comando de inicio de la API
CMD ["node", "dist/src/main.js"]
