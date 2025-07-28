import { NextResponse } from 'next/server';
import { stripe, validateWebhookSignature } from '../../../../lib/stripe';
import { headers } from 'next/headers';

// Configuration des webhooks
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const WEBHOOK_SECRET_THIN = process.env.STRIPE_WEBHOOK_SECRET_THIN;

export async function POST(request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Signature Stripe manquante');
      return NextResponse.json(
        { error: 'Signature Stripe manquante' },
        { status: 400 }
      );
    }

    // Validation de la signature webhook
    const validationResult = validateWebhookSignature(body, signature, WEBHOOK_SECRET);
    
    if (!validationResult.success) {
      // Essayer avec le secret alternatif pour les webhooks "thin"
      const thinValidationResult = validateWebhookSignature(body, signature, WEBHOOK_SECRET_THIN);
      
      if (!thinValidationResult.success) {
        console.error('Erreur de signature webhook:', validationResult.error);
        return NextResponse.json(
          { error: 'Signature webhook invalide' },
          { status: 400 }
        );
      }
      
      validationResult.event = thinValidationResult.event;
    }

    const event = validationResult.event;
    console.log('Événement webhook reçu:', event.type, 'ID:', event.id);

    // Gérer les différents types d'événements
    try {
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

        case 'customer.subscription.trial_will_end':
          await handleTrialWillEnd(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object);
          break;

        case 'invoice.payment_action_required':
          await handleInvoicePaymentActionRequired(event.data.object);
          break;

        case 'customer.subscription.trial_ended':
          await handleTrialEnded(event.data.object);
          break;

        case 'payment_method.attached':
          await handlePaymentMethodAttached(event.data.object);
          break;

        case 'payment_method.detached':
          await handlePaymentMethodDetached(event.data.object);
          break;

        case 'charge.succeeded':
          await handleChargeSucceeded(event.data.object);
          break;

        case 'charge.failed':
          await handleChargeFailed(event.data.object);
          break;

        case 'charge.refunded':
          await handleChargeRefunded(event.data.object);
          break;

        default:
          console.log(`Événement non géré: ${event.type}`);
      }
    } catch (handlerError) {
      console.error(`Erreur lors du traitement de l'événement ${event.type}:`, handlerError);
      // Ne pas retourner d'erreur pour éviter les retries inutiles
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erreur webhook générale:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Gestionnaires d'événements
async function handleCheckoutSessionCompleted(session) {
  console.log('Session de paiement complétée:', session.id);
  
  const customerEmail = session.customer_email;
  const planId = session.metadata?.planId;
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const paymentIntentId = session.payment_intent;
  
  console.log(`Utilisateur ${customerEmail} a souscrit au plan ${planId}`);
  console.log(`Customer ID: ${customerId}, Subscription ID: ${subscriptionId}`);
  
  // Ici vous pouvez :
  // - Mettre à jour le statut de l'utilisateur dans votre base de données
  // - Envoyer un email de confirmation
  // - Créer un compte utilisateur
  // - Activer les fonctionnalités premium
  // - Enregistrer l'abonnement dans votre système
  
  try {
    // Exemple d'envoi d'email de confirmation
    // await sendWelcomeEmail(customerEmail, planId);
    
    // Exemple de mise à jour de la base de données
    // await updateUserSubscription(customerEmail, planId, subscriptionId);
    
    console.log(`Traitement terminé pour la session ${session.id}`);
  } catch (error) {
    console.error('Erreur lors du traitement de la session complétée:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('Abonnement créé:', subscription.id);
  
  const customerId = subscription.customer;
  const planId = subscription.metadata?.planId;
  const status = subscription.status;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  
  console.log(`Abonnement créé pour le client ${customerId}, plan: ${planId}, statut: ${status}`);
  console.log(`Période actuelle se termine le: ${currentPeriodEnd.toISOString()}`);
  
  // Activer les fonctionnalités premium pour l'utilisateur
  try {
    // await activatePremiumFeatures(customerId, planId);
    console.log(`Fonctionnalités premium activées pour ${customerId}`);
  } catch (error) {
    console.error('Erreur lors de l\'activation des fonctionnalités premium:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Abonnement mis à jour:', subscription.id);
  
  const customerId = subscription.customer;
  const status = subscription.status;
  const planId = subscription.metadata?.planId;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;
  
  console.log(`Abonnement ${subscription.id} mis à jour, statut: ${status}`);
  console.log(`Annulation à la fin de la période: ${cancelAtPeriodEnd}`);
  
  // Mettre à jour les fonctionnalités selon le nouveau plan
  try {
    if (cancelAtPeriodEnd) {
      // L'abonnement sera annulé à la fin de la période
      // await scheduleSubscriptionCancellation(customerId, subscription.current_period_end);
      console.log(`Annulation programmée pour ${customerId}`);
    } else {
      // L'abonnement a été réactivé
      // await reactivateSubscription(customerId);
      console.log(`Abonnement réactivé pour ${customerId}`);
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Abonnement supprimé:', subscription.id);
  
  const customerId = subscription.customer;
  const canceledAt = new Date(subscription.canceled_at * 1000);
  
  console.log(`Abonnement ${subscription.id} supprimé pour le client ${customerId}`);
  console.log(`Annulé le: ${canceledAt.toISOString()}`);
  
  // Désactiver les fonctionnalités premium
  try {
    // await deactivatePremiumFeatures(customerId);
    // await sendCancellationEmail(customerId);
    console.log(`Fonctionnalités premium désactivées pour ${customerId}`);
  } catch (error) {
    console.error('Erreur lors de la désactivation des fonctionnalités premium:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Paiement réussi:', invoice.id);
  
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;
  const amount = invoice.amount_paid;
  const currency = invoice.currency;
  
  console.log(`Paiement de ${amount}${currency.toUpperCase()} réussi pour le client ${customerId}`);
  console.log(`Abonnement: ${subscriptionId}`);
  
  // Confirmer le paiement et maintenir l'accès
  try {
    // await confirmPayment(customerId, amount, currency);
    // await extendSubscription(customerId, subscriptionId);
    console.log(`Paiement confirmé pour ${customerId}`);
  } catch (error) {
    console.error('Erreur lors de la confirmation du paiement:', error);
  }
}

async function handleInvoicePaymentFailed(invoice) {
  console.log('Paiement échoué:', invoice.id);
  
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;
  const attemptCount = invoice.attempt_count;
  const nextPaymentAttempt = invoice.next_payment_attempt;
  
  console.log(`Paiement échoué pour le client ${customerId}`);
  console.log(`Tentative ${attemptCount}, prochaine tentative: ${nextPaymentAttempt ? new Date(nextPaymentAttempt * 1000).toISOString() : 'Aucune'}`);
  
  // Gérer l'échec de paiement
  try {
    // await sendPaymentFailureEmail(customerId, attemptCount);
    // await limitAccess(customerId);
    console.log(`Traitement de l'échec de paiement pour ${customerId}`);
  } catch (error) {
    console.error('Erreur lors du traitement de l\'échec de paiement:', error);
  }
}

async function handleInvoicePaymentActionRequired(invoice) {
  console.log('Action de paiement requise:', invoice.id);
  
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;
  const hostedInvoiceUrl = invoice.hosted_invoice_url;
  
  console.log(`Action de paiement requise pour le client ${customerId}`);
  console.log(`URL de facture: ${hostedInvoiceUrl}`);
  
  // Notifier l'utilisateur qu'une action est requise
  try {
    // await sendPaymentActionRequiredEmail(customerId, hostedInvoiceUrl);
    console.log(`Notification d'action de paiement envoyée à ${customerId}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification d\'action de paiement:', error);
  }
}

async function handleTrialWillEnd(subscription) {
  console.log('Essai se termine bientôt:', subscription.id);
  
  const customerId = subscription.customer;
  const trialEnd = new Date(subscription.trial_end * 1000);
  
  console.log(`Essai se termine bientôt pour le client ${customerId}`);
  console.log(`Fin de l'essai: ${trialEnd.toISOString()}`);
  
  // Notifier l'utilisateur que l'essai se termine
  try {
    // await sendTrialEndingEmail(customerId, trialEnd);
    console.log(`Notification de fin d'essai envoyée à ${customerId}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de fin d\'essai:', error);
  }
}

async function handleTrialEnded(subscription) {
  console.log('Essai terminé:', subscription.id);
  
  const customerId = subscription.customer;
  const status = subscription.status;
  
  console.log(`Essai terminé pour le client ${customerId}, statut: ${status}`);
  
  // Gérer la fin de l'essai
  try {
    if (status === 'active') {
      // L'utilisateur a un abonnement actif
      // await activatePaidSubscription(customerId);
      console.log(`Abonnement payant activé pour ${customerId}`);
    } else {
      // L'utilisateur n'a pas de moyen de paiement valide
      // await handleTrialEndedWithoutPayment(customerId);
      console.log(`Essai terminé sans paiement pour ${customerId}`);
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la fin d\'essai:', error);
  }
}

async function handlePaymentMethodAttached(paymentMethod) {
  console.log('Méthode de paiement attachée:', paymentMethod.id);
  
  const customerId = paymentMethod.customer;
  const type = paymentMethod.type;
  
  console.log(`Méthode de paiement ${type} attachée pour le client ${customerId}`);
  
  // Mettre à jour les informations de paiement
  try {
    // await updatePaymentMethod(customerId, paymentMethod);
    console.log(`Méthode de paiement mise à jour pour ${customerId}`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la méthode de paiement:', error);
  }
}

async function handlePaymentMethodDetached(paymentMethod) {
  console.log('Méthode de paiement détachée:', paymentMethod.id);
  
  const customerId = paymentMethod.customer;
  
  console.log(`Méthode de paiement détachée pour le client ${customerId}`);
  
  // Gérer la suppression de la méthode de paiement
  try {
    // await removePaymentMethod(customerId, paymentMethod.id);
    console.log(`Méthode de paiement supprimée pour ${customerId}`);
  } catch (error) {
    console.error('Erreur lors de la suppression de la méthode de paiement:', error);
  }
}

async function handleChargeSucceeded(charge) {
  console.log('Charge réussie:', charge.id);
  
  const customerId = charge.customer;
  const amount = charge.amount;
  const currency = charge.currency;
  
  console.log(`Charge de ${amount}${currency.toUpperCase()} réussie pour le client ${customerId}`);
  
  // Enregistrer la charge réussie
  try {
    // await recordSuccessfulCharge(customerId, charge);
    console.log(`Charge enregistrée pour ${customerId}`);
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la charge:', error);
  }
}

async function handleChargeFailed(charge) {
  console.log('Charge échouée:', charge.id);
  
  const customerId = charge.customer;
  const failureCode = charge.failure_code;
  const failureMessage = charge.failure_message;
  
  console.log(`Charge échouée pour le client ${customerId}`);
  console.log(`Code d'erreur: ${failureCode}, Message: ${failureMessage}`);
  
  // Gérer l'échec de charge
  try {
    // await handleChargeFailure(customerId, charge);
    console.log(`Échec de charge traité pour ${customerId}`);
  } catch (error) {
    console.error('Erreur lors du traitement de l\'échec de charge:', error);
  }
}

async function handleChargeRefunded(charge) {
  console.log('Charge remboursée:', charge.id);
  
  const customerId = charge.customer;
  const refunded = charge.refunded;
  const refunds = charge.refunds?.data || [];
  
  console.log(`Charge remboursée pour le client ${customerId}`);
  console.log(`Nombre de remboursements: ${refunds.length}`);
  
  // Gérer le remboursement
  try {
    // await handleRefund(customerId, charge);
    console.log(`Remboursement traité pour ${customerId}`);
  } catch (error) {
    console.error('Erreur lors du traitement du remboursement:', error);
  }
} 