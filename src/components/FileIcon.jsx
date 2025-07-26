'use client';

import { motion } from 'framer-motion';

export default function FileIcon({ type, name, size = 'md', className = '' }) {
  const getIcon = () => {
    const extension = name?.split('.').pop()?.toLowerCase();
    
    // Icônes personnalisées gitShadow
    const iconMap = {
      // Langages de programmation
      'js': '⚡', 'jsx': '⚛️', 'ts': '🔷', 'tsx': '🔷',
      'py': '🐍', 'java': '☕', 'cpp': '⚙️', 'c': '🔧',
      'cs': '💎', 'php': '🐘', 'rb': '💎', 'go': '🐹',
      'rs': '🦀', 'swift': '🍎', 'kt': '🤖', 'dart': '🎯',
      
      // Web
      'html': '🌐', 'css': '🎨', 'scss': '🎨', 'sass': '🎨',
      'less': '🎨', 'vue': '💚', 'svelte': '🟠',
      
      // Configuration
      'json': '📋', 'xml': '📄', 'yaml': '📝', 'yml': '📝',
      'toml': '⚙️', 'ini': '⚙️', 'env': '🔐', 'config': '⚙️',
      
      // Documentation
      'md': '📖', 'txt': '📄', 'rst': '📚', 'adoc': '📚',
      
      // Base de données
      'sql': '🗄️', 'db': '🗄️', 'sqlite': '🗄️',
      
      // Images
      'png': '🖼️', 'jpg': '🖼️', 'jpeg': '🖼️', 'gif': '🖼️',
      'svg': '🎨', 'ico': '🎨', 'webp': '🖼️',
      
      // Archives
      'zip': '📦', 'rar': '📦', 'tar': '📦', 'gz': '📦',
      '7z': '📦', 'bz2': '📦',
      
      // Autres
      'pdf': '📕', 'doc': '📘', 'docx': '📘', 'xls': '📗',
      'xlsx': '📗', 'ppt': '📙', 'pptx': '📙',
      
      // Dossiers spéciaux
      'node_modules': '📚', 'dist': '📦', 'build': '🔨',
      'src': '📁', 'public': '🌍', 'assets': '💎',
      'components': '🧩', 'pages': '📄', 'utils': '🔧',
      'hooks': '🎣', 'context': '🔄', 'styles': '🎨',
      'tests': '🧪', 'test': '🧪', '__tests__': '🧪',
      'docs': '📚', 'documentation': '📚', 'examples': '💡',
      'templates': '📋', 'layouts': '🏗️', 'middleware': '🔗',
      'api': '🔌', 'routes': '🛣️', 'controllers': '🎮',
      'models': '🏗️', 'views': '👁️', 'services': '⚙️',
      'helpers': '🤝', 'lib': '📚', 'vendor': '🏪',
      'cache': '💾', 'logs': '📊', 'temp': '🔥',
      'backup': '💾', 'archive': '📦', 'old': '📜',
      'legacy': '📜', 'deprecated': '⚠️'
    };

    // Vérifier d'abord les dossiers spéciaux
    if (type === 'tree') {
      const folderName = name?.toLowerCase();
      for (const [key, icon] of Object.entries(iconMap)) {
        if (folderName === key || folderName?.includes(key)) {
          return icon;
        }
      }
      return '📁'; // Dossier par défaut
    }

    // Vérifier l'extension pour les fichiers
    if (extension && iconMap[extension]) {
      return iconMap[extension];
    }

    // Fichiers par défaut selon le type
    return '📄';
  };

  const sizeClasses = {
    sm: 'w-4 h-4 text-sm',
    md: 'w-5 h-5 text-base',
    lg: 'w-6 h-6 text-lg',
    xl: 'w-8 h-8 text-xl'
  };

  const icon = getIcon();

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}
      title={`${type === 'tree' ? 'Dossier' : 'Fichier'}: ${name}`}
    >
      {icon}
    </motion.span>
  );
} 