'use client';

import React, { useState, useEffect } from 'react';
import styles from './telemetry.module.css';
import { Bot, Activity, AlertCircle } from 'lucide-react';

interface Props {
  telemetryData: any; // The full API response payload
}

export default function RaceEngineerInsights({ telemetryData }: Props) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!telemetryData || !telemetryData.driver1) return;

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch('/api/race-engineer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            driver1: telemetryData.driver1,
            driver2: telemetryData.driver2
          }),
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || data.response || 'Failed to fetch analysis');
        }
        
        setAnalysis(data.response);
      } catch (err: any) {
        console.error("Analysis Error:", err);
        setError(err.message || 'An error occurred while analyzing the telemetry.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [telemetryData]);

  return (
    <div className={styles.chartCard} style={{ marginTop: '2rem', borderTop: '4px solid #e10600' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <div style={{ width: '24px', height: '24px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexShrink: 0 }}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Google_Gemini_logo_2025.svg/250px-Google_Gemini_logo_2025.svg.png" 
            alt="Gemini Star" 
            style={{ height: '100%', width: 'auto', objectFit: 'cover', objectPosition: '0% center', filter: 'brightness(1.2)' }}
          />
        </div>
        <h3 className={styles.chartTitle} style={{ fontSize: '1.4rem', margin: 0 }}>
          AI Race Engineer Insights
        </h3>
      </div>
      
      <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', minHeight: '100px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.6)' }}>
            <Activity className="animate-pulse" size={20} />
            <span>Analyzing high-fidelity telemetry for {telemetryData.driver1.name}{telemetryData.driver2 ? ` vs ${telemetryData.driver2.name}` : ''}...</span>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ff4444' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        ) : analysis ? (
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            lineHeight: '1.8', 
            fontSize: '1.05rem',
            whiteSpace: 'pre-wrap'
          }}>
            "{analysis}"
          </p>
        ) : (
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Awaiting data...</span>
        )}
      </div>
    </div>
  );
}
