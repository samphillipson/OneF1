"use client";
import { useState, useEffect } from 'react';
import styles from './DriverCard.module.css';


interface Driver {
  driverId: string;
  permanentNumber?: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

interface DriverCardProps {
  driver: Driver;
  currentPoints: string;
  currentWins: string;
  currentPosition: string;
}

export default function DriverCard({ driver, currentPoints, currentWins, currentPosition }: DriverCardProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'season' | 'history'>('season');
  const [backgroundInfo, setBackgroundInfo] = useState<{ 
    personal: string; 
    career: string;
    history?: any[];
    stats?: {
      titles: string;
      wins: string;
      podiums: string;
      bestFinish: string;
    }
  } | null>(null);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  useEffect(() => {
    if ((activeTab === 'personal' || activeTab === 'history') && !hasFetched && !loadingInfo) {
      fetchInfo();
    }
  }, [activeTab, hasFetched, loadingInfo]);

  const fetchInfo = async () => {
    setLoadingInfo(true);
    setError(null);
    try {
      const response = await fetch(`/api/driver-info?id=${driver.driverId}&name=${encodeURIComponent(driver.givenName + ' ' + driver.familyName)}`);
      if (response.ok) {
        const data = await response.json();
        setBackgroundInfo(data);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (err) {
      console.error("Failed to fetch driver info", err);
      setError('Failed to load. Please try again.');
    } finally {
      setLoadingInfo(false);
      setHasFetched(true);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.nameContainer}>
          <span className={styles.givenName}>{driver.givenName}</span>
          <span className={styles.familyName}>{driver.familyName}</span>
        </div>
        <div className={styles.number}>{driver.permanentNumber || '-'}</div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'personal' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Bio
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'season' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('season')}
        >
          2026
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'personal' && (
          <>
            <div className={styles.infoRow}>
              <span className={styles.label}>Nationality</span>
              <span className={styles.value}>{driver.nationality}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Age</span>
              <span className={styles.value}>{calculateAge(driver.dateOfBirth)} yrs</span>
            </div>
            <div className={styles.scrollableTextContainer}>
              <span className={styles.label}>Background</span>
              {loadingInfo ? (
                <p className={styles.loadingText}>Fetching AI background info...</p>
              ) : backgroundInfo?.personal ? (
                <p className={styles.paragraphText}>{backgroundInfo.personal}</p>
              ) : (
                error && <p className={styles.errorText}>{error}</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'season' && (
          <>
            <div className={styles.infoRow}>
              <span className={styles.label}>Position</span>
              <span className={`${styles.value} ${styles.highlight}`}>P{currentPosition}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Points</span>
              <span className={styles.value}>{currentPoints} pts</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Wins</span>
              <span className={styles.value}>{currentWins}</span>
            </div>

            {backgroundInfo?.stats && (
              <div className={styles.lifetimeStats}>
                <div className={styles.statsDivider}>LIFETIME</div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Championships</span>
                  <span className={`${styles.value} ${styles.highlight}`}>{backgroundInfo.stats.titles}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Total Wins</span>
                  <span className={styles.value}>{backgroundInfo.stats.wins}</span>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className={styles.historyList}>
            {loadingInfo ? (
              <p className={styles.loadingText}>Fetching career data...</p>
            ) : backgroundInfo?.history && backgroundInfo.history.length > 0 ? (
              backgroundInfo.history.map((season: any, idx: number) => (
                <div key={idx} className={styles.historyRow}>
                  <span className={styles.seasonYear}>{season.season}</span>
                  <span className={styles.seasonTeam}>{season.team}</span>
                  <span className={styles.seasonPos}>{season.position}</span>
                </div>
              ))
            ) : error ? (
              <div className={styles.errorContainer}>
                <p className={styles.errorText}>{error}</p>
                <button onClick={fetchInfo} className={styles.retryBtn}>Retry Load</button>
              </div>
            ) : (
              <p className={styles.emptyStateText}>No F1 historical data found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
