# Dockerfile pour gitShadow - Générateur de Documentation IA
# Multi-stage build pour optimiser la taille de l'image

# Stage 1: Build de l'application
FROM node:18-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app


# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production=false

# Copier le code source
COPY . .

# Build de l'application Next.js
RUN npm run build

# Stage 2: Image de production
FROM node:18-alpine AS runner

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers nécessaires depuis le stage de build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Changer la propriété des fichiers
RUN chown -R nextjs:nodejs /app

# Passer à l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 3000

# Variable d'environnement pour le port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Commande de démarrage
CMD ["node", "server.js"] 