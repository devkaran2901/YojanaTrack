import { Link } from 'react-router-dom';
import type { Scheme } from '../api/schemes';
import { Briefcase, Landmark, ShieldPlus, ChevronRight } from 'lucide-react';

interface SchemeCardProps {
  scheme: Scheme;
}

export const SchemeCard = ({ scheme }: SchemeCardProps) => {
  const getCategoryIcon = () => {
    switch (scheme.category) {
      case 'Finance': return <Landmark className="w-5 h-5" />;
      case 'Health': return <ShieldPlus className="w-5 h-5" />;
      default: return <Briefcase className="w-5 h-5" />;
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 transform hover:-translate-y-1">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
            {getCategoryIcon()}
            {scheme.category}
          </span>
          {scheme.state && (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              📍 {scheme.state}
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {scheme.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
          {scheme.description}
        </p>

        {scheme.matchScore !== undefined && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">ELIGIBILITY SCORE</span>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                scheme.matchScore === 1 
                  ? 'bg-green-150 text-green-800 dark:bg-green-950/40 dark:text-green-300 border border-green-200/30' 
                  : scheme.matchScore >= 0.5 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/30' 
                    : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200/30'
              }`}>
                {Math.round(scheme.matchScore * 100)}% Match
              </span>
            </div>
            <div className="w-full bg-gray-150 dark:bg-gray-700/60 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  scheme.matchScore === 1 ? 'bg-green-500' : scheme.matchScore >= 0.5 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${scheme.matchScore * 100}%` }}
              />
            </div>
            {/* Show failed criteria list if not full match */}
            {scheme.matchScore < 1 && scheme.details && (
              <div className="mt-3 space-y-1 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-extrabold text-rose-500 dark:text-rose-400 uppercase tracking-wider block mb-1">Near-Miss Reasons:</span>
                {scheme.details.filter(d => !d.passed).map((d, idx) => (
                  <p key={idx} className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                    • {d.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Ministry</span>
            <span className="text-sm text-gray-800 dark:text-gray-200 truncate max-w-[180px]" title={scheme.ministry}>
              {scheme.ministry}
            </span>
          </div>
          
          <Link 
            to={`/schemes/${scheme.slug}`}
            className="inline-flex items-center justify-center p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/60 transition-colors duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
