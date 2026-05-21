import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  Sparkles, 
  Bookmark, 
  Layers, 
  Grid, 
  LogOut, 
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { path: '/schemes', label: 'Browse Schemes', icon: Grid },
    { path: '/find-scheme', label: 'YojanaMatch', icon: Sparkles },
    { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { path: '/tracker', label: 'Application Tracker', icon: Layers },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ path: '/admin', label: 'Admin Panel', icon: ShieldCheck });
  }


  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-[#0F1115]/75 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/schemes" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 active:scale-95 transition-all">
              YT
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Yojana<span className="text-blue-600 dark:text-blue-400">Track</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile / Action */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50">
              {user?.role === 'ADMIN' ? (
                <ShieldCheck className="w-4 h-4 text-red-500" />
              ) : (
                <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                {user?.role === 'ADMIN' ? 'Admin Portal' : 'Citizen'}
              </span>
            </div>

            <button
              onClick={() => logout()}
              className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-red-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-100 dark:hover:border-red-900/20 transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
