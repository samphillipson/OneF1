import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchCurrentStandings, fetchRaceSchedule, fetchConstructorStandings } from '@/lib/jolpica';

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
    const model = ai.getGenerativeModel({ model: "gemini-flash-latest" });
    
    // Fetch real-time F1 context
    let contextStr = "";
    try {
      const [dStandings, cStandings, schedule] = await Promise.all([
        fetchCurrentStandings(),
        fetchConstructorStandings(),
        fetchRaceSchedule()
      ]);
      
      const top5Drivers = dStandings.slice(0, 5).map((d: any) => `${d.Driver.familyName} (${d.points} pts)`).join(', ');
      const top3Constructors = cStandings.slice(0, 3).map((c: any) => `${c.Constructor.name} (${c.points} pts)`).join(', ');
      
      const now = new Date();
      const upcoming = schedule.find((r: any) => new Date(r.date) >= now) || schedule[0];
      const nextRaceStr = upcoming ? `${upcoming.raceName} at ${upcoming.Circuit.circuitName} on ${upcoming.date}` : "Unknown";
      
      contextStr = `Real-time F1 Status (${now.getFullYear()}):
      Top 5 Drivers: ${top5Drivers}
      Top 3 Constructors: ${top3Constructors}
      Next Grand Prix: ${nextRaceStr}`;
    } catch (e) {
      console.error("Failed to fetch F1 context", e);
    }
    
    const systemInstruction = `You are a Formula 1 expert assistant. Provide accurate, engaging answers about F1 history, stats, and predictions.
    
    CONTEXT DATA:
    ${contextStr}
    
    Always use this context to provide the most up-to-date answers. If asked about strategy or lap times, use the provided data to give a technical but accessible analysis.`;
    
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
