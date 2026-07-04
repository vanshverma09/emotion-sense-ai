import time
import cv2
import numpy as np
import tensorflow as tf
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent.parent.parent.parent / "model"
MODEL_PATH = MODEL_DIR / "emotion_model.keras"
TFLITE_PATH = MODEL_DIR / "emotion_model.tflite"
CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'

EMOTIONS = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

class MLEngine:
    def __init__(self):
        self.model = None
        self.tflite_interpreter = None
        self.input_details = None
        self.output_details = None
        self.face_cascade = None
        self.is_tflite = False
        
    def load_model(self):
        self.face_cascade = cv2.CascadeClassifier(CASCADE_PATH)
        
        if TFLITE_PATH.exists():
            logger.info(f"Loading optimized TFLite model from {TFLITE_PATH}...")
            self.tflite_interpreter = tf.lite.Interpreter(model_path=str(TFLITE_PATH))
            self.tflite_interpreter.allocate_tensors()
            self.input_details = self.tflite_interpreter.get_input_details()
            self.output_details = self.tflite_interpreter.get_output_details()
            self.is_tflite = True
            logger.info("TFLite Model loaded successfully.")
        elif MODEL_PATH.exists():
            logger.info(f"Loading Keras model from {MODEL_PATH}...")
            self.model = tf.keras.models.load_model(str(MODEL_PATH))
            logger.info("Keras Model loaded successfully.")
        else:
            logger.warning("No trained model found. Prediction will fail.")

    def predict_emotion(self, image_bytes: bytes):
        start_time = time.time()
        
        if self.model is None and self.tflite_interpreter is None:
            self.load_model()
            if self.model is None and self.tflite_interpreter is None:
                raise Exception("TensorFlow Model could not be loaded. Ensure you have trained the model first.")

        # Decode image from bytes
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise Exception("Could not decode image.")
            
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Detect face using OpenCV Haar Cascades
        faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        # If no face is found, process the whole image as a fallback
        if len(faces) == 0:
            roi_gray = cv2.resize(gray, (48, 48), interpolation=cv2.INTER_AREA)
        else:
            # Grab the largest or first face found
            (x, y, w, h) = faces[0]
            roi_gray = gray[y:y+h, x:x+w]
            # Resize the cropped face to 48x48 as expected by our CNN
            roi_gray = cv2.resize(roi_gray, (48, 48), interpolation=cv2.INTER_AREA)
            
        # The CNN expects shape (1, 48, 48, 1) -> (Batch, Height, Width, Channels)
        # Note: Rescaling(1./255) is natively handled by the model architecture we defined!
        roi_gray = np.expand_dims(roi_gray, axis=0) # Add Batch dimension
        roi_gray = np.expand_dims(roi_gray, axis=-1) # Add Channel dimension
        
        if self.is_tflite:
            # Use TFLite for prediction
            input_data = roi_gray.astype(np.float32)
            self.tflite_interpreter.set_tensor(self.input_details[0]['index'], input_data)
            self.tflite_interpreter.invoke()
            preds = self.tflite_interpreter.get_tensor(self.output_details[0]['index'])
        else:
            # Use standard Keras model
            preds = self.model.predict(roi_gray, verbose=0)
            
        emotion_idx = np.argmax(preds[0])
        confidence = float(preds[0][emotion_idx])
        
        inference_time = round((time.time() - start_time) * 1000, 2) # in milliseconds
        
        return EMOTIONS[emotion_idx], confidence, inference_time

ml_engine = MLEngine()
