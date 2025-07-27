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

    console.log('Checkout session request:', { planId, customerEmail, customAmount });

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

    // Vérifier si Stripe est configuré
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('Stripe non configuré - retour d\'une URL de test');
      // Retourner une URL de test pour le développement
      const testUrl = `${successUrl}?test=true&plan=${planId}&email=${encodeURIComponent(customerEmail)}`;
      return NextResponse.json({
        success: true,
        sessionId: 'test_session_' + Date.now(),
        url: testUrl
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
      
      if (!plan || !plan.stripePriceId) {
        return NextResponse.json(
          { error: 'Plan invalide ou non configuré' },
          { status: 400 }
        );
      }

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
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        sessionId: result.sessionId,
        url: result.url
      });
    } else {
      return NextResponse.json(
        { error: result.error },
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