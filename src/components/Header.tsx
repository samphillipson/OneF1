"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./SignOutButton";
import styles from "../app/page.module.css";
import { Session } from "next-auth";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "./CartContext";

interface HeaderProps {
  session: Session | null;
}

export default function Header({ session }: HeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { items } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToChat = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault();
      const chatElement = document.getElementById('chat');
      if (chatElement) {
        chatElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link 
          href="/" 
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
        >
          <div className={styles.logo}>
            ONE
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Formula_One_logo.svg/250px-Formula_One_logo.svg.png" 
              alt="F1" 
              className={styles.f1LogoImg} 
            />
          </div>
        </Link>
        <div className={styles.headerBadge}>
          <span className={styles.poweredByText}>Powered by Google Gemini&trade;</span>
          <div className={styles.headerStarCrop}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Google_Gemini_logo_2025.svg/250px-Google_Gemini_logo_2025.svg.png" 
              alt="Gemini Star"
              className={styles.officialHeaderLogoStar}
            />
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        <Link href="/" className={styles.navLink}>Dashboard</Link>
        <Link href="/drivers" className={styles.navLink}>Drivers</Link>
        <Link href="/circuits" className={styles.navLink}>Circuits</Link>
        <Link href="/analytics" className={styles.navLink}>Analytics</Link>
        <Link href="/tickets" className={styles.navLink}>Tickets</Link>
        <Link href="/orders" className={styles.navLink}>Orders</Link>
        <Link href="/#chat" className={styles.navLink}>AI Assistant</Link>
        <Link href="/account" className={styles.navLink}>Account</Link>
        <Link href="/cart" className={styles.navLink} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShoppingCart size={18} />
          {items.length > 0 && (
            <span style={{ 
              background: 'var(--f1-red)', 
              color: 'white', 
              fontSize: '0.75rem', 
              padding: '2px 6px', 
              borderRadius: '10px',
              fontWeight: 'bold'
            }}>
              {items.reduce((total, item) => total + item.quantity, 0)}
            </span>
          )}
        </Link>
        {session ? (
          <SignOutButton />
        ) : (
          <Link href="/login" className={styles.loginBtn}>Login</Link>
        )}
      </nav>

      <button 
        className={styles.mobileMenuBtn} 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMenuOpen && (
        <div className={styles.mobileOverlay} onClick={() => setIsMenuOpen(false)} />
      )}
      
      <div className={`${styles.mobileDrawer} ${isMenuOpen ? styles.mobileDrawerOpen : ""}`}>
        <nav className={styles.mobileNav}>
          <Link href="/" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
          <Link href="/drivers" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>Drivers</Link>
          <Link href="/circuits" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>Circuits</Link>
          <Link href="/analytics" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>Analytics</Link>
          <Link href="/tickets" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>Tickets</Link>
          <Link href="/orders" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>Orders</Link>
          <Link href="/#chat" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>AI Assistant</Link>
          <Link href="/account" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>Account</Link>
          <Link href="/cart" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={18} />
            <span>Cart</span>
            {items.length > 0 && (
              <span style={{ 
                background: 'var(--f1-red)', 
                color: 'white', 
                fontSize: '0.75rem', 
                padding: '2px 6px', 
                borderRadius: '10px',
                fontWeight: 'bold'
              }}>
                {items.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </Link>
          <div className={styles.mobileAuthContainer} onClick={() => setIsMenuOpen(false)}>
            {session ? (
              <SignOutButton />
            ) : (
              <Link href="/login" className={styles.mobileLoginBtn}>Login</Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
