import { NextResponse } from 'next/server';
import { validateWebhookSignature } from '../../../../lib/stripe';

// Secrets des webhooks (comme dans le sample)
const WEBHOOK_SECRET_SNAPSHOT = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_ZBrup7oEMxq41NGuD6kVfsQ8BiNYvHps';
const WEBHOOK_SECRET_THIN = process.env.STRIPE_WEBHOOK_THIN_SECRET || 'whsec_Uvfxw888jdlp6ZECH8wxtXyJT77MMWld';

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ Signature Stripe manquante');
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      );
    }

    // Valider la signature avec le secret principal
    let event;
    let validationResult = validateWebhookSignature(body, signature, WEBHOOK_SECRET_SNAPSHOT);
    
    if (!validationResult.success) {
      // Essayer avec le secret thin
      validationResult = validateWebhookSignature(body, signature, WEBHOOK_SECRET_THIN);
      
      if (!validationResult.success) {
        console.error('❌ Échec de validation de signature webhook');
        return NextResponse.json(
          { error: 'Signature invalide' },
          { status: 400 }
        );
      }
    }

    event = validationResult.event;
    console.log(`📦 Événement reçu: ${event.type}`);

    // Traiter l'événement
    await handleWebhookEvent(event);

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Fonction pour traiter les événements webhook
async function handleWebhookEvent(event) {
  let subscription;
  let status;
  
  console.log(`📦 Traitement de l'événement: ${event.type}`);
  
  // Traiter l'événement selon son type
  switch (event.type) {
    case 'customer.subscription.trial_will_end':
      subscription = event.data.object;
      status = subscription.status;
      console.log(`🔔 Essai se termine - Statut: ${status}`);
      await handleSubscriptionTrialEnding(subscription);
      break;
      
    case 'customer.subscription.deleted':
      subscription = event.data.object;
      status = subscription.status;
      console.log(`🗑️ Abonnement supprimé - Statut: ${status}`);
      await handleSubscriptionDeleted(subscription);
      break;
      
    case 'customer.subscription.created':
      subscription = event.data.object;
      status = subscription.status;
      console.log(`✅ Abonnement créé - Statut: ${status}`);
      await handleSubscriptionCreated(subscription);
      break;
      
    case 'customer.subscription.updated':
      subscription = event.data.object;
      status = subscription.status;
      console.log(`🔄 Abonnement mis à jour - Statut: ${status}`);
      await handleSubscriptionUpdated(subscription);
      break;
      
    case 'customer.subscription.trial_ended':
      subscription = event.data.object;
      status = subscription.status;
      console.log(`⏰ Essai terminé - Statut: ${status}`);
      await handleSubscriptionTrialEnded(subscription);
      break;
      
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log(`💰 Paiement réussi pour la facture: ${invoice.id}`);
      await handlePaymentSucceeded(invoice);
      break;
      
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log(`❌ Paiement échoué pour la facture: ${failedInvoice.id}`);
      await handlePaymentFailed(failedInvoice);
      break;
      
    case 'entitlements.active_entitlement_summary.updated':
      const entitlement = event.data.object;
      console.log(`🎯 Droits mis à jour pour le client: ${entitlement.customer}`);
      await handleEntitlementUpdated(entitlement);
      break;
      
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log(`🛒 Checkout terminé: ${session.id}`);
      await handleCheckoutCompleted(session);
      break;
      
    default:
      // Type d'événement non géré
      console.log(`❓ Type d'événement non géré: ${event.type}`);
  }
}

