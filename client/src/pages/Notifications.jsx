import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, FileText, CreditCard, AlertCircle, TrendingUp, StickyNote, Info } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead } from '../services/api';
import toast from 'react-hot-toast';

const typeIcons = {
  invoice: CreditCard, file: FileText, issue: AlertCircle,
  progress: TrendingUp, note: StickyNote, general: Info, task: CheckCheck,
};

const typeColors = {
  invoice: 'text-warning bg-warning/10', file: 'text-accent bg-accent/10',
  issue: 'text-danger bg-danger/10', progress: 'text-primary-light bg-primary/10',
  note: 'text-success bg-success/10', general: 'text-text-muted bg-surface-2',
  task: 'text-success bg-success/10',
};

const Notifications = () => {
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data: d } = await getNotifications();
      setData(d);
    } finally { setLoading(false); }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setData(prev => ({
        ...prev,
        unreadCount: prev.unreadCount - 1,
        notifications: prev.notifications.map(n => n._id === id ? { ...n, read: true } : n),
      }));
    } catch { toast.error('Failed to mark as read'); }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setData(prev => ({
        ...prev,
        unreadCount: 0,
        notifications: prev.notifications.map(n => ({ ...n, read: true })),
      }));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to mark all as read'); }
  };

  // Group by date
  const grouped = data.notifications.reduce((acc, n) => {
    const d = new Date(n.createdAt);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    let key = d.toDateString() === today.toDateString() ? 'Today'
      : d.toDateString() === yesterday.toDateString() ? 'Yesterday'
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
          <p className="text-text-secondary text-sm mt-1">{data.unreadCount} unread notifications</p>
        </div>
        {data.unreadCount > 0 && (
          <button onClick={handleMarkAll} className="btn-secondary text-sm">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {data.notifications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell size={40} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No notifications yet</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, notifs]) => (
          <div key={date}>
            <p className="label mb-3">{date}</p>
            <div className="space-y-2">
              {notifs.map((n, i) => {
                const Icon = typeIcons[n.type] || Info;
                const colorCls = typeColors[n.type] || typeColors.general;
                return (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`glass-card p-4 flex gap-4 transition-all ${!n.read ? 'border-primary/20 bg-primary/5' : ''}`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 self-start ${colorCls}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm text-text-primary">{n.title}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-0.5" />}
                          <span className="text-xs text-text-muted whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary mt-0.5 leading-relaxed">{n.message}</p>
                      {!n.read && (
                        <button onClick={() => handleMarkAsRead(n._id)} className="btn-ghost text-xs mt-2 py-0.5">
                          Mark as read
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
