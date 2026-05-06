import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import styles from './orders.module.css';
import Link from 'next/link';

export const revalidate = 0; // Dynamic route

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!session || !userId) {
    redirect('/login?callbackUrl=/orders');
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Orders</h1>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No orders found</h2>
          <p style={{ marginTop: '1rem', color: '#a0a0a0' }}>You haven't purchased any tickets yet.</p>
          <div style={{ marginTop: '2rem' }}>
            <Link href="/tickets" style={{ background: 'var(--f1-red)', color: 'white', padding: '1rem 2rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
              Browse Tickets
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <div className={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                  <div className={styles.orderId}>Order #{order.id.slice(-8).toUpperCase()}</div>
                </div>
                <div className={styles.orderStatus}>{order.status}</div>
              </div>
              
              <div className={styles.orderItems}>
                {order.items.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div>
                      <div className={styles.itemName}>{item.raceName}</div>
                      <div className={styles.itemDetails}>
                        Round {item.raceRound} • {item.ticketTier} • Qty: {item.quantity}
                      </div>
                    </div>
                    <div className={styles.itemPrice}>
                      ${(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.orderTotal}>
                  Total: ${order.totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
