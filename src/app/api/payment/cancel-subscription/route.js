import { NextResponse } from 'next/server';
import { cancelSubscription } from '../../../../lib/stripe';

export async function POST(request) {
  try {
    const body = await request.json();
    const { subscriptionId, cancelAtPeriodEnd = true } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'ID d\'abonnement requis' },
        { status: 400 }
      );
    }

    const result = await cancelSubscription(subscriptionId, cancelAtPeriodEnd);

    if (result.success) {
      return NextResponse.json({
        success: true,
        subscription: result.subscription,
        message: cancelAtPeriodEnd 
          ? 'Abonnement annulé à la fin de la période actuelle'
          : 'Abonnement annulé immédiatement'
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 