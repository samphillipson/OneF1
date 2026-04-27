'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';
import { Github, Mail, ArrowLeft } from 'lucide-react'; // Fallback icon for Google could be Mail if needed, or import standard SVGs

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('verified') === 'true') {
      setSuccess('Email successfully verified! You can now sign in.');
    }
    if (searchParams?.get('message') === 'email_changed') {
      setSuccess('Please check your new inbox to verify your email before logging in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    // Note: These buttons are intentionally non-functional per user request, but left here for future use
    alert(`${provider} login is temporarily disabled. Please use credentials.`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to One F1</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className={styles.label} htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
              <Link href="/forgot-password" className={styles.link} style={{ fontSize: '0.85rem' }}>Forgot password?</Link>
            </div>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.divider}>or continue with</div>

        <button 
          type="button" 
          className={styles.socialButton}
          onClick={() => handleOAuth('Google')}
        >
          <Mail size={18} /> Google
        </button>
        <button 
          type="button" 
          className={styles.socialButton}
          onClick={() => handleOAuth('GitHub')}
        >
          <Github size={18} /> GitHub
        </button>

        <div className={styles.footer}>
          Don't have an account? <Link href="/register" className={styles.link}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
