import './globals.css';

export const metadata = {
  title: 'gitShadow - AI Documentation Generator',
  description: 'Generate smart documentation from your Git repository with AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn.tailwindcss.com" 
          key="tailwind-cdn"
        />
        <link 
          rel="preconnect" 
          href="https://fonts.googleapis.com" 
          key="font-preconnect-1"
        />
        <link 
          rel="preconnect" 
          href="https://fonts.gstatic.com" 
          crossOrigin="anonymous"
          key="font-preconnect-2"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
          key="font-stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-900 text-white font-sans antialiased">
        <div className="relative min-h-screen">
          {/* Futuristic background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 pointer-events-none" />
          
          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
