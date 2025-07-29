#!/usr/bin/env python3
"""
Service Python Ultra-Robuste pour la génération de documentation
Supporte : Python, Django, Flask, NumPy, Pandas, FastAPI, Celery, etc.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
import ast
import asyncio
import logging
import json
import hashlib
import time
from datetime import datetime, timedelta
import uvicorn
from pathlib import Path
import redis
import psycopg2
from psycopg2.extras import RealDictCursor
import structlog
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
import jwt
from functools import wraps
import traceback
import sys
import os

# Configuration du logging structuré
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Métriques Prometheus
REQUEST_COUNT = Counter('documentation_requests_total', 'Total documentation requests', ['endpoint', 'status'])
REQUEST_DURATION = Histogram('documentation_request_duration_seconds', 'Request duration in seconds', ['endpoint'])
ACTIVE_REQUESTS = Gauge('documentation_active_requests', 'Number of active requests')
CACHE_HITS = Counter('documentation_cache_hits_total', 'Total cache hits')
CACHE_MISSES = Counter('documentation_cache_misses_total', 'Total cache misses')

app = FastAPI(
    title="GitShadow Python Documentation Service - Ultra Robust",
    description="Service de génération de documentation avancé pour Python et écosystème Python",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Configuration Redis
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=int(os.getenv('REDIS_DB', 0)),
    decode_responses=True
)

# Configuration PostgreSQL
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('POSTGRES_HOST', 'localhost'),
        database=os.getenv('POSTGRES_DB', 'gitshadow'),
        user=os.getenv('POSTGRES_USER', 'gitshadow'),
        password=os.getenv('POSTGRES_PASSWORD', 'gitshadow123'),
        cursor_factory=RealDictCursor
    )

# Modèles Pydantic avancés
class DocumentationRequest(BaseModel):
    code: str = Field(..., description="Code source à documenter", min_length=1)
    filename: str = Field(..., description="Nom du fichier")
    language: str = Field(default="Python", description="Langage de programmation")
    doc_type: str = Field(default="comprehensive", description="Type de documentation")
    custom_prompt: Optional[str] = Field(None, description="Instructions personnalisées")
    user_id: Optional[str] = Field(None, description="ID de l'utilisateur")
    project_id: Optional[str] = Field(None, description="ID du projet")
    version: Optional[str] = Field(None, description="Version du code")
    include_tests: bool = Field(default=True, description="Inclure les tests dans l'analyse")
    include_dependencies: bool = Field(default=True, description="Analyser les dépendances")
    quality_threshold: float = Field(default=0.8, description="Seuil de qualité minimum")
    
    @validator('doc_type')
    def validate_doc_type(cls, v):
        allowed_types = ['comprehensive', 'minimal', 'api', 'tutorial', 'reference']
        if v not in allowed_types:
            raise ValueError(f'Type de documentation invalide. Types autorisés: {allowed_types}')
        return v

class DocumentationResponse(BaseModel):
    id: str
    documentation: str
    metadata: Dict[str, Any]
    generated_at: datetime
    language: str
    filename: str
    quality_score: float
    cache_hit: bool = False
    processing_time: float
    version: str
    suggestions: List[str]
    warnings: List[str]
    dependencies: List[str]
    test_coverage: Optional[float]

class CodeAnalysis(BaseModel):
    functions: List[Dict[str, Any]]
    classes: List[Dict[str, Any]]
    imports: List[str]
    complexity: Dict[str, Any]
    suggestions: List[str]
    security_issues: List[str]
    performance_issues: List[str]
    maintainability_score: float
    test_coverage: Optional[float]
    dependencies: List[str]
    architecture_patterns: List[str]

class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: datetime
    version: str
    uptime: float
    memory_usage: Dict[str, float]
    cache_status: str
    database_status: str
    supported_languages: List[str]

# Rate limiting
class RateLimiter:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.max_requests = 100
        self.window = 3600  # 1 heure
    
    async def is_allowed(self, user_id: str) -> bool:
        key = f"rate_limit:{user_id}"
        current = await self.redis.incr(key)
        if current == 1:
            await self.redis.expire(key, self.window)
        return current <= self.max_requests

rate_limiter = RateLimiter(redis_client)

# Cache intelligent
class IntelligentCache:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.default_ttl = 3600  # 1 heure
    
    async def get(self, key: str) -> Optional[Dict]:
        try:
            data = await self.redis.get(key)
            if data:
                CACHE_HITS.inc()
                return json.loads(data)
            CACHE_MISSES.inc()
            return None
        except Exception as e:
            logger.error(f"Erreur cache get: {e}")
            return None
    
    async def set(self, key: str, value: Dict, ttl: int = None) -> bool:
        try:
            ttl = ttl or self.default_ttl
            await self.redis.setex(key, ttl, json.dumps(value))
            return True
        except Exception as e:
            logger.error(f"Erreur cache set: {e}")
            return False

cache = IntelligentCache(redis_client)

# Analyseur de code avancé
class AdvancedCodeAnalyzer:
    def __init__(self):
        self.security_patterns = {
            'sql_injection': r'execute\(.*\+.*\)',
            'xss': r'innerHTML.*=.*\+',
            'command_injection': r'os\.system\(.*\+.*\)',
            'path_traversal': r'open\(.*\.\./',
        }
    
    def analyze_security(self, tree: ast.AST) -> List[str]:
        """Analyse de sécurité avancée"""
        issues = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                # Vérifier les appels dangereux
                if hasattr(node.func, 'attr'):
                    if node.func.attr in ['eval', 'exec', 'system']:
                        issues.append(f"Appel dangereux: {node.func.attr}")
        
        return issues
    
    def analyze_performance(self, tree: ast.AST) -> List[str]:
        """Analyse de performance"""
        issues = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.For):
                # Vérifier les boucles inefficaces
                if any(isinstance(n, ast.Call) for n in ast.walk(node)):
                    issues.append("Boucle avec appels de fonction - considérer l'optimisation")
        
        return issues
    
    def calculate_maintainability(self, tree: ast.AST) -> float:
        """Calcul du score de maintenabilité"""
        score = 100.0
        
        # Réduire le score pour la complexité
        complexity = self.calculate_complexity(tree)
        if complexity > 10:
            score -= (complexity - 10) * 2
        
        # Réduire pour les fonctions trop longues
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                if len(node.body) > 20:
                    score -= 5
        
        return max(score, 0.0)
    
    def calculate_complexity(self, tree: ast.AST) -> int:
        """Calcul de la complexité cyclomatique améliorée"""
        complexity = 1
        
        for node in ast.walk(tree):
            if isinstance(node, (ast.If, ast.While, ast.For, ast.ExceptHandler)):
                complexity += 1
            elif isinstance(node, ast.BoolOp):
                complexity += len(node.values) - 1
            elif isinstance(node, ast.Try):
                complexity += len(node.handlers)
        
        return complexity
    
    def detect_architecture_patterns(self, tree: ast.AST) -> List[str]:
        """Détection de patterns architecturaux"""
        patterns = []
        
        # Détecter les patterns courants
        class_count = len([n for n in ast.walk(tree) if isinstance(n, ast.ClassDef)])
        func_count = len([n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)])
        
        if class_count > 0 and func_count > class_count * 2:
            patterns.append("Pattern: Service Layer")
        
        if any(isinstance(n, ast.ClassDef) and any(isinstance(m, ast.FunctionDef) and m.name.startswith('__') for m in n.body) for n in ast.walk(tree)):
            patterns.append("Pattern: Builder/Factory")
        
        return patterns

analyzer = AdvancedCodeAnalyzer()

# Générateur de documentation avancé
class AdvancedDocumentationGenerator:
    def __init__(self):
        self.templates = {
            'comprehensive': self._generate_comprehensive_doc,
            'minimal': self._generate_minimal_doc,
            'api': self._generate_api_doc,
            'tutorial': self._generate_tutorial_doc,
            'reference': self._generate_reference_doc,
        }
    
    def generate_documentation(self, code: str, filename: str, analysis: CodeAnalysis, 
                             doc_type: str, custom_prompt: Optional[str] = None) -> str:
        """Génération de documentation avancée"""
        
        if doc_type in self.templates:
            return self.templates[doc_type](code, filename, analysis, custom_prompt)
        else:
            return self._generate_comprehensive_doc(code, filename, analysis, custom_prompt)
    
    def _generate_comprehensive_doc(self, code: str, filename: str, analysis: CodeAnalysis, 
                                  custom_prompt: Optional[str] = None) -> str:
        """Documentation complète avec analyse approfondie"""
        
        doc = f"""# 📚 Documentation Complète - {filename}

