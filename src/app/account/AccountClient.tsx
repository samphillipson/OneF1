'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';
import { signOut } from 'next-auth/react';
import styles from '../auth.module.css';

interface AccountClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function AccountClient({ user }: AccountClientProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState((user as any).username || '');
  const [emailPassword, setEmailPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/user/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update username');
      } else {
        setSuccess('Username updated successfully! Refreshing...');
        setTimeout(() => {
          router.refresh();
        }, 2000);
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update password');
      } else {
        setSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/user/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, password: emailPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update email');
      } else {
        setSuccess('Email updated! Please check your new inbox to verify your email before logging in again. Signing out...');
        setNewEmail('');
        setEmailPassword('');
        
        // Force sign out and redirect to login after a short delay
        setTimeout(() => {
          signOut({ callbackUrl: '/login?message=email_changed' });
        }, 4000);
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ maxWidth: '500px' }}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        <div className={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent)' }}>
            <User size={48} />
          </div>
          <h1 className={styles.title}>Account Settings</h1>
          <p className={styles.subtitle}>{user.email}</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <div className={styles.divider}>Change Username</div>

        <form className={styles.form} onSubmit={handleUsernameSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="newUsername">New Username</label>
            <input
              id="newUsername"
              type="text"
              className={styles.input}
              placeholder="f1fan123"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Username'}
          </button>
        </form>

        <div className={styles.divider} style={{ marginTop: '2rem' }}>Change Email</div>

        <form className={styles.form} onSubmit={handleEmailSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="newEmail">New Email Address</label>
            <input
              id="newEmail"
              type="email"
              className={styles.input}
              placeholder="new@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="emailPassword">Current Password (for security)</label>
            <input
              id="emailPassword"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Email'}
          </button>
        </form>

        <div className={styles.divider} style={{ marginTop: '2rem' }}>Change Password</div>

        <form className={styles.form} onSubmit={handlePasswordSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
