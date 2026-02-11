import axios from 'axios';
import config from '../config';

const biometricApi = axios.create({
    baseURL: config.BIOMETRIC_API_URL,
});

biometricApi.interceptors.request.use((reqConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    // Bypass Ngrok warning page for free tier
    reqConfig.headers['ngrok-skip-browser-warning'] = 'true';
    return reqConfig;
});

export default biometricApi;