## 📋 Vue d'Ensemble
{f"*Instructions personnalisées : {custom_prompt}*" if custom_prompt else ""}

## 🔧 Architecture et Structure

### 📊 Métriques de Qualité
- **Score de maintenabilité :** {analysis.maintainability_score:.1f}/100
- **Complexité cyclomatique :** {analysis.complexity['cyclomatic']} ({analysis.complexity['level']})
- **Couverture de tests :** {analysis.test_coverage or 'Non mesurée'}%
- **Patterns détectés :** {', '.join(analysis.architecture_patterns) if analysis.architecture_patterns else 'Aucun'}

### 🏗️ Structure du Code

#### Fonctions ({len(analysis.functions)})
"""
        
        for func in analysis.functions:
            doc += f"""
#### `{func['name']}()`
- **Ligne :** {func['lineno']}
- **Arguments :** {', '.join(func['args'])}
- **Valeurs par défaut :** {func['defaults']}
{f"- **Décorateurs :** {', '.join(func['decorators'])}" if func['decorators'] else ""}
{f"- **Description :** {func['docstring']}" if func['docstring'] else "- **Description :** À documenter"}
- **Complexité :** {func.get('complexity', 'N/A')}
"""
        
        if analysis.classes:
            doc += "\n#### Classes\n"
            for cls in analysis.classes:
                doc += f"""
