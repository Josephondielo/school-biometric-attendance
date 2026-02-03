import requests
import os
import numpy as np
from flask import current_app

def get_face_encoding(image_file, is_enrollment=False):
    """
    Delegates face encoding to the standalone Biometric Service.
    """
    service_url = os.environ.get("BIOMETRIC_SERVICE_URL", "http://127.0.0.1:5000")
    if not service_url.startswith("http"):
        service_url = f"http://{service_url}"
    
    try:
        # Prepare multipart form data
        files = {"image": (image_file.filename, image_file.stream, image_file.content_type)}
        data = {"is_enrollment": str(is_enrollment).lower()}
        headers = {"X-API-KEY": os.environ.get("BIOMETRIC_API_KEY", "supersecret-key")}
        
        response = requests.post(f"{service_url}/encode", files=files, data=data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return np.array(result["encoding"])
        else:
            # Propagate error message from service if available
            error_data = response.json()
            return {"error": error_data.get("error", "Biometric service error")}
            
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"❌ Biometric Service Connection Error: {e}")
        return {"error": "Biometric service is currently unavailable"}
    except Exception as e:
        current_app.logger.error(f"❌ Face Engine Error: {e}")
        return {"error": f"Failed to process face: {str(e)}"}

def db_to_encoding(binary_data):
    """Converts binary data from DB back to numpy array."""
    return np.frombuffer(binary_data, dtype=np.float64)

def encoding_to_db(encoding_array):
    """Converts numpy array encoding to binary for DB storage."""
    # Ensure it's a numpy array
    if not isinstance(encoding_array, np.ndarray):
        encoding_array = np.array(encoding_array)
    return encoding_array.tobytes()
