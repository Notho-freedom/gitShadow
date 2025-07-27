import { NextResponse } from 'next/server';
import { reactivateSubscription } from '../../../../lib/stripe';

export async function POST(request) {
  try {
    const body = await request.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'ID d\'abonnement requis' },
        { status: 400 }
      );
    }

    const result = await reactivateSubscription(subscriptionId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        subscription: result.subscription,
        message: 'Abonnement réactivé avec succès'
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur lors de la réactivation de l\'abonnement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 