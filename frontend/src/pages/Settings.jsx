import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Settings as SettingsIcon, User, Shield, Camera, CheckCircle, AlertTriangle, X, LogOut } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const Settings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const [showCamera, setShowCamera] = useState(false);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sysSettings, setSysSettings] = useState({ school_start_time: '08:00' });
    const [saving, setSaving] = useState(false);

    const fetchSettings = useCallback(async () => {
        try {
            const response = await api.get("/settings/");
            if (response.data) {
                setSysSettings(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleUpdateSettings = async () => {
        setSaving(true);
        try {
            await api.post("/settings/update", sysSettings);
            setStatus({ type: 'success', message: 'Settings updated successfully!' });
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to update settings' });
        } finally {
            setSaving(false);
        }
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleRegisterFace = async () => {
        if (!webcamRef.current) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        setLoading(true);
        setStatus(null);

        try {
            const blob = dataURLtoBlob(imageSrc);
            const formData = new FormData();
            formData.append("image", blob, "face.jpg");

            const response = await api.post("/faces/register-user-face", formData);

            setStatus({ type: 'success', message: 'Face ID registered successfully!' });
            setTimeout(() => {
                setShowCamera(false);
                setStatus(null);
            }, 2000);

        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || "Registration failed";
            setStatus({ type: 'error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 pt-8 pb-24 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gray-700/50 flex items-center justify-center text-white">
                    <SettingsIcon size={20} />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-tight">Settings</h1>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Manage your account</p>
                </div>
            </div>

            <div className="space-y-6">

                {/* Profile Section */}
                <section>
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Profile</h2>
                    <Card className="p-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary border-2 border-primary/50">
                            <User size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">{user?.username || 'Admin User'}</h3>
                            <p className="text-gray-500 text-sm">{user?.role || 'Administrator'}</p>
                        </div>
                    </Card>
                </section>

                {/* Security Section */}
                <section>
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Security & Biometrics</h2>
                    <Card className="p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex gap-3">
                                <div className="mt-1">
                                    <Shield size={24} className="text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Face ID Access</h3>
                                    <p className="text-gray-400 text-sm max-w-sm mt-1">
                                        Register your face to enable passwordless login. This adds an extra layer of security to your account.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => setShowCamera(true)}
                            className="w-full bg-card-bg border border-white/10 hover:bg-white/5 active:scale-[0.99]"
                        >
                            <Camera className="mr-2" size={18} />
                            Register New Face
                        </Button>
                    </Card>
                </section>

                {/* System Configuration */}
                <section>
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">System Configuration</h2>
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex gap-3">
                                <div className="mt-1">
                                    <Shield size={24} className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Attendance Threshold</h3>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Set the standard arrival time. Scans after this time will be marked as "Late".
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <input
                                type="time"
                                value={sysSettings.school_start_time}
                                onChange={(e) => setSysSettings({ ...sysSettings, school_start_time: e.target.value })}
                                className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary/50"
                            />
                            <Button
                                onClick={handleUpdateSettings}
                                disabled={saving}
                                className="px-8"
                            >
                                {saving ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </Card>
                </section>


                {/* Logout Button */}
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full h-14 border border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400 font-bold rounded-2xl"
                >
                    <LogOut className="mr-2" size={18} />
                    Sign Out
                </Button>
            </div>

            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-card-bg border border-white/10 rounded-3xl p-6 relative">
                        <button
                            onClick={() => setShowCamera(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-xl font-bold mb-4 text-center">Register Face ID</h2>

                        <div className="rounded-2xl overflow-hidden border-2 border-white/10 mb-4 bg-black aspect-video relative">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode: "user" }}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {status && (
                            <div className={`p-3 rounded-xl mb-4 text-center text-sm font-bold flex items-center justify-center gap-2 ${status.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                }`}>
                                {status.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                {status.message}
                            </div>
                        )}

                        <Button
                            onClick={handleRegisterFace}
                            disabled={loading}
                            className="w-full h-14 font-bold text-lg"
                        >
                            {loading ? 'Processing...' : 'Capture & Register'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Settings;
