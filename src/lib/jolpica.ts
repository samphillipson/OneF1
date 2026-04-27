const BASE_URL = "https://api.jolpi.ca/ergast/f1";

export async function fetchCurrentStandings() {
  const res = await fetch(`${BASE_URL}/current/driverStandings.json`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch standings");
  const data = await res.json();
  return data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
}

export async function fetchConstructorStandings() {
  const res = await fetch(`${BASE_URL}/current/constructorStandings.json`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch constructor standings");
  const data = await res.json();
  return data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
}

export async function fetchRaceSchedule() {
  const res = await fetch(`${BASE_URL}/current.json`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error("Failed to fetch schedule");
  const data = await res.json();
  return data.MRData.RaceTable.Races;
}

export async function fetchLastRaceResults() {
  const res = await fetch(`${BASE_URL}/current/last/results.json`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch last race results");
  const data = await res.json();
  return data.MRData.RaceTable.Races[0];
}

export async function fetchQualifyingResults(round: string) {
  const res = await fetch(`${BASE_URL}/current/${round}/qualifying.json`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch qualifying results");
  const data = await res.json();
  return data.MRData.RaceTable.Races[0]?.QualifyingResults || [];
}

export async function fetchCircuitDetails(circuitId: string) {
  const res = await fetch(`${BASE_URL}/circuits/${circuitId}.json`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error("Failed to fetch circuit details");
  const data = await res.json();
  return data.MRData.CircuitTable.Circuits[0];
}

export async function fetchLapTimes(round: string, lap: string = "last") {
  const res = await fetch(`${BASE_URL}/current/${round}/laps/${lap}.json`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch lap times");
  const data = await res.json();
  return data.MRData.RaceTable.Races[0]?.Laps || [];
}


