import { useQuery } from '@tanstack/react-query';
import { getSchemes } from './api/schemes';
import { SchemeCard } from './components/SchemeCard';
import { useAuthStore } from '../../store/authStore';
import { Search, SlidersHorizontal, Loader2, ShieldCheck, LogOut, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export const SchemesPage = () => {
  const [search, setSearch] = useState('');
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['schemes', { search }],
    queryFn: () => getSchemes({ search, limit: 20 }),
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F1115] transition-colors duration-300">
      {/* Admin Panel Header */}
      {user?.role === 'ADMIN' && (
        <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white px-4 py-3 text-center text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md relative z-50">
          <ShieldCheck className="w-5 h-5 animate-pulse" />
          <span>🔧 YojanaTrack Admin Mode Active — Full access to Schemes management enabled.</span>
          <button 
            onClick={() => logout()}
            className="ml-4 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      )}
      
      {user?.role === 'USER' && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 text-center text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md relative z-50">
          <span>👋 Welcome to YojanaTrack! Discover and track your welfare schemes.</span>
          <button 
            onClick={() => logout()}
            className="ml-4 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      )}
      {/* Hero Header */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent" />
          {/* Decorative blur blobs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-70 animate-blob" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
            Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Benefits</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6">
            Explore hundreds of government schemes tailored for you. Filter, find, and apply easily.
          </p>
          
          <div className="flex justify-center mb-10">
            <Link
              to="/find-scheme"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.03] active:scale-[0.98] group"
            >
              <Sparkles className="w-5 h-5 group-hover:animate-bounce" />
              <span>Launch YojanaMatch Quiz</span>
            </Link>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center w-full h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden transition-all">
              <div className="grid place-items-center h-full w-16 text-gray-400">
                <Search className="w-6 h-6" />
              </div>
              <input
                className="peer h-full w-full outline-none text-gray-700 dark:text-gray-200 bg-transparent pr-2 text-lg"
                type="text"
                id="search"
                placeholder="Search schemes by name, category, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="h-full px-6 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium border-l border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors">
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:block">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {search ? 'Search Results' : 'All Schemes'}
          </h2>
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            {data?.pagination.total || 0} schemes found
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-blue-600 dark:text-blue-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading government schemes...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl">
            Failed to load schemes. Please try again later.
          </div>
        ) : data?.schemes.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No schemes found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {data?.schemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
