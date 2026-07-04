import os
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc
from sklearn.preprocessing import label_binarize
from pathlib import Path

# Setup Paths
BASE_DIR = Path("../dataset")
TEST_DIR = BASE_DIR / "test"
MODEL_PATH = Path("./emotion_model.keras")

# Hyperparameters
BATCH_SIZE = 64
IMG_SIZE = (48, 48)

# Emotion Labels (must match the alphabetical directory order produced by dataset_from_directory)
EMOTIONS = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

def evaluate():
    print(f"Loading trained model from {MODEL_PATH}...")
    if not MODEL_PATH.exists():
        print("Model file not found. Please train the model first by running train_model.py.")
        return
    model = tf.keras.models.load_model(MODEL_PATH)
    
    print("Loading test dataset...")
    # WARNING: shuffle=False is strictly required to match labels with predictions accurately
    test_ds = tf.keras.utils.image_dataset_from_directory(
        TEST_DIR,
        color_mode='grayscale',
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical',
        shuffle=False 
    )
    
    print("\nExecuting predictions on test data...")
    # Predict directly via the un-shuffled dataset
    y_pred_probs = model.predict(test_ds)
    y_pred_classes = np.argmax(y_pred_probs, axis=1)
    
    # Extract actual labels and raw images for visualization
    y_true = []
    all_images = []
    for images, labels in test_ds.unbatch():
        y_true.append(np.argmax(labels.numpy()))
        all_images.append(images.numpy())
        
    y_true = np.array(y_true)
    all_images = np.array(all_images)
    
    # ---------------------------------------------------------
    # 1. Classification Report (Precision, Recall, F1-Score)
    print("\n--- Classification Report ---")
    report = classification_report(y_true, y_pred_classes, target_names=EMOTIONS)
    print(report)
    
    # Save the text report to a file
    with open("classification_report.txt", "w") as f:
        f.write("Evaluation Classification Report\n\n")
        f.write(report)
    print("-> Saved classification_report.txt")
    
    # ---------------------------------------------------------
    # 2. Confusion Matrix
    print("\nGenerating Confusion Matrix...")
    cm = confusion_matrix(y_true, y_pred_classes)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=EMOTIONS, yticklabels=EMOTIONS)
    plt.title('Confusion Matrix - Emotion Recognition')
    plt.ylabel('Actual Emotion')
    plt.xlabel('Predicted Emotion')
    plt.savefig('confusion_matrix.png')
    print("-> Saved confusion_matrix.png")
    
    # ---------------------------------------------------------
    # 3. ROC Curves (Multi-class)
    print("Generating ROC Curves...")
    # Binarize labels for One-vs-Rest ROC curves
    y_true_bin = label_binarize(y_true, classes=[0, 1, 2, 3, 4, 5, 6])
    n_classes = y_true_bin.shape[1]
    
    plt.figure(figsize=(12, 8))
    for i in range(n_classes):
        fpr, tpr, _ = roc_curve(y_true_bin[:, i], y_pred_probs[:, i])
        roc_auc = auc(fpr, tpr)
        plt.plot(fpr, tpr, lw=2, label=f'{EMOTIONS[i]} (AUC = {roc_auc:0.2f})')

    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic (ROC) Curves')
    plt.legend(loc="lower right")
    plt.savefig('roc_curves.png')
    print("-> Saved roc_curves.png")
    
    # ---------------------------------------------------------
    # 4. Visualize Prediction Examples
    print("Generating Sample Predictions grid...")
    plt.figure(figsize=(15, 10))
    
    # Grab 15 random image indices
    indices = np.random.choice(len(all_images), 15, replace=False)
    for i, idx in enumerate(indices):
        plt.subplot(3, 5, i + 1)
        # Squeeze removes the single channel dimension (48, 48, 1) -> (48, 48) for matplotlib grayscale display
        plt.imshow(all_images[idx].squeeze(), cmap='gray')
        
        pred_label = EMOTIONS[y_pred_classes[idx]]
        true_label = EMOTIONS[y_true[idx]]
        
        # Color text green if correct, red if incorrect
        color = 'green' if pred_label == true_label else 'red'
        
        plt.title(f"Pred: {pred_label}\nTrue: {true_label}", color=color, fontweight='bold')
        plt.axis('off')
        
    plt.tight_layout()
    plt.savefig('prediction_examples.png')
    print("-> Saved prediction_examples.png\n")
    print("All evaluation artifacts have been generated successfully!")

if __name__ == '__main__':
    evaluate()