#### `{cls['name']}`
- **Ligne :** {cls['lineno']}
- **Héritage :** {', '.join(cls['bases']) if cls['bases'] else 'Aucun'}
- **Méthodes :** {', '.join(cls['methods'])}
{f"- **Description :** {cls['docstring']}" if cls['docstring'] else "- **Description :** À documenter"}
"""
        
        doc += f"""
## 📦 Dépendances et Imports
```python
{chr(10).join(analysis.imports)}
```

## 🔒 Analyse de Sécurité
"""
        
        if analysis.security_issues:
            for issue in analysis.security_issues:
                doc += f"- ⚠️ {issue}\n"
        else:
            doc += "- ✅ Aucun problème de sécurité détecté\n"
        
        doc += f"""
## ⚡ Analyse de Performance
"""
        
        if analysis.performance_issues:
            for issue in analysis.performance_issues:
                doc += f"- ⚠️ {issue}\n"
        else:
            doc += "- ✅ Aucun problème de performance détecté\n"
        
        doc += f"""
## 💡 Suggestions d'Amélioration
"""
        
        for suggestion in analysis.suggestions:
            doc += f"- 💡 {suggestion}\n"
        
        doc += f"""
## 📈 Recommandations

### 🔧 Refactoring Suggéré
- **Priorité haute :** {len([s for s in analysis.suggestions if 'critique' in s.lower()])} suggestions critiques
- **Priorité moyenne :** {len([s for s in analysis.suggestions if 'amélioration' in s.lower()])} améliorations
- **Priorité basse :** {len([s for s in analysis.suggestions if 'optimisation' in s.lower()])} optimisations

### 🧪 Tests Recommandés
- **Couverture cible :** 80% minimum
- **Tests unitaires :** {len(analysis.functions)} fonctions à tester
- **Tests d'intégration :** {len(analysis.classes)} classes à valider

