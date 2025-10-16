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

## 3. Machine Learning Foundations

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

## 4. Mathematical Background

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

## 5. Pipeline Overview

```text
Data (synthetic or real)
   ↓
Preprocessing  →  Model training (Logistic / RF)
   ↓
Evaluation  →  Feature importance / SHAP
   ↓
Model saved (.joblib)  →  Dashboard / API
