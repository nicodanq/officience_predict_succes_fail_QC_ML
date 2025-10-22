# 🛰️ AI-Driven Quality Intelligence – Project Overview

## 1. Context & Objectives
This project explores how AI can help identify and explain communication success or failure
between mobile devices and a satellite relay.  
We start without real logs, using **synthetic data** to build and test the full pipeline.

---

## 2. Data Simulation (Synthetic Data)
**File:** `scripts/generate_data.py`

### What it does
- Simulates physical and environmental parameters (SNR, RSSI, temperature…)
- Creates a probability of success using a *logit* + *sigmoid* model
- Adds noise to mimic real-world variability

### Why we use synthetic data
- Allows development before real logs exist  
- Lets us test preprocessing, model training, and visualization pipelines  
- Makes it easy to adjust distributions and relationships

### Mathematical model
We generate a latent score:

z = w1SNR + w2RSSI + ... + b

and convert it to probability with a **sigmoid**:

P(success) = 1 / (1 + exp(-z))

Then we sample a binary variable (`success`).

---

## 3. Dataset Description (Synthetic Features)

| Variable | Type | Description | Unit / Example |
|-----------|------|--------------|----------------|
| **snr** | Numeric | **Signal-to-Noise Ratio** – measures signal quality at the satellite receiver. Higher = clearer signal. | dB (e.g., 12.5) |
| **rssi** | Numeric | **Received Signal Strength Indicator** – measures Bluetooth signal power between phone and device. Closer to 0 = stronger. | dBm (e.g., -70) |
| **distance** | Numeric | Distance between the phone and its Bluetooth-connected device. | meters (e.g., 2.8) |
| **latency_bt** | Numeric | Latency of Bluetooth transmission. | milliseconds (e.g., 45 ms) |
| **latency_sat** | Numeric | Latency of satellite transmission. | milliseconds (e.g., 400 ms) |
| **temperature** | Numeric | Local ambient temperature during transmission. | °C (e.g., 27.3) |
| **humidity** | Numeric | Relative humidity (can influence RF propagation). | % (e.g., 65%) |
| **battery** | Numeric | Device battery level at the time of transmission. | % (e.g., 58%) |
| **firmware** | Categorical | Version of device firmware (v1.0, v1.1, v2.0). Higher versions simulate improved stability. | categorical |
| **time_of_day** | Categorical | Moment of the day (“morning”, “afternoon”, “evening”, “night”) to check contextual patterns. | categorical |
| **latitude**, **longitude**, **altitude** | Numeric | Simulated geolocation to detect spatial effects on connection quality. | degrees / meters |
| **success** | Target (0/1) | Binary result of communication attempt (1 = success, 0 = failure). | binary |

### Notes
- `SNR` and `RSSI` are the **core indicators of communication quality**:
  - High `SNR` → less noise in the satellite link.
  - High (less negative) `RSSI` → stronger Bluetooth connection.
- Environmental variables like `humidity` or `temperature` can degrade performance.
- `distance`, `latency_sat`, and `latency_bt` increase the risk of failure.
- `firmware` represents software improvements (e.g., better retry logic).

---


## 4. Machine Learning Foundations

### Scikit-learn pipeline
Scikit-learn structures ML as a **pipeline**:
1. **Preprocessing**: scaling numeric features, encoding categorical ones  
2. **Model training**: fitting a model on training data  
3. **Prediction**: producing probabilities or classes for new data  

### Why logistic regression first
- It’s interpretable (each coefficient has meaning)  
- It matches the synthetic generation process (same sigmoid idea)  
- Serves as a baseline before complex models

### Alternative models
| Model | Type | Strength | Limitation |
|--------|------|-----------|-------------|
| Logistic Regression | Linear | Explainable, fast | Misses non-linear effects |
| RandomForest | Ensemble | Captures interactions | Less interpretable |
| XGBoost | Gradient boosting | High accuracy | More complex tuning |

---

## 5. Mathematical Background

### The Logit
The **logit** is the linear score before the sigmoid:

logit(p) = log(p / (1 - p))

It maps probabilities (0–1) to all real numbers.

### The Sigmoid
Smoothly converts the logit into a probability curve.  
Small changes around 0 strongly affect the probability.

### Why scaling matters
Many models assume features have comparable ranges.
`StandardScaler()` centers and normalizes numeric variables.

---

## 6. Pipeline Overview

```text
Data (synthetic or real)
   ↓
Preprocessing  →  Model training (Logistic / RF)
   ↓
Evaluation  →  Feature importance / SHAP
   ↓
Model saved (.joblib)  →  Dashboard / API
