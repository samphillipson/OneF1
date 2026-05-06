'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartContext';
import styles from '../tickets.module.css';

import { useRouter } from 'next/navigation';

interface BuyButtonProps {
  tier: string;
  price: number;
  raceRound: string;
  raceName: string;
}

export default function BuyButton({ tier, price, raceRound, raceName }: BuyButtonProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/session');
      const session = await res.json();
      
      if (!session || Object.keys(session).length === 0) {
        router.push('/login?callbackUrl=/tickets');
        return;
      }

      addItem({
        id: `${raceRound}-${tier}`,
        raceRound,
        raceName,
        ticketTier: tier,
        price,
        quantity: 1
      });
      alert(`${tier} ticket added to cart!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleBuy} className={styles.buyBtn}>
      Add to Cart
    </button>
  );
}
