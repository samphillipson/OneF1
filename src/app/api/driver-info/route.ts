import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CACHE_FILE = path.join(DATA_DIR, 'driver_cache.json');

// Ensure data directory exists (wrapped in try-catch for production/read-only environments)
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Could not create data directory (likely a read-only environment):", e);
}

// Load cache from file or initialize
let cache: Record<string, { personal: string; career: string; history?: any[]; timestamp: number }> = {};
function loadCacheFromDisk() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const data = fs.readFileSync(CACHE_FILE, 'utf8');
      cache = JSON.parse(data);
    } catch (e) {
      console.error("Failed to load driver cache file:", e);
    }
  }
}

// Initial load
loadCacheFromDisk();

function saveCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (e) {
    // In production (e.g. Vercel), the filesystem is often read-only.
    // We log the error but don't crash, as the in-memory cache still works for the current session.
    console.warn("Could not save cache to disk (expected in production):", e);
  }
}

const CACHE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get('id');
    const driverName = searchParams.get('name');

    if (!driverId || !driverName) {
      return NextResponse.json({ error: 'Missing driver id or name' }, { status: 400 });
    }

    // Check memory cache first
    let cachedEntry = cache[driverId];

    // If not in memory, try a fresh disk read (handles pre-populated files)
    if (!cachedEntry) {
      loadCacheFromDisk();
      cachedEntry = cache[driverId];
    }

    const now = Date.now();
    // If we have a valid, non-expired cache entry, return it immediately
    if (cachedEntry && (now - cachedEntry.timestamp < CACHE_EXPIRATION_MS)) {
      return NextResponse.json(cachedEntry);
    }

    if (!process.env.GEMINI_API_KEY) {
      // If AI is not configured but we have an old cache, use it as fallback
      if (cachedEntry) return NextResponse.json(cachedEntry);
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    const prompt = `
      You are an expert Formula 1 historian and journalist. 
      Write exactly two concise paragraphs about the F1 driver ${driverName}.
      
      Paragraph 1 (Personal Background): Detail their early life, nationality, family racing background if any, and non-racing hobbies or significant personal details.
      Paragraph 2 (Career Background): Detail their journey to F1, their notable achievements, significant teams they have raced for, and their biggest milestones.
      
      Return ONLY a valid JSON object matching this exact structure:
      {
        "personal": "The personal background paragraph...",
        "career": "The career background paragraph...",
        "stats": {
          "titles": "Number of World Championships (e.g. '7' or '0')",
          "wins": "Total Grand Prix wins (e.g. '103')",
          "podiums": "Total podium finishes (e.g. '197')",
          "bestFinish": "Best career race finish (e.g. '1st' or '4th')"
        },
        "history": [
          { "season": "2024", "team": "Mercedes", "position": "P2" },
          { "season": "2023", "team": "Mercedes", "position": "P2" }
        ]
      }
      Important: Provide the full championship history for all seasons they have competed in F1. 
      Do not include any markdown formatting like \`\`\`json. Return just the raw JSON object.
    `;

    let result;
    let retries = 3; 
    let baseDelay = 2000;

    while (retries > 0) {
      try {
        result = await model.generateContent(prompt);
        break; // Success!
      } catch (err: any) {
        if (err.status === 429 && retries > 1) {
          let waitTime = baseDelay;
          const retryInfo = err.errorDetails?.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
          if (retryInfo?.retryDelay) {
            const seconds = parseInt(retryInfo.retryDelay);
            if (!isNaN(seconds)) {
              waitTime = (seconds + 1) * 1000;
            }
          }

          console.log(`Rate limited for ${driverName}, waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries--;
          baseDelay *= 2;
        } else {
          throw err;
        }
      }
    }

    try {
      if (!result) throw new Error('No result from AI');
      const text = result.response.text().trim();
      
      const startIndex = text.indexOf('{');
      const endIndex = text.lastIndexOf('}');
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error('AI response did not contain a valid JSON object');
      }
      
      const jsonStr = text.substring(startIndex, endIndex + 1);
      const parsedData = JSON.parse(jsonStr);

      if (parsedData.personal && parsedData.career && parsedData.history) {
        cache[driverId] = {
          ...parsedData,
          timestamp: Date.now()
        };
        saveCache();
        return NextResponse.json(cache[driverId]);
      } else {
        throw new Error('Invalid JSON structure returned by AI');
      }
      
    } catch (err: any) {
      const errorMsg = `AI Generation Error for ${driverName}: ${err.message}`;
      console.error(errorMsg);
      
      try {
        const logPath = path.join('C:\\Users\\samph\\.gemini\\antigravity\\brain\\edc1b67b-efb7-4b85-971d-86ebb2dd7186', 'api_error.log');
        fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] ${errorMsg}\n`);
      } catch (logErr) {
        // ignore log errors
      }
      
      // If refresh failed, but we have an old cached version, return that as a final fallback
      if (cachedEntry) {
        console.log(`Refresh failed for ${driverName}, falling back to expired cache.`);
        return NextResponse.json(cachedEntry);
      }

      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }
  } catch (error: any) {
    const mainErrorMsg = `CRITICAL Driver Info API Error: ${error.message}`;
    console.error(mainErrorMsg);
    try {
      const logPath = path.join('C:\\Users\\samph\\.gemini\\antigravity\\brain\\edc1b67b-efb7-4b85-971d-86ebb2dd7186', 'api_error.log');
      fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] ${mainErrorMsg}\n`);
    } catch (logErr) {}
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
