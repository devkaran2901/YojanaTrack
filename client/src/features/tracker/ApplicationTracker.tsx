import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTracks, upsertTrack, deleteTrack } from '../schemes/api/tracker';
import type { ApplicationStatus, ApplicationTrack } from '../schemes/api/tracker';
import { 
  Layers, 
  HelpCircle, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  X,
  FileText,
  CheckCircle,
  XCircle,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';

const COLUMNS: { id: ApplicationStatus; label: string; bg: string; text: string; icon: any }[] = [
  { id: 'INTERESTED', label: 'Interested', bg: 'bg-blue-50/50 dark:bg-blue-950/10', text: 'text-blue-600 dark:text-blue-400', icon: Briefcase },
  { id: 'APPLIED', label: 'Applied / In Progress', bg: 'bg-amber-50/50 dark:bg-amber-950/10', text: 'text-amber-600 dark:text-amber-400', icon: FileText },
  { id: 'APPROVED', label: 'Approved', bg: 'bg-green-50/50 dark:bg-green-950/10', text: 'text-green-600 dark:text-green-400', icon: CheckCircle },
  { id: 'REJECTED', label: 'Rejected / Ineligible', bg: 'bg-red-50/50 dark:bg-red-950/10', text: 'text-red-600 dark:text-red-400', icon: XCircle },
];

export const ApplicationTracker = () => {
  const queryClient = useQueryClient();

  const { data: tracks, isLoading, isError } = useQuery({
    queryKey: ['tracks'],
    queryFn: getTracks,
  });

  const updateStatusMutation = useMutation({
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

  const handleMove = (track: ApplicationTrack, targetStatus: ApplicationStatus) => {
    updateStatusMutation.mutate({
      schemeId: track.schemeId,
      status: targetStatus,
      notes: track.notes || undefined
    });
  };

  const getNextStatus = (current: ApplicationStatus): ApplicationStatus | null => {
    if (current === 'INTERESTED') return 'APPLIED';
    if (current === 'APPLIED') return 'APPROVED';
    return null;
  };

  const getPrevStatus = (current: ApplicationStatus): ApplicationStatus | null => {
    if (current === 'APPROVED') return 'APPLIED';
    if (current === 'APPLIED') return 'INTERESTED';
    return null;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F1115] transition-colors duration-300 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-10 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/5">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Application Tracker
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track your eligibility pipeline. Progress your government benefits from "Interested" to "Approved"!
            </p>
          </div>
        </div>

        {/* Loading / Error / Empty States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-blue-600 dark:text-blue-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading tracker pipeline...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-3xl">
            Failed to load your tracking dashboard. Please refresh.
          </div>
        ) : tracks?.length === 0 ? (
          /* Empty State */
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full grid place-items-center mx-auto mb-6 text-gray-400">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your tracker is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 text-md leading-relaxed">
              Find schemes you match with, open their details, and click "Start Application Track" to trace your benefits here.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/schemes"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-500/10"
              >
                Browse Schemes
              </Link>
            </div>
          </div>
        ) : (
          /* Kanban Board Columns */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start animate-fadeIn">
            {COLUMNS.map((column) => {
              const ColumnIcon = column.icon;
              const columnTracks = tracks?.filter((t) => t.status === column.id) || [];
              
              return (
                <div 
                  key={column.id} 
                  className={`flex flex-col h-full min-h-[500px] rounded-3xl border border-gray-100/50 dark:border-gray-800/80 p-5 ${column.bg}`}
                >
                  {/* Column Title Header */}
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-gray-800/50">
                    <div className="flex items-center gap-2">
                      <ColumnIcon className={`w-5 h-5 ${column.text}`} />
                      <h3 className="font-extrabold text-gray-900 dark:text-white text-md">
                        {column.label}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                      {columnTracks.length}
                    </span>
                  </div>

                  {/* Column Cards Container */}
                  <div className="space-y-4 flex-1">
                    {columnTracks.map((track) => {
                      const next = getNextStatus(track.status);
                      const prev = getPrevStatus(track.status);
                      
                      return (
                        <div 
                          key={track.id} 
                          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                        >
                          <button
                            onClick={() => deleteTrackMutation.mutate(track.schemeId)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            title="Remove tracking"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 px-2 py-0.5 rounded">
                            {track.scheme.category}
                          </span>

                          <h4 className="font-bold text-gray-900 dark:text-white text-sm mt-2 leading-snug mb-3">
                            <Link to={`/schemes/${track.scheme.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              {track.scheme.title}
                            </Link>
                          </h4>

                          {/* Quick Actions Panel */}
                          <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-800/50 pt-3 mt-4">
                            {prev ? (
                              <button
                                onClick={() => handleMove(track, prev)}
                                className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 dark:hover:border-blue-900/30 transition-colors"
                                title="Move back"
                              >
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                            ) : (
                              <div className="w-7 h-7" />
                            )}

                            {/* Option to Reject / Accept directly */}
                            {track.status !== 'APPROVED' && track.status !== 'REJECTED' && (
                              <button
                                onClick={() => handleMove(track, 'REJECTED')}
                                className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors"
                              >
                                Reject
                              </button>
                            )}

                            {next ? (
                              <button
                                onClick={() => handleMove(track, next)}
                                className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 dark:hover:border-blue-900/30 transition-colors"
                                title="Move forward"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <div className="w-7 h-7" />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {columnTracks.length === 0 && (
                      <div className="h-28 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center text-gray-400 text-xs font-semibold">
                        Empty column
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
