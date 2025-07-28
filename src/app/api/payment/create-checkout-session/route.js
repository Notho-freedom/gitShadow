import { NextResponse } from 'next/server';
import { createCheckoutSession, createCustomCheckoutSession } from '../../../../lib/stripe';
import { getPlanById } from '../../../../lib/pricing';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      planId, 
      customerEmail, 
      successUrl, 
      cancelUrl, 
      customAmount,
      metadata = {} 
    } = body;

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Email client requis' },
        { status: 400 }
      );
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'URLs de succès et d\'annulation requises' },
        { status: 400 }
      );
    }

    // En mode développement, simuler une session de checkout
    if (process.env.NODE_ENV === 'development') {
      console.log('Mode développement : simulation de session de checkout');
      return NextResponse.json({
        sessionId: 'cs_test_simulation_' + Date.now(),
        url: successUrl,
        success: true
      });
    }

    let result;

    if (customAmount) {
      // Paiement personnalisé (pour le plan Enterprise)
      result = await createCustomCheckoutSession({
        amount: customAmount,
        customerEmail,
        successUrl,
        cancelUrl,
        metadata: {
          ...metadata,
          planId: planId || 'enterprise',
          type: 'custom'
        }
      });
    } else {
      // Paiement standard avec plan
      const plan = getPlanById(planId);
      
      if (!plan) {
        return NextResponse.json(
          { error: `Plan '${planId}' non trouvé` },
          { status: 400 }
        );
      }

      if (!plan.stripePriceId) {
        return NextResponse.json(
          { error: `Plan '${plan.name}' non configuré pour les paiements` },
          { status: 400 }
        );
      }

      try {
        result = await createCheckoutSession({
          priceId: plan.stripePriceId,
          customerEmail,
          successUrl,
          cancelUrl,
          metadata: {
            ...metadata,
            planId: plan.id,
            planName: plan.name
          }
        });
      } catch (stripeError) {
        console.error('Erreur Stripe:', stripeError);
        return NextResponse.json(
          { error: `Erreur Stripe: ${stripeError.message}` },
          { status: 500 }
        );
      }
    }

    if (result.success) {
      return NextResponse.json({
        sessionId: result.sessionId,
        url: result.url
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Erreur lors de la création de la session' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 