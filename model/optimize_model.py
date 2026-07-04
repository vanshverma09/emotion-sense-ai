import tensorflow as tf
import os

model_path = "emotion_model.keras"
tflite_path = "emotion_model.tflite"

def optimize():
    if not os.path.exists(model_path):
        print(f"Error: {model_path} not found. Please train the model first.")
        return

    print(f"Loading {model_path}...")
    model = tf.keras.models.load_model(model_path)

    print("Converting to TensorFlow Lite format (with dynamic range quantization)...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Apply default optimization (Quantization for smaller footprint and faster inference)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]

    tflite_model = converter.convert()

    print(f"Saving optimized model to {tflite_path}...")
    with open(tflite_path, "wb") as f:
        f.write(tflite_model)

    print(f"Optimization complete! Original model size: {os.path.getsize(model_path) / 1024 / 1024:.2f} MB")
    print(f"Optimized TFLite size: {os.path.getsize(tflite_path) / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    optimize()
