import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { headers } from 'next/headers';

export async function POST(request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Signature Stripe manquante' },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Erreur de signature webhook:', err.message);
      return NextResponse.json(
        { error: 'Signature webhook invalide' },
        { status: 400 }
      );
    }

    console.log('Événement webhook reçu:', event.type);

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erreur webhook:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Gestionnaires d'événements
async function handleCheckoutSessionCompleted(session) {
  console.log('Session de paiement complétée:', session.id);
  
  // Ici vous pouvez :
  // - Mettre à jour le statut de l'utilisateur
  // - Envoyer un email de confirmation
  // - Créer un compte utilisateur
  // - Activer les fonctionnalités premium
  
  const customerEmail = session.customer_email;
  const planId = session.metadata?.planId;
  
  console.log(`Utilisateur ${customerEmail} a souscrit au plan ${planId}`);
}

async function handleSubscriptionCreated(subscription) {
  console.log('Abonnement créé:', subscription.id);
  
  // Activer les fonctionnalités premium pour l'utilisateur
  const customerId = subscription.customer;
  const planId = subscription.metadata?.planId;
  
  console.log(`Abonnement créé pour le client ${customerId}, plan: ${planId}`);
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Abonnement mis à jour:', subscription.id);
  
  // Mettre à jour les fonctionnalités selon le nouveau plan
  const customerId = subscription.customer;
  const status = subscription.status;
  
  console.log(`Abonnement ${subscription.id} mis à jour, statut: ${status}`);
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Abonnement supprimé:', subscription.id);
  
  // Désactiver les fonctionnalités premium
  const customerId = subscription.customer;
  
  console.log(`Abonnement ${subscription.id} supprimé pour le client ${customerId}`);
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Paiement réussi:', invoice.id);
  
  // Confirmer le paiement et maintenir l'accès
  const customerId = invoice.customer;
  const amount = invoice.amount_paid;
  
  console.log(`Paiement de ${amount}€ réussi pour le client ${customerId}`);
}

async function handleInvoicePaymentFailed(invoice) {
  console.log('Paiement échoué:', invoice.id);
  
  // Gérer l'échec de paiement
  const customerId = invoice.customer;
  
  console.log(`Paiement échoué pour le client ${customerId}`);
  
  // Ici vous pouvez :
  // - Envoyer un email de rappel
  // - Limiter l'accès aux fonctionnalités
  // - Tenter un nouveau prélèvement
}

async function handleTrialWillEnd(subscription) {
  console.log('Essai se termine bientôt:', subscription.id);
  
  // Notifier l'utilisateur que l'essai se termine
  const customerId = subscription.customer;
  
  console.log(`Essai se termine bientôt pour le client ${customerId}`);
  
  // Ici vous pouvez :
  // - Envoyer un email de rappel
  // - Afficher une notification dans l'application
} 