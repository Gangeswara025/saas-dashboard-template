import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getNotifications, markAllAsRead } from '../../services/api';

const Navbar = ({ onMenuClick, sidebarCollapsed }) => {
  const { user, isAdmin } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data.notifications?.slice(0, 8) || []);
      setUnread(data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAll = async () => {
    await markAllAsRead();
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const typeColors = {
    invoice: 'text-warning', file: 'text-accent', issue: 'text-danger',
    progress: 'text-primary-light', note: 'text-success', general: 'text-text-secondary',
  };

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-surface-2 rounded-lg text-text-secondary transition-colors"
        >
          <Menu size={18} />
        </button>
        <div className="hidden sm:flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-3 py-1.5 w-56 xl:w-72">
          <Search size={15} className="text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search tasks, files, issues..."
            className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none w-full"
            onFocus={() => navigate('/search')}
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="sm:hidden p-2 hover:bg-surface-2 rounded-lg text-text-secondary"
          onClick={() => navigate('/search')}
        >
          <Search size={18} />
        </button>

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 hover:bg-surface-2 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-glass overflow-hidden z-50"
              >
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold text-sm text-text-primary">Notifications</h3>
                  {unread > 0 && (
                    <button onClick={handleMarkAll} className="text-xs text-primary-light hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-text-muted text-sm py-8">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`px-4 py-3 border-b border-border/50 hover:bg-surface-2 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                          <div>
                            <p className="text-sm font-medium text-text-primary">{n.title}</p>
                            <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{n.message}</p>
                            <p className="text-xs text-text-muted mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-border">
                  <button
                    onClick={() => { setNotifOpen(false); navigate('/notifications'); }}
                    className="w-full text-center text-xs text-primary-light hover:underline"
                  >
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          {user?.avatar ? (
            <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}`} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-primary/30" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-light font-semibold text-xs">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden md:block">
            <p className="text-sm font-medium text-text-primary leading-none">{user?.name}</p>
            <p className="text-xs text-text-muted capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
