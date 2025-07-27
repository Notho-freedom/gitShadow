import { NextResponse } from 'next/server';
import { createCustomerPortalSession } from '../../../../lib/stripe';

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, returnUrl } = body;

    console.log('Customer portal request:', { customerId, returnUrl });

    if (!customerId) {
      console.error('Customer ID manquant');
      return NextResponse.json(
        { error: 'ID client requis' },
        { status: 400 }
      );
    }

    if (!returnUrl) {
      console.error('Return URL manquante');
      return NextResponse.json(
        { error: 'URL de retour requise' },
        { status: 400 }
      );
    }

    // Vérifier si Stripe est configuré
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe non configuré');
      return NextResponse.json(
        { error: 'Stripe non configuré' },
        { status: 500 }
      );
    }

    const result = await createCustomerPortalSession(customerId, returnUrl);

    if (result.success) {
      console.log('Portail client créé avec succès');
      return NextResponse.json({
        url: result.url
      });
    } else {
      console.error('Erreur lors de la création du portail:', result.error);
      return NextResponse.json(
        { error: result.error || 'Erreur lors de la création du portail client' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur lors de la création du portail client:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 