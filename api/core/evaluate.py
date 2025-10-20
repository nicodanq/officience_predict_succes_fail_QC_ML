import io, base64
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from sklearn.metrics import (
    confusion_matrix, ConfusionMatrixDisplay,
    roc_curve, auc, classification_report
)

from .logger import logger
from .predict import model
from pathlib import Path
import pandas as pd

def generate_metrics_and_graphs():
    # Charger ton X_test et y_test depuis le dossier processed
    PROCESSED_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"

    X_test = pd.read_csv(PROCESSED_DIR / "x_test.csv")
    y_test = pd.read_csv(PROCESSED_DIR / "y_test.csv").squeeze()  # pour avoir un vecteur

    # Prédictions du modèle
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]  # colonne de la proba de succès
    y_true = y_test
    
    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred)
    disp = ConfusionMatrixDisplay(cm)
    fig, ax = plt.subplots()
    disp.plot(ax=ax)
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    cm_b64 = base64.b64encode(buf.read()).decode("utf-8")
    plt.close(fig)

    # ROC Curve
    fpr, tpr, _ = roc_curve(y_true, y_proba)
    roc_auc = auc(fpr, tpr)
    plt.figure()
    plt.plot(fpr, tpr, color='blue', label=f'ROC curve (AUC = {roc_auc:.2f})')
    plt.plot([0, 1], [0, 1], color='gray', linestyle='--')
    plt.legend()
    plt.title('ROC Curve')
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    roc_b64 = base64.b64encode(buf.read()).decode("utf-8")
    plt.close()

    logger.info("📊 Metrics and graphs generated.")
    report = classification_report(y_true, y_pred, output_dict=True)
    return {
        "accuracy": report["accuracy"],
        "roc_auc": roc_auc,
        "precision_0": report["0"]["precision"],
        "recall_0": report["0"]["recall"],
        "precision_1": report["1"]["precision"],
        "recall_1": report["1"]["recall"],
        "confusion_matrix": cm_b64,
        "roc_curve": roc_b64
    }
