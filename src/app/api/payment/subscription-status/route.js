import { NextResponse } from 'next/server';
import { getCustomerSubscriptions, getCustomer } from '../../../../lib/stripe';

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, customerEmail } = body;

    if (!customerId && !customerEmail) {
      return NextResponse.json(
        { error: 'ID client ou email requis' },
        { status: 400 }
      );
    }

    let customer;
    let subscriptions;

    if (customerId) {
      // Récupérer directement avec l'ID client
      const customerResult = await getCustomer(customerId);
      if (!customerResult.success) {
        return NextResponse.json(
          { error: 'Client non trouvé' },
          { status: 404 }
        );
      }
      customer = customerResult.customer;
    } else {
      // Chercher le client par email
      const customerResult = await getCustomer(customerEmail);
      if (!customerResult.success) {
        return NextResponse.json(
          { error: 'Client non trouvé' },
          { status: 404 }
        );
      }
      customer = customerResult.customer;
    }

    // Récupérer les abonnements du client
    const subscriptionsResult = await getCustomerSubscriptions(customer.id);
    
    if (!subscriptionsResult.success) {
      return NextResponse.json(
        { error: subscriptionsResult.error },
        { status: 500 }
      );
    }

    subscriptions = subscriptionsResult.subscriptions;

    // Trouver l'abonnement actif
    const activeSubscription = subscriptions.find(sub => 
      sub.status === 'active' || sub.status === 'trialing'
    );

    // Formater la réponse
    const response = {
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        created: customer.created
      },
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        status: sub.status,
        planId: sub.metadata?.planId,
        planName: sub.metadata?.planName,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        canceledAt: sub.canceled_at,
        trialStart: sub.trial_start,
        trialEnd: sub.trial_end,
        amount: sub.items.data[0]?.price.unit_amount,
        currency: sub.items.data[0]?.price.currency,
        interval: sub.items.data[0]?.price.recurring?.interval
      })),
      activeSubscription: activeSubscription ? {
        id: activeSubscription.id,
        status: activeSubscription.status,
        planId: activeSubscription.metadata?.planId,
        planName: activeSubscription.metadata?.planName,
        currentPeriodStart: activeSubscription.current_period_start,
        currentPeriodEnd: activeSubscription.current_period_end,
        cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
        canceledAt: activeSubscription.canceled_at,
        trialStart: activeSubscription.trial_start,
        trialEnd: activeSubscription.trial_end,
        amount: activeSubscription.items.data[0]?.price.unit_amount,
        currency: activeSubscription.items.data[0]?.price.currency,
        interval: activeSubscription.items.data[0]?.price.recurring?.interval
      } : null
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur lors de la récupération du statut d\'abonnement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 