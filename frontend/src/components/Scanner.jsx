import { useEffect, useRef, useState } from "react";
import config from "../config";

const BACKEND_URL = config.BIOMETRIC_API_URL;

export default function Scanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 🔐 Get JWT from localStorage
  const token = localStorage.getItem("access_token");

  // 🎥 Start camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        setError("❌ Unable to access camera");
      });

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  // 📸 Capture image + send to backend
  const scanFace = async () => {
    setScanning(true);
    setMessage("");
    setError("");

    try {
      if (!token) {
        throw new Error("You are not logged in");
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
      );

      const formData = new FormData();
      formData.append("image", blob, "scan.jpg");

      const response = await fetch(
        `${BACKEND_URL}/attendance/verify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setMessage(
        `✅ Attendance recorded for ${data.student.name}`
      );
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setScanning(false); // ⛔ STOP spinner
    }
  };

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>Face Attendance Scanner</h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 10,
          border: "2px solid #ccc",
        }}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ marginTop: 20 }}>
        <button
          onClick={scanFace}
          disabled={scanning}
          style={{
            padding: "10px 20px",
            fontSize: 16,
            cursor: scanning ? "not-allowed" : "pointer",
          }}
        >
          {scanning ? "Scanning..." : "Scan Face"}
        </button>
      </div>

      {message && (
        <p style={{ color: "green", marginTop: 15 }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ color: "red", marginTop: 15 }}>
          {error}
        </p>
      )}
    </div>
  );
}
