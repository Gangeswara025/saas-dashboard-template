import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Plus, X, Filter, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProjects, getIssues, createIssue, updateIssue } from '../services/api';
import toast from 'react-hot-toast';

const priorityConfig = {
  low: { cls: 'badge-gray', dot: 'bg-text-muted' },
  medium: { cls: 'badge-warning', dot: 'bg-warning' },
  high: { cls: 'badge-danger', dot: 'bg-danger' },
};
const statusConfig = {
  open: { cls: 'badge-danger', label: 'Open' },
  'in-progress': { cls: 'badge-warning', label: 'In Progress' },
  resolved: { cls: 'badge-success', label: 'Resolved' },
};

const Issues = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { if (selectedProject) loadIssues(); }, [selectedProject, filterStatus, filterPriority]);

  const loadProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data);
      if (data.length > 0) setSelectedProject(data[0]);
    } finally { setLoading(false); }
  };

  const loadIssues = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      const { data } = await getIssues(selectedProject._id, params);
      setIssues(data);
    } catch { toast.error('Failed to load issues'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createIssue({ ...form, projectId: selectedProject._id });
      toast.success('Issue reported!');
      setShowForm(false);
      setForm({ title: '', description: '', priority: 'medium' });
      loadIssues();
    } catch { toast.error('Failed to report issue'); }
    finally { setSaving(false); }
  };

  const handleStatusUpdate = async (issueId, status) => {
    try {
      await updateIssue(issueId, { status });
      toast.success('Issue status updated');
      loadIssues();
      if (selectedIssue?._id === issueId) setSelectedIssue(prev => ({ ...prev, status }));
    } catch { toast.error('Failed to update issue'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Issues</h1>
          <p className="text-text-secondary text-sm mt-1">Report and track project issues</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {projects.length > 1 && (
            <select className="select-field text-sm w-40" value={selectedProject?._id || ''}
              onChange={(e) => setSelectedProject(projects.find(p => p._id === e.target.value))}>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          )}
          <select className="select-field text-sm w-32" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select className="select-field text-sm w-32" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm shrink-0">
            <Plus size={16} /> Report Issue
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open', count: issues.filter(i => i.status === 'open').length, cls: 'text-danger' },
          { label: 'In Progress', count: issues.filter(i => i.status === 'in-progress').length, cls: 'text-warning' },
          { label: 'Resolved', count: issues.filter(i => i.status === 'resolved').length, cls: 'text-success' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.count}</p>
            <p className="label mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Issues Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {issues.map((issue, i) => (
          <motion.div
            key={issue._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedIssue(issue)}
            className="glass-card-hover p-5 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-semibold text-text-primary text-sm leading-snug">{issue.title}</h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`badge ${priorityConfig[issue.priority]?.cls}`}>{issue.priority}</span>
                <span className={`badge ${statusConfig[issue.status]?.cls}`}>{statusConfig[issue.status]?.label}</span>
              </div>
            </div>
            <p className="text-sm text-text-secondary line-clamp-2 mb-3">{issue.description}</p>
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Reported by {issue.reportedBy?.name}</span>
              <span>{new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
            {isAdmin && issue.status !== 'resolved' && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <select
                  className="select-field text-xs py-1"
                  value={issue.status}
                  onClick={e => e.stopPropagation()}
                  onChange={e => { e.stopPropagation(); handleStatusUpdate(issue._id, e.target.value); }}
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            )}
          </motion.div>
        ))}
        {issues.length === 0 && (
          <div className="lg:col-span-2 glass-card p-12 text-center">
            <AlertCircle size={40} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">No issues {filterStatus || filterPriority ? 'matching filters' : 'reported yet'}</p>
            {!filterStatus && !filterPriority && (
              <button onClick={() => setShowForm(true)} className="btn-primary mt-4 mx-auto">
                <Plus size={16} /> Report First Issue
              </button>
            )}
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedIssue(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-card p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`badge ${priorityConfig[selectedIssue.priority]?.cls}`}>{selectedIssue.priority}</span>
                  <span className={`badge ${statusConfig[selectedIssue.status]?.cls}`}>{statusConfig[selectedIssue.status]?.label}</span>
                </div>
                <button onClick={() => setSelectedIssue(null)} className="btn-ghost p-1"><X size={18} /></button>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">{selectedIssue.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">{selectedIssue.description}</p>
              {selectedIssue.adminNotes && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                  <p className="text-xs label mb-1">Admin Notes</p>
                  <p className="text-sm text-text-secondary">{selectedIssue.adminNotes}</p>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Reported by {selectedIssue.reportedBy?.name}</span>
                <span>{new Date(selectedIssue.createdAt).toLocaleDateString()}</span>
              </div>
              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-border">
                  <label className="label block mb-2">Update Status</label>
                  <div className="flex gap-2">
                    {['open', 'in-progress', 'resolved'].map(s => (
                      <button key={s} onClick={() => { handleStatusUpdate(selectedIssue._id, s); setSelectedIssue(prev => ({ ...prev, status: s })); }}
                        className={`btn-secondary text-xs py-1 px-3 ${selectedIssue.status === s ? 'border-primary/50 text-primary-light' : ''}`}>
                        {statusConfig[s]?.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Issue Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-card p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-text-primary">Report an Issue</h3>
                <button onClick={() => setShowForm(false)} className="btn-ghost p-1"><X size={18} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label block mb-1.5">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="input-field" placeholder="Brief issue description" required />
                </div>
                <div>
                  <label className="label block mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="input-field h-24 resize-none" placeholder="Detailed description of the issue..." required />
                </div>
                <div>
                  <label className="label block mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="select-field">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                    {saving ? 'Reporting...' : 'Report Issue'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Issues;
