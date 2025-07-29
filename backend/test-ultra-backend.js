#!/usr/bin/env node
/**
 * Test complet du Backend Ultra-Robuste GitShadow
 * Vérifie tous les services et leurs fonctionnalités
 */

const fetch = require('node-fetch').default;
const Redis = require('ioredis');

// Configuration
const config = {
  gateway: 'http://localhost:3001',
  services: {
    python: 'http://localhost:3002',
    javascript: 'http://localhost:3004',
    java: 'http://localhost:3003',
    rust: 'http://localhost:3005',
    web: 'http://localhost:3006',
    ai: 'http://localhost:3007',
    analytics: 'http://localhost:3008',
  },
  redis: {
    host: 'localhost',
    port: 6379,
  },
};

// Code de test pour différents langages
const testCode = {
  python: `
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
`,

  javascript: `
/**
 * Gestionnaire d'utilisateurs
 * @author GitShadow Team
 */

class User {
  constructor(id, name, email, isActive = true) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.isActive = isActive;
  }
}

class UserManager {
  constructor() {
    this.users = [];
  }

  /**
   * Ajoute un nouvel utilisateur
   * @param {string} name - Nom de l'utilisateur
   * @param {string} email - Email de l'utilisateur
   * @returns {User} L'utilisateur créé
   */
  addUser(name, email) {
    const userId = this.users.length + 1;
    const user = new User(userId, name, email);
    this.users.push(user);
    return user;
  }

  /**
   * Récupère un utilisateur par son ID
   * @param {number} userId - ID de l'utilisateur
   * @returns {User|null} L'utilisateur trouvé ou null
   */
  getUserById(userId) {
    return this.users.find(user => user.id === userId) || null;
  }

  /**
   * Récupère tous les utilisateurs actifs
   * @returns {User[]} Liste des utilisateurs actifs
   */
  getActiveUsers() {
    return this.users.filter(user => user.isActive);
  }
}

module.exports = { User, UserManager };
`,

  java: `
package com.gitshadow.users;

import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

/**
 * Représente un utilisateur du système
 */
public class User {
    private int id;
    private String name;
    private String email;
    private boolean isActive;

    public User(int id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.isActive = true;
    }

    // Getters et setters
    public int getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { this.isActive = active; }
}

/**
 * Gère les utilisateurs du système
 */
public class UserManager {
    private List<User> users;

    public UserManager() {
        this.users = new ArrayList<>();
    }

    /**
     * Ajoute un nouvel utilisateur
     * @param name Nom de l'utilisateur
     * @param email Email de l'utilisateur
     * @return L'utilisateur créé
     */
    public User addUser(String name, String email) {
        int userId = users.size() + 1;
        User user = new User(userId, name, email);
        users.add(user);
        return user;
    }

    /**
     * Récupère un utilisateur par son ID
     * @param userId ID de l'utilisateur
     * @return Optional contenant l'utilisateur ou vide
     */
    public Optional<User> getUserById(int userId) {
        return users.stream()
                   .filter(user -> user.getId() == userId)
                   .findFirst();
    }

    /**
     * Récupère tous les utilisateurs actifs
     * @return Liste des utilisateurs actifs
     */
    public List<User> getActiveUsers() {
        return users.stream()
                   .filter(User::isActive)
                   .collect(Collectors.toList());
    }
}
`,

  rust: `
use std::collections::HashMap;

/// Représente un utilisateur du système
#[derive(Debug, Clone)]
pub struct User {
    pub id: u32,
    pub name: String,
    pub email: String,
    pub is_active: bool,
}

impl User {
    /// Crée un nouvel utilisateur
    pub fn new(id: u32, name: String, email: String) -> Self {
        User {
            id,
            name,
            email,
            is_active: true,
        }
    }
}

/// Gère les utilisateurs du système
pub struct UserManager {
    users: HashMap<u32, User>,
    next_id: u32,
}

impl UserManager {
    /// Crée un nouveau gestionnaire d'utilisateurs
    pub fn new() -> Self {
        UserManager {
            users: HashMap::new(),
            next_id: 1,
        }
    }

    /// Ajoute un nouvel utilisateur
    pub fn add_user(&mut self, name: String, email: String) -> User {
        let user = User::new(self.next_id, name, email);
        self.users.insert(self.next_id, user.clone());
        self.next_id += 1;
        user
    }

    /// Récupère un utilisateur par son ID
    pub fn get_user_by_id(&self, user_id: u32) -> Option<&User> {
        self.users.get(&user_id)
    }

    /// Récupère tous les utilisateurs actifs
    pub fn get_active_users(&self) -> Vec<&User> {
        self.users.values()
                  .filter(|user| user.is_active)
                  .collect()
    }
}
`,

  html: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitShadow - Documentation</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="header">
        <nav class="navbar">
            <div class="logo">
                <img src="/logo.svg" alt="GitShadow">
            </div>
            <ul class="nav-menu">
                <li><a href="/">Accueil</a></li>
                <li><a href="/docs">Documentation</a></li>
                <li><a href="/pricing">Tarifs</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main class="main">
        <section class="hero">
            <h1>Documentation Intelligente</h1>
            <p>Générez automatiquement une documentation complète pour vos projets</p>
            <button class="cta-button">Commencer</button>
        </section>

        <section class="features">
            <div class="feature-card">
                <h3>Analyse Avancée</h3>
                <p>Analysez votre code avec des métriques de qualité</p>
            </div>
            <div class="feature-card">
                <h3>Documentation Générée</h3>
                <p>Générez une documentation complète automatiquement</p>
            </div>
        </section>
    </main>

    <footer class="footer">
        <p>&copy; 2024 GitShadow. Tous droits réservés.</p>
    </footer>

    <script src="app.js"></script>
</body>
</html>
`,

  css: `
/* Variables CSS */
:root {
    --primary-color: #3b82f6;
    --secondary-color: #1e40af;
    --accent-color: #f59e0b;
    --text-color: #1f2937;
    --background-color: #ffffff;
    --border-color: #e5e7eb;
    --shadow-color: rgba(0, 0, 0, 0.1);
}

/* Reset et base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
}

/* Header */
.header {
    background-color: var(--background-color);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 100;
}

.navbar {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo img {
    height: 2rem;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    text-decoration: none;
    color: var(--text-color);
    font-weight: 500;
    transition: color 0.2s ease;
}

.nav-menu a:hover {
    color: var(--primary-color);
}

/* Main content */
.main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.hero {
    text-align: center;
    padding: 4rem 0;
}

.hero h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero p {
    font-size: 1.25rem;
    color: #6b7280;
    margin-bottom: 2rem;
}

.cta-button {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.cta-button:hover {
    transform: translateY(-2px);
}

/* Features */
.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 4rem;
}

.feature-card {
    background: white;
    padding: 2rem;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px var(--shadow-color);
    border: 1px solid var(--border-color);
    transition: transform 0.2s ease;
}

.feature-card:hover {
    transform: translateY(-4px);
}

.feature-card h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-color);
}

