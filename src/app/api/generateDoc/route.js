export async function POST(request) {
  try {
    const { code, filename, docType = 'comprehensive', prompt } = await request.json();
    
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Code manquant pour la génération de documentation' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier la présence de la clé API
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      // Retourner une documentation mock si pas de clé API
      return generateMockDocumentation(code, filename, docType);
    }

    // Déterminer le langage du fichier
    const language = detectLanguage(filename);
    
    // Construire le prompt système adapté
    const systemPrompt = buildSystemPrompt(language, docType);
    
    // Construire le prompt utilisateur
    const userPrompt = buildUserPrompt(code, filename, prompt, language);

    // Appel à l'API OpenRouter
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://gitShadow.dev',
        'X-Title': 'gitShadow Documentation Generator'
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { 
            role: "system", 
            content: systemPrompt
          },
          { 
            role: "user", 
            content: userPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3,
        top_p: 0.9
      })
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => ({}));
      
      if (aiResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Clé API invalide ou expirée' }), 
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de taux API atteinte. Réessayez dans quelques minutes.' }), 
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Erreur API IA: ${aiResponse.status} - ${errorData.error?.message || 'Erreur inconnue'}`);
    }

    const aiData = await aiResponse.json();
    
    // Extraire la documentation générée
    const documentation = aiData.choices?.[0]?.message?.content;
    
    if (!documentation) {
      throw new Error('Aucune documentation générée par l\'IA');
    }

    // Post-traitement de la documentation
    const processedDocumentation = postProcessDocumentation(documentation, filename, language);

    return new Response(
      JSON.stringify({ 
        documentation: processedDocumentation,
        metadata: {
          language,
          docType,
          generatedAt: new Date().toISOString(),
          model: "anthropic/claude-3.5-sonnet",
          tokensUsed: aiData.usage?.total_tokens || 0
        }
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    // En cas d'erreur, retourner une documentation de fallback
    return generateFallbackDocumentation(error.message);
  }
}

// Fonction pour détecter le langage
function detectLanguage(filename) {
  if (!filename) return 'text';
  
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap = {
    'js': 'JavaScript',
    'jsx': 'JavaScript React',
    'ts': 'TypeScript',
    'tsx': 'TypeScript React',
    'py': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'cs': 'C#',
    'php': 'PHP',
    'rb': 'Ruby',
    'go': 'Go',
    'rs': 'Rust',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'dart': 'Dart',
    'vue': 'Vue.js',
    'svelte': 'Svelte',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'json': 'JSON',
    'md': 'Markdown',
    'sql': 'SQL',
    'sh': 'Shell Script',
    'yml': 'YAML',
    'yaml': 'YAML'
  };
  
  return languageMap[ext] || 'Code générique';
}

// Fonction pour construire le prompt système
function buildSystemPrompt(language, docType) {
  const basePrompt = `Tu es un expert en documentation de code spécialisé en ${language}. Tu génères des documentations claires, précises et utiles pour les développeurs.`;
  
  const docTypePrompts = {
    comprehensive: `Génère une documentation complète incluant :
- Description détaillée du code
- Paramètres et types
- Valeurs de retour
- Exemples d'utilisation
- Cas d'usage et bonnes pratiques
- Gestion des erreurs si applicable`,
    
    summary: `Génère un résumé concis incluant :
- Objectif principal du code
- Fonctionnement général
- Points clés à retenir`,
    
    api: `Génère une documentation API incluant :
- Interface publique
- Méthodes et endpoints
- Paramètres requis/optionnels
- Formats de réponse
- Codes d'erreur`
  };
  
  return `${basePrompt}\n\n${docTypePrompts[docType] || docTypePrompts.comprehensive}

Règles importantes :
- Utilise le français pour la documentation
- Sois précis et technique mais accessible
- Inclus des exemples pratiques quand c'est pertinent
- Structure ta réponse avec des titres et sections claires
- Ne répète pas le code, concentre-toi sur l'explication`;
}

