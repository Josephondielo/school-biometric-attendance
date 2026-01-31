import { Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Enroll from './pages/Enroll';
import Scanner from './pages/Scanner';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';

const AppRoutes = () => {
    const location = useLocation();
    // Don't show layout on Login
    const showLayout = location.pathname !== '/login';

    const WrappedLayout = ({ children }) => {
        return showLayout ? <Layout>{children}</Layout> : children;
    }

    return (
        <WrappedLayout>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/enroll" element={<Enroll />} />
                    <Route path="/directory" element={<Users />} />
                    <Route path="/scanner" element={<Scanner />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
            </Routes>
        </WrappedLayout>
    );
};

export default AppRoutes;
