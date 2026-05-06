import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-04-22.dahlia',
});
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request, { params }: { params: { session_id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    
    if (!session || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id } = params;

    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    if (checkoutSession.payment_status === 'paid') {
      const orderId = checkoutSession.client_reference_id;
      
      if (orderId) {
        // Find if order is already completed to prevent duplicate emails
        const existingOrder = await prisma.order.findUnique({
          where: { id: orderId },
          include: { user: true, items: true }
        });

        if (existingOrder && existingOrder.status !== 'COMPLETED') {
          // Update the order status to COMPLETED
          await prisma.order.update({
            where: { id: orderId },
            data: { status: 'COMPLETED' },
          });

          // Send confirmation email
          if (existingOrder.user && existingOrder.user.email) {
            try {
              const itemListHTML = existingOrder.items.map(item => 
                `<li>${item.quantity}x ${item.ticketTier} Ticket - ${item.raceName} (Round ${item.raceRound}) - $${item.price.toLocaleString()}</li>`
              ).join('');

              await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'OneF1 <noreply@onef1.app>',
                to: existingOrder.user.email,
                subject: 'Your OneF1 Order Confirmation',
                html: `
                  <h1>Order Confirmed!</h1>
                  <p>Thank you for your purchase. Your F1 tickets have been secured.</p>
                  <p><strong>Order ID:</strong> ${orderId}</p>
                  <h3>Order Details:</h3>
                  <ul>
                    ${itemListHTML}
                  </ul>
                  <p><strong>Total Paid:</strong> $${existingOrder.totalAmount.toLocaleString()}</p>
                  <br/>
                  <p>See you at the track!</p>
                `
              });
            } catch (emailErr) {
              console.error('Failed to send confirmation email:', emailErr);
            }
          }
        }
      }

      return NextResponse.json({ success: true, orderId });
    } else {
      return NextResponse.json({ success: false, status: checkoutSession.payment_status });
    }
  } catch (error: any) {
    console.error('Failed to retrieve session:', error);
    return NextResponse.json({ error: 'Failed to retrieve session' }, { status: 500 });
  }
}
