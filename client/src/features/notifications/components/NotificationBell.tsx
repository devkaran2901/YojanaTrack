import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../api/notifications';

export const NotificationBell = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 15000, // Poll every 15s to get new alerts
  });

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', { limit: 5 }],
    queryFn: () => getNotifications({ limit: 5 }),
    enabled: isOpen, // Only query list when dropdown is opened
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markReadMutation.mutate(id);
    }
    setIsOpen(false);
  };

  const unreadCount = unreadData?.count ?? 0;
  const notifications = notificationsData?.notifications ?? [];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all active:scale-95"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-gray-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-3 z-50 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2 mb-2 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto px-2 space-y-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-blue-600 dark:text-blue-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-xs text-gray-400">Loading alerts...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                No new notifications matching your profile.
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif._id}
                  to={`/schemes/${notif.schemeId.slug}`}
                  onClick={() => handleNotificationClick(notif._id, notif.isRead)}
                  className={`block p-3 rounded-xl transition-all border text-left ${
                    notif.isRead
                      ? 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-600 dark:text-gray-400'
                      : 'bg-blue-50/30 border-blue-50 dark:bg-blue-900/5 dark:border-blue-900/10 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm leading-snug font-medium">
                      {notif.message}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                    {new Date(notif.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
