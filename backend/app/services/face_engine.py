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

def get_face_encoding(image_file):
    """
    Detects a face in the provided image file and returns the 128-dimensional face encoding.
    Returns None if no face is found.
    """
    if face_recognition is None:
        raise ImportError("face_recognition module is not installed.")

    # Load the image using face_recognition (supports file-like objects)
    image = face_recognition.load_image_file(image_file)
    
    # Get face encodings for any faces in the image
    # We assume the user is uploading a profile picture with one clear face
    encodings = face_recognition.face_encodings(image)
    
    if not encodings:
        return None
        
    # Return the first face encoding found
    return encodings[0]

def db_to_encoding(binary_data):
    """Converts binary data from DB back to numpy array."""
    if np is None:
         raise ImportError("numpy module is not installed.")
    return np.frombuffer(binary_data, dtype=np.float64)

def encoding_to_db(encoding_array):
    """Converts numpy array encoding to binary for DB storage."""
    return encoding_array.tobytes()
