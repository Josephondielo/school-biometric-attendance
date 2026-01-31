import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, ChevronLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";

const Enroll = () => {
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    admission_number: "",
    role: "STUDENT",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

  const enrollStudent = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      toast.error("Could not capture image");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Enrolling student...");

    try {
      const blob = dataURLtoBlob(imageSrc);
      const data = new FormData();

      data.append("first_name", formData.first_name);
      data.append("last_name", formData.last_name);
      data.append("admission_number", formData.admission_number);
      data.append("role", formData.role);
      data.append("image", blob, "face.jpg");

      const response = await api.post("/enroll/student", data);

      toast.success("Enrollment successful!", { id: loadingToast });
      setTimeout(() => navigate("/users"), 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Enrollment failed";
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  }, [formData, navigate]);

  return (
    <div className="p-6 pt-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <h1 className="text-lg font-bold">Enroll {formData.role === "STUDENT" ? "Student" : "Staff"}</h1>
      </div>

      {/* Role Selector */}
      <div className="flex gap-2 mb-6 p-1 bg-card-bg/30 border border-white/5 rounded-xl">
        {["STUDENT", "STAFF"].map((r) => (
          <button
            key={r}
            onClick={() => setFormData({ ...formData, role: r })}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.role === r
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "text-gray-500 hover:text-white"
              }`}
          >
            {r.charAt(0) + r.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="space-y-3 mb-6">
        <input
          name="first_name"
          placeholder="First Name"
          onChange={handleChange}
          className="w-full bg-card-bg/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:bg-card-bg transition-colors"
        />
        <input
          name="last_name"
          placeholder="Last Name"
          onChange={handleChange}
          className="w-full bg-card-bg/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:bg-card-bg transition-colors"
        />
        <input
          name="admission_number"
          placeholder={formData.role === "STUDENT" ? "Admission Number" : "Staff ID"}
          onChange={handleChange}
          className="w-full bg-card-bg/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:bg-card-bg transition-colors"
        />
      </div>

      {/* Camera */}
      <div className="rounded-xl overflow-hidden mb-4 bg-black/20 aspect-video flex items-center justify-center relative">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user" }}
          onUserMediaError={(err) => {
            console.error("Camera Error:", err);
            toast.error(`Camera Error: ${err.message || "Could not access camera"}`);
          }}
          className="w-full h-full object-cover"
        />
        {!webcamRef.current && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">
            Waiting for camera...
          </div>
        )}
      </div>

      {/* Action */}
      <Button
        onClick={enrollStudent}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Processing..." : <><Camera className="mr-2" /> Enroll {formData.role === "STUDENT" ? "Student" : "Staff"}</>}
      </Button>


    </div>
  );
};

export default Enroll;
