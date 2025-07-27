import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: 'ID client requis' },
        { status: 400 }
      );
    }

    // Récupérer les méthodes de paiement du client
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });

    // Formater les méthodes de paiement
    const formattedPaymentMethods = paymentMethods.data.map(method => ({
      id: method.id,
      type: method.type,
      card: method.card ? {
        brand: method.card.brand,
        last4: method.card.last4,
        expMonth: method.card.exp_month,
        expYear: method.card.exp_year,
        country: method.card.country,
        funding: method.card.funding
      } : null,
      billingDetails: method.billing_details ? {
        name: method.billing_details.name,
        email: method.billing_details.email,
        phone: method.billing_details.phone,
        address: method.billing_details.address
      } : null,
      isDefault: false, // Stripe ne stocke pas cette information, à gérer côté application
      created: method.created
    }));

    return NextResponse.json({
      success: true,
      paymentMethods: formattedPaymentMethods
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des méthodes de paiement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 