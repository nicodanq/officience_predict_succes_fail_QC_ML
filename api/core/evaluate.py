import io
import base64
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from sklearn.metrics import (
    confusion_matrix, ConfusionMatrixDisplay,
    roc_curve, auc, classification_report,
    f1_score, balanced_accuracy_score, brier_score_loss
)
from sklearn.calibration import calibration_curve

from .logger import logger
from .predict import model
from pathlib import Path


def generate_metrics_and_graphs():
    """
    Génère toutes les métriques et graphiques utiles pour évaluer le modèle :
    - Confusion matrix
    - ROC curve
    - Distribution des probabilités
    - Importance globale des features
    - Calibration curve
    - Scores numériques (accuracy, F1, AUC, etc.)
    """

    # === 1️⃣ Chargement des données ===
    PROCESSED_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"
    X_test = pd.read_csv(PROCESSED_DIR / "x_test.csv")
    y_test = pd.read_csv(PROCESSED_DIR / "y_test.csv").squeeze()

    # === 2️⃣ Prédictions ===
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    y_true = y_test

    # === 3️⃣ Confusion Matrix ===
    cm = confusion_matrix(y_true, y_pred)
    disp = ConfusionMatrixDisplay(cm)
    fig, ax = plt.subplots()
    disp.plot(ax=ax, cmap="viridis", colorbar=True)
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    cm_b64 = base64.b64encode(buf.read()).decode("utf-8")
    plt.close(fig)

    # === 4️⃣ ROC Curve ===
    fpr, tpr, _ = roc_curve(y_true, y_proba)
    roc_auc = auc(fpr, tpr)
    plt.figure()
    plt.plot(fpr, tpr, color='blue', label=f'ROC curve (AUC = {roc_auc:.2f})')
    plt.plot([0, 1], [0, 1], color='gray', linestyle='--')
    plt.title('ROC Curve')
    plt.legend()
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    roc_b64 = base64.b64encode(buf.read()).decode("utf-8")
    plt.close()

    # === 5️⃣ Distribution des probabilités ===
    plt.figure()
    plt.hist(y_proba, bins=20, color='skyblue', edgecolor='black')
    plt.title("Distribution des probabilités de succès")
    plt.xlabel("Probabilité prédite")
    plt.ylabel("Nombre de cas")
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    proba_dist_b64 = base64.b64encode(buf.read()).decode("utf-8")
    plt.close()

    # === 6️⃣ Importance globale des variables (LogisticRegression) ===
    try:
        feature_names = model.named_steps["preproc"].get_feature_names_out()
        coefs = model.named_steps["model"].coef_[0]
        abs_coefs = np.abs(coefs)
        top_idx = np.argsort(abs_coefs)[::-1][:10]

        plt.figure(figsize=(7, 5))
        plt.barh(np.array(feature_names)[top_idx][::-1], abs_coefs[top_idx][::-1], color='mediumpurple')
        plt.title("Importance globale des variables")
        plt.xlabel("Poids absolu du coefficient")
        plt.tight_layout()
        buf = io.BytesIO()
        plt.savefig(buf, format="png")
        buf.seek(0)
        importance_b64 = base64.b64encode(buf.read()).decode("utf-8")
        plt.close()
    except Exception as e:
        logger.warning(f"Impossible de générer l'importance des features : {e}")
        importance_b64 = None

    # === 7️⃣ Calibration Curve ===
    try:
        prob_true, prob_pred = calibration_curve(y_true, y_proba, n_bins=10)
        plt.figure()
        plt.plot(prob_pred, prob_true, marker='o', color='blue', label='Calibration')
        plt.plot([0, 1], [0, 1], linestyle='--', color='gray')
        plt.title("Courbe de calibration")
        plt.xlabel("Probabilité prédite")
        plt.ylabel("Probabilité réelle")
        plt.legend()
        buf = io.BytesIO()
        plt.savefig(buf, format="png")
        buf.seek(0)
        calib_b64 = base64.b64encode(buf.read()).decode("utf-8")
        plt.close()
    except Exception as e:
        logger.warning(f"Impossible de générer la calibration curve : {e}")
        calib_b64 = None

    # === 8️⃣ Métriques numériques ===
    report = classification_report(y_true, y_pred, output_dict=True)
    f1 = f1_score(y_true, y_pred)
    balanced_acc = balanced_accuracy_score(y_true, y_pred)
    brier = brier_score_loss(y_true, y_proba)

    logger.info("📊 Metrics and graphs generated successfully.")

    # === 9️⃣ Retour ===
    return {
        "accuracy": report["accuracy"],
        "roc_auc": roc_auc,
        "f1_score": f1,
        "balanced_accuracy": balanced_acc,
        "brier_score": brier,
        "precision_0": report["0"]["precision"],
        "recall_0": report["0"]["recall"],
        "precision_1": report["1"]["precision"],
        "recall_1": report["1"]["recall"],
        "confusion_matrix": cm_b64,
        "roc_curve": roc_b64,
        "proba_distribution": proba_dist_b64,
        "feature_importance": importance_b64,
        "calibration_curve": calib_b64
    }
