import { useState, useEffect } from 'react';
import { Notification, NotificationService } from '../utils/notificationService';
import { Candidature } from '../lib/api';
import { Bell, X, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationCenter({ candidatures }: { candidatures: Candidature[] }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Générer les notifications au chargement
    const newNotifications = NotificationService.generateNotifications(candidatures);
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter((n) => !n.read).length);

    // Demander la permission pour les notifications du navigateur
    NotificationService.requestNotificationPermission();

    // Vérifier les notifications toutes les heures
    const interval = setInterval(() => {
      const updated = NotificationService.generateNotifications(candidatures);
      setNotifications(updated);
      setUnreadCount(updated.filter((n) => !n.read).length);
    }, 3600000); // 1 heure

    return () => clearInterval(interval);
  }, [candidatures]);

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const handleDismiss = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const urgentNotifications = notifications.filter((n) => n.type === 'urgence');
  const normalNotifications = notifications.filter((n) => n.type !== 'urgence');

  return (
    <div className="relative">
      {/* Bouton notification dans Navbar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-indigo-700 rounded transition"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel notifications */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Bell size={20} />
              Notifications ({notifications.length})
            </h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell size={40} className="mx-auto mb-2 opacity-50" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Notifications urgentes */}
              {urgentNotifications.length > 0 && (
                <>
                  <div className="p-2 bg-red-50 border-b border-red-100">
                    <p className="text-xs font-bold text-red-700">🚨 URGENT</p>
                  </div>
                  {urgentNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onDismiss={handleDismiss}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </>
              )}

              {/* Notifications normales */}
              {normalNotifications.length > 0 && (
                <>
                  {urgentNotifications.length > 0 && (
                    <div className="p-2 bg-blue-50 border-b border-blue-100">
                      <p className="text-xs font-bold text-blue-700">À VENIR</p>
                    </div>
                  )}
                  {normalNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onDismiss={handleDismiss}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onDismiss,
  onClick,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
  onClick: () => void;
}) {
  const getIcon = () => {
    if (notification.type === 'urgence') {
      return <AlertCircle size={20} className="text-red-500" />;
    } else if (notification.type === 'entretien') {
      return <Clock size={20} className="text-orange-500" />;
    } else {
      return <CheckCircle size={20} className="text-blue-500" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 hover:bg-gray-50 cursor-pointer transition flex gap-3 ${
        !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">
          {notification.title}
        </p>
        <p className="text-xs text-gray-600 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {format(notification.date, 'd MMM HH:mm', { locale: fr })}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notification.id);
        }}
        className="text-gray-400 hover:text-gray-600 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
}
