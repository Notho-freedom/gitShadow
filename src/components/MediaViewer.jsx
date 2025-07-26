'use client';

import { useState, useEffect } from 'react';

export default function MediaViewer({ file, repo, commit }) {
  const [mediaUrl, setMediaUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Détection du type de fichier
  const getFileType = (filename) => {
    if (!filename) return 'unknown';
    const ext = filename.split('.').pop()?.toLowerCase();
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext)) {
      return 'image';
    }
    
    // Vidéos
    if (['mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv', 'flv', 'wmv'].includes(ext)) {
      return 'video';
    }
    
    // Audio
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext)) {
      return 'audio';
    }
    
    // PDF
    if (ext === 'pdf') {
      return 'pdf';
    }
    
    // Documents Office
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
      return 'office';
    }
    
    return 'unknown';
  };

  useEffect(() => {
    if (!file || !repo) {
      setLoading(false);
      return;
    }

    const fetchMediaUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construire l'URL raw GitHub
        const rawUrl = `https://raw.githubusercontent.com/${repo.owner?.login || repo.owner}/${repo.name}/${commit?.sha || 'main'}/${file.path}`;
        
        // Vérifier si le fichier est accessible
        const response = await fetch(rawUrl, {
          method: 'HEAD',
          headers: repo.accessToken ? {
            'Authorization': `token ${repo.accessToken}`
          } : {}
        });

        if (response.ok) {
          setMediaUrl(rawUrl);
        } else {
          throw new Error(`Fichier non accessible: ${response.status}`);
        }
      } catch (err) {
        console.error('Erreur lors du chargement du média:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaUrl();
  }, [file, repo, commit]);

  const fileType = getFileType(file?.name);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement du média...</p>
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
            <p>Impossible de charger le média</p>
            <p className="text-sm mt-2">{error}</p>
            <p className="text-xs mt-1">{file?.name}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!mediaUrl) {
    return (
      <div className="bg-gray-900 rounded-lg p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">📄</div>
            <p>Aucun média à afficher</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête du fichier */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">
            {fileType === 'image' ? '🖼️' : 
             fileType === 'video' ? '🎥' : 
             fileType === 'audio' ? '🎵' : 
             fileType === 'pdf' ? '📄' : 
             fileType === 'office' ? '📊' : '📄'}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">{file.name}</h2>
            <p className="text-sm text-gray-400 font-mono">{file.path}</p>
          </div>
        </div>
      </div>

      {/* Affichage du média */}
      <div className="bg-gray-900 rounded-lg p-4">
        {fileType === 'image' && (
          <div className="flex items-center justify-center min-h-[400px]">
            <img 
              src={mediaUrl}
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
        )}

        {fileType === 'video' && (
          <div className="flex items-center justify-center">
            <video 
              controls 
              className="w-full max-h-[600px] rounded-lg"
              preload="metadata"
            >
              <source src={mediaUrl} type="video/mp4" />
              <source src={mediaUrl} type="video/webm" />
              <source src={mediaUrl} type="video/ogg" />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
        )}

        {fileType === 'audio' && (
          <div className="flex items-center justify-center">
            <audio 
              controls 
              className="w-full max-w-md"
              preload="metadata"
            >
              <source src={mediaUrl} type="audio/mpeg" />
              <source src={mediaUrl} type="audio/wav" />
              <source src={mediaUrl} type="audio/ogg" />
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
          </div>
        )}

        {fileType === 'pdf' && (
          <div className="flex items-center justify-center">
            <iframe
              src={mediaUrl}
              className="w-full h-[600px] rounded-lg"
              title={file.name}
            />
          </div>
        )}

        {fileType === 'office' && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-400 mb-4">Document Office détecté</p>
              <div className="space-y-2">
                <a 
                  href={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(mediaUrl)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Ouvrir avec Office Online
                </a>
                <br />
                <a 
                  href={mediaUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Télécharger le fichier
                </a>
              </div>
            </div>
          </div>
        )}

        {fileType === 'unknown' && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">📄</div>
              <p>Type de fichier non supporté</p>
              <p className="text-sm mt-2">{file.name}</p>
              <a 
                href={mediaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Ouvrir dans un nouvel onglet
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 