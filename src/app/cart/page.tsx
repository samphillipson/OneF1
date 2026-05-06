'use client';

import { useCart } from '@/components/CartContext';
import styles from './cart.module.css';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, total } = useCart();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Cart</h1>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>Your cart is empty</h2>
          <p style={{ marginTop: '1rem', color: '#a0a0a0' }}>Looks like you haven't added any tickets yet.</p>
          <div style={{ marginTop: '2rem' }}>
            <Link href="/tickets" className={styles.checkoutBtn}>
              Browse Tickets
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.cartList}>
            {items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemInfo}>
                  <h3>{item.raceName} (Round {item.raceRound})</h3>
                  <p>{item.ticketTier} Ticket</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div className={styles.itemActions}>
                  <div className={styles.price}>${item.price.toLocaleString()}</div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className={styles.removeBtn}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <div className={styles.total}>Total: ${total.toLocaleString()}</div>
            <Link href="/checkout" className={styles.checkoutBtn}>
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
