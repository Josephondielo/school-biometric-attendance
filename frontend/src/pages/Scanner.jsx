import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { Bell, UserCheck } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import config from "../config";

const Scanner = () => {
    const webcamRef = useRef(null);
    const navigate = useNavigate();
    const lastScannedRef = useRef({ id: null, time: 0 });

    const [status, setStatus] = useState("scanning"); // scanning | success | error | already
    const [message, setMessage] = useState("Scanning...");
    const [recentScans, setRecentScans] = useState([]);

    // Convert webcam screenshot → Blob
    const dataURLtoBlob = (dataurl) => {
        const arr = dataurl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new Blob([u8arr], { type: mime });
    };

    const captureAndVerify = useCallback(async () => {
        if (!webcamRef.current) return false;

        const token = localStorage.getItem("token");
        if (!token) {
            setStatus("error");
            setMessage("Not logged in");
            return false;
        }

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return false;

        try {
            const blob = dataURLtoBlob(imageSrc);
            const formData = new FormData();
            formData.append("image", blob, "scan.jpg");

            const response = await fetch(
                `${config.API_BASE_URL}/attendance/verify`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                // If it's a 401 (not recognized), just keep silent/scanning usually,
                // or optionally throw to show "Not Recognized".
                // For a smooth experience, we often ignore unknowns or show a brief "Try Again".
                // But current logic throws. Let's keep it.
                throw new Error(result.error || "Face not recognized");
            }

            // DUPLICATE CHECK
            const now = Date.now();
            if (
                result.student.id === lastScannedRef.current.id &&
                (now - lastScannedRef.current.time) < 15000 // 15s cooldown
            ) {
                setStatus("already");
                setMessage(`Already Verified: ${result.student.name.split(" ")[0]}`);
                return true; // Stop loop briefly to show message
            }

            // NEW SUCCESSFUL SCAN
            lastScannedRef.current = { id: result.student.id, time: now };
            setStatus("success");
            setMessage(`Welcome, ${result.student.name.split(" ")[0]}!`);

            setRecentScans((prev) => [
                {
                    id: result.attendance.id,
                    name: result.student.name,
                    time: new Date(result.attendance.timestamp)
                        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
                ...prev.slice(0, 4),
            ]);

            return true;
        } catch (err) {
            console.error(err);
            // Optionally: Don't show error on every frame if face not found?
            // But if face IS found but not recognized, we might want to say "Unknown".
            // Let's rely on the previous behavior: setStatus("error")
            // But maybe we return 'false' so it keeps trying?
            // If we return 'true', it pauses.
            // Let's return false for errors so it retries immediately.
            setStatus("error");
            setMessage("Face not recognized");
            return false; // Continuous scanning
        }
    }, []);

    // Auto scan loop
    useEffect(() => {
        let interval;

        const startScanning = () => {
            interval = setInterval(async () => {
                const success = await captureAndVerify();

                if (success) {
                    clearInterval(interval);
                    // Pause for 2 seconds to show Success/Already message, then resume
                    setTimeout(() => {
                        setStatus("scanning");
                        setMessage("Scanning...");
                        startScanning();
                    }, 2000);
                }
            }, 1000); // Scan every 1s (faster than 2.5s)
        };

        startScanning();
        return () => clearInterval(interval);
    }, [captureAndVerify]);

    return (
        <div className="p-6 pt-8 h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" onClick={() => navigate("/")}>
                    ←
                </Button>
                <h1 className="font-bold uppercase text-sm">Attendance</h1>
                <Button variant="ghost">
                    <Bell size={20} />
                </Button>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                    Face Recognition
                </h2>
                <p className="text-gray-400 text-sm">
                    Position your face inside the frame
                </p>
            </div>

            {/* Scanner */}
            <div className="flex-1 flex items-center justify-center mb-10 relative">
                <div className="relative w-72 h-72">
                    <div className="w-full h-full rounded-3xl overflow-hidden border-4 border-white/10 bg-black">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "user" }}
                            className="w-full h-full object-cover"
                            onUserMediaError={(err) => {
                                console.error("Webcam Error:", err);
                                setStatus("error");
                                setMessage(`Camera Error: ${err.name || "Access Denied"}`);
                            }}
                        />
                    </div>

                    {/* Status */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                        <div
                            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2
                            ${status === "success"
                                    ? "bg-green-500"
                                    : status === "already"
                                        ? "bg-orange-500"
                                        : status === "error"
                                            ? "bg-red-500"
                                            : "bg-primary animate-pulse"
                                }`}
                        >
                            {status === "success" && <UserCheck size={14} />}
                            {message}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">
                    Recent Activity
                </h3>

                {recentScans.length === 0 ? (
                    <p className="text-center text-gray-600 text-xs">
                        Waiting for scans...
                    </p>
                ) : (
                    recentScans.map((scan) => (
                        <Card
                            key={scan.id}
                            className="flex justify-between items-center p-3 mb-2"
                        >
                            <div>
                                <p className="text-sm font-bold">{scan.name}</p>
                                <p className="text-xs text-gray-400">{scan.time}</p>
                            </div>
                            <span className="text-green-500 text-xs font-bold">
                                VERIFIED
                            </span>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Scanner;
