"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Dashboard.module.css";
import { fetchCurrentStandings, fetchRaceSchedule, fetchConstructorStandings, fetchLastRaceResults, fetchLapTimes } from "@/lib/jolpica";

export default function Dashboard() {
  const [driverStandings, setDriverStandings] = useState<any[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<any[]>([]);
  const [nextRace, setNextRace] = useState<any>(null);
  const [lastRace, setLastRace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConstructors, setShowConstructors] = useState(false);

  const [aiInsight, setAiInsight] = useState<string>("");
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [dStandings, cStandings, scheduleData, lRace] = await Promise.all([
          fetchCurrentStandings(),
          fetchConstructorStandings(),
          fetchRaceSchedule(),
          fetchLastRaceResults()
        ]);
        
        setDriverStandings(dStandings.slice(0, 5));
        setConstructorStandings(cStandings.slice(0, 5));
        setLastRace(lRace);
        
        const now = new Date();
        const upcoming = scheduleData.find((r: any) => new Date(r.date) >= now) || scheduleData[0];
        setNextRace(upcoming);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const generateInsight = async () => {
    if (!lastRace) return;
    setGeneratingAi(true);
    try {
      const topResults = lastRace.Results.slice(0, 5).map((r: any) => ({
        driver: r.Driver.familyName,
        position: r.position,
        fastestLap: r.FastestLap?.Time?.time || "N/A"
      }));
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Analyze the performance for the ${lastRace.raceName}. Top 5 finishers: ${JSON.stringify(topResults)}. Focus on who had the best pace (Fastest Lap) and any notable gains. Keep it very brief (2 sentences).`
        })
      });
      const data = await response.json();
      setAiInsight(data.response);
    } catch (e) {
      setAiInsight("Failed to generate insight.");
    } finally {
      setGeneratingAi(false);
    }
  };

  const teamColors: Record<string, string> = {
    'red_bull': '#3671C6',
    'mercedes': '#27F4D2',
    'ferrari': '#E80020',
    'mclaren': '#FF8000',
    'aston_martin': '#229971',
    'alpine': '#0093CC',
    'haas': '#B6BABD',
    'williams': '#64C4FF',
    'rb': '#6692FF',
    'sauber': '#52E252',
    'audi': '#E11B22',
    'cadillac': '#FFD700'
  };

  const teamLogos: Record<string, string> = {
    'red_bull': 'https://media.formula1.com/image/upload/c_lfill,w_150/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracinglogowhite.webp',
    'mercedes': 'https://media.formula1.com/image/upload/c_lfill,w_150/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedeslogowhite.webp',
    'ferrari': 'https://media.formula1.com/image/upload/c_lfill,w_150/q_auto/v1740000001/common/f1/2026/ferrari/2026ferrarilogowhite.webp',
    'mclaren': 'https://media.formula1.com/image/upload/c_lfill,w_150/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarenlogowhite.webp',
    'aston_martin': 'https://media.formula1.com/image/upload/c_lfill,w_150/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartinlogowhite.webp',
    'alpine': 'https://media.formula1.com/image/upload/c_lfill,w_150/q_auto/v1740000001/common/f1/2026/alpine/2026alpinelogowhite.webp',
    'haas': 'https://media.formula1.com/image/upload/c_lfill,w_150/q_auto/v1740000001/common/f1/2026/haasf1team/2026haasf1teamlogowhite.webp',
    'williams': 'https://media.formula1.com/image/upload/c_lfill,w_150/q_auto/v1740000001/common/f1/2026/williams/2026williamslogowhite.webp',
    'rb': 'https://media.formula1.com/image/upload/c_lfill,w_150/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullslogowhite.webp',
    'sauber': 'https://media.formula1.com/image/upload/c_lfill,w_150/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp',
    'audi': 'https://media.formula1.com/image/upload/c_lfill,w_150/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp',
    'cadillac': 'https://media.formula1.com/image/upload/c_lfill,w_150/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp'
  };

  return (
    <section id="dashboard" className={styles.dashboard}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Championship Insights</h2>
        <button 
          className={styles.insightBtn} 
          onClick={generateInsight}
          disabled={generatingAi || loading}
        >
          {generatingAi ? "Analyzing..." : "Generate AI Insight"}
        </button>
      </div>

      {aiInsight && (
        <div className={`glass-panel ${styles.aiCard}`}>
          <div className={styles.aiBadge} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '18px', height: '18px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexShrink: 0 }}>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Google_Gemini_logo_2025.svg/250px-Google_Gemini_logo_2025.svg.png" 
                alt="Gemini Star" 
                style={{ height: '100%', width: 'auto', objectFit: 'cover', objectPosition: '0% center', filter: 'brightness(1.2)' }}
              />
            </div>
            AI STRATEGY INSIGHT
          </div>
          <p>{aiInsight}</p>
        </div>
      )}
      
      <div className={styles.grid}>
        {/* Standings Card */}
        <div className={`glass-panel ${styles.card}`}>
          <h3>Standings</h3>
          <div className={styles.cardHeader} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingBottom: '1.2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button 
              className={styles.toggleBtn}
              style={{
                padding: '0.8rem',
                fontSize: '0.95rem',
                letterSpacing: '0.05em',
                ...(!showConstructors ? { background: 'var(--f1-red)', color: 'white', borderColor: 'var(--f1-red)' } : {})
              }}
              onClick={() => setShowConstructors(false)}
            >
              Drivers
            </button>
            <button 
              className={styles.toggleBtn}
              style={{
                padding: '0.8rem',
                fontSize: '0.95rem',
                letterSpacing: '0.05em',
                ...(showConstructors ? { background: 'var(--f1-red)', color: 'white', borderColor: 'var(--f1-red)' } : {})
              }}
              onClick={() => setShowConstructors(true)}
            >
              Constructors
            </button>
          </div>
          
          {loading ? (
            <div className={styles.loader}>Loading...</div>
          ) : (
            <ul className={styles.standingsList}>
              {(showConstructors ? constructorStandings : driverStandings).map((item, idx) => {
                const teamId = showConstructors ? item.Constructor.constructorId : item.Constructors[0]?.constructorId;
                const teamColor = teamColors[teamId] || 'var(--f1-red)';
                const name = showConstructors ? item.Constructor.name : `${item.Driver.givenName} ${item.Driver.familyName}`;
                const logoUrl = teamLogos[teamId];

                return (
                  <li 
                    key={idx} 
                    className={styles.driverItem}
                    style={{ '--team-color': teamColor } as any}
                  >
                    <div className={styles.teamAccent}></div>
                    <div className={styles.logoContainer}>
                      {logoUrl && (
                        <img 
                          src={logoUrl} 
                          alt="" 
                          className={styles.teamLogo} 
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <span className={styles.position}>{idx + 1}</span>
                    <span className={styles.name}>{name}</span>
                    <span className={styles.points}>{item.points} pts</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Latest Race Results Card */}
        <div className={`glass-panel ${styles.card}`}>
          <h3>Latest Race Results</h3>
          {loading ? (
            <div className={styles.loader}>Loading...</div>
          ) : lastRace ? (
            <div className={styles.nextRaceInfo}>
              <h4 className={styles.raceTitle}>{lastRace.raceName}</h4>
              <p><strong>Date:</strong> {new Date(lastRace.date).toLocaleDateString()}</p>
              <p><strong>Circuit:</strong> {lastRace.Circuit.circuitName}</p>
              <p><strong>Location:</strong> {lastRace.Circuit.Location.locality}, {lastRace.Circuit.Location.country}</p>
              <div style={{ marginTop: '1.5rem', marginBottom: '0.8rem' }}>
                <strong style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Podium Finishers</strong>
              </div>
              <ul className={styles.standingsList}>
                {lastRace.Results.slice(0, 3).map((res: any, idx: number) => {
                  const teamId = res.Constructor.constructorId;
                  const logoUrl = teamLogos[teamId];
                  return (
                    <li key={idx} className={styles.driverItem} style={{'--team-color': teamColors[teamId]} as any}>
                      <div className={styles.teamAccent}></div>
                      <div className={styles.logoContainer}>
                        {logoUrl && (
                          <img 
                            src={logoUrl} 
                            alt="" 
                            className={styles.teamLogo} 
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                      <span className={styles.position}>{res.position}</span>
                      <span className={styles.name}>{res.Driver.familyName}</span>
                      <span className={styles.points}>{res.Time?.time || "Finished"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p>No recent data.</p>
          )}
        </div>

        {/* Next Race Card */}
        <div className={`glass-panel ${styles.card}`}>
          <h3>Next Race</h3>
          {loading ? (
            <div className={styles.loader}>Loading...</div>
          ) : nextRace ? (
            <div className={styles.nextRaceInfo}>
              <h4 className={styles.raceTitle}>{nextRace.raceName}</h4>
              <p><strong>Date:</strong> {new Date(nextRace.date).toLocaleDateString()}</p>
              <p><strong>Circuit:</strong> {nextRace.Circuit.circuitName}</p>
              <p><strong>Location:</strong> {nextRace.Circuit.Location.locality}, {nextRace.Circuit.Location.country}</p>
              <div style={{ marginTop: '2rem', textAlign: 'center', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={`/images/circuits/${nextRace.Circuit.circuitId}.svg`} 
                  alt={`${nextRace.Circuit.circuitName} Layout`}
                  style={{ width: '90%', maxHeight: '280px', objectFit: 'contain', opacity: 0.8 }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            </div>
          ) : (
            <p>No upcoming races.</p>
          )}
        </div>
      </div>
    </section>
  );
}
