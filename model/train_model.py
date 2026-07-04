import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, BatchNormalization, Dropout, Dense, Flatten, Rescaling, Input
import os
import matplotlib.pyplot as plt
from pathlib import Path

# Setup Paths
BASE_DIR = Path("../dataset")
TRAIN_DIR = BASE_DIR / "train"
VAL_DIR = BASE_DIR / "validation"
MODEL_SAVE_PATH = Path("./emotion_model.keras")

# Hyperparameters
BATCH_SIZE = 64
EPOCHS = 50
IMG_SIZE = (48, 48)

def build_model():
    """
    Builds a Convolutional Neural Network (CNN) from scratch for Facial Expression Recognition.
    """
    model = Sequential([
        # ----------------------------------------------------------------------
        # Input Layer
        # Explicitly defines the expected shape of the input images (48x48, 1 channel grayscale)
        Input(shape=(48, 48, 1)),
        
        # ----------------------------------------------------------------------
        # Preprocessing Layer
        # Rescaling: Normalizes the raw pixel values from [0, 255] down to [0.0, 1.0]. 
        # This makes the neural network converge much faster and prevents exploding gradients.
        Rescaling(1./255),
        
        # ----------------------------------------------------------------------
        # BLOCK 1: Low-level Feature Detection (Edges, lines)
        # Conv2D: Scans the image with 3x3 filters to extract low-level features.
        Conv2D(64, (3, 3), padding='same', activation='relu'),
        # BatchNormalization: Normalizes the activations from the previous layer to mean=0, std=1. 
        # Accelerates training and adds slight regularization.
        BatchNormalization(),
        
        Conv2D(64, (3, 3), padding='same', activation='relu'),
        BatchNormalization(),
        # MaxPooling2D: Downsamples the spatial dimensions (width, height) by a factor of 2. 
        # This drastically reduces computational load and makes the model slightly translation-invariant.
        MaxPooling2D(pool_size=(2, 2)),
        # Dropout: Randomly turns off 25% of neurons during each training step.
        # This forces the network to learn redundant representations and prevents overfitting (memorizing the data).
        Dropout(0.25),
        
        # ----------------------------------------------------------------------
        # BLOCK 2: Mid-level Feature Extraction (Shapes, facial components like eyes, mouth curves)
        Conv2D(128, (3, 3), padding='same', activation='relu'),
        BatchNormalization(),
        Conv2D(128, (3, 3), padding='same', activation='relu'),
        BatchNormalization(),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.25),
        
        # ----------------------------------------------------------------------
        # BLOCK 3: High-level Feature Extraction (Abstract patterns specific to complex emotions)
        Conv2D(256, (3, 3), padding='same', activation='relu'),
        BatchNormalization(),
        Conv2D(256, (3, 3), padding='same', activation='relu'),
        BatchNormalization(),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.25),
        
        # ----------------------------------------------------------------------
        # FULLY CONNECTED CLASSIFIER
        # Flatten: Converts the 2D feature maps from the convolution blocks into a flat 1D vector. 
        # Neural networks' Dense layers require 1D inputs.
        Flatten(),
        
        # Dense: A traditional fully connected layer where every neuron connects to every neuron in the previous layer. 
        # Learns to map the highly abstract visual features to specific emotion categories.
        Dense(512, activation='relu'),
        BatchNormalization(),
        Dropout(0.5), # Using a higher dropout of 50% here because Dense layers with many parameters are highly prone to overfitting.
        
        # Output Dense Layer: 7 units (one for each emotion class). 
        # Softmax activation converts the raw output logits into a probability distribution that sums to 1 (e.g., 80% Happy, 10% Neutral...).
        Dense(7, activation='softmax')
    ])
    
    # Compile the model
    # Adam: An adaptive learning rate optimizer that performs very well on computer vision tasks.
    # categorical_crossentropy: The standard loss function for multi-class classification problems with one-hot encoded labels.
    model.compile(optimizer='adam',
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])
    
    return model

def train():
    print("Loading and preparing datasets...")
    
    # tf.keras.utils.image_dataset_from_directory is the most efficient way to load images from disk to TensorFlow
    train_ds = tf.keras.utils.image_dataset_from_directory(
        TRAIN_DIR,
        color_mode='grayscale',
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical' # Automatically one-hot encodes the labels based on folder names
    )
    
    val_ds = tf.keras.utils.image_dataset_from_directory(
        VAL_DIR,
        color_mode='grayscale',
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical'
    )
    
    # Optimize data loading performance (caches data in memory to prevent disk I/O bottlenecks)
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
    
    print("Building model architecture...")
    model = build_model()
    
    # Print out the architecture layout and parameter counts
    model.summary()
    
    # Training Callbacks
    # EarlyStopping: Halts training if the validation accuracy stops improving for 7 epochs.
    early_stopping = tf.keras.callbacks.EarlyStopping(monitor='val_accuracy', patience=7, restore_best_weights=True)
    
    # ModelCheckpoint: Saves the best performing model to disk continuously.
    checkpoint = tf.keras.callbacks.ModelCheckpoint(filepath=str(MODEL_SAVE_PATH), monitor='val_accuracy', save_best_only=True)
    
    # ReduceLROnPlateau: Drops the learning rate if the model gets stuck (val_loss plateaus for 3 epochs).
    reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=3, min_lr=1e-6, verbose=1)
    
    # TensorBoard: Visualizes the training metrics, model graph, and weights over time.
    tensorboard_dir = Path("./logs")
    tensorboard_dir.mkdir(exist_ok=True)
    tensorboard = tf.keras.callbacks.TensorBoard(log_dir=str(tensorboard_dir), histogram_freq=1)
    
    print("\nStarting CNN Training Loop...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=[early_stopping, checkpoint, reduce_lr, tensorboard]
    )
    
    print(f"\nTraining completed! The best model weights were saved to: {MODEL_SAVE_PATH}")
    
    plot_history(history)

def plot_history(history):
    print("\nGenerating training history plots...")
    acc = history.history['accuracy']
    val_acc = history.history['val_accuracy']
    loss = history.history['loss']
    val_loss = history.history['val_loss']

    epochs_range = range(len(acc))

    plt.figure(figsize=(14, 5))

    # Plot Accuracy
    plt.subplot(1, 2, 1)
    plt.plot(epochs_range, acc, label='Training Accuracy')
    plt.plot(epochs_range, val_acc, label='Validation Accuracy')
    plt.legend(loc='lower right')
    plt.title('Training and Validation Accuracy')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')

    # Plot Loss
    plt.subplot(1, 2, 2)
    plt.plot(epochs_range, loss, label='Training Loss')
    plt.plot(epochs_range, val_loss, label='Validation Loss')
    plt.legend(loc='upper right')
    plt.title('Training and Validation Loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')

    plot_path = Path("./training_history.png")
    plt.savefig(plot_path)
    print(f"Plot saved successfully to {plot_path}")

if __name__ == '__main__':
    train()
