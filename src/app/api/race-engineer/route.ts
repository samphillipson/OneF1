import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { driver1, driver2 } = body;

    if (!driver1) {
      return NextResponse.json({ error: "Missing driver data" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { response: "API Key missing. Please set GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // We already sample the data in the Python backend, but let's sample it a bit more
    // here to ensure we stay well within token limits, especially for two drivers.
    const sampleSize = driver2 ? 20 : 30; // Fewer points if two drivers to save tokens
    const stride = Math.ceil(driver1.data.length / sampleSize);
    
    const sampledDriver1 = driver1.data.filter((_: any, index: number) => index % stride === 0);
    const sampledDriver2 = driver2 ? driver2.data.filter((_: any, index: number) => index % stride === 0) : null;

    const isComparison = !!driver2;

    const systemInstruction = isComparison 
      ? `You are a world-class Formula 1 Race Engineer analyzing telemetry data for TWO drivers to compare their fastest laps.
      You will be provided with arrays of telemetry data for both drivers aligned by distance.
      Your task is to provide a brief, professional, and insightful comparative summary (max 4 sentences).
      - Identify who carried more speed on the straights.
      - Identify who braked later or carried more apex speed in the corners.
      - Write in the style of an F1 broadcast commentator or Race Engineer debriefing the driver.
      - DO NOT just list data points. Tell the story of the time delta between the two drivers.`
      : `You are a world-class Formula 1 Race Engineer analyzing telemetry data.
      You will be provided with an array of telemetry data for a specific driver over a lap.
      Your task is to provide a brief, professional, and insightful summary of this lap (max 3 sentences).
      - Identify the top speed reached.
      - Identify major braking zones.
      - Write in the style of an F1 broadcast commentator.`;
    
    let response;
    try {
      const prompt = isComparison 
        ? `Analyze this telemetry comparison:\n\n${driver1.name} Data:\n${JSON.stringify(sampledDriver1)}\n\n${driver2.name} Data:\n${JSON.stringify(sampledDriver2)}`
        : `Analyze this telemetry for ${driver1.name}:\n\n${JSON.stringify(sampledDriver1)}`;
        
      response = await model.generateContent(`${systemInstruction}\n\nUser: ${prompt}`);
    } catch (err: any) {
      console.error("Gemini Generation Error:", err);
      if (err.status === 429) {
        return NextResponse.json({ response: "API Rate Limit Exceeded. Please wait a few seconds and try again." }, { status: 429 });
      } else {
        return NextResponse.json({ response: "The Race Engineer is currently unavailable. Please try again." }, { status: 500 });
      }
    }

    return NextResponse.json({ response: response.response.text() });
  } catch (error: any) {
    console.error("Race Engineer AI Error:", error);
    return NextResponse.json({ error: "Failed to process telemetry analysis request" }, { status: 500 });
  }
}
