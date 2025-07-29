# Dockerfile pour le service Python de documentation GitShadow
FROM python:3.11-slim

# Définir les variables d'environnement
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONPATH=/app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY requirements-minimal.txt requirements.txt

# Installer les dépendances Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .
COPY main-simple.py main.py

# Créer un utilisateur non-root
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# Exposer le port
EXPOSE 3002

# Commande de démarrage
CMD ["uvicorn", "main-simple:app", "--host", "0.0.0.0", "--port", "3002", "--workers", "1"] 