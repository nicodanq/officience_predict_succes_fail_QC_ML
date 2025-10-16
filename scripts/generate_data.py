"""
generate_data.py
----------------
Simulates satellite ↔ bluetooth communication logs.

Author: Nicolas Danquigny
Purpose: Create synthetic data to train & test the AI-QC system
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

# ---- PARAMETERS ----
N = 10000  # number of samples to simulate
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# output path
OUTPUT_PATH = os.path.join("data", "synthetic_satellite_logs.csv")

# ---- FEATURE SIMULATION ----

print("🛰️ Generating synthetic communication data...")

# physical & signal metrics
snr = np.random.normal(12, 4, N)              # Signal-to-noise ratio (dB)
rssi = np.random.normal(-70, 6, N)            # Bluetooth signal strength (dBm)
distance = np.clip(np.random.exponential(3, N), 0, 30)  # distance in meters
latency_bt = np.random.normal(50, 20, N)      # Bluetooth latency (ms)
latency_sat = np.random.normal(400, 150, N)   # Satellite latency (ms)

# environment & device metrics
temperature = np.random.normal(28, 7, N)      # °C
humidity = np.random.normal(60, 15, N)        # %
battery = np.random.uniform(20, 100, N)       # battery %
firmware = np.random.choice(['v1.0', 'v1.1', 'v2.0'], N, p=[0.4, 0.4, 0.2])
time_of_day = np.random.choice(['morning', 'afternoon', 'evening', 'night'], N)
lat = np.random.uniform(8.0, 22.0, N)   # degrees north
lon = np.random.uniform(102.0, 110.0, N)  # degrees east
altitude = np.random.normal(50, 20, N)  # meters

# ---- SUCCESS PROBABILITY (nonlinear formula) ----

# baseline "score" (logit-like)
# z = ton “score” → c’est ce qu’on appelle le logit
# σ(z) = probabilité du succès

logit = (
    0.35 * (snr - 10)
    - 0.25 * (np.abs(rssi + 70) / 6)
    - 0.03 * (temperature - 25)
    - 0.02 * (humidity - 60)
    - 0.05 * np.maximum(0, distance - 5)
    - 0.001 * latency_bt
    - 0.002 * latency_sat
    + 0.03 * (battery - 50) / 50
)

# firmware effect: v2.0 improves success
firmware_bonus = np.select(
    [firmware == 'v2.0', firmware == 'v1.1', firmware == 'v1.0'],
    [0.6, 0.2, 0.0],
)
logit += firmware_bonus

# convert score → probability (sigmoid)
prob = 1 / (1 + np.exp(-logit))

# binary success outcome
success = (np.random.rand(N) < prob).astype(int)

# ---- ASSEMBLE DATAFRAME ----
df = pd.DataFrame({
    "timestamp": [datetime.now() - timedelta(seconds=i*5) for i in range(N)],
    "snr": snr,
    "rssi": rssi,
    "distance": distance,
    "latency_bt": latency_bt,
    "latency_sat": latency_sat,
    "temperature": temperature,
    "humidity": humidity,
    "battery": battery,
    "firmware": firmware,
    "time_of_day": time_of_day,
    "success": success,
    "latitude": lat,
    "longitude": lon,
    "altitude": altitude,
})

# ---- SAVE ----
os.makedirs("data", exist_ok=True)
df.to_csv(OUTPUT_PATH, index=False)

print(f"✅ Done! Generated {len(df)} samples → {OUTPUT_PATH}")
print(df.head())
