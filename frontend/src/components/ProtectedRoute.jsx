import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user } = useAuth();
    if (!user) {
        // For simplified scaffolding, just render Outlet or mock login. 
        // In real app: return <Navigate to="/login" replace />;
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};
export default ProtectedRoute;
