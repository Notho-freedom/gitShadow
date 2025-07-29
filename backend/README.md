# 🏗️ Architecture Backend GitShadow

## 📋 Vue d'Ensemble

Cette architecture backend est conçue pour gérer la génération de documentation pour **25+ langages** de programmation avec une approche microservices.

## 🎯 Services par Langage

### **1. Service Python (Port 3002)**
**Langages supportés :** Python, Django, Flask, NumPy, Pandas
**Technologies :** FastAPI, Pydantic, ast-parser
**Avantages :**
- Parsing AST natif Python
- Excellent pour l'IA/ML
- Analyse de dépendances

### **2. Service JavaScript/TypeScript (Port 3004)**
**Langages supportés :** JS, TS, React, Vue, Angular, Node.js
**Technologies :** Node.js, TypeScript, Babel, ESLint
**Avantages :**
- Écosystème riche
- Parsing natif
- Support des frameworks modernes

### **3. Service Java (Port 3003)**
**Langages supportés :** Java, Kotlin, Android
**Technologies :** Spring Boot, JavaParser, ANTLR
**Avantages :**
- Parsing robuste
- Support enterprise
- Outils matures

### **4. Service C/C++/Rust (Port 3005)**
**Langages supportés :** C, C++, Rust, Go
**Technologies :** Rust, Actix-web, tree-sitter
**Avantages :**
- Performance maximale
- Sécurité mémoire
- Parsing précis

### **5. Service Web (Port 3006)**
**Langages supportés :** HTML, CSS, SCSS, Vue.js, Svelte
**Technologies :** Node.js, Cheerio, PostCSS
**Avantages :**
- Parsing DOM
- Génération HTML
- Support des frameworks frontend

## 🤖 Services Spécialisés

### **Service IA/ML (Port 3007)**
- Analyse sémantique du code
- Suggestions intelligentes
- Génération de documentation avancée
- Technologies : Python, FastAPI, TensorFlow/PyTorch

### **Service Analytics (Port 3008)**
- Métriques de performance
- Analyse d'usage
- Rapports de qualité
- Technologies : Node.js, InfluxDB

## 🚀 Démarrage Rapide

```bash
# Cloner le projet
git clone <repository>
cd gitshadow/backend

# Démarrer tous les services
docker-compose -f docker-compose.backend.yml up -d

# Vérifier les services
docker-compose -f docker-compose.backend.yml ps

# Logs en temps réel
docker-compose -f docker-compose.backend.yml logs -f
```

## 📊 Architecture de Données

### **Base de Données**
- **PostgreSQL :** Données utilisateurs, projets, métadonnées
- **Redis :** Cache, sessions, file d'attente
- **InfluxDB :** Métriques, analytics, performance

### **API Endpoints**
```
POST /api/v1/docs/generate
GET  /api/v1/docs/{id}
PUT  /api/v1/docs/{id}
DELETE /api/v1/docs/{id}
GET  /api/v1/analytics/usage
```

## 🔧 Configuration par Service

### **Variables d'Environnement**
```env
# API Gateway
GATEWAY_PORT=3001
GATEWAY_SECRET=your-secret-key

# Services
PYTHON_SERVICE_URL=http://python-service:3002
JS_SERVICE_URL=http://js-service:3004
JAVA_SERVICE_URL=http://java-service:3003
RUST_SERVICE_URL=http://rust-service:3005
WEB_SERVICE_URL=http://web-service:3006

# Base de données
POSTGRES_URL=postgresql://gitshadow:gitshadow123@postgres:5432/gitshadow
REDIS_URL=redis://redis:6379
INFLUXDB_URL=http://influxdb:8086
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests de performance
npm run test:performance

# Tests de charge
npm run test:load
```

## 📈 Monitoring

### **Métriques Collectées**
- Temps de réponse par service
- Taux d'erreur
- Utilisation CPU/Mémoire
- Nombre de requêtes par langage
- Qualité de la documentation générée

### **Alertes**
- Service down
- Temps de réponse > 5s
- Taux d'erreur > 5%
- Utilisation mémoire > 80%

## 🔒 Sécurité

### **Authentification**
- JWT tokens
- Rate limiting
- API keys par service

### **Validation**
- Input sanitization
- Schema validation
- Code injection protection

## 🚀 Déploiement

### **Production**
```bash
# Build des images
docker-compose -f docker-compose.backend.yml build

# Déploiement
docker-compose -f docker-compose.backend.yml up -d

# Migration base de données
npm run migrate:prod
```

### **Staging**
```bash
# Environnement de test
docker-compose -f docker-compose.backend.yml -f docker-compose.staging.yml up -d
```

## 📚 Documentation API

### **Swagger/OpenAPI**
- Documentation interactive
- Tests d'API
- Exemples de requêtes

### **Postman Collections**
- Collections par service
- Variables d'environnement
- Tests automatisés

## 🔄 CI/CD

### **Pipeline GitHub Actions**
1. Tests unitaires
2. Tests d'intégration
3. Build des images Docker
4. Déploiement staging
5. Tests de régression
6. Déploiement production

## 📞 Support

### **Logs Centralisés**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Monitoring temps réel
- Alertes automatiques

### **Documentation**
- Architecture détaillée
- Guides de développement
- Troubleshooting 