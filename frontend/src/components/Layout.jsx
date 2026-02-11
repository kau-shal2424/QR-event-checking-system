import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Scan,
    LogOut,
    Menu,
    X,
    Bell,
    User,
    ChevronRight
} from 'lucide-react';

const Layout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/events', label: 'Events', icon: <Calendar size={20} /> },
        { path: '/scan', label: 'Scanner', icon: <Scan size={20} /> },
    ];

    const isActive = (path) => location.pathname.startsWith(path);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-dark-900 text-gray-100 overflow-hidden relative font-sans transition-colors duration-500">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-green/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 z-20 shadow-2xl">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-8 group cursor-pointer hover:scale-105 transition-transform">
                        <div className="w-10 h-10 bg-gradient-to-tr from-neon-green to-neon-cyan rounded-xl flex items-center justify-center text-white shadow-lg shadow-neon-green/20 group-hover:shadow-neon-cyan/40 transition-shadow">
                            <Scan size={24} />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent group-hover:text-white transition-colors">
                            QR Admin
                        </h1>
                    </div>

                    <nav className="space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive(item.path)
                                        ? 'bg-neon-green/10 text-neon-green shadow-[0_0_20px_rgba(0,245,212,0.1)] border border-neon-green/20'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-3 relative z-10">
                                    <span className={`transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                                        {item.icon}
                                    </span>
                                    <span className="font-medium tracking-wide">{item.label}</span>
                                </div>
                                {isActive(item.path) && <ChevronRight size={16} className="text-neon-green animate-pulse" />}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5 mx-4 mb-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-300 group border border-transparent hover:border-red-500/20"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="ml-3 font-medium">Logout</span>
                    </button>
                    <div className="mt-4 text-xs text-gray-700 text-center font-mono">
                        v1.2.0 • Build 2024
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-dark-900/80 backdrop-blur-md border-b border-white/10 z-50 px-4 py-3 flex justify-between items-center transition-colors">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-neon-green to-neon-cyan rounded-lg flex items-center justify-center text-white shadow-lg shadow-neon-green/20">
                        <Scan size={18} />
                    </div>
                    <h1 className="text-lg font-bold text-white">QR Admin</h1>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg bg-white/5 text-white active:bg-white/10 transition-colors"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-dark-900/95 z-40 pt-20 px-6 backdrop-blur-xl animate-fade-in-down">
                    <nav className="space-y-3">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-lg transition-all ${isActive(item.path)
                                        ? 'bg-neon-green/10 text-neon-green border border-neon-green/20 shadow-lg'
                                        : 'bg-white/5 text-gray-300 border border-white/5'
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                        <button
                            onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-red-500/10 text-red-400 mt-8 border border-red-500/20"
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
                {/* Topbar (Desktop) */}
                <header className="hidden md:flex h-20 items-center justify-between px-8 border-b border-white/5 bg-transparent backdrop-blur-sm relative z-20">
                    <h2 className="text-xl font-medium text-gray-400">
                        {menuItems.find(i => isActive(i.path))?.label || 'Overview'}
                    </h2>

                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer">
                            <span className="absolute top-0 right-0 w-2 h-2 bg-neon-error rounded-full animate-pulse"></span>
                            <Bell size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                            <div className="text-right">
                                <p className="text-sm font-bold text-white leading-none">Admin User</p>
                                <p className="text-xs text-neon-green mt-1">Online</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center shadow-inner text-gray-300">
                                <User size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-24 md:pb-8 scrollbar-thin scrollbar-track-dark-900 scrollbar-thumb-dark-700">
                    <div className="max-w-7xl mx-auto animate-fade-in-up">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
