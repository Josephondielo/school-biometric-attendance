try:
    import face_recognition
except ImportError:
    print("Warning: face_recognition module not found.")
    face_recognition = None

try:
    import numpy as np
except ImportError:
    print("Warning: numpy module not found.")
    np = None

def get_face_encoding(image_file, is_enrollment=False):
    """
    Detects a face in the provided image file and returns the 128-dimensional face encoding.
    Includes quality validation and alignment enhancements.
    """
    if face_recognition is None:
        raise ImportError("face_recognition module is not installed.")

    # Load image
    image = face_recognition.load_image_file(image_file)
    
    # QUALITY VALIDATION: Check image dimensions
    height, width = image.shape[:2]
    if height < 200 or width < 200:
        return {"error": "Image resolution too low. Minimum 200x200 required."}

    # Detect face locations with upsampling for better precision
    # model="hog" is faster for CPU, "cnn" is more accurate but requires GPU
    face_locations = face_recognition.face_locations(image, number_of_times_to_upsample=2, model="hog")
    
    if not face_locations:
        return None

    # QUALITY VALIDATION: Check face size relative to image
    top, right, bottom, left = face_locations[0]
    face_height = bottom - top
    face_width = right - left
    
    # Face should be at least 20% of the minor dimension
    min_dim = min(height, width)
    if face_height < (min_dim * 0.2):
        return {"error": "Face too small or too far away. Please move closer."}

    # Encodings with Jittering for enrollment (Augmentation)
    # Using model="large" for 68-point landmarks
    jitters = 100 if is_enrollment else 1
    encodings = face_recognition.face_encodings(
        image, 
        known_face_locations=face_locations, 
        num_jitters=jitters,
        model="large"
    )
    
    if not encodings:
        return None
        
    return encodings[0]

def db_to_encoding(binary_data):
    """Converts binary data from DB back to numpy array."""
    if np is None:
         raise ImportError("numpy module is not installed.")
    return np.frombuffer(binary_data, dtype=np.float64)

def encoding_to_db(encoding_array):
    """Converts numpy array encoding to binary for DB storage."""
    return encoding_array.tobytes()
