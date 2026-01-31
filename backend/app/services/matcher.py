try:
    import numpy as np
except ImportError:
    np = None

try:
    import face_recognition
except ImportError:
    face_recognition = None

def find_best_match(known_embeddings, unknown_encoding, tolerance=0.6):
    """
    Finds the closest match for an unknown face encoding among a list of known embeddings.
    
    Args:
        known_embeddings: List of embedding objects (must have .vector attribute as bytes)
        unknown_encoding: The 128-d numpy array of the face to match
        tolerance: Distance threshold. Lower is stricter. 0.6 is typical, 0.45-0.5 is safer for high security.
    
    Returns:
        The matching embedding object from the list, or None if no match found.
    """
    if not known_embeddings:
        print("🔍 No known embeddings to match against.")
        return None
        
    try:
        known_vectors = [np.frombuffer(e.vector, dtype=np.float64) for e in known_embeddings]
    except Exception as e:
        print(f"❌ Error converting embeddings: {e}")
        return None
    
    if not known_vectors:
        return None

    # Calculate Euclidean distances between the unknown face and all known faces
    face_distances = face_recognition.face_distance(known_vectors, unknown_encoding)
    
    # Find the index of the minimum distance (best match)
    best_match_index = np.argmin(face_distances)
    min_distance = face_distances[best_match_index]
    
    # Check if the best match is within the tolerance
    if min_distance < tolerance:
        return known_embeddings[best_match_index]
        
    return None
