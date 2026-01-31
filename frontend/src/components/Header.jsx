import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-40 w-full bg-dark-bg/60 backdrop-blur-xl border-b border-white/5 px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all active:scale-95"
                    aria-label="Go back"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={() => navigate(1)}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all active:scale-95"
                    aria-label="Go forward"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <div className="flex-1 text-center pr-20">
                <span className="text-sm font-bold tracking-widest text-gray-400 uppercase">
                    School Biometrics
                </span>
            </div>
        </header>
    );
};
