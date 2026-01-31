import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, ScanFace, BarChart3, Settings } from 'lucide-react';
import { clsx } from 'clsx';

const NavItem = ({ to, icon: Icon, label, active }) => (
    <Link to={to} className="flex flex-col items-center gap-1 flex-1 group">
        <div className={clsx(
            "p-2 rounded-xl transition-all duration-300",
            active ? "text-primary bg-primary/10" : "text-gray-500 group-hover:text-gray-300"
        )}>
            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        </div>
        <span className={clsx(
            "text-[10px] font-medium transition-colors",
            active ? "text-primary" : "text-gray-600"
        )}>
            {label}
        </span>
    </Link>
);

export const BottomNav = () => {
    const location = useLocation();

    const navs = [
        { to: '/', icon: LayoutGrid, label: 'HOME' },
        { to: '/directory', icon: Users, label: 'USERS' },
        { to: '/scanner', icon: ScanFace, label: 'SCANNER' }, // Central action
        { to: '/reports', icon: BarChart3, label: 'REPORTS' },
        { to: '/settings', icon: Settings, label: 'SETTINGS' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-bg/80 backdrop-blur-md border-t border-white/5 pb-6 pt-2 px-6">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {navs.map((nav) => (
                    <NavItem
                        key={nav.to}
                        {...nav}
                        active={location.pathname === nav.to}
                    />
                ))}
            </div>
        </div>
    );
};
