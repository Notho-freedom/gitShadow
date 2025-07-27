import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Vérifier les variables d'environnement essentielles
    const requiredEnvVars = [
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      return NextResponse.json({
        status: 'warning',
        message: 'Application accessible mais certaines variables d\'environnement sont manquantes',
        missingVariables: missingVars,
        timestamp: new Date().toISOString()
      }, { status: 200 });
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Application fonctionnelle',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de santé:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erreur lors de la vérification de santé',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 