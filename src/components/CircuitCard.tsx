"use client";
import Image from 'next/image';
import styles from './CircuitCard.module.css';

interface CircuitCardProps {
  circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  round?: string;
  date?: string;
}

const countryCodeMap: Record<string, string> = {
  "USA": "us", "United States": "us", "UK": "gb", "Great Britain": "gb",
  "Italy": "it", "Monaco": "mc", "Spain": "es", "Canada": "ca",
  "Austria": "at", "Belgium": "be", "Netherlands": "nl", "Singapore": "sg",
  "Japan": "jp", "Qatar": "qa", "UAE": "ae", "Abu Dhabi": "ae",
  "Saudi Arabia": "sa", "Bahrain": "bh", "Australia": "au", "China": "cn",
  "Azerbaijan": "az", "Hungary": "hu", "Brazil": "br", "Mexico": "mx"
};

export default function CircuitCard({ circuit, round, date }: CircuitCardProps) {
  // Format date if provided
  const formattedDate = date 
    ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'TBA';

  const countryCode = countryCodeMap[circuit.Location.country] || "un";

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <img 
          src={`https://flagcdn.com/${countryCode}.svg`} 
          alt={`${circuit.Location.country} Flag`} 
          className={styles.headerFlag} 
        />
        <div className={styles.headerContent}>
          <span className={styles.country}>{circuit.Location.country}</span>
          <h3 className={styles.circuitName}>{circuit.circuitName}</h3>
          <span className={styles.location}>{circuit.Location.locality}</span>
        </div>
      </div>
      
      <div className={styles.content}>
        <img 
          src={`/images/circuits/${circuit.circuitId}.svg`} 
          alt={`${circuit.circuitName} Layout`}
          className={styles.circuitImage}
          onError={(e) => { 
            // Fallback if SVG is missing
            e.currentTarget.style.display = 'none'; 
            e.currentTarget.parentElement!.innerHTML = `<div style="color: rgba(255,255,255,0.3); font-style: italic;">Layout Unavailable</div>`;
          }}
        />
      </div>

      <div className={styles.footer}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Round</span>
          <span className={styles.statValue}>{round || 'N/A'}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Date</span>
          <span className={styles.statValue}>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
