# Dockerfile pour l'API Gateway GitShadow Ultra-Robuste
FROM node:18-alpine

# Définir les variables d'environnement
ENV NODE_ENV=production
ENV PORT=3001

# Installer les dépendances système
RUN apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY . .

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Créer les répertoires de logs
RUN mkdir -p /app/logs

# Changer les permissions
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exposer le port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Commande de démarrage avec dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "main.js"] 