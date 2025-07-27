import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { planId, customerEmail, successUrl, cancelUrl, metadata } = await request.json();

    console.log('Création de session de paiement:', { planId, customerEmail });

    // Validation des données
    if (!planId || !customerEmail || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Données manquantes pour la création de la session' },
        { status: 400 }
      );
    }

    // Vérifier si Stripe est configuré
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('Stripe non configuré - mode développement activé');
      
      // Mode développement : simuler le processus de paiement
      const plans = {
        'pro': { name: 'Pro', price: '19' },
        'enterprise': { name: 'Enterprise', price: '199' }
      };
      
      const plan = plans[planId];
      if (!plan) {
        return NextResponse.json(
          { error: 'Plan invalide' },
          { status: 400 }
        );
      }

      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Retourner une URL de succès simulée
      const testSuccessUrl = `${successUrl}?test=true&plan=${planId}&email=${encodeURIComponent(customerEmail)}&amount=${plan.price}`;
      
      return NextResponse.json({
        sessionId: `test_session_${Date.now()}`,
        sessionUrl: testSuccessUrl,
        isTest: true
      });
    }

    // Importer Stripe de manière dynamique
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Définir les prix Stripe selon le plan
    const priceMap = {
      'pro': process.env.STRIPE_PRO_PRICE_ID,
      'enterprise': process.env.STRIPE_ENTERPRISE_PRICE_ID
    };

    const priceId = priceMap[planId];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Plan invalide' },
        { status: 400 }
      );
    }

    // Créer la session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        ...metadata,
        planId,
        createdAt: new Date().toISOString()
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: {
          planId,
          userId: metadata?.userId,
          userLogin: metadata?.userLogin
        }
      }
    });

    console.log('Session créée avec succès:', session.id);

    return NextResponse.json({
      sessionId: session.id,
      sessionUrl: session.url,
      isTest: false
    });

  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
} 