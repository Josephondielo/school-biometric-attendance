import requests
import os
import numpy as np
from flask import current_app

def find_best_match(known_embeddings, unknown_encoding, tolerance=0.45):
    """
    Delegates face comparison to the standalone Biometric Service.
    """
    if not known_embeddings:
        return None
        
    service_url = os.environ.get("BIOMETRIC_SERVICE_URL", "http://127.0.0.1:5000")
    if not service_url.startswith("http"):
        service_url = f"http://{service_url}"
    
    try:
        # Prepare known vectors for JSON serialization
        known_vectors = [np.frombuffer(e.vector, dtype=np.float64).tolist() for e in known_embeddings]
        
        # Prepare the request body
        payload = {
            "unknown": unknown_encoding.tolist() if hasattr(unknown_encoding, "tolist") else unknown_encoding,
            "knowns": known_vectors,
            "tolerance": tolerance
        }
        
        # Prepare the request headers
        headers = {"X-API-KEY": os.environ.get("BIOMETRIC_API_KEY", "supersecret-key")}
        
        response = requests.post(f"{service_url}/compare", json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            match_index = result.get("match_index", -1)
            
            if match_index != -1:
                return known_embeddings[match_index]
            return None
        else:
            current_app.logger.error(f"❌ Biometric Service Error: {response.text}")
            return None
            
    except Exception as e:
        current_app.logger.error(f"❌ Matcher Service Error: {e}")
        return None
