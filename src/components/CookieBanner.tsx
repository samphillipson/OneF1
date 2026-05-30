"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./CookieBanner.module.css";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already consented or declined cookies
    const consent = localStorage.getItem("onef1-cookie-consent");
    if (!consent) {
      // Small delay for a smoother entry effect
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("onef1-cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("onef1-cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.bannerContainer}>
      <div className={styles.bannerContent}>
        <div className={styles.textContainer}>
          <div className={styles.titleContainer}>
            <span className={styles.dot}></span>
            <h4 className={styles.title}>Cookie Consent</h4>
          </div>
          <p className={styles.description}>
            We use strictly necessary cookies to manage your session and simulate Stripe checkouts. 
            No third-party tracking or advertising cookies are used. Read our{" "}
            <Link href="/privacy" className={styles.link}>
              Privacy Policy
            </Link>{" "}
            to learn more.
          </p>
        </div>
        <div className={styles.actions}>
          <button className={styles.declineButton} onClick={handleDecline}>
            Decline
          </button>
          <button className={styles.acceptButton} onClick={handleAccept}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
