import { BottomNav } from './BottomNav';
import { Header } from './Header';

export const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-dark-bg text-white pb-24 font-sans antialiased selection:bg-primary/30">
            <div className="max-w-md mx-auto min-h-screen relative shadow-2xl shadow-black bg-dark-bg">
                <Header />
                <main className="relative">
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    );
};
