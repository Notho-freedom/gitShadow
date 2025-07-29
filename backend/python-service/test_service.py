#!/usr/bin/env python3
"""
Script de test pour le service Python de documentation
"""

import asyncio
import httpx
import json
from datetime import datetime

# URL du service
SERVICE_URL = "http://localhost:3002"

# Exemple de code Python à tester
SAMPLE_PYTHON_CODE = '''
import os
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class User:
    """Représente un utilisateur du système"""
    id: int
    name: str
    email: str
    is_active: bool = True

class UserManager:
    """Gère les utilisateurs du système"""
    
    def __init__(self):
        self.users: List[User] = []
    
    def add_user(self, name: str, email: str) -> User:
        """Ajoute un nouvel utilisateur"""
        user_id = len(self.users) + 1
        user = User(id=user_id, name=name, email=email)
        self.users.append(user)
        return user
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Récupère un utilisateur par son ID"""
        for user in self.users:
            if user.id == user_id:
                return user
        return None
    
    def get_active_users(self) -> List[User]:
        """Récupère tous les utilisateurs actifs"""
        return [user for user in self.users if user.is_active]

def calculate_complexity(items: List[int]) -> Dict[str, int]:
    """Calcule des métriques de complexité"""
    if not items:
        return {"count": 0, "sum": 0, "average": 0}
    
    total = sum(items)
    count = len(items)
    average = total / count
    
    return {
        "count": count,
        "sum": total,
        "average": average
    }
'''

async def test_health_check():
    """Test du health check"""
    print("🔍 Test du health check...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{SERVICE_URL}/health")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Health check OK: {data['status']}")
                print(f"   Service: {data['service']}")
                print(f"   Langages supportés: {data['supported_languages']}")
                return True
            else:
                print(f"❌ Health check échoué: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Erreur health check: {str(e)}")
            return False

async def test_code_analysis():
    """Test de l'analyse de code"""
    print("\n🔍 Test de l'analyse de code...")
    
    request_data = {
        "code": SAMPLE_PYTHON_CODE,
        "filename": "user_manager.py",
        "language": "Python",
        "doc_type": "comprehensive"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{SERVICE_URL}/analyze", json=request_data)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Analyse OK")
                print(f"   Fonctions: {len(data['functions'])}")
                print(f"   Classes: {len(data['classes'])}")
                print(f"   Imports: {len(data['imports'])}")
                print(f"   Complexité: {data['complexity']['cyclomatic']} ({data['complexity']['level']})")
                return True
            else:
                print(f"❌ Analyse échouée: {response.status_code}")
                print(f"   Erreur: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Erreur analyse: {str(e)}")
            return False

async def test_documentation_generation():
    """Test de la génération de documentation"""
    print("\n🔍 Test de la génération de documentation...")
    
    request_data = {
        "code": SAMPLE_PYTHON_CODE,
        "filename": "user_manager.py",
        "language": "Python",
        "doc_type": "comprehensive",
        "custom_prompt": "Documente ce code en français avec des exemples d'utilisation"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{SERVICE_URL}/generate", json=request_data)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Génération OK")
                print(f"   ID: {data['id']}")
                print(f"   Score qualité: {data['quality_score']:.2f}")
                print(f"   Longueur doc: {len(data['documentation'])} caractères")
                print(f"   Métadonnées: {data['metadata']}")
                
                # Afficher un extrait de la documentation
                doc_preview = data['documentation'][:200] + "..." if len(data['documentation']) > 200 else data['documentation']
                print(f"   Extrait: {doc_preview}")
                
                return True
            else:
                print(f"❌ Génération échouée: {response.status_code}")
                print(f"   Erreur: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Erreur génération: {str(e)}")
            return False

async def test_error_handling():
    """Test de la gestion d'erreurs"""
    print("\n🔍 Test de la gestion d'erreurs...")
    
    # Test avec du code Python invalide
    invalid_code = '''
def test_function(
    # Code invalide - manque de fermeture
'''
    
    request_data = {
        "code": invalid_code,
        "filename": "invalid.py",
        "language": "Python"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{SERVICE_URL}/analyze", json=request_data)
            if response.status_code == 400:
                print("✅ Gestion d'erreur OK - Syntaxe invalide détectée")
                return True
            else:
                print(f"❌ Gestion d'erreur échouée: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Erreur test: {str(e)}")
            return False

async def test_performance():
    """Test de performance"""
    print("\n🔍 Test de performance...")
    
    request_data = {
        "code": SAMPLE_PYTHON_CODE,
        "filename": "performance_test.py",
        "language": "Python"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            start_time = datetime.now()
            response = await client.post(f"{SERVICE_URL}/generate", json=request_data)
            end_time = datetime.now()
            
            duration = (end_time - start_time).total_seconds()
            
            if response.status_code == 200:
                print(f"✅ Performance OK")
                print(f"   Temps de réponse: {duration:.2f}s")
                if duration < 2.0:
                    print("   ⚡ Performance excellente")
                elif duration < 5.0:
                    print("   ✅ Performance acceptable")
                else:
                    print("   ⚠️ Performance lente")
                return True
            else:
                print(f"❌ Test performance échoué: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Erreur performance: {str(e)}")
            return False

async def main():
    """Fonction principale de test"""
    print("🧪 Tests du Service Python de Documentation")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("Analyse de Code", test_code_analysis),
        ("Génération Documentation", test_documentation_generation),
        ("Gestion d'Erreurs", test_error_handling),
        ("Performance", test_performance)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Erreur dans {test_name}: {str(e)}")
            results.append((test_name, False))
    
    # Résumé des tests
    print("\n📊 Résumé des Tests")
    print("=" * 30)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Résultat: {passed}/{total} tests réussis")
    
    if passed == total:
        print("🎉 Tous les tests sont passés !")
    else:
        print("⚠️ Certains tests ont échoué.")

if __name__ == "__main__":
    asyncio.run(main()) 