### 📚 Documentation Supplémentaire
- **API Reference :** Générer automatiquement
- **Tutorials :** Créer des exemples d'utilisation
- **Architecture :** Documenter les patterns détectés
"""
        
        return doc
    
    def _generate_minimal_doc(self, code: str, filename: str, analysis: CodeAnalysis, 
                             custom_prompt: Optional[str] = None) -> str:
        """Documentation minimale"""
        return f"""# {filename}

## Fonctions ({len(analysis.functions)})
{chr(10).join([f"- `{f['name']}()`" for f in analysis.functions])}

## Classes ({len(analysis.classes)})
{chr(10).join([f"- `{c['name']}`" for c in analysis.classes])}
"""
    
    def _generate_api_doc(self, code: str, filename: str, analysis: CodeAnalysis, 
                          custom_prompt: Optional[str] = None) -> str:
        """Documentation API"""
        doc = f"""# API Reference - {filename}

## Endpoints

"""
        for func in analysis.functions:
            doc += f"""### {func['name']}

**Signature :** `{func['name']}({', '.join(func['args'])})`

**Description :** {func['docstring'] or 'À documenter'}

**Paramètres :**
"""
            for arg in func['args']:
                doc += f"- `{arg}` : Type et description\n"
            doc += "\n"
        
        return doc
    
    def _generate_tutorial_doc(self, code: str, filename: str, analysis: CodeAnalysis, 
                              custom_prompt: Optional[str] = None) -> str:
        """Documentation tutoriel"""
        return f"""# Tutorial - {filename}

## 🚀 Démarrage Rapide

### Installation
```bash
pip install -r requirements.txt
```

### Utilisation Basique
```python
# Exemple d'utilisation
```

## 📖 Guide Complet

### Fonctionnalités Principales
{chr(10).join([f"- {f['name']} : {f['docstring'] or 'Description à ajouter'}" for f in analysis.functions[:3]])}

## 🔧 Configuration

## 📚 Exemples Avancés
"""
    
    def _generate_reference_doc(self, code: str, filename: str, analysis: CodeAnalysis, 
                               custom_prompt: Optional[str] = None) -> str:
        """Documentation de référence"""
        return f"""# Reference - {filename}

## Index

### Fonctions
{chr(10).join([f"- [{f['name']}](#{f['name']})" for f in analysis.functions])}

### Classes
{chr(10).join([f"- [{c['name']}](#{c['name']})" for c in analysis.classes])}

## Référence Complète

{chr(10).join([f"### {f['name']}\n\n{f['docstring'] or 'Documentation manquante'}\n" for f in analysis.functions])}
"""

generator = AdvancedDocumentationGenerator()

# Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Vérification de santé avancée du service"""
    import psutil
    
    memory = psutil.virtual_memory()
    
    # Vérifier Redis
    try:
        await redis_client.ping()
        cache_status = "healthy"
    except:
        cache_status = "unhealthy"
    
    # Vérifier PostgreSQL
    try:
        conn = get_db_connection()
        conn.close()
        db_status = "healthy"
    except:
        db_status = "unhealthy"
    
    return HealthResponse(
        status="healthy",
        service="python-documentation-ultra-robust",
        timestamp=datetime.now(),
        version="2.0.0",
        uptime=time.time() - app.start_time if hasattr(app, 'start_time') else 0,
        memory_usage={
            "total": memory.total,
            "available": memory.available,
            "percent": memory.percent
        },
        cache_status=cache_status,
        database_status=db_status,
        supported_languages=["Python", "Django", "Flask", "NumPy", "Pandas", "FastAPI", "Celery"]
    )

@app.get("/metrics")
async def metrics():
    """Métriques Prometheus"""
    return JSONResponse(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )

