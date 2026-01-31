import face_recognition

def get_face_encoding(image_file):
    try:
        image = face_recognition.load_image_file(image_file)
        encodings = face_recognition.face_encodings(image)
        return encodings[0] if encodings else None
    except Exception as e:
        print(f"Error processing face: {e}")
        return None
