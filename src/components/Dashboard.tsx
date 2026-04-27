"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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
          <div className={styles.aiBadge}>AI STRATEGY INSIGHT</div>
          <p>{aiInsight}</p>
        </div>
      )}
      
      <div className={styles.grid}>
        {/* Standings Card */}
        <div className={`glass-panel ${styles.card}`}>
          <div className={styles.cardHeader}>
            <h3>{showConstructors ? "Constructor" : "Driver"} Standings</h3>
            <button 
              className={styles.toggleBtn}
              onClick={() => setShowConstructors(!showConstructors)}
            >
              Switch to {showConstructors ? "Drivers" : "Teams"}
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

                return (
                  <li 
                    key={idx} 
                    className={styles.driverItem}
                    style={{ '--team-color': teamColor } as any}
                  >
                    <div className={styles.teamAccent}></div>
                    <span className={styles.position}>{idx + 1}</span>
                    <span className={styles.name}>{name}</span>
                    <span className={styles.points}>{item.points} pts</span>
                  </li>
                );
              })}
            </ul>
          )}
          <Link href="/drivers" className={styles.actionBtn}>
            Full Standings
          </Link>
        </div>

        {/* Latest Race Results Card */}
        <div className={`glass-panel ${styles.card}`}>
          <h3>Latest Race Results</h3>
          {loading ? (
            <div className={styles.loader}>Loading...</div>
          ) : lastRace ? (
            <div className={styles.nextRaceInfo}>
              <h4 className={styles.raceTitle}>{lastRace.raceName}</h4>
              <ul className={styles.standingsList}>
                {lastRace.Results.slice(0, 3).map((res: any, idx: number) => (
                  <li key={idx} className={styles.driverItem} style={{'--team-color': teamColors[res.Constructor.constructorId]} as any}>
                    <div className={styles.teamAccent}></div>
                    <span className={styles.position}>{res.position}</span>
                    <span className={styles.name}>{res.Driver.familyName}</span>
                    <span className={styles.points}>{res.Time?.time || "Finished"}</span>
                  </li>
                ))}
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
            </div>
          ) : (
            <p>No upcoming races.</p>
          )}
        </div>
      </div>
    </section>
  );
}
