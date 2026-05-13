import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || '2024';
    const race = searchParams.get('race') || 'Bahrain';
    const session = searchParams.get('session') || 'R';
    const driver = searchParams.get('driver') || 'VER';
    const driver2 = searchParams.get('driver2');

    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000';
    let backendUrl = `${pythonBackendUrl}/api/telemetry?year=${year}&race=${encodeURIComponent(race)}&session=${session}&driver=${driver}`;
    if (driver2 && driver2 !== 'None') {
      backendUrl += `&driver2=${driver2}`;
    }

    console.log(`Proxying telemetry request to backend: ${backendUrl}`);

    const res = await fetch(backendUrl, { cache: 'no-store' });
    
    // Check if the response actually returned JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error(`Backend returned non-JSON response: ${text}`);
      return NextResponse.json(
        { error: `Backend returned non-JSON response: ${res.statusText}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Telemetry Proxy API Route Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to the Python backend service. Please ensure the Python telemetry server is running." },
      { status: 500 }
    );
  }
}
