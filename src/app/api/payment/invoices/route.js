import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, limit = 50 } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: 'ID client requis' },
        { status: 400 }
      );
    }

    // Récupérer les factures du client
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: Math.min(limit, 100), // Limiter à 100 maximum
      expand: ['data.payment_intent', 'data.subscription']
    });

    // Formater les factures
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      created: invoice.created,
      dueDate: invoice.due_date,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      subscriptionId: invoice.subscription,
      paymentIntentId: invoice.payment_intent,
      description: invoice.description,
      lines: invoice.lines.data.map(line => ({
        id: line.id,
        description: line.description,
        amount: line.amount,
        currency: line.currency,
        quantity: line.quantity,
        unitAmount: line.unit_amount
      }))
    }));

    return NextResponse.json({
      success: true,
      invoices: formattedInvoices,
      hasMore: invoices.has_more
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 