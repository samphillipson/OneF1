import { fetchRaceSchedule, fetchCircuitDetails } from "@/lib/jolpica";
import styles from "../tickets.module.css";
import Link from "next/link";
import { ArrowLeft, Check, Calendar, MapPin, ExternalLink, Globe } from "lucide-react";
import BuyButton from "./BuyButton";

export const revalidate = 3600;

export default async function RaceTicketPage({ params }: { params: { round: string } }) {
  let schedule = [];
  try {
    schedule = await fetchRaceSchedule();
  } catch (e) {
    console.error("Failed to fetch schedule", e);
  }

  const race = schedule.find((r: any) => r.round === params.round);

  if (!race) {
    return (
      <div className={styles.container}>
        <h2>Race not found</h2>
        <Link href="/tickets">Return to Tickets</Link>
      </div>
    );
  }

  let circuitDetails = null;
  try {
    circuitDetails = await fetchCircuitDetails(race.Circuit.circuitId);
  } catch (e) {
    console.error("Failed to fetch circuit details", e);
  }

  const dateStr = new Date(race.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });

  // Mock Ticket Tiers
  const ticketTiers = [
    {
      id: "ga",
      name: "General Admission",
      price: "$199",
      features: [
        "Trackside viewing",
        "Access to fan zones",
        "Food and beverage vendors",
        "Standing areas"
      ]
    },
    {
      id: "gs",
      name: "Grandstand Seating",
      price: "$499",
      features: [
        "Reserved seating",
        "Excellent track views",
        "Covered seating (where available)",
        "Dedicated screens"
      ]
    },
    {
      id: "vip",
      name: "Paddock Club™ VIP",
      price: "$4,500",
      features: [
        "Exclusive Paddock views",
        "Pit lane walk access",
        "Gourmet hospitality",
        "Open bar & champagne",
        "F1 driver appearances"
      ]
    }
  ];

  const countryCodeMap: Record<string, string> = {
    "USA": "us", "United States": "us", "UK": "gb", "Great Britain": "gb",
    "Italy": "it", "Monaco": "mc", "Spain": "es", "Canada": "ca",
    "Austria": "at", "Belgium": "be", "Netherlands": "nl", "Singapore": "sg",
    "Japan": "jp", "Qatar": "qa", "UAE": "ae", "Abu Dhabi": "ae",
    "Saudi Arabia": "sa", "Bahrain": "bh", "Australia": "au", "China": "cn",
    "Azerbaijan": "az", "Hungary": "hu", "Brazil": "br", "Mexico": "mx"
  };
  const countryCode = countryCodeMap[race.Circuit.Location.country] || "un";

  return (
    <div className={styles.container}>
      <Link href="/tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#a0a0a0', textDecoration: 'none', marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
        <ArrowLeft size={16} /> Back to Schedule
      </Link>

      <header className={styles.raceHeader}>
        <img 
          src={`https://flagcdn.com/${countryCode}.svg`} 
          alt={`${race.Circuit.Location.country} Flag`} 
          className={styles.watermark} 
          style={{ opacity: 0.15, filter: 'grayscale(0%)' }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className={styles.roundBadge} style={{ marginBottom: '1rem', display: 'inline-block' }}>Round {race.round}</span>
          <h1 className={styles.title} style={{ marginBottom: '1rem' }}>{race.raceName}</h1>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', color: '#ccc', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} style={{ color: 'var(--f1-red)' }} />
              {dateStr}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} style={{ color: 'var(--f1-red)' }} />
              {race.Circuit.circuitName}, {race.Circuit.Location.locality}
            </div>
          </div>

          {circuitDetails && (
            <div className={styles.circuitDetails}>
              <div className={styles.coordBox}>
                <span>LAT: {circuitDetails.Location.lat}</span>
                <span>LONG: {circuitDetails.Location.long}</span>
              </div>
              <a href={circuitDetails.url} target="_blank" rel="noopener noreferrer" className={styles.wikiLink}>
                <Globe size={14} /> Official Circuit Info <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      </header>

      <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Select Your Experience</h2>

      <div className={styles.ticketGrid}>
        {ticketTiers.map((tier) => (
          <div key={tier.id} className={styles.ticketCard}>
            <h3 className={styles.ticketTier}>{tier.name}</h3>
            <div className={styles.ticketPrice}>{tier.price}</div>
            
            <ul className={styles.ticketFeatures}>
              {tier.features.map((feature, idx) => (
                <li key={idx}>
                  <Check size={16} style={{ color: 'var(--f1-red)' }} /> {feature}
                </li>
              ))}
            </ul>

            <BuyButton 
              tier={tier.name} 
              price={parseInt(tier.price.replace(/[^0-9.-]+/g,""))}
              raceRound={race.round}
              raceName={race.raceName}
            />
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem', color: '#a0a0a0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <span style={{ display: 'flex', alignItems: 'flex-start' }}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/250px-Stripe_Logo%2C_revised_2016.svg.png" 
            alt="Stripe" 
            style={{ height: '24px' }} 
          />
          <sup style={{ fontSize: '0.6em', marginLeft: '2px' }}>&reg;</sup>
        </span>
        <span>Payment-Processing System</span>
      </div>
    </div>
  );
}
