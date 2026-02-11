import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, ArrowRight, Lock, Eye, Mail, MoreVertical, X } from 'lucide-react';
import Webcam from 'react-webcam';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import config from '../config';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    // Webcam
    const webcamRef = useRef(null);
    const [showFaceLogin, setShowFaceLogin] = useState(false);

    // Form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const dataURLtoBlob = (dataurl) => {
        const arr = dataurl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new Blob([u8arr], { type: mime });
    };

    const handleFaceLogin = async () => {
        if (!webcamRef.current) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        setLoading(true);
        setError('');

        try {
            const blob = dataURLtoBlob(imageSrc);
            const formData = new FormData();
            formData.append("image", blob, "login.jpg");

            // We need to import 'api' or fetch relative. 
            // Since AuthContext uses api, let's use fetch correctly or import api. 
            // Let's assume we can fetch directly to localhost:8000 for now or import api if possible.
            // Actually, let's just use fetch to keep it simple and consistent with Enroll.jsx pattern if api import is tricky.
            // But api client handles baseURL. Let's try importing api.
            // Wait, import api from '../api/client'; needs to be at top.
            // I'll add the function logic here assuming api is available or use fetch with hardcoded URL for safety.

            // Use the Biometric API URL for face login
            const response = await fetch(`${config.BIOMETRIC_API_URL}/auth/face-login`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Face login failed");
            }

            // Success - manually set token (hacky but works without updating AuthContext deeply)
            localStorage.setItem("token", data.access_token);
            // Force reload or just navigate? Navigation might not trigger AuthContext update locally unless we force it.
            // Best way: navigate to dashboard, and AuthContext check on mount or refresh.
            // Ideally call a method from AuthContext to set user.
            // Let's reload page to be safe or navigate.
            window.location.href = "/";

        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Using email as username for now, or adapt as needed
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg text-white p-6 relative overflow-hidden flex flex-col">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-20%] w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-20%] w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full"></div>

            {/* Header */}
            <div className="flex justify-between items-center mb-12 relative z-10">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                    <ScanFace size={24} className="text-white" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">PORTAL ACCESS</span>
                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/70">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {/* Title */}
            <div className="mb-10 relative z-10">
                <h1 className="text-4xl font-bold mb-2 leading-tight">
                    Welcome to <br />
                    <span className="text-primary">Attendance</span>
                </h1>
                <p className="text-gray-400">Please authenticate to continue.</p>
            </div>

            {/* Biometric Prompt */}
            <div className="flex-1 flex flex-col items-center justify-center mb-10 relative z-10">
                <div
                    onClick={() => setShowFaceLogin(true)}
                    className="w-full max-w-xs aspect-square rounded-[3rem] bg-card-bg border border-white/5 p-8 relative group cursor-pointer hover:border-primary/50 transition-all"
                >

                    {/* Corners */}
                    <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-primary rounded-ss-xl"></div>
                    <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-primary rounded-se-xl"></div>
                    <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-primary rounded-es-xl"></div>
                    <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-primary rounded-ee-xl"></div>

                    {/* Content */}
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                        <div className="w-20 h-20 rounded-full bg-tile/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ScanFace size={48} className="text-white/20 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <p className="absolute bottom-10 left-0 right-0 text-center text-primary font-bold text-xs tracking-widest uppercase opacity-70 group-hover:opacity-100">Scan Face to Log In</p>
                </div>
            </div>

            {/* Face Login Modal */}
            {showFaceLogin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-card-bg border border-white/10 rounded-3xl p-6 relative">
                        <button
                            onClick={() => setShowFaceLogin(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-xl font-bold mb-4 text-center">Face Login</h2>

                        <div className="rounded-2xl overflow-hidden border-2 border-white/10 mb-4 bg-black aspect-video relative">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode: "user" }}
                                className="w-full h-full object-cover"
                            />
                        </div>



                        <Button
                            onClick={handleFaceLogin}
                            disabled={loading}
                            className="w-full h-14 font-bold text-lg"
                        >
                            {loading ? 'Verifying...' : 'Capture & Login'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Or Divider */}
            <div className="flex items-center gap-4 text-xs font-bold text-gray-600 uppercase tracking-widest mb-8">
                <div className="h-[1px] bg-white/10 flex-1"></div>
                OR USE CREDENTIALS
                <div className="h-[1px] bg-white/10 flex-1"></div>
            </div>

            {/* Traditional Login Form */}
            <form onSubmit={handleLogin} className="space-y-4 mb-8 relative z-10">

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Username / Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="username"
                            className="w-full bg-card-bg/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:bg-card-bg transition-colors"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-card-bg/50 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:bg-card-bg transition-colors"
                        />
                        <Eye className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-white" size={18} />
                    </div>
                </div>
                <div className="text-right">
                    <button type="button" className="text-primary text-xs font-bold hover:underline">Forgot Password?</button>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    variant="primary"
                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 bg-white text-black hover:bg-gray-100 relative z-10"
                >
                    {loading ? 'Logging in...' : 'Enter Dashboard'}
                    {!loading && <ArrowRight className="ml-2" size={20} />}
                </Button>
            </form>

            <p className="text-center mt-6 text-xs text-gray-500">Need assistance? <button className="text-primary font-bold underline">Contact Admin</button></p>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
                <div className="w-8 h-1.5 bg-primary rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
            </div>
        </div>
    );
};
export default Login;
