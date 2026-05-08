'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import styles from './telemetry.module.css';

interface FastF1TelemetryPoint {
  time: number;
  speed: number;
  rpm: number;
  gear: number;
  throttle: number;
  brake: number;
}

interface Props {
  data1: { name: string, data: any[], lap_time?: string };
  data2?: { name: string, data: any[], lap_time?: string } | null;
  showThrottle: boolean;
  showBrake: boolean;
  sessionName: string;
}

export default function TelemetryChart({ data1, data2, showThrottle, showBrake, sessionName }: Props) {
  if (!data1 || !data1.data || data1.data.length === 0) {
    return <div className={styles.noData}>No telemetry data available. Make sure the Python backend is running!</div>;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      // Find the time from the first payload item
      const time = payload[0].payload.time;
      return (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '10px',
          borderRadius: '8px',
          color: '#fff'
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>Time: {Number(time).toFixed(2)}s</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: '4px 0 0 0', color: entry.color, fontWeight: 'bold' }}>
              {entry.name}: {Number(entry.value).toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const hasDriver2 = data2 && data2.data && data2.data.length > 0;
  
  // To use multiple separate datasets in Recharts, we either use ScatterChart or 
  // LineChart with unified data. We will merge them here based on closest time.
  let mergedData = [...data1.data];
  
  if (hasDriver2) {
    // We map data1 and add driver2 values by finding the closest time
    mergedData = mergedData.map(d1 => {
      // Find closest point in driver2 data
      const closest = data2!.data.reduce((prev, curr) => 
        Math.abs(curr.time - d1.time) < Math.abs(prev.time - d1.time) ? curr : prev
      );
      
      return {
        ...d1,
        speed2: closest.speed,
        gear2: closest.gear,
        throttle2: closest.throttle,
        brake2: closest.brake,
      };
    });
  }

  const title = hasDriver2 
    ? `${data1.name} vs ${data2!.name} - ${sessionName} Fastest Lap Telemetry`
    : `${data1.name} - ${sessionName} Fastest Lap Telemetry`;

  const getDriverColor = (driverCode: string, isDriver2: boolean = false) => {
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
    let color = map[driverCode] || '#ffffff';
    // If it's driver 2 and they have the same team color, make it white so we can distinguish them
    if (isDriver2 && map[data1.name] === color) {
      return '#ffffff';
    }
    return color;
  };

  const c1 = getDriverColor(data1.name, false);
  const c2 = hasDriver2 ? getDriverColor(data2!.name, true) : '#ffffff';

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className={styles.chartTitle}>{title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Displaying full telemetry data for the absolute fastest lap recorded by the driver(s) during this session.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'right', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fastest Lap</span>
            <span style={{ color: c1, fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'monospace' }}>
              {data1.name}: {data1.lap_time || 'N/A'}
            </span>
          </div>
          {hasDriver2 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fastest Lap</span>
              <span style={{ color: c2, fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'monospace' }}>
                {data2!.name}: {data2!.lap_time || 'N/A'}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mergedData}
            margin={{ top: 20, right: 40, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            
            <XAxis 
              dataKey="time" 
              type="number"
              domain={['dataMin', 'dataMax']}
              stroke="rgba(255,255,255,0.5)" 
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
              tickFormatter={(val) => Number(val).toFixed(0)}
              label={{ value: 'Time (seconds)', position: 'bottom', fill: 'rgba(255,255,255,0.6)', fontSize: 14 }}
            />
            
            <YAxis 
              yAxisId="speed"
              stroke="rgba(255,255,255,0.5)" 
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
              domain={['auto', 'auto']}
              label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft', offset: -10, fill: 'rgba(255,255,255,0.6)', fontSize: 14 }}
            />
            
            {showThrottle && (
              <YAxis 
                yAxisId="throttle"
                orientation="right"
                hide
                domain={[0, 100]}
              />
            )}
            
            {showBrake && (
              <YAxis 
                yAxisId="brake"
                orientation="right"
                hide
                domain={[0, 100]}
              />
            )}

            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            {/* Driver 1 */}
            <Line yAxisId="speed" type="monotone" dataKey="speed" name={`${data1.name} Speed`} stroke={c1} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            {showThrottle && <Line yAxisId="throttle" type="monotone" dataKey="throttle" name={`${data1.name} Throttle %`} stroke={c1} strokeWidth={2} dot={false} strokeDasharray="8 6" />}
            {showBrake && <Line yAxisId="brake" type="stepAfter" dataKey="brake" name={`${data1.name} Brake`} stroke={c1} strokeWidth={2} dot={false} strokeDasharray="8 6" />}
            
            {/* Driver 2 */}
            {hasDriver2 && (
              <>
                <Line yAxisId="speed" type="monotone" dataKey="speed2" name={`${data2!.name} Speed`} stroke={c2} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                {showThrottle && <Line yAxisId="throttle" type="monotone" dataKey="throttle2" name={`${data2!.name} Throttle %`} stroke={c2} strokeWidth={2} dot={false} strokeDasharray="8 6" opacity={0.6} />}
                {showBrake && <Line yAxisId="brake" type="stepAfter" dataKey="brake2" name={`${data2!.name} Brake`} stroke={c2} strokeWidth={2} dot={false} strokeDasharray="8 6" opacity={0.6} />}
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
