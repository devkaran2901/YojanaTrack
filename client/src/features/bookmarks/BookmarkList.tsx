import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookmarks, removeBookmark } from '../schemes/api/bookmarks';
import { SchemeCard } from '../schemes/components/SchemeCard';
import { Bookmark, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BookmarkList = () => {
  const queryClient = useQueryClient();

  const { data: bookmarks, isLoading, isError } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarks,
  });

  const mutation = useMutation({
    mutationFn: removeBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F1115] transition-colors duration-300 pt-32 pb-24">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full filter blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-10 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/5">
            <Bookmark className="w-7 h-7 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              My Bookmarks
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Quick access to welfare schemes you have saved for later.
            </p>
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-blue-600 dark:text-blue-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading saved bookmarks...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-3xl">
            Failed to load bookmarks. Please try again.
          </div>
        ) : bookmarks?.length === 0 ? (
          /* Empty State */
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full grid place-items-center mx-auto mb-6 text-gray-400">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No saved bookmarks yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 text-md leading-relaxed">
              When browsing, click the bookmark icon on any card to save schemes to this list for quick reference.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/schemes"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/10"
              >
                <span>Browse Schemes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Bookmarks Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-fadeIn">
            {bookmarks?.map((bookmark) => (
              <div key={bookmark.id} className="relative group">
                <SchemeCard scheme={bookmark.scheme} />
                <button
                  onClick={() => mutation.mutate(bookmark.schemeId)}
                  className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 text-blue-600 dark:text-blue-400 border border-blue-50 dark:border-blue-900/50 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 hover:border-red-100 dark:hover:border-red-900/30 transition-all shadow-md backdrop-blur-md"
                  title="Remove bookmark"
                >
                  <Bookmark className="w-4 h-4 fill-current stroke-[2.5px]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