// Gestionnaires d'événements
async function handleSubscriptionTrialEnding(subscription) {
  try {
    console.log(`📧 Envoi d'email de rappel pour l'essai qui se termine - Client: ${subscription.customer}`);
    
    // Logique métier : Envoyer un email de rappel
    // TODO: Implémenter l'envoi d'email
    
    console.log(`✅ Traitement de la fin d'essai terminé`);
  } catch (error) {
    console.error('❌ Erreur lors du traitement de la fin d\'essai:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    console.log(`🔒 Révoquer l'accès au service pour le client ${subscription.customer}`);
    
    // Logique métier : Révoquer l'accès au service
    // TODO: Implémenter la révocation d'accès
    
    console.log(`📧 Envoi d'email de confirmation de suppression`);
    
    console.log(`✅ Traitement de la suppression terminé`);
  } catch (error) {
    console.error('❌ Erreur lors du traitement de la suppression:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  try {
    console.log(`✅ Accorder l'accès au service pour le client ${subscription.customer}`);
    
    // Logique métier : Accorder l'accès au service
    // TODO: Implémenter l'octroi d'accès
    
    console.log(`📧 Envoi d'email de bienvenue`);
    
    console.log(`✅ Traitement de la création terminé`);
  } catch (error) {
    console.error('❌ Erreur lors du traitement de la création:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    // Logique métier : Gérer les changements de statut
    if (subscription.status === 'active') {
      console.log(`✅ Réactiver l'accès pour le client ${subscription.customer}`);
    } else if (subscription.status === 'past_due') {
      console.log(`⚠️ Accès limité pour le client ${subscription.customer} (paiement en retard)`);
    } else if (subscription.status === 'canceled') {
      console.log(`🔒 Accès suspendu pour le client ${subscription.customer} (abonnement annulé)`);
    }

    console.log(`✅ Traitement de la mise à jour terminé`);
  } catch (error) {
    console.error('❌ Erreur lors du traitement de la mise à jour:', error);
  }
}

async function handleSubscriptionTrialEnded(subscription) {
  try {
    // Logique métier : Gérer la fin d'essai
    if (subscription.status === 'active') {
      console.log(`✅ Conversion en abonnement payant pour le client ${subscription.customer}`);
    } else {
      console.log(`❌ Essai terminé sans conversion pour le client ${subscription.customer}`);
    }

    console.log(`📧 Envoi d'email de fin d'essai`);
    
    console.log(`✅ Traitement de la fin d'essai terminé`);
  } catch (error) {
    console.error('❌ Erreur lors du traitement de la fin d\'essai:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    console.log(`✅ Confirmer l'accès au service pour le client ${invoice.customer}`);
    
    // Logique métier : Confirmer l'accès au service
    // TODO: Implémenter la confirmation d'accès
    
    console.log(`📧 Envoi du reçu pour ${(invoice.amount_paid / 100).toFixed(2)}€`);
    
    console.log(`📊 Mise à jour des statistiques`);
    
    console.log(`✅ Traitement du paiement réussi terminé`);
  } catch (error) {
    console.error('❌ Erreur lors du traitement du paiement réussi:', error);
  }
}

async function handlePaymentFailed(invoice) {
  try {
    console.log(`❌ Gérer l'échec de paiement pour le client ${invoice.customer}`);
    
    // Logique métier : Gérer l'échec de paiement
    // TODO: Implémenter la gestion d'échec
    
    console.log(`📧 Envoi d'email de rappel de paiement`);
    
    console.log(`🔒 Limiter l'accès si nécessaire`);
    
    console.log(`✅ Traitement du paiement échoué terminé`);
  } catch (error) {
    console.error('❌ Erreur lors du traitement du paiement échoué:', error);
  }
}

async function handleEntitlementUpdated(entitlement) {
  try {
    console.log(`🔄 Synchroniser les permissions pour le client ${entitlement.customer}`);
    
    // Logique métier : Synchroniser les permissions
    // TODO: Implémenter la synchronisation
    
    console.log(`🎯 Mettre à jour les fonctionnalités disponibles`);
    
    console.log(`✅ Traitement de la mise à jour des droits terminé`);
  } catch (error) {
    console.error('❌ Erreur lors du traitement de la mise à jour des droits:', error);
  }
}

async function handleCheckoutCompleted(session) {
  try {
    console.log(`🛒 Traiter la commande pour le client ${session.customer}`);
    
    // Logique métier : Traiter la commande
    // TODO: Implémenter le traitement de commande
    
    console.log(`📧 Envoi d'email de confirmation de commande`);
    
    console.log(`🚀 Préparer l'onboarding`);
    
    console.log(`✅ Traitement du checkout terminé`);
  } catch (error) {
    console.error('❌ Erreur lors du traitement du checkout:', error);
  }
} 