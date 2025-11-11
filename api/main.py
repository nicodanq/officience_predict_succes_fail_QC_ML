from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from core.predict import predict_one, predict_from_csv
from core.evaluate import generate_metrics_and_graphs
from core.schemas import PredictRequest
from core.logger import logger

app = FastAPI(title="AI QC Predictor API")
# --- Configuration CORS ---
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://ai-qc.officience.com",
    "http://172.16.1.7:3000",  # si tu veux tester en local aussi
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # ou ["*"] pour tout autoriser (dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "🚀 AI QC Predictor API is running!"}

@app.post("/predict")
def predict(data: PredictRequest):  # ✅ Pydantic valide automatiquement le JSON
    return predict_one(data.dict())

@app.post("/predict_csv")
async def predict_csv(file: UploadFile = File(...)):
    return await predict_from_csv(file)

@app.get("/metrics")
def get_metrics():
    metrics = generate_metrics_and_graphs()
    del metrics["confusion_matrix"]
    del metrics["roc_curve"]
    return metrics

@app.get("/graphs")
def get_graphs():
    """
    Retourne toutes les visualisations du modèle :
    - matrice de confusion
    - courbe ROC
    - distribution des probabilités
    - importance des features
    - calibration curve
    """
    logger.info("📈 Generating all graphs for visualization dashboard...")
    metrics = generate_metrics_and_graphs()

    return {
        "confusion_matrix": metrics.get("confusion_matrix"),
        "roc_curve": metrics.get("roc_curve"),
        "proba_distribution": metrics.get("proba_distribution"),
        "feature_importance": metrics.get("feature_importance"),
        "calibration_curve": metrics.get("calibration_curve"),
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": True}

