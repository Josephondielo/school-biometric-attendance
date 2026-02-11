const normalizeUrl = (url) => {
    if (!url) return "http://127.0.0.1:8000";
    if (!url.startsWith("http")) {
        url = `https://${url}`;
    }
    return url.replace(/\/$/, "");
};

const config = {
    API_BASE_URL: normalizeUrl(import.meta.env.VITE_API_BASE_URL),
    BIOMETRIC_API_URL: normalizeUrl(import.meta.env.VITE_BIOMETRIC_API_URL || import.meta.env.VITE_API_BASE_URL),
};

export default config;