.feature-card p {
    color: #6b7280;
    line-height: 1.6;
}

/* Footer */
.footer {
    background-color: #f9fafb;
    border-top: 1px solid var(--border-color);
    padding: 2rem;
    text-align: center;
    margin-top: 4rem;
}

/* Responsive */
@media (max-width: 768px) {
    .navbar {
        padding: 1rem;
    }
    
    .nav-menu {
        gap: 1rem;
    }
    
    .hero h1 {
        font-size: 2rem;
    }
    
    .hero p {
        font-size: 1.125rem;
    }
    
    .features {
        grid-template-columns: 1fr;
    }
}
`
};

// Tests des services
class BackendTester {
  constructor() {
    this.results = [];
    this.redis = new Redis(config.redis);
  }

  async testHealthCheck(serviceName, url) {
    try {
      const response = await fetch(`${url}/health`);
      const data = await response.json();
      
      return {
        service: serviceName,
        status: response.ok ? '✅' : '❌',
        healthy: response.ok,
        data: data,
        responseTime: response.headers.get('x-process-time') || 'N/A'
      };
    } catch (error) {
      return {
        service: serviceName,
        status: '❌',
        healthy: false,
        error: error.message
      };
    }
  }

  async testDocumentationGeneration(serviceName, url, language, code) {
    try {
      const response = await fetch(`${url}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          filename: `test_${language}.${this.getFileExtension(language)}`,
          language: language,
          doc_type: 'comprehensive',
          custom_prompt: 'Test de génération de documentation ultra-robuste'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      
      return {
        service: serviceName,
        status: '✅',
        success: true,
        quality_score: data.quality_score,
        processing_time: data.processing_time,
        cache_hit: data.cache_hit,
        documentation_length: data.documentation?.length || 0
      };
    } catch (error) {
      return {
        service: serviceName,
        status: '❌',
        success: false,
        error: error.message
      };
    }
  }

  async testCodeAnalysis(serviceName, url, language, code) {
    try {
      const response = await fetch(`${url}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          filename: `test_${language}.${this.getFileExtension(language)}`,
          language: language
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      
      return {
        service: serviceName,
        status: '✅',
        success: true,
        functions_count: data.functions?.length || 0,
        classes_count: data.classes?.length || 0,
        complexity: data.complexity,
        maintainability_score: data.maintainability_score
      };
    } catch (error) {
      return {
        service: serviceName,
        status: '❌',
        success: false,
        error: error.message
      };
    }
  }

  async testGateway() {
    console.log('\n🔍 Test de l\'API Gateway...');
    
    // Test health check
    const gatewayHealth = await this.testHealthCheck('Gateway', config.gateway);
    this.results.push(gatewayHealth);
    
    // Test services endpoint
    try {
      const response = await fetch(`${config.gateway}/services`);
      const data = await response.json();
      
      this.results.push({
        service: 'Gateway Services',
        status: response.ok ? '✅' : '❌',
        healthy: response.ok,
        services_count: data.services?.length || 0
      });
    } catch (error) {
      this.results.push({
        service: 'Gateway Services',
        status: '❌',
        healthy: false,
        error: error.message
      });
    }
  }

  async testRedis() {
    console.log('\n🔍 Test de Redis...');
    
    try {
      await this.redis.ping();
      this.results.push({
        service: 'Redis',
        status: '✅',
        healthy: true,
        message: 'Connexion Redis réussie'
      });
    } catch (error) {
      this.results.push({
        service: 'Redis',
        status: '❌',
        healthy: false,
        error: error.message
      });
    }
  }

  async testAllServices() {
    console.log('\n🔍 Test de tous les services...');
    
    const serviceTests = [
      { name: 'Python', url: config.services.python, language: 'python', code: testCode.python },
      { name: 'JavaScript', url: config.services.javascript, language: 'javascript', code: testCode.javascript },
      { name: 'Java', url: config.services.java, language: 'java', code: testCode.java },
      { name: 'Rust', url: config.services.rust, language: 'rust', code: testCode.rust },
      { name: 'Web', url: config.services.web, language: 'html', code: testCode.html },
    ];

    for (const test of serviceTests) {
      console.log(`\n📋 Test du service ${test.name}...`);
      
      // Health check
      const health = await this.testHealthCheck(test.name, test.url);
      this.results.push(health);
      
      if (health.healthy) {
        // Code analysis
        const analysis = await this.testCodeAnalysis(test.name, test.url, test.language, test.code);
        this.results.push(analysis);
        
        // Documentation generation
        const doc = await this.testDocumentationGeneration(test.name, test.url, test.language, test.code);
        this.results.push(doc);
      }
    }
  }

  getFileExtension(language) {
    const extensions = {
      python: 'py',
      javascript: 'js',
      java: 'java',
      rust: 'rs',
      html: 'html',
      css: 'css'
    };
    return extensions[language] || 'txt';
  }

  async runAllTests() {
    console.log('🧪 Test Complet du Backend Ultra-Robuste GitShadow');
    console.log('=' * 60);
    
    // Test Redis
    await this.testRedis();
    
    // Test Gateway
    await this.testGateway();
    
    // Test tous les services
    await this.testAllServices();
    
    // Affichage des résultats
    this.displayResults();
    
    // Nettoyage
    await this.redis.quit();
  }

  displayResults() {
    console.log('\n📊 Résultats des Tests');
    console.log('=' * 40);
    
    let passed = 0;
    let total = 0;
    
    for (const result of this.results) {
      total++;
      if (result.status === '✅') {
        passed++;
      }
      
      console.log(`${result.status} ${result.service}`);
      
      if (result.error) {
        console.log(`   ❌ Erreur: ${result.error}`);
      } else if (result.healthy !== undefined) {
        console.log(`   ${result.healthy ? '✅' : '❌'} Healthy: ${result.healthy}`);
        if (result.data) {
          console.log(`   📊 Services: ${result.data.services?.total || 'N/A'}`);
        }
      } else if (result.success !== undefined) {
        if (result.success) {
          console.log(`   📊 Score qualité: ${result.quality_score?.toFixed(2) || 'N/A'}`);
          console.log(`   ⏱️ Temps: ${result.processing_time?.toFixed(3)}s`);
          console.log(`   💾 Cache: ${result.cache_hit ? 'Hit' : 'Miss'}`);
        } else {
          console.log(`   ❌ Erreur: ${result.error}`);
        }
      }
      
      console.log('');
    }
    
    console.log(`🎯 Résultat: ${passed}/${total} tests réussis`);
    
    if (passed === total) {
      console.log('🎉 Tous les tests sont passés ! Le backend est opérationnel.');
    } else {
      console.log('⚠️ Certains tests ont échoué. Vérifiez la configuration.');
    }
  }
}

// Exécution des tests
async function main() {
  const tester = new BackendTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { BackendTester, config, testCode }; 