'use client';

import React, { useState } from 'react';
import TelemetryChart from './TelemetryChart';
import RaceEngineerInsights from './RaceEngineerInsights';
import styles from './telemetry.module.css';

const DRIVERS = [
  'VER', 'PER', 'HAM', 'RUS', 'LEC', 'SAI', 'NOR', 'PIA',
  'ALO', 'STR', 'GAS', 'OCO', 'ALB', 'SAR', 'TSU', 'RIC',
  'BOT', 'ZHO', 'MAG', 'HUL'
];

const SESSIONS = [
  { id: 'R', name: 'Race' },
  { id: 'Q', name: 'Qualifying' },
  { id: 'S', name: 'Sprint' },
  { id: 'SQ', name: 'Sprint Shootout' },
  { id: 'FP1', name: 'Practice 1' },
  { id: 'FP2', name: 'Practice 2' },
  { id: 'FP3', name: 'Practice 3' }
];

const RACES = [
  'Bahrain', 'Saudi Arabia', 'Australia', 'Japan', 'China', 'Miami', 
  'Emilia Romagna', 'Monaco', 'Canada', 'Spain', 'Austria', 'Great Britain', 
  'Hungary', 'Belgium', 'Netherlands', 'Italy', 'Azerbaijan', 'Singapore', 
  'United States', 'Mexico', 'Brazil', 'Las Vegas', 'Qatar', 'Abu Dhabi'
];

export default function TelemetryDashboard() {
  const [year, setYear] = useState('2024');
  const [race, setRace] = useState('Bahrain');
  const [session, setSession] = useState('R');
  const [driver, setDriver] = useState('VER');
  const [driver2, setDriver2] = useState('None');
  
  const [showThrottle, setShowThrottle] = useState(false);
  const [showBrake, setShowBrake] = useState(false);
  
  const [telemetryData, setTelemetryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTelemetryData(null);

    try {
      const url = `/api/telemetry?year=${year}&race=${encodeURIComponent(race)}&session=${session}&driver=${driver}&driver2=${driver2}`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Failed to fetch telemetry data');
      }

      setTelemetryData(data);
    } catch (err: any) {
      console.error("Telemetry Fetch Error:", err);
      setError(err.message || "Could not connect to the Python backend.");
    } finally {
      setLoading(false);
    }
  };

  const getDriverColor = (driverCode: string) => {
    const map: Record<string, string> = {
      'VER': '#3671C6', 'PER': '#3671C6',
      'HAM': '#27F4D2', 'RUS': '#27F4D2',
      'LEC': '#E80020', 'SAI': '#E80020',
      'NOR': '#FF8000', 'PIA': '#FF8000',
      'ALO': '#229971', 'STR': '#229971',
      'GAS': '#0093CC', 'OCO': '#0093CC',
      'ALB': '#64C4FF', 'SAR': '#64C4FF',
      'TSU': '#6692FF', 'RIC': '#6692FF',
      'BOT': '#52E252', 'ZHO': '#52E252',
      'MAG': '#B6BABD', 'HUL': '#B6BABD',
    };
    return map[driverCode] || 'white';
  };

  const driver1Color = getDriverColor(driver);
  const driver2Color = driver2 !== 'None' ? getDriverColor(driver2) : '#00a0d6';

  return (
    <div className={styles.content}>
      {/* Control Panel */}
      <div className={styles.chartCard} style={{ marginBottom: '2rem' }}>
        <h3 className={styles.chartTitle} style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>
          Telemetry Configuration
        </h3>
        <form onSubmit={fetchTelemetry} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 100px' }}>
            <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Year</label>
            <select 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', outline: 'none' }}
            >
              {[2024, 2023, 2022, 2021].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 150px' }}>
            <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Race</label>
            <select 
              value={race} 
              onChange={(e) => setRace(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', outline: 'none' }}
            >
              {RACES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 150px' }}>
            <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Session</label>
            <select 
              value={session} 
              onChange={(e) => setSession(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', outline: 'none' }}
            >
              {SESSIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 100px' }}>
            <label style={{ fontSize: '0.85rem', color: driver1Color, fontWeight: 'bold', textTransform: 'uppercase' }}>Driver 1</label>
            <select 
              value={driver} 
              onChange={(e) => setDriver(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', color: 'white', border: `1px solid ${driver1Color}`, outline: 'none' }}
            >
              {DRIVERS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 100px' }}>
            <label style={{ fontSize: '0.85rem', color: driver2Color, fontWeight: 'bold', textTransform: 'uppercase' }}>Driver 2</label>
            <select 
              value={driver2} 
              onChange={(e) => setDriver2(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', color: 'white', border: `1px solid ${driver2Color}`, outline: 'none' }}
            >
              <option value="None">None</option>
              {DRIVERS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '0.75rem 2rem', 
              borderRadius: '6px', 
              background: 'var(--f1-red)', 
              color: 'white', 
              border: 'none', 
              fontWeight: 'bold',
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              flex: '1 1 150px'
            }}
          >
            {loading ? 'Loading...' : 'Load Telemetry'}
          </button>
        </form>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showThrottle} 
              onChange={e => {
                setShowThrottle(e.target.checked);
                if (e.target.checked) setShowBrake(false);
              }} 
            />
            Show Throttle (%)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showBrake} 
              onChange={e => {
                setShowBrake(e.target.checked);
                if (e.target.checked) setShowThrottle(false);
              }} 
            />
            Show Brake (%)
          </label>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className={styles.chartCard} style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--f1-red)', borderRadius: '50%', margin: '0 auto 1rem auto' }}></div>
          <h3 style={{ color: 'white' }}>Fetching Telemetry...</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Note: If this is the first time loading this session, FastF1 needs a few seconds to download the data from F1 servers.
          </p>
        </div>
      )}

      {error && !loading && (
        <div className={styles.chartCard} style={{ textAlign: 'center', padding: '4rem', borderLeft: '4px solid #ff4444' }}>
          <h3 style={{ color: '#ff4444', marginBottom: '1rem' }}>Data Error</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>{error}</p>
        </div>
      )}

      {/* Visualizations */}
      {telemetryData && !loading && (
        <>
          <TelemetryChart 
            data1={telemetryData.driver1} 
            data2={telemetryData.driver2} 
            showThrottle={showThrottle}
            showBrake={showBrake}
            sessionName={telemetryData.session}
          />
          <RaceEngineerInsights 
            telemetryData={telemetryData} 
          />
        </>
      )}
    </div>
  );
}
