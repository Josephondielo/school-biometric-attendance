from flask import Flask, request, jsonify
import face_recognition
import numpy as np

app = Flask(__name__)

# -----------------------------
# Simple security for ngrok use
# -----------------------------
API_KEY = "supersecret-key"  # must match backend header

def authorize(req):
    return req.headers.get("X-API-KEY") == API_KEY


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200


@app.route("/encode", methods=["POST"])
def encode_face():
    """
    Detects a face and returns its 128-d encoding.
    Supports is_enrollment=true for jittered augmentation.
    """
    if not authorize(request):
        return jsonify({"error": "Unauthorized"}), 401

    image_file = request.files.get("image")
    is_enrollment = request.form.get("is_enrollment", "false").lower() == "true"

    if not image_file:
        return jsonify({"error": "No image provided"}), 400

    try:
        # Load image
        image = face_recognition.load_image_file(image_file)

        # Quality Validation: resolution
        height, width = image.shape[:2]
        if height < 200 or width < 200:
            return jsonify({
                "error": "Image resolution too low. Minimum 200x200 required."
            }), 400

        # Face detection
        face_locations = face_recognition.face_locations(
            image,
            number_of_times_to_upsample=2,
            model="hog"
        )

        if not face_locations:
            return jsonify({"error": "No face detected"}), 400

        # Quality Validation: face size ratio
        top, right, bottom, left = face_locations[0]
        face_height = bottom - top
        min_dim = min(height, width)

        if face_height < (min_dim * 0.2):
            return jsonify({
                "error": "Face too small or too far away. Please move closer."
            }), 400

        # Jittering for enrollment
        jitters = 100 if is_enrollment else 1
        encodings = face_recognition.face_encodings(
            image,
            known_face_locations=face_locations,
            num_jitters=jitters,
            model="large"
        )

        if not encodings:
            return jsonify({"error": "Failed to extract encoding"}), 400

        return jsonify({
            "encoding": encodings[0].tolist()
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/compare", methods=["POST"])
def compare_faces():
    """
    Compares an unknown encoding against a list of known encodings.
    """
    if not authorize(request):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    if not data or "unknown" not in data or "knowns" not in data:
        return jsonify({"error": "Missing data"}), 400

    try:
        unknown = np.array(data["unknown"])
        knowns = [np.array(k) for k in data["knowns"]]
        tolerance = float(data.get("tolerance", 0.45))

        if not knowns:
            return jsonify({"match_index": -1}), 200

        distances = face_recognition.face_distance(knowns, unknown)
        best_match_index = int(np.argmin(distances))

        if distances[best_match_index] < tolerance:
            return jsonify({
                "match_index": best_match_index,
                "distance": float(distances[best_match_index])
            }), 200

        return jsonify({"match_index": -1}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# Run locally (FREE + ngrok)
# -----------------------------
if __name__ == "__main__":
    print("🚀 Biometric Service running on port 5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