@app.post("/analyze", response_model=CodeAnalysis)
async def analyze_code(request: DocumentationRequest):
    """Analyse avancée du code Python"""
    start_time = time.time()
    ACTIVE_REQUESTS.inc()
    
    try:
        # Parse le code avec AST
        tree = ast.parse(request.code)
        
        # Analyse complète
        functions = extract_functions_advanced(tree)
        classes = extract_classes_advanced(tree)
        imports = extract_imports_advanced(tree)
        complexity = analyzer.calculate_complexity(tree)
        security_issues = analyzer.analyze_security(tree)
        performance_issues = analyzer.analyze_performance(tree)
        maintainability_score = analyzer.calculate_maintainability(tree)
        architecture_patterns = analyzer.detect_architecture_patterns(tree)
        
        # Suggestions intelligentes
        suggestions = generate_advanced_suggestions(tree, functions, classes)
        
        analysis = CodeAnalysis(
            functions=functions,
            classes=classes,
            imports=imports,
            complexity={
                "cyclomatic": complexity,
                "level": "low" if complexity <= 5 else "medium" if complexity <= 10 else "high"
            },
            suggestions=suggestions,
            security_issues=security_issues,
            performance_issues=performance_issues,
            maintainability_score=maintainability_score,
            test_coverage=None,  # À implémenter avec coverage.py
            dependencies=extract_dependencies(imports),
            architecture_patterns=architecture_patterns
        )
        
        duration = time.time() - start_time
        REQUEST_DURATION.observe(duration)
        REQUEST_COUNT.labels(endpoint="analyze", status="success").inc()
        
        logger.info("Analyse terminée", 
                   filename=request.filename, 
                   duration=duration,
                   functions_count=len(functions),
                   classes_count=len(classes))
        
        return analysis
        
    except SyntaxError as e:
        REQUEST_COUNT.labels(endpoint="analyze", status="error").inc()
        raise HTTPException(status_code=400, detail=f"Erreur de syntaxe: {str(e)}")
    except Exception as e:
        REQUEST_COUNT.labels(endpoint="analyze", status="error").inc()
        logger.error("Erreur lors de l'analyse", error=str(e), traceback=traceback.format_exc())
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")
    finally:
        ACTIVE_REQUESTS.dec()

@app.post("/generate", response_model=DocumentationResponse)
async def generate_documentation(
    request: DocumentationRequest,
    background_tasks: BackgroundTasks
):
    """Génération de documentation ultra-robuste"""
    start_time = time.time()
    ACTIVE_REQUESTS.inc()
    
    try:
        # Vérifier le cache
        cache_key = f"doc:{hashlib.md5(f'{request.filename}:{hash(request.code)}'.encode()).hexdigest()}"
        cached_result = await cache.get(cache_key)
        
        if cached_result:
            logger.info("Documentation trouvée en cache", filename=request.filename)
            return DocumentationResponse(**cached_result, cache_hit=True)
        
        # Analyser le code
        analysis = await analyze_code(request)
        
        # Générer la documentation
        documentation = generator.generate_documentation(
            request.code,
            request.filename,
            analysis,
            request.doc_type,
            request.custom_prompt
        )
        
        # Calculer le score de qualité avancé
        quality_score = calculate_advanced_quality_score(analysis, documentation)
        
        # Créer la réponse
        response = DocumentationResponse(
            id=f"doc_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            documentation=documentation,
            metadata={
                "functions_count": len(analysis.functions),
                "classes_count": len(analysis.classes),
                "imports_count": len(analysis.imports),
                "complexity": analysis.complexity,
                "language": request.language,
                "doc_type": request.doc_type,
                "maintainability_score": analysis.maintainability_score,
                "security_issues_count": len(analysis.security_issues),
                "performance_issues_count": len(analysis.performance_issues),
                "architecture_patterns": analysis.architecture_patterns
            },
            generated_at=datetime.now(),
            language=request.language,
            filename=request.filename,
            quality_score=quality_score,
            cache_hit=False,
            processing_time=time.time() - start_time,
            version="2.0.0",
            suggestions=analysis.suggestions,
            warnings=analysis.security_issues + analysis.performance_issues,
            dependencies=analysis.dependencies,
            test_coverage=analysis.test_coverage
        )
        
        # Mettre en cache
        await cache.set(cache_key, response.dict())
        
        # Tâches en arrière-plan
        background_tasks.add_task(log_advanced_analytics, request, response)
        background_tasks.add_task(store_documentation, request, response)
        
        duration = time.time() - start_time
        REQUEST_DURATION.observe(duration)
        REQUEST_COUNT.labels(endpoint="generate", status="success").inc()
        
        logger.info("Documentation générée", 
                   filename=request.filename, 
                   duration=duration,
                   quality_score=quality_score)
        
        return response
        
    except Exception as e:
        REQUEST_COUNT.labels(endpoint="generate", status="error").inc()
        logger.error("Erreur lors de la génération", error=str(e), traceback=traceback.format_exc())
        raise HTTPException(status_code=500, detail="Erreur lors de la génération")
    finally:
        ACTIVE_REQUESTS.dec()

# Fonctions utilitaires avancées
def extract_functions_advanced(tree: ast.AST) -> List[Dict[str, Any]]:
    """Extraction avancée des fonctions"""
    functions = []
    
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            # Calculer la complexité de la fonction
            func_complexity = analyzer.calculate_complexity(node)
            
            func_info = {
                "name": node.name,
                "lineno": node.lineno,
                "args": [arg.arg for arg in node.args.args],
                "defaults": len(node.args.defaults),
                "docstring": ast.get_docstring(node),
                "decorators": [d.id for d in node.decorator_list if hasattr(d, 'id')],
                "complexity": func_complexity,
                "lines": len(node.body),
                "has_returns": any(isinstance(n, ast.Return) for n in ast.walk(node)),
                "has_yields": any(isinstance(n, ast.Yield) for n in ast.walk(node)),
                "is_async": isinstance(node, ast.AsyncFunctionDef)
            }
            functions.append(func_info)
    
    return functions

def extract_classes_advanced(tree: ast.AST) -> List[Dict[str, Any]]:
    """Extraction avancée des classes"""
    classes = []
    
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            methods = [n.name for n in node.body if isinstance(n, ast.FunctionDef)]
            properties = [n.name for n in node.body if isinstance(n, ast.AnnAssign)]
            
            class_info = {
                "name": node.name,
                "lineno": node.lineno,
                "bases": [base.id for base in node.bases if hasattr(base, 'id')],
                "docstring": ast.get_docstring(node),
                "methods": methods,
                "properties": properties,
                "method_count": len(methods),
                "is_dataclass": any(d.id == 'dataclass' for d in node.decorator_list if hasattr(d, 'id')),
                "has_init": any(m == '__init__' for m in methods),
                "has_str": any(m == '__str__' for m in methods),
                "has_repr": any(m == '__repr__' for m in methods)
            }
            classes.append(class_info)
    
    return classes

def extract_imports_advanced(tree: ast.AST) -> List[str]:
    """Extraction avancée des imports"""
    imports = []
    
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.append(alias.name)
        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            for alias in node.names:
                imports.append(f"{module}.{alias.name}")
    
    return list(set(imports))  # Supprimer les doublons

def extract_dependencies(imports: List[str]) -> List[str]:
    """Extraction des dépendances depuis les imports"""
    dependencies = []
    
    for imp in imports:
        if '.' in imp:
            base_module = imp.split('.')[0]
            if base_module not in ['os', 'sys', 'json', 'datetime', 'typing']:
                dependencies.append(base_module)
        else:
            if imp not in ['os', 'sys', 'json', 'datetime', 'typing']:
                dependencies.append(imp)
    
    return list(set(dependencies))

