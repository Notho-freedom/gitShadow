'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function GuestCommitHistory({ commits, onCommitSelect, selectedCommit }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLimit, setShowLimit] = useState(10);

  const filteredCommits = commits.filter(commit => {
    if (!searchQuery) return true;
    
    const message = commit.message || commit.commit?.message || '';
    const authorName = commit.author?.name || commit.commit?.author?.name || '';
    const sha = commit.sha || '';
    
    return message.toLowerCase().includes(searchQuery.toLowerCase()) ||
           authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           sha.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const displayedCommits = filteredCommits.slice(0, showLimit);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `Il y a ${days}j`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const getCommitType = (message) => {
    if (!message) return 'other';
    
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.startsWith('feat')) return 'feature';
    if (lowerMessage.startsWith('fix')) return 'fix';
    if (lowerMessage.startsWith('docs')) return 'docs';
    if (lowerMessage.startsWith('style')) return 'style';
    if (lowerMessage.startsWith('refactor')) return 'refactor';
    if (lowerMessage.startsWith('test')) return 'test';
    if (lowerMessage.startsWith('chore')) return 'chore';
    return 'other';
  };

  const getCommitColor = (type) => {
    const colors = {
      feature: 'bg-green-500/20 text-green-400 border-green-500/30',
      fix: 'bg-red-500/20 text-red-400 border-red-500/30',
      docs: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      style: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      refactor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      test: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      chore: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      other: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[type] || colors.other;
  };

  const truncateSha = (sha) => {
    return sha ? sha.substring(0, 7) : '';
  };

  const truncateMessage = (message, maxLength = 60) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un commit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Commits List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {displayedCommits.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchQuery ? 'Aucun commit trouvé' : 'Aucun commit disponible'}
          </div>
        ) : (
          displayedCommits.map((commit, index) => {
            const message = commit.message || commit.commit?.message || 'Sans message';
            const commitType = getCommitType(message);
            const isSelected = selectedCommit?.sha === commit.sha;
            
            return (
              <motion.div
                key={commit.sha}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'bg-blue-500/20 border-blue-500/30'
                    : 'hover:bg-white/5 border-white/10'
                }`}
                onClick={() => onCommitSelect(commit)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getCommitColor(commitType)}`}>
                      {commitType}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {truncateSha(commit.sha)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(commit.date || commit.commit?.author?.date)}
                  </span>
                </div>
                
                <div className="text-sm text-white font-medium mb-1">
                  {truncateMessage(message)}
                </div>
                
                {commit.author && (
                  <div className="flex items-center space-x-2">
                    {commit.author.avatar_url && (
                      <img
                        src={commit.author.avatar_url}
                        alt={commit.author.name}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <span className="text-xs text-gray-400">
                      {commit.author.name}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Load More Button */}
      {filteredCommits.length > showLimit && (
        <div className="text-center pt-4">
          <button
            onClick={() => setShowLimit(prev => prev + 10)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
          >
            Charger plus ({filteredCommits.length - showLimit} restants)
          </button>
        </div>
      )}

      {/* Guest Notice */}
      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-yellow-400">
            Mode invité : Historique limité. Connectez-vous pour l'historique complet.
          </span>
        </div>
      </div>
    </div>
  );
} 