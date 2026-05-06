'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartContext';
import styles from './checkout.module.css';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [stripeUrl, setStripeUrl] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, totalAmount: total })
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login?callbackUrl=/checkout');
          return;
        }
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to place order');
      }

      const { url } = await res.json();
      
      if (url) {
        setStripeUrl(url);
        setRedirecting(true);
      } else {
        throw new Error('Failed to retrieve checkout URL');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.box} style={{ textAlign: 'center' }}>
          <h2>Your cart is empty</h2>
          <button onClick={() => router.push('/tickets')} className={styles.submitBtn} style={{ marginTop: '2rem' }}>
            Browse Tickets
          </button>
        </div>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className={styles.container}>
        <div className={styles.box} style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Ready for Payment</h2>
          <p style={{ color: '#a0a0a0', marginBottom: '2rem' }}>
            We've generated your secure Stripe&reg; session. Please click below to open Stripe&reg; in a new tab.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--f1-red)', marginBottom: '2rem' }}>
            <p style={{ fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
              ⚠️ TEST MODE
            </p>
            <p style={{ color: '#a0a0a0', marginBottom: '0.5rem' }}>
              Please use the following test card details:
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: '1.5rem', color: '#00e676', letterSpacing: '4px', margin: '1rem 0' }}>
              4242 4242 4242 4242
            </p>
            <p style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>
              (Any future expiry date and 3-digit CVC will work)
            </p>
          </div>
          <a href={stripeUrl} target="_blank" rel="noopener noreferrer" className={styles.submitBtn} style={{ display: 'inline-block', width: 'auto', padding: '1rem 3rem' }}>
            Open Stripe&reg; Payment
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Checkout</h1>
      <div className={styles.box}>
        <div className={styles.totalRow}>
          <span>Total to Pay:</span>
          <span>${total.toLocaleString()}</span>
        </div>

        <p style={{ marginBottom: '2rem', color: '#a0a0a0', textAlign: 'center' }}>
          You will be redirected to Stripe&reg; to securely complete your payment.
        </p>

        <button 
          onClick={handleCheckout} 
          disabled={loading} 
          className={styles.submitBtn}
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Checkout with Stripe®'}
        </button>

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}
