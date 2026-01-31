import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-gray-800 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex gap-6">
                    <Link to="/" className="hover:text-gray-300 font-medium">Dashboard</Link>
                    <Link to="/classes" className="hover:text-gray-300 font-medium">Classes</Link>
                    <Link to="/enroll" className="hover:text-gray-300 font-medium">Enroll</Link>
                    <Link to="/verify" className="hover:text-gray-300 font-medium">Verify</Link>
                    <Link to="/reports" className="hover:text-gray-300 font-medium">Reports</Link>
                </div>
                {user && (
                    <button
                        onClick={logout}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition-colors"
                    >
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
};
export default Navbar;
