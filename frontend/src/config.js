const getApiUrl = () => {
    let url = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

    // Add protocol if missing (common when using Render host property)
    if (!url.startsWith("http")) {
        url = `https://${url}`;
    }

    // Remove trailing slash if present
    return url.replace(/\/$/, "");
};

const config = {
    API_BASE_URL: getApiUrl(),
};

export default config;