// Fonction pour construire le prompt utilisateur
function buildUserPrompt(code, filename, customPrompt, language) {
  let prompt = `Voici le code ${language} du fichier "${filename}" à documenter :\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\`\n\n`;
  
  if (customPrompt) {
    prompt += `Instructions spécifiques : ${customPrompt}\n\n`;
  }
  
  prompt += `Génère la documentation demandée en français.`;
  
  return prompt;
}

// Fonction de post-traitement
function postProcessDocumentation(documentation, filename, language) {
  // Ajouter un en-tête si pas présent
  if (!documentation.startsWith('#')) {
    documentation = `# Documentation - ${filename}\n\n${documentation}`;
  }
  
  // Ajouter des métadonnées à la fin
  documentation += `\n\n---\n*Documentation générée automatiquement pour ${filename} (${language})*`;
  
  return documentation;
}

// Fonction pour générer une documentation mock (sans API)
function generateMockDocumentation(code, filename, docType) {
  const language = detectLanguage(filename);
  
  const mockDoc = `# Documentation - ${filename}

## Description
Ce fichier ${language} contient du code qui nécessite une analyse approfondie pour générer une documentation complète.

## Analyse du code
- **Langage détecté** : ${language}
- **Taille du code** : ${code.length} caractères
- **Nombre de lignes** : ${code.split('\n').length}

## Fonctionnalités détectées
${generateBasicAnalysis(code, language)}

## Notes
Cette documentation a été générée en mode démo. Pour une analyse complète avec l'IA, configurez votre clé API OpenRouter.

---
*Documentation générée en mode démo*`;

  return new Response(
    JSON.stringify({ 
      documentation: mockDoc,
      metadata: {
        language,
        docType,
        generatedAt: new Date().toISOString(),
        model: "openrouter-ai",
        demo: false
      }
    }), 
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}

// Fonction d'analyse basique
function generateBasicAnalysis(code, language) {
  const analysis = [];
  
  // Détection de fonctions
  const functionPatterns = {
    'JavaScript': /function\s+(\w+)|const\s+(\w+)\s*=|(\w+)\s*:/g,
    'Python': /def\s+(\w+)/g,
    'Java': /(public|private|protected)?\s*(static)?\s*\w+\s+(\w+)\s*\(/g
  };
  
  const pattern = functionPatterns[language];
  if (pattern) {
    const matches = [...code.matchAll(pattern)];
    if (matches.length > 0) {
      analysis.push(`- **Fonctions détectées** : ${matches.length} fonction(s)`);
    }
  }
  
  // Détection de classes
  if (code.includes('class ')) {
    const classMatches = code.match(/class\s+\w+/g);
    if (classMatches) {
      analysis.push(`- **Classes détectées** : ${classMatches.length} classe(s)`);
    }
  }
  
  // Détection d'imports
  if (code.includes('import ') || code.includes('require(')) {
    analysis.push(`- **Dépendances** : Le code utilise des modules externes`);
  }
  
  // Détection de commentaires
  const commentLines = code.split('\n').filter(line => 
    line.trim().startsWith('//') || 
    line.trim().startsWith('#') || 
    line.trim().startsWith('/*')
  ).length;
  
  if (commentLines > 0) {
    analysis.push(`- **Documentation existante** : ${commentLines} ligne(s) de commentaires`);
  }
  
  return analysis.length > 0 ? analysis.join('\n') : '- Code détecté, analyse détaillée disponible avec l\'IA';
}

// Fonction de documentation de fallback
function generateFallbackDocumentation(errorMessage) {
  const fallbackDoc = `# Documentation - Erreur de génération

## Erreur rencontrée
Une erreur s'est produite lors de la génération de la documentation automatique.

**Détails de l'erreur** : ${errorMessage}

## Solutions suggérées
1. Vérifiez votre connexion internet
2. Assurez-vous que la clé API OpenRouter est configurée
3. Réessayez dans quelques minutes
4. Contactez le support si le problème persiste

## Documentation manuelle
En attendant, vous pouvez :
- Analyser le code manuellement
- Consulter les commentaires existants dans le code
- Utiliser d'autres outils de documentation

---
*Documentation de fallback générée suite à une erreur*`;

  return new Response(
    JSON.stringify({ 
      documentation: fallbackDoc,
      error: true,
      errorMessage
    }), 
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}
