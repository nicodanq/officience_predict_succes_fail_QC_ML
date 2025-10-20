import joblib
import pandas as pd
from pathlib import Path
from fastapi import UploadFile, File
from .logger import logger
import io

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "qc_baseline_model.joblib"
logger.info(f"Loading model from: {MODEL_PATH}")
model = joblib.load(MODEL_PATH)
logger.info("✅ Model loaded successfully.")

def predict_one(data: dict):
    df = pd.DataFrame([data])
    prediction = model.predict(df)[0]
    proba = model.predict_proba(df)[0][1]
    logger.info(f"Prediction={prediction}, Success Probability={proba:.3f}")
    return {"prediction": int(prediction), "success_proba": float(proba)}

async def predict_from_csv(file: UploadFile = File(...)):

    try:
        # Lire le CSV
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))

        # Faire les prédictions
        preds = model.predict(df)
        probas = model.predict_proba(df)[:, 1]

        # Ajouter les résultats
        df["prediction"] = preds
        df["success_proba"] = probas

        # Calculs de statistiques
        total_rows = len(df)
        total_success = int((preds == 1).sum())
        total_fail = int((preds == 0).sum())
        success_rate = round(total_success / total_rows * 100, 2)
        avg_confidence = round(probas.mean() * 100, 2)

        logger.info(f"✅ Batch prediction complete. {total_rows} rows processed.")

        # Retourne un résumé + aperçu
        return {
            "rows": total_rows,
            "success_rate": success_rate,
            "avg_confidence": avg_confidence,
            "success_count": total_success,
            "fail_count": total_fail,
            "preview": df.head(5).to_dict(orient="records"),
        }

    except Exception as e:
        logger.error(f"❌ Batch prediction failed: {e}")
        return {"error": str(e)}
