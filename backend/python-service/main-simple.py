#!/usr/bin/env python3
"""
Service Python Simplifié pour la génération de documentation
Version de test pour éviter les conflits de dépendances
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import ast
import time
from datetime import datetime
import uvicorn
import os

app = FastAPI(
    title="GitShadow Python Documentation Service - Test",
    description="Service de génération de documentation simplifié pour les tests",
    version="1.0.0"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèles Pydantic
class DocumentationRequest(BaseModel):
    code: str = Field(..., description="Code source à documenter", min_length=1)
    filename: str = Field(..., description="Nom du fichier")
    language: str = Field(default="Python", description="Langage de programmation")
    doc_type: str = Field(default="comprehensive", description="Type de documentation")
    custom_prompt: Optional[str] = Field(None, description="Instructions personnalisées")

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

class CodeAnalysis(BaseModel):
    functions: List[Dict[str, Any]]
    classes: List[Dict[str, Any]]
    imports: List[str]
    complexity: Dict[str, Any]
    suggestions: List[str]
    security_issues: List[str]
    performance_issues: List[str]
    maintainability_score: float
    dependencies: List[str]

class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: datetime
    version: str
    uptime: float
    memory_usage: Dict[str, float]
    supported_languages: List[str]

# Variables globales
app.start_time = time.time()

def extract_functions_simple(tree: ast.AST) -> List[Dict[str, Any]]:
    """Extrait les fonctions du code"""
    functions = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            functions.append({
                "name": node.name,
                "line": node.lineno,
                "docstring": ast.get_docstring(node),
                "args": [arg.arg for arg in node.args.args],
                "returns": getattr(node, 'returns', None)
            })
    return functions

def extract_classes_simple(tree: ast.AST) -> List[Dict[str, Any]]:
    """Extrait les classes du code"""
    classes = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            classes.append({
                "name": node.name,
                "line": node.lineno,
                "docstring": ast.get_docstring(node),
                "methods": [n.name for n in node.body if isinstance(n, ast.FunctionDef)]
            })
    return classes

def extract_imports_simple(tree: ast.AST) -> List[str]:
    """Extrait les imports du code"""
    imports = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.append(alias.name)
        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            for alias in node.names:
                imports.append(f"{module}.{alias.name}")
    return imports

def calculate_complexity_simple(tree: ast.AST) -> int:
    """Calcule la complexité cyclomatique"""
    complexity = 1
    for node in ast.walk(tree):
        if isinstance(node, (ast.If, ast.While, ast.For, ast.ExceptHandler)):
            complexity += 1
        elif isinstance(node, ast.BoolOp):
            complexity += len(node.values) - 1
    return complexity

def generate_documentation_simple(code: str, filename: str, analysis: CodeAnalysis) -> str:
    """Génère une documentation simple"""
    doc = f"# Documentation pour {filename}\n\n"
    doc += f"## Généré le {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    
    if analysis.functions:
        doc += "## Fonctions\n\n"
        for func in analysis.functions:
            doc += f"### {func['name']}\n"
            if func['docstring']:
                doc += f"{func['docstring']}\n\n"
            else:
                doc += "Documentation manquante\n\n"
    
    if analysis.classes:
        doc += "## Classes\n\n"
        for cls in analysis.classes:
            doc += f"### {cls['name']}\n"
            if cls['docstring']:
                doc += f"{cls['docstring']}\n\n"
            else:
                doc += "Documentation manquante\n\n"
    
    return doc

# Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Vérification de santé du service"""
    return HealthResponse(
        status="healthy",
        service="python-documentation-test",
        timestamp=datetime.now(),
        version="1.0.0",
        uptime=time.time() - app.start_time,
        memory_usage={"total": 0, "available": 0, "percent": 0},
        supported_languages=["Python"]
    )

@app.get("/metrics")
async def metrics():
    """Métriques simples"""
    return {"status": "ok", "service": "python-documentation-test"}

@app.post("/analyze", response_model=CodeAnalysis)
async def analyze_code(request: DocumentationRequest):
    """Analyse simple du code Python"""
    try:
        # Parse le code avec AST
        tree = ast.parse(request.code)
        
        # Analyse basique
        functions = extract_functions_simple(tree)
        classes = extract_classes_simple(tree)
        imports = extract_imports_simple(tree)
        complexity = calculate_complexity_simple(tree)
        
        analysis = CodeAnalysis(
            functions=functions,
            classes=classes,
            imports=imports,
            complexity={
                "cyclomatic": complexity,
                "level": "low" if complexity <= 5 else "medium" if complexity <= 10 else "high"
            },
            suggestions=["Considérez ajouter des docstrings", "Vérifiez la complexité"],
            security_issues=[],
            performance_issues=[],
            maintainability_score=0.8,
            dependencies=imports
        )
        
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur d'analyse: {str(e)}")

@app.post("/generate", response_model=DocumentationResponse)
async def generate_documentation(request: DocumentationRequest):
    """Génération de documentation simple"""
    start_time = time.time()
    
    try:
        # Parse le code
        tree = ast.parse(request.code)
        
        # Analyse
        functions = extract_functions_simple(tree)
        classes = extract_classes_simple(tree)
        imports = extract_imports_simple(tree)
        complexity = calculate_complexity_simple(tree)
        
        analysis = CodeAnalysis(
            functions=functions,
            classes=classes,
            imports=imports,
            complexity={
                "cyclomatic": complexity,
                "level": "low" if complexity <= 5 else "medium" if complexity <= 10 else "high"
            },
            suggestions=["Considérez ajouter des docstrings"],
            security_issues=[],
            performance_issues=[],
            maintainability_score=0.8,
            dependencies=imports
        )
        
        # Générer documentation
        documentation = generate_documentation_simple(request.code, request.filename, analysis)
        
        processing_time = time.time() - start_time
        
        return DocumentationResponse(
            id=f"doc_{int(time.time())}",
            documentation=documentation,
            metadata={
                "functions_count": len(functions),
                "classes_count": len(classes),
                "complexity": complexity
            },
            generated_at=datetime.now(),
            language=request.language,
            filename=request.filename,
            quality_score=0.8,
            cache_hit=False,
            processing_time=processing_time,
            version="1.0.0",
            suggestions=["Ajoutez des docstrings", "Vérifiez la complexité"],
            warnings=[],
            dependencies=imports
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur de génération: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3002) 