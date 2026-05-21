import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getSchemeBySlug } from './api/schemes';
import { getBookmarks, addBookmark, removeBookmark } from './api/bookmarks';
import { getTracks, upsertTrack, deleteTrack } from './api/tracker';
import { 
  ArrowLeft, 
  Loader2, 
  Landmark, 
  CheckCircle2, 
  Building2, 
  Bookmark as BookmarkIcon, 
  Layers, 
  Trash2,
  ExternalLink
} from 'lucide-react';

export const SchemeDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();

  const { data: scheme, isLoading, isError } = useQuery({
    queryKey: ['scheme', slug],
    queryFn: () => getSchemeBySlug(slug!),
    enabled: !!slug,
  });

  // Bookmarks state
  const { data: bookmarks } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarks,
    enabled: !!scheme,
  });

  // Tracker state
  const { data: tracks } = useQuery({
    queryKey: ['tracks'],
    queryFn: getTracks,
    enabled: !!scheme,
  });

  const isBookmarked = bookmarks?.some((b) => b.schemeId === scheme?.id) || false;
  const currentTrack = tracks?.find((t) => t.schemeId === scheme?.id);

  // Mutations
  const addBookmarkMutation = useMutation({
    mutationFn: addBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: removeBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const trackMutation = useMutation({
    mutationFn: upsertTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
  });

  const deleteTrackMutation = useMutation({
    mutationFn: deleteTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
  });

  const handleBookmarkToggle = () => {
    if (!scheme) return;
    if (isBookmarked) {
      removeBookmarkMutation.mutate(scheme.id);
    } else {
      addBookmarkMutation.mutate(scheme.id);
    }
  };

  const handleStartTracking = () => {
    if (!scheme) return;
    trackMutation.mutate({
      schemeId: scheme.id,
      status: 'INTERESTED',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0F1115]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !scheme) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] dark:bg-[#0F1115]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Scheme not found</h2>
        <Link to="/schemes" className="text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Schemes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F1115] pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/schemes" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Schemes
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <Landmark className="w-4 h-4" /> {scheme.category}
            </span>
            {scheme.state && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                📍 {scheme.state}
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            {scheme.title}
          </h1>
          
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Building2 className="w-5 h-5 text-gray-400" />
            <span className="font-medium">{scheme.ministry}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About the Scheme</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {scheme.description}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Benefits</h2>
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50">
                <p className="text-lg font-medium text-blue-900 dark:text-blue-200">
                  {scheme.benefits}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Documents Required</h2>
              <ul className="grid gap-3">
                {scheme.documentsRequired.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                    <span className="font-medium">{doc}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-28">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Eligibility Criteria</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Age</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {scheme.minAge ? `${scheme.minAge}+` : 'All'} {scheme.maxAge ? `to ${scheme.maxAge}` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Gender</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{scheme.gender.toLowerCase()}</span>
                </div>
                {scheme.maxIncome && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Income Limit</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{scheme.maxIncome.toLocaleString()}</span>
                  </div>
                )}
                {scheme.occupation && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Occupation</span>
                    <span className="font-medium text-gray-900 dark:text-white">{scheme.occupation}</span>
                  </div>
                )}
              </div>

              {/* Bookmark Toggle Action */}
              <button
                onClick={handleBookmarkToggle}
                className={`mt-8 w-full py-3 px-4 font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  isBookmarked
                    ? 'border-blue-200 bg-blue-50/50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <BookmarkIcon className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark Scheme'}</span>
              </button>

              {/* Application Tracking Control */}
              {currentTrack ? (
                <div className="mt-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-400">Track Status</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/25 px-2 py-0.5 rounded">
                      {currentTrack.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/tracker"
                      className="flex-1 text-center py-2 px-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Layers className="w-3.5 h-3.5" /> View Tracker
                    </Link>
                    <button
                      onClick={() => deleteTrackMutation.mutate(scheme.id)}
                      className="p-2 border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                      title="Stop Tracking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleStartTracking}
                  className="mt-3 w-full py-3 px-4 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Layers className="w-5 h-5" />
                  <span>Start Application Track</span>
                </button>
              )}

              <a 
                href={scheme.applicationUrl} 
                target="_blank" 
                rel="noreferrer"
                className="mt-3 w-full text-center px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <span>Apply Now</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
