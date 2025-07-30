import './globals.css';
import { AuthProvider } from '../components/AuthProvider';

export const metadata = {
  title: 'gitShadow - AI Documentation Generator',
  description: 'Generate smart documentation from your Git repository with AI',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'gitShadow - AI Documentation Generator',
    description: 'Generate smart documentation from your Git repository with AI',
    url: 'https://gitshadow.com',
    siteName: 'gitShadow',
    images: [
      {
        url: '/cover.png',
        width: 1200,
        height: 630,
        alt: 'gitShadow - AI Documentation Generator',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'gitShadow - AI Documentation Generator',
    description: 'Generate smart documentation from your Git repository with AI',
    images: ['/cover.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
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
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
