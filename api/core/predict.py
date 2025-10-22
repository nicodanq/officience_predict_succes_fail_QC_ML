import joblib
import pandas as pd
from pathlib import Path
from fastapi import UploadFile, File
from .logger import logger
import shap
import io

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "qc_baseline_model.joblib"
logger.info(f"Loading model from: {MODEL_PATH}")
model = joblib.load(MODEL_PATH)
logger.info("✅ Model loaded successfully.")

# --- Préparation du modèle et de SHAP ---
preproc = model.named_steps["preproc"]
base_model = model.named_steps["model"]

# Échantillon de référence pour SHAP
x_train_path = Path(__file__).resolve().parent.parent / "data" / "processed" / "x_train.csv"
x_train_sample = pd.read_csv(x_train_path).sample(500, random_state=42)
explainer = shap.LinearExplainer(base_model, preproc.transform(x_train_sample))

def explain_text(top_positive, top_negative):
    """Construit une phrase naturelle résumant les effets."""
    pos_features = [r["feature"].replace("num__", "").replace("cat__", "") for r in top_positive]
    neg_features = [r["feature"].replace("num__", "").replace("cat__", "") for r in top_negative]

    parts = []
    if pos_features:
        parts.append(f"The factors that have contributed to the success are {', '.join(pos_features)}.")
    if neg_features:
        parts.append(f"On the other hand, {', '.join(neg_features)} have limited the model's confidence.")

    if not parts:
        return "No notable factors influenced this prediction."
    return " ".join(parts)

def predict_one(data: dict):
    """Fait une prédiction unique avec explication SHAP (facteurs positifs et négatifs)."""
    df = pd.DataFrame([data])
    X_prep = preproc.transform(df)

    # --- Prédiction ---
    prediction = int(base_model.predict(X_prep)[0])
    proba = float(base_model.predict_proba(X_prep)[0][1])

    # --- Valeurs SHAP ---
    shap_values = explainer.shap_values(X_prep)[0]
    feature_names = preproc.get_feature_names_out()
    shap_df = pd.DataFrame({
        "feature": feature_names,
        "impact": shap_values
    })

    # --- Séparer positifs et négatifs ---
    top_positive = shap_df[shap_df["impact"] > 0].sort_values("impact", ascending=False).head(5)
    top_negative = shap_df[shap_df["impact"] < 0].sort_values("impact", ascending=True).head(5)

    explanation = explain_text(
        top_positive.to_dict(orient="records"),
        top_negative.to_dict(orient="records")
    )

    logger.info(f"Prediction={prediction}, Success Probability={proba:.3f}")
    return {
        "prediction": prediction,
        "success_proba": proba,
        "top_positive": top_positive.to_dict(orient="records"),
        "top_negative": top_negative.to_dict(orient="records"),
        "explanation": explanation
    }

async def predict_from_csv(file: UploadFile = File(...)):
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        preds = model.predict(df)
        probas = model.predict_proba(df)[:, 1]

        df["prediction"] = preds
        df["success_proba"] = probas

        total_rows = len(df)
        total_success = int((preds == 1).sum())
        total_fail = int((preds == 0).sum())
        success_rate = round(total_success / total_rows * 100, 2)
        avg_confidence = round(probas.mean() * 100, 2)

        logger.info(f"✅ Batch prediction complete. {total_rows} rows processed.")

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
