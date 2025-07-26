import { NextResponse } from 'next/server';
import { createCustomerPortalSession } from '../../../../lib/stripe';

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, returnUrl } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: 'ID client requis' },
        { status: 400 }
      );
    }

    if (!returnUrl) {
      return NextResponse.json(
        { error: 'URL de retour requise' },
        { status: 400 }
      );
    }

    const result = await createCustomerPortalSession(customerId, returnUrl);

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