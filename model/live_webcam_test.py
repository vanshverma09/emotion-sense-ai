import cv2
import numpy as np
import tensorflow as tf
from pathlib import Path
import time

# Setup Paths
MODEL_PATH = Path("./emotion_model.keras")
# Load the pre-trained OpenCV Haar Cascade for face detection
CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'

# Emotion labels mapping
EMOTIONS = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

def run_live_webcam():
    print("Loading TensorFlow model into memory...")
    if not MODEL_PATH.exists():
        print(f"Error: Model not found at {MODEL_PATH}. Please train the model first.")
        return
        
    model = tf.keras.models.load_model(str(MODEL_PATH))
    face_cascade = cv2.CascadeClassifier(CASCADE_PATH)
    
    print("Starting webcam... Press 'q' in the video window to quit.")
    # Initialize webcam (0 is usually the default laptop camera)
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not access the webcam. Please check your camera permissions.")
        return

    # Variables to track FPS
    prev_frame_time = 0
    new_frame_time = 0

    while True:
        # Read a frame from the webcam
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame.")
            break
            
        # Calculate FPS
        new_frame_time = time.time()
        fps = 1 / (new_frame_time - prev_frame_time) if prev_frame_time > 0 else 0
        prev_frame_time = new_frame_time
        fps_text = f"FPS: {int(fps)}"
            
        # Convert frame to grayscale (Haar Cascade and our CNN require grayscale images)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces in the frame
        faces = face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.3, 
            minNeighbors=5, 
            minSize=(30, 30)
        )
        
        for (x, y, w, h) in faces:
            # 1. Crop: Extract the Region of Interest (ROI) - the face bounding box
            roi_gray = gray[y:y+h, x:x+w]
            
            # 2. Preprocess: Resize the ROI to fit the model's expected input shape (48x48)
            roi_gray = cv2.resize(roi_gray, (48, 48), interpolation=cv2.INTER_AREA)
            
            # 3. Format: Format the image array for TensorFlow prediction
            roi = np.expand_dims(roi_gray, axis=0) # Add batch dimension (1, 48, 48)
            roi = np.expand_dims(roi, axis=-1)     # Add channel dimension (1, 48, 48, 1)
            
            # 4. Predict: Send the cropped, preprocessed face to the TensorFlow model
            preds = model.predict(roi, verbose=0)
            emotion_idx = np.argmax(preds[0])
            confidence = preds[0][emotion_idx]
            emotion_label = EMOTIONS[emotion_idx]
            
            # Draw bounding box and label on the original colored frame
            # Color logic: Green for positive emotions, Red for negative/neutral
            color = (0, 255, 0) if emotion_label in ['happy', 'surprise'] else (0, 0, 255)
            
            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            
            text = f"{emotion_label.upper()} ({confidence*100:.0f}%)"
            # Overlay the text just above the bounding box
            cv2.putText(frame, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2, cv2.LINE_AA)

        # Draw FPS counter on the top left
        cv2.putText(frame, fps_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2, cv2.LINE_AA)

        # Display the live video feed with our ML overlays
        cv2.imshow('Emotion Sense AI - Live Webcam Inference', frame)
        
        # Wait for the user to press 'q' on the keyboard to exit the loop
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    # Cleanup resources
    cap.release()
    cv2.destroyAllWindows()
    print("Webcam closed.")

if __name__ == '__main__':
    run_live_webcam()
