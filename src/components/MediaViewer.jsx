'use client';

import { useState, useEffect } from 'react';

export default function MediaViewer({ file, repo, commit }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier que c'est bien une image
  const isImage = (filename) => {
    if (!filename) return false;
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext);
  };

  useEffect(() => {
    if (!file || !repo || !isImage(file.name)) {
      setLoading(false);
      return;
    }

    const fetchImageUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construire l'URL raw GitHub
        const rawUrl = `https://raw.githubusercontent.com/${repo.owner?.login || repo.owner}/${repo.name}/${commit?.sha || 'main'}/${file.path}`;
        
        // Vérifier si l'image est accessible
        const response = await fetch(rawUrl, {
          method: 'HEAD',
          headers: repo.accessToken ? {
            'Authorization': `token ${repo.accessToken}`
          } : {}
        });

        if (response.ok) {
          setImageUrl(rawUrl);
        } else {
          throw new Error(`Image non accessible: ${response.status}`);
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'image:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchImageUrl();
  }, [file, repo, commit]);

  if (!isImage(file?.name)) {
    return (
      <div className="bg-gray-900 rounded-lg p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">⚠️</div>
            <p>Ce fichier n'est pas une image</p>
            <p className="text-sm mt-2">{file?.name}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement de l'image...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">⚠️</div>
            <p>Impossible de charger l'image</p>
            <p className="text-sm mt-2">{error}</p>
            <p className="text-xs mt-1">{file?.name}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="bg-gray-900 rounded-lg p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">🖼️</div>
            <p>Aucune image à afficher</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête de l'image */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🖼️</span>
          <div>
            <h2 className="text-lg font-semibold text-white">{file.name}</h2>
            <p className="text-sm text-gray-400 font-mono">{file.path}</p>
          </div>
        </div>
      </div>

      {/* Affichage de l'image */}
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <img 
            src={imageUrl}
            alt={file.name}
            className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="hidden text-center text-gray-400">
            <div className="text-6xl mb-4">🖼️</div>
            <p>Impossible de charger l'image</p>
            <p className="text-sm">{file.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 