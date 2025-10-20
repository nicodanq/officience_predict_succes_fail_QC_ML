"""
predict.py
-----------
Loads the trained QC model and makes predictions on new data.
Author: Nicolas Danquigny
"""

import pandas as pd
import joblib
from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

PROCESSED_DIR = Path(os.getenv("PROCESSED_DIR"))
MODELS_DIR = Path(os.getenv("MODELS_DIR"))

model_path = MODELS_DIR / "qc_baseline_model.joblib"

print(f"PREDICT : Loading model from {model_path} ...")
clf = joblib.load(model_path)
print(f"PREDICT : ✅ Model loaded successfully.")

# Load new data for prediction
new_data_path = PROCESSED_DIR / "x_test.csv"  # Change this path to your new data file
x_new = pd.read_csv(new_data_path)
print(f"PREDICT : ✅ New data Loaded : {len(x_new)} samples from {new_data_path}")
print(x_new.head(3))

# Predict probabilities and classes
y_proba = clf.predict_proba(x_new)[:, 1]
y_pred = (y_proba >= 0.5).astype(int)

# Combine results
results = x_new.copy()
results["success_proba"] = y_proba
results["predicted_success"] = y_pred

print("\n🎯 Sample predictions:")
print(results[["success_proba", "predicted_success"]].head(10))

output_path = PROCESSED_DIR / "predictions.csv"
results.to_csv(output_path, index=False)
print(f"\n💾 Predictions saved to: {output_path}")