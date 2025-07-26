'use client';

import { useState, useEffect } from 'react';

export default function CommitHistory({ repo, onCommitSelect, selectedCommit }) {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (repo) {
      fetchCommits();
    }
  }, [repo, branch]);

  const fetchCommits = async (pageNum = 1) => {
    if (!repo) return;
    
    setLoading(pageNum === 1);
    try {
      // Simulation des données de commits
      const mockCommits = [
        {
          sha: 'a1b2c3d4e5f6789012345678901234567890abcd',
          commit: {
            message: 'feat: Ajout du système d\'authentification OAuth2\n\n- Intégration GitHub OAuth\n- Gestion des tokens JWT\n- Middleware de sécurité',
            author: {
              name: 'John Doe',
              email: 'john@example.com',
              date: '2024-01-15T10:30:00Z'
            },
            committer: {
              name: 'John Doe',
              email: 'john@example.com',
              date: '2024-01-15T10:30:00Z'
            }
          },
          author: {
            login: 'johndoe',
            avatar_url: 'https://github.com/identicons/johndoe.png'
          },
          stats: {
            additions: 245,
            deletions: 12,
            total: 257
          },
          files: [
            { filename: 'src/auth/oauth.js', status: 'added', additions: 89, deletions: 0 },
            { filename: 'src/middleware/auth.js', status: 'modified', additions: 34, deletions: 8 },
            { filename: 'package.json', status: 'modified', additions: 3, deletions: 1 }
          ]
        },
        {
          sha: 'b2c3d4e5f6789012345678901234567890abcdef',
          commit: {
            message: 'fix: Correction du bug de pagination dans la liste des dépôts',
            author: {
              name: 'Jane Smith',
              email: 'jane@example.com',
              date: '2024-01-14T16:45:00Z'
            },
            committer: {
              name: 'Jane Smith',
              email: 'jane@example.com',
              date: '2024-01-14T16:45:00Z'
            }
          },
          author: {
            login: 'janesmith',
            avatar_url: 'https://github.com/identicons/janesmith.png'
          },
          stats: {
            additions: 23,
            deletions: 15,
            total: 38
          },
          files: [
            { filename: 'src/components/RepositoryList.jsx', status: 'modified', additions: 23, deletions: 15 }
          ]
        },
        {
          sha: 'c3d4e5f6789012345678901234567890abcdef12',
          commit: {
            message: 'docs: Mise à jour de la documentation API\n\n- Ajout des exemples d\'utilisation\n- Correction des typos\n- Amélioration de la structure',
            author: {
              name: 'Bob Wilson',
              email: 'bob@example.com',
              date: '2024-01-13T09:20:00Z'
            },
            committer: {
              name: 'Bob Wilson',
              email: 'bob@example.com',
              date: '2024-01-13T09:20:00Z'
            }
          },
          author: {
            login: 'bobwilson',
            avatar_url: 'https://github.com/identicons/bobwilson.png'
          },
          stats: {
            additions: 156,
            deletions: 43,
            total: 199
          },
          files: [
            { filename: 'README.md', status: 'modified', additions: 89, deletions: 23 },
            { filename: 'docs/api.md', status: 'added', additions: 67, deletions: 0 },
            { filename: 'docs/examples.md', status: 'modified', additions: 0, deletions: 20 }
          ]
        },
        {
          sha: 'd4e5f6789012345678901234567890abcdef1234',
          commit: {
            message: 'refactor: Restructuration du code des composants React',
            author: {
              name: 'Alice Brown',
              email: 'alice@example.com',
              date: '2024-01-12T14:10:00Z'
            },
            committer: {
              name: 'Alice Brown',
              email: 'alice@example.com',
              date: '2024-01-12T14:10:00Z'
            }
          },
          author: {
            login: 'alicebrown',
            avatar_url: 'https://github.com/identicons/alicebrown.png'
          },
          stats: {
            additions: 89,
            deletions: 134,
            total: 223
          },
          files: [
            { filename: 'src/components/Dashboard.jsx', status: 'modified', additions: 45, deletions: 67 },
            { filename: 'src/components/FileViewer.jsx', status: 'modified', additions: 23, deletions: 34 },
            { filename: 'src/hooks/useAuth.js', status: 'added', additions: 21, deletions: 0 }
          ]
        },
        {
          sha: 'e5f6789012345678901234567890abcdef123456',
          commit: {
            message: 'style: Amélioration du design de l\'interface utilisateur',
            author: {
              name: 'Charlie Davis',
              email: 'charlie@example.com',
              date: '2024-01-11T11:30:00Z'
            },
            committer: {
              name: 'Charlie Davis',
              email: 'charlie@example.com',
              date: '2024-01-11T11:30:00Z'
            }
          },
          author: {
            login: 'charliedavis',
            avatar_url: 'https://github.com/identicons/charliedavis.png'
          },
          stats: {
            additions: 67,
            deletions: 23,
            total: 90
          },
          files: [
            { filename: 'src/styles/globals.css', status: 'modified', additions: 45, deletions: 12 },
            { filename: 'tailwind.config.js', status: 'modified', additions: 22, deletions: 11 }
          ]
        }
      ];

      if (pageNum === 1) {
        setCommits(mockCommits);
      } else {
        setCommits(prev => [...prev, ...mockCommits]);
      }
      
      setHasMore(pageNum < 3); // Simulation de 3 pages max
    } catch (error) {
      console.error('Erreur lors du chargement des commits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCommitType = (message) => {
    const types = {
      'feat': { label: 'Feature', color: 'bg-green-500', icon: '✨' },
      'fix': { label: 'Fix', color: 'bg-red-500', icon: '🐛' },
      'docs': { label: 'Docs', color: 'bg-blue-500', icon: '📚' },
      'style': { label: 'Style', color: 'bg-purple-500', icon: '💄' },
      'refactor': { label: 'Refactor', color: 'bg-yellow-500', icon: '♻️' },
      'test': { label: 'Test', color: 'bg-orange-500', icon: '🧪' },
      'chore': { label: 'Chore', color: 'bg-gray-500', icon: '🔧' }
    };

    for (const [key, value] of Object.entries(types)) {
      if (message.toLowerCase().startsWith(key + ':')) {
        return value;
      }
    }
    return { label: 'Other', color: 'bg-gray-500', icon: '📝' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'hier';
    if (diffDays < 7) return `il y a ${diffDays} jours`;
    if (diffDays < 30) return `il y a ${Math.ceil(diffDays / 7)} semaines`;
    return date.toLocaleDateString('fr-FR');
  };

  const filteredCommits = commits.filter(commit =>
    commit.commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commit.commit.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!repo) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Sélectionnez un dépôt</h3>
          <p className="text-gray-400">Choisissez un dépôt pour voir son historique de commits</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Historique des Commits</h2>
            <p className="text-gray-400">{repo.name}</p>
          </div>
          <div className="text-sm text-gray-400">
            {filteredCommits.length} commit{filteredCommits.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher dans les commits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="main">main</option>
            <option value="develop">develop</option>
            <option value="feature/auth">feature/auth</option>
          </select>
        </div>
      </div>

      {loading && commits.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des commits...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCommits.map((commit) => {
            const commitType = getCommitType(commit.commit.message);
            const isSelected = selectedCommit?.sha === commit.sha;
            
            return (
              <div
                key={commit.sha}
                onClick={() => onCommitSelect(commit)}
                className={`p-6 bg-gray-800/50 border rounded-lg cursor-pointer transition-all duration-200 hover:border-gray-600 hover:bg-gray-800/70 ${
                  isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <img
                    src={commit.author?.avatar_url || '/default-avatar.png'}
                    alt={commit.commit.author.name}
                    className="w-10 h-10 rounded-full"
                  />

                  <div className="flex-1 min-w-0">
                    {/* Message du commit */}
                    <div className="flex items-start space-x-3 mb-2">
                      <div className={`px-2 py-1 ${commitType.color} text-white text-xs rounded-full flex items-center space-x-1`}>
                        <span>{commitType.icon}</span>
                        <span>{commitType.label}</span>
                      </div>
                      <h3 className="text-white font-medium flex-1 line-clamp-2">
                        {commit.commit.message.split('\n')[0]}
                      </h3>
                    </div>

                    {/* Détails du commit */}
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                      <span>{commit.commit.author.name}</span>
                      <span>•</span>
                      <span>{formatDate(commit.commit.author.date)}</span>
                      <span>•</span>
                      <span className="font-mono text-xs">{commit.sha.substring(0, 7)}</span>
                    </div>

                    {/* Statistiques */}
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400">+{commit.stats.additions}</span>
                        <span className="text-red-400">-{commit.stats.deletions}</span>
                      </div>
                      <div className="text-gray-400">
                        {commit.files.length} fichier{commit.files.length > 1 ? 's' : ''} modifié{commit.files.length > 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Fichiers modifiés (aperçu) */}
                    {commit.files.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {commit.files.slice(0, 3).map((file, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded ${
                              file.status === 'added' ? 'bg-green-500/20 text-green-400' :
                              file.status === 'modified' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {file.filename}
                          </span>
                        ))}
                        {commit.files.length > 3 && (
                          <span className="px-2 py-1 text-xs rounded bg-gray-500/20 text-gray-400">
                            +{commit.files.length - 3} autres
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bouton charger plus */}
          {hasMore && !loading && (
            <div className="text-center pt-6">
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchCommits(nextPage);
                }}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded-lg transition-colors"
              >
                Charger plus de commits
              </button>
            </div>
          )}

          {loading && commits.length > 0 && (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}
        </div>
      )}

      {filteredCommits.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Aucun commit trouvé</h3>
          <p className="text-gray-400">
            {searchQuery ? 'Essayez de modifier votre recherche' : 'Ce dépôt n\'a pas encore de commits'}
          </p>
        </div>
      )}
    </div>
  );
}
