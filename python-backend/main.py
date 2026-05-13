from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fastf1
import os
import pandas as pd

app = FastAPI()

# Allow Next.js frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup FastF1 Cache
CACHE_DIR = os.path.join(os.path.dirname(__file__), 'cache')
os.makedirs(CACHE_DIR, exist_ok=True)
fastf1.Cache.enable_cache(CACHE_DIR)

PROCESSED_CACHE_DIR = os.path.join(CACHE_DIR, 'processed')
os.makedirs(PROCESSED_CACHE_DIR, exist_ok=True)

@app.get("/api/telemetry")
async def get_telemetry(year: int = 2024, race: str = "Bahrain", session: str = "R", driver: str = "VER", driver2: str = None):
    # Setup cache file path
    cache_filename = f"{year}_{race.replace(' ', '_')}_{session}_{driver}_{driver2 or 'None'}.json"
    cache_path = os.path.join(PROCESSED_CACHE_DIR, cache_filename)
    
    # Try loading from processed JSON cache
    if os.path.exists(cache_path):
        try:
            print(f"Returning cached processed JSON: {cache_filename}")
            import json
            with open(cache_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Failed to read cache file {cache_filename}, deleting: {e}")
            try:
                os.remove(cache_path)
            except:
                pass

    try:
        # Load the session using FastF1
        f1_session = fastf1.get_session(year, race, session)
        f1_session.load(telemetry=True, laps=True, weather=False)
        
        def process_driver(drv_code):
            laps = f1_session.laps.pick_driver(drv_code)
            if laps.empty:
                return None
            
            fastest_lap = laps.pick_fastest()
            if type(fastest_lap) != fastf1.core.Lap or fastest_lap.isna().all():
                return None
                
            telemetry = fastest_lap.get_telemetry()
            
            telemetry['time'] = telemetry['Time'].dt.total_seconds()
            
            telemetry = telemetry.rename(columns={
                'Speed': 'speed',
                'RPM': 'rpm',
                'nGear': 'gear',
                'Throttle': 'throttle',
                'Brake': 'brake'
            })
            
            # Brake is usually a boolean in FastF1, convert to 0-100 for charting
            if telemetry['brake'].dtype == bool or telemetry['brake'].dtype == object:
                telemetry['brake'] = telemetry['brake'].astype(int) * 100
            
            if pd.isnull(fastest_lap['LapTime']):
                lap_time_str = "N/A"
            else:
                total_seconds = fastest_lap['LapTime'].total_seconds()
                minutes = int(total_seconds // 60)
                seconds = total_seconds % 60
                lap_time_str = f"{minutes}:{seconds:06.3f}"

            columns_to_keep = ['time', 'speed', 'rpm', 'gear', 'throttle', 'brake']
            result_df = telemetry[columns_to_keep]
            
            records = result_df.to_dict(orient='records')
            return {
                "telemetry": records[::5], # Sample data
                "lap_time": lap_time_str
            }

        driver1_result = process_driver(driver)
        if not driver1_result:
            raise HTTPException(status_code=404, detail=f"No laps found for driver {driver}.")
            
        driver2_result = process_driver(driver2) if driver2 and driver2 != "None" else None

        result = {
            "session": f"{year} {race}",
            "driver1": {"name": driver, "data": driver1_result["telemetry"], "lap_time": driver1_result["lap_time"]},
            "driver2": {"name": driver2, "data": driver2_result["telemetry"], "lap_time": driver2_result["lap_time"]} if driver2_result else None
        }
        
        # Save to processed JSON cache
        try:
            import json
            with open(cache_path, 'w') as f:
                json.dump(result, f)
            print(f"Successfully cached processed JSON: {cache_filename}")
        except Exception as ce:
            print(f"Failed to save cache file {cache_filename}: {ce}")
            
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        import gc
        gc.collect()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
