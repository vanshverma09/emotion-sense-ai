import os
import cv2
import numpy as np
import pandas as pd
import random
from pathlib import Path

# Paths (Relative to where the script is run in the model folder)
BASE_DIR = Path("../dataset")
CSV_PATH = BASE_DIR / "fer2013.csv"
TRAIN_DIR = BASE_DIR / "train"
VAL_DIR = BASE_DIR / "validation"
TEST_DIR = BASE_DIR / "test"

# Emotion labels mapping based on FER2013 standards
EMOTIONS = {
    0: 'angry', 
    1: 'disgust', 
    2: 'fear', 
    3: 'happy', 
    4: 'sad', 
    5: 'surprise', 
    6: 'neutral'
}

def setup_directories():
    """Creates the required folder structure."""
    print("Setting up directory structure...")
    for dir_path in [TRAIN_DIR, VAL_DIR, TEST_DIR]:
        for emotion in EMOTIONS.values():
            (dir_path / emotion).mkdir(parents=True, exist_ok=True)

def process_dataset(balance_classes=True):
    if not CSV_PATH.exists():
        print(f"Error: Could not find '{CSV_PATH}'.")
        print("Please download the original 'fer2013.csv' dataset file and place it in the 'dataset' folder.")
        return

    print("Loading fer2013.csv into memory (this may take a moment)...")
    df = pd.read_csv(CSV_PATH)
    
    # Dictionary to store training images in memory for balancing later
    train_data = {emotion: [] for emotion in EMOTIONS.values()}
    
    print("\nExtracting pixels, preprocessing, and routing images...")
    
    for index, row in df.iterrows():
        emotion_label = EMOTIONS[row['emotion']]
        usage = row['Usage']
        
        # 1. Load & Extract: Convert space-separated pixel strings to a numpy array
        pixels = np.array(row['pixels'].split(' '), dtype='uint8').reshape(48, 48)
        
        # 2. Preprocessing (Resize): Explicitly resizing to 48x48 using OpenCV
        # FER2013 is natively 48x48, but this ensures conformity if the input size varies
        image = cv2.resize(pixels, (48, 48), interpolation=cv2.INTER_AREA)
        
        # 3. Preprocessing (Grayscale Normalization): 
        # By converting the raw string to uint8, the image is constrained to standard 0-255 grayscale values.
        # Note: We save to disk as standard JPGs. Deep learning models require the inputs to be strictly
        # normalized between 0.0 and 1.0. That division (img / 255.0) is best handled by the 
        # tf.keras.layers.Rescaling(1./255) layer directly in the CNN architecture to prevent data loss.
        
        if usage == 'Training':
            if balance_classes:
                train_data[emotion_label].append(image)
            else:
                cv2.imwrite(str(TRAIN_DIR / emotion_label / f"{index}.jpg"), image)
                
        elif usage == 'PublicTest':
            # PublicTest is traditionally used as the Validation set
            cv2.imwrite(str(VAL_DIR / emotion_label / f"{index}.jpg"), image)
            
        elif usage == 'PrivateTest':
            # PrivateTest is used as the final Test set
            cv2.imwrite(str(TEST_DIR / emotion_label / f"{index}.jpg"), image)

    # 4. Balancing Classes
    if balance_classes:
        print("\nBalancing training classes via data augmentation (oversampling)...")
        # Find the maximum class size so we can oversample minority classes to match it
        max_samples = max([len(imgs) for imgs in train_data.values()])
        print(f"Target samples per class: {max_samples}")
        
        for emotion, images in train_data.items():
            current_count = len(images)
            needed = max_samples - current_count
            print(f"[{emotion.upper()}] Original: {current_count} -> Generating {needed} augmented images...")
            
            # Save original un-augmented images
            for i, img in enumerate(images):
                cv2.imwrite(str(TRAIN_DIR / emotion / f"orig_{i}.jpg"), img)
            
            # Oversample to reach max_samples using basic horizontal flips
            for i in range(needed):
                # Pick a random original image from this class
                img = random.choice(images)
                
                # Augmentation: Flip horizontally
                aug_img = cv2.flip(img, 1) 
                
                cv2.imwrite(str(TRAIN_DIR / emotion / f"aug_{i}.jpg"), aug_img)
                
    print("\nDataset successfully processed, balanced, and saved to directories!")

if __name__ == '__main__':
    setup_directories()
    process_dataset(balance_classes=True)
