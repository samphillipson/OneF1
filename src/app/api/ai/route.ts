import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchCurrentStandings, fetchRaceSchedule, fetchConstructorStandings, fetchLastRaceResults } from '@/lib/jolpica';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt || body.message;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { response: "API Key missing. Please set GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Fetch real-time F1 context
    let contextStr = "";
    try {
      const [dStandings, cStandings, schedule, lastRace] = await Promise.all([
        fetchCurrentStandings(),
        fetchConstructorStandings(),
        fetchRaceSchedule(),
        fetchLastRaceResults()
      ]);
      
      const top5Drivers = dStandings.slice(0, 5).map((d: any) => `${d.Driver.familyName} (${d.points} pts)`).join(', ');
      const top3Constructors = cStandings.slice(0, 3).map((c: any) => `${c.Constructor.name} (${c.points} pts)`).join(', ');
      
      const now = new Date();
      const upcoming = schedule.find((r: any) => new Date(r.date) >= now) || schedule[0];
      const nextRaceStr = upcoming ? `${upcoming.raceName} at ${upcoming.Circuit.circuitName} on ${upcoming.date}` : "Unknown";
      
      let lastRaceStr = "Unknown";
      if (lastRace) {
        const podium = lastRace.Results.slice(0, 3).map((r: any) => `${r.position}. ${r.Driver.familyName} (${r.Constructor.name})`).join(', ');
        lastRaceStr = `${lastRace.raceName} on ${lastRace.date}. Winner/Podium: ${podium}`;
      }
      
      contextStr = `Real-time F1 Status (${now.getFullYear()}):
      Top 5 Drivers: ${top5Drivers}
      Top 3 Constructors: ${top3Constructors}
      Last Completed Race: ${lastRaceStr}
      Next Grand Prix: ${nextRaceStr}`;
    } catch (e) {
      console.error("Failed to fetch F1 context", e);
    }
    
    const systemInstruction = `You are a Formula 1 expert assistant. Provide accurate, engaging answers about F1 history, stats, and predictions.
    
    CONTEXT DATA (Current 2026 Season):
    ${contextStr}
    
    Instructions:
    1. Use the CONTEXT DATA above for questions about the current 2026 season standings, constructor points, last completed race results, and the next upcoming race.
    2. For queries about past race winners, historical seasons, driver biographies, rules, and general F1 stats, rely on your extensive pre-trained knowledge base.
    3. Refer to "Last Completed Race" to answer questions about the most recently finished race (e.g., the 2026 Canadian Grand Prix, which occurred on May 24, 2026). If the user asks about a 2026 race that hasn't happened yet (e.g., Monaco on June 7, 2026, or any race scheduled after), note that it hasn't occurred yet.`;
    
    let response;
    try {
      response = await model.generateContent(`${systemInstruction}\n\nUser: ${prompt}`);
    } catch (err: any) {
      if (err.status === 429) {
        return NextResponse.json({ response: "API Rate Limit Exceeded. Please wait a few seconds and try again." }, { status: 429 });
      } else if (err.status === 503) {
        return NextResponse.json({ response: "Google API is currently experiencing high demand. Please try again later." }, { status: 503 });
      } else {
        throw err;
      }
    }

    return NextResponse.json({ response: response.response.text() });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to process AI request" }, { status: 500 });
  }
}
