import { NextResponse } from 'next/server';
import { createCustomerPortalSession, createOrRetrieveCustomer } from '../../../../lib/stripe';

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, customerEmail, returnUrl } = body;

    if (!customerId && !customerEmail) {
      return NextResponse.json(
        { error: 'ID client ou email requis' },
        { status: 400 }
      );
    }

    if (!returnUrl) {
      return NextResponse.json(
        { error: 'URL de retour requise' },
        { status: 400 }
      );
    }

    let finalCustomerId = customerId;

    // Si on a un email mais pas de customerId, on récupère ou crée le client
    if (!customerId && customerEmail) {
      const customerResult = await createOrRetrieveCustomer(customerEmail, {
        source: 'gitshadow_portal'
      });

      if (!customerResult.success) {
        return NextResponse.json(
          { error: 'Impossible de récupérer ou créer le client' },
          { status: 500 }
        );
      }

      finalCustomerId = customerResult.customer.id;
    }

    const result = await createCustomerPortalSession(finalCustomerId, returnUrl);

    if (result.success) {
      return NextResponse.json({
        url: result.url
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur lors de la création du portail client:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 