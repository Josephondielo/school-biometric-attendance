import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes";
import { AuthProvider } from "./context/AuthContext";
import api from "./api/client";
import "./index.css";

function App() {
  useEffect(() => {
    // Basic connectivity check (optional for production)
    api.get("/").catch(() => { });
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