def generate_advanced_suggestions(tree: ast.AST, functions: List[Dict], classes: List[Dict]) -> List[str]:
    """Génération de suggestions avancées"""
    suggestions = []
    
    # Vérifier la présence de docstrings
    documented_functions = sum(1 for f in functions if f['docstring'])
    documented_classes = sum(1 for c in classes if c['docstring'])
    
    if documented_functions < len(functions) * 0.8:
        suggestions.append("Améliorer la documentation des fonctions (objectif: 80%)")
    
    if documented_classes < len(classes) * 0.8:
        suggestions.append("Améliorer la documentation des classes (objectif: 80%)")
    
    # Vérifier la complexité
    high_complexity_functions = [f for f in functions if f['complexity'] > 10]
    if high_complexity_functions:
        suggestions.append(f"Refactoriser {len(high_complexity_functions)} fonctions de haute complexité")
    
    # Vérifier les patterns
    if len(functions) > 20 and len(classes) < 3:
        suggestions.append("Considérer l'introduction de classes pour organiser le code")
    
    # Vérifier les tests
    if not any('test' in f['name'].lower() for f in functions):
        suggestions.append("Ajouter des tests unitaires")
    
    return suggestions

def calculate_advanced_quality_score(analysis: CodeAnalysis, documentation: str) -> float:
    """Calcul avancé du score de qualité"""
    score = 0.0
    
    # Score basé sur la documentation (40%)
    total_elements = len(analysis.functions) + len(analysis.classes)
    documented_elements = sum(
        1 for func in analysis.functions if func['docstring']
    ) + sum(
        1 for cls in analysis.classes if cls['docstring']
    )
    
    if total_elements > 0:
        score += (documented_elements / total_elements) * 0.4
    
    # Score basé sur la maintenabilité (30%)
    score += (analysis.maintainability_score / 100) * 0.3
    
    # Score basé sur la sécurité (15%)
    security_score = max(0, 1 - len(analysis.security_issues) * 0.1)
    score += security_score * 0.15
    
    # Score basé sur la performance (15%)
    performance_score = max(0, 1 - len(analysis.performance_issues) * 0.1)
    score += performance_score * 0.15
    
    return min(score, 1.0)

async def log_advanced_analytics(request: DocumentationRequest, response: DocumentationResponse):
    """Logging avancé des analytics"""
    try:
        analytics_data = {
            "user_id": request.user_id,
            "project_id": request.project_id,
            "filename": request.filename,
            "language": request.language,
            "doc_type": request.doc_type,
            "quality_score": response.quality_score,
            "processing_time": response.processing_time,
            "cache_hit": response.cache_hit,
            "functions_count": len(response.metadata.get('functions_count', 0)),
            "classes_count": len(response.metadata.get('classes_count', 0)),
            "security_issues": len(response.warnings),
            "timestamp": datetime.now().isoformat()
        }
        
        # Stocker dans Redis pour l'analytics
        await redis_client.lpush("analytics:documentation", json.dumps(analytics_data))
        await redis_client.ltrim("analytics:documentation", 0, 999)  # Garder les 1000 derniers
        
        logger.info("Analytics enregistrées", **analytics_data)
        
    except Exception as e:
        logger.error("Erreur analytics", error=str(e))

async def store_documentation(request: DocumentationRequest, response: DocumentationResponse):
    """Stockage de la documentation en base"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO documentation (
                id, filename, language, doc_type, documentation, 
                quality_score, metadata, created_at, user_id, project_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            response.id,
            response.filename,
            response.language,
            request.doc_type,
            response.documentation,
            response.quality_score,
            json.dumps(response.metadata),
            response.generated_at,
            request.user_id,
            request.project_id
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info("Documentation stockée en base", doc_id=response.id)
        
    except Exception as e:
        logger.error("Erreur stockage documentation", error=str(e))

# Middleware pour le timing
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Gestionnaire d'erreurs global
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Erreur globale", 
                error=str(exc), 
                traceback=traceback.format_exc(),
                path=request.url.path)
    
    return JSONResponse(
        status_code=500,
        content={"detail": "Erreur interne du serveur", "error": str(exc)}
    )

if __name__ == "__main__":
    app.start_time = time.time()
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=3002,
        reload=True,
        log_level="info",
        workers=4
    ) 