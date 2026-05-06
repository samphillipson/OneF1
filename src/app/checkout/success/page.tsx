'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import styles from '../checkout.module.css';
import Link from 'next/link';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const { clearCart } = useCart();

  useEffect(() => {
    if (!session_id) {
      setStatus('error');
      return;
    }

    const verifySession = async () => {
      try {
        const res = await fetch(`/api/checkout_sessions/${session_id}`);
        const data = await res.json();

        if (data.success) {
          clearCart();
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    };

    verifySession();
  }, [session_id, clearCart]);

  return (
    <div className={styles.container}>
      <div className={styles.box} style={{ textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <Loader2 className="animate-spin" size={48} style={{ margin: '0 auto', color: 'var(--f1-red)' }} />
            <h2 style={{ marginTop: '2rem' }}>Verifying your payment...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={64} style={{ margin: '0 auto', color: '#00e676' }} />
            <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Payment Successful!</h2>
            <p style={{ color: '#a0a0a0', marginBottom: '2rem' }}>
              Thank you for your purchase. Your F1 tickets have been secured.
            </p>
            <Link href="/orders" className={styles.submitBtn}>
              View My Orders
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={64} style={{ margin: '0 auto', color: '#ff4444' }} />
            <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Payment Failed or Incomplete</h2>
            <p style={{ color: '#a0a0a0', marginBottom: '2rem' }}>
              We couldn't verify your payment. Please try again or contact support.
            </p>
            <Link href="/cart" className={styles.submitBtn}>
              Return to Cart
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.box} style={{ textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={48} style={{ margin: '0 auto', color: 'var(--f1-red)' }} />
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
