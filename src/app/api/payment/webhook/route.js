import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Erreur de signature webhook:', err.message);
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 400 }
      );
    }

    console.log('Webhook reçu:', event.type);

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
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
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

async function handleCheckoutSessionCompleted(session) {
  console.log('Session de paiement complétée:', session.id);
  
  // Ici vous pouvez mettre à jour votre base de données
  // pour marquer l'utilisateur comme ayant un abonnement actif
  const { planId, userId, userLogin } = session.metadata;
  
  // Exemple de mise à jour (à adapter selon votre base de données)
  try {
    // Mettre à jour le plan de l'utilisateur
    // await updateUserPlan(userId, planId);
    console.log(`Utilisateur ${userLogin} (${userId}) a souscrit au plan ${planId}`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du plan utilisateur:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('Abonnement créé:', subscription.id);
  
  const { planId, userId, userLogin } = subscription.metadata;
  
  try {
    // Marquer l'abonnement comme actif
    // await activateSubscription(subscription.id, userId, planId);
    console.log(`Abonnement activé pour ${userLogin} (${userId}) - Plan: ${planId}`);
  } catch (error) {
    console.error('Erreur lors de l\'activation de l\'abonnement:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Abonnement mis à jour:', subscription.id);
  
  const { planId, userId, userLogin } = subscription.metadata;
  const status = subscription.status;
  
  try {
    // Mettre à jour le statut de l'abonnement
    // await updateSubscriptionStatus(subscription.id, status, planId);
    console.log(`Abonnement mis à jour pour ${userLogin} (${userId}) - Statut: ${status}`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Abonnement supprimé:', subscription.id);
  
  const { userId, userLogin } = subscription.metadata;
  
  try {
    // Marquer l'abonnement comme inactif
    // await deactivateSubscription(subscription.id, userId);
    console.log(`Abonnement désactivé pour ${userLogin} (${userId})`);
  } catch (error) {
    console.error('Erreur lors de la désactivation de l\'abonnement:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('Paiement réussi:', invoice.id);
  
  // Ici vous pouvez gérer les paiements récurrents réussis
  const subscriptionId = invoice.subscription;
  
  try {
    // Marquer le paiement comme réussi
    // await markPaymentSucceeded(invoice.id, subscriptionId);
    console.log(`Paiement marqué comme réussi pour l'abonnement ${subscriptionId}`);
  } catch (error) {
    console.error('Erreur lors du traitement du paiement:', error);
  }
}

async function handlePaymentFailed(invoice) {
  console.log('Paiement échoué:', invoice.id);
  
  const subscriptionId = invoice.subscription;
  
  try {
    // Gérer l'échec de paiement
    // await handlePaymentFailure(invoice.id, subscriptionId);
    console.log(`Échec de paiement traité pour l'abonnement ${subscriptionId}`);
  } catch (error) {
    console.error('Erreur lors du traitement de l\'échec de paiement:', error);
  }
} 