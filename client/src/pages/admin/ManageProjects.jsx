import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderKanban, Plus, X, Trash2, Edit2 } from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject, getClients } from '../../services/api';
import toast from 'react-hot-toast';

const defaultStages = [
  { name: 'Requirements Gathering', status: 'pending', order: 1 },
  { name: 'UI Design', status: 'pending', order: 2 },
  { name: 'Development', status: 'pending', order: 3 },
  { name: 'Testing', status: 'pending', order: 4 },
  { name: 'Deployment', status: 'pending', order: 5 },
];

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', clientId: '', estimatedDelivery: '',
    totalCost: '', progress: 0, currentStage: '', status: 'active',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.all([getProjects(), getClients()]);
      setProjects(pRes.data);
      setClients(cRes.data);
    } finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', clientId: '', estimatedDelivery: '', totalCost: '', progress: 0, currentStage: '', status: 'active' });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, clientId: p.client?._id || '',
      estimatedDelivery: p.estimatedDelivery ? new Date(p.estimatedDelivery).toISOString().split('T')[0] : '',
      totalCost: p.totalCost || '', progress: p.progress || 0, currentStage: p.currentStage || '', status: p.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateProject(editing._id, form);
        toast.success('Project updated!');
      } else {
        await createProject({ ...form, totalCost: Number(form.totalCost), stages: defaultStages });
        toast.success('Project created!');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      load();
    } catch { toast.error('Failed to delete project'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Manage Projects</h1>
          <p className="text-text-secondary text-sm mt-1">{projects.length} projects</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          <Plus size={16} /> New Project
        </button>
      </div>

      <div className="space-y-3">
        {projects.map((p, i) => (
          <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-text-primary">{p.name}</h3>
                <span className={`badge ${p.status === 'active' ? 'badge-success' : p.status === 'completed' ? 'badge-primary' : 'badge-gray'}`}>{p.status}</span>
              </div>
              <p className="text-sm text-text-muted truncate">{p.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                <span>Client: {p.client?.name || '—'}</span>
                <span>Progress: {p.progress}%</span>
                <span>₹{p.totalCost?.toLocaleString() || '—'}</span>
              </div>
              <div className="progress-bar mt-2 w-48">
                <div className="progress-fill" style={{ width: `${p.progress}%` }} />
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openEdit(p)} className="btn-secondary text-sm py-1.5"><Edit2 size={14} /> Edit</button>
              <button onClick={() => handleDelete(p._id)} className="btn-danger text-sm py-1.5"><Trash2 size={14} /></button>
            </div>
          </motion.div>
        ))}
        {projects.length === 0 && (
          <div className="glass-card p-12 text-center">
            <FolderKanban size={40} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">No projects yet. Create your first project.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-card p-6 w-full max-w-lg my-4">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-text-primary">{editing ? 'Edit Project' : 'Create Project'}</h3>
                <button onClick={() => setShowForm(false)} className="btn-ghost p-1"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label block mb-1.5">Project Name</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input-field" placeholder="E-commerce Website" required />
                </div>
                <div>
                  <label className="label block mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="input-field h-20 resize-none" placeholder="Project description..." />
                </div>
                {!editing && (
                  <div>
                    <label className="label block mb-1.5">Client</label>
                    <select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                      className="select-field" required={!editing}>
                      <option value="">Select client...</option>
                      {clients.map(c => <option key={c._id} value={c._id}>{c.name} — {c.company}</option>)}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label block mb-1.5">Total Cost (₹)</label>
                    <input type="number" value={form.totalCost} onChange={e => setForm(f => ({ ...f, totalCost: e.target.value }))}
                      className="input-field" placeholder="20000" />
                  </div>
                  <div>
                    <label className="label block mb-1.5">Est. Delivery</label>
                    <input type="date" value={form.estimatedDelivery} onChange={e => setForm(f => ({ ...f, estimatedDelivery: e.target.value }))}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="label block mb-1.5">Progress (%)</label>
                    <input type="number" value={form.progress} min="0" max="100" onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="label block mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="select-field">
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="on-hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label block mb-1.5">Current Stage</label>
                  <input type="text" value={form.currentStage} onChange={e => setForm(f => ({ ...f, currentStage: e.target.value }))}
                    className="input-field" placeholder="e.g. Payment Integration" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                    {saving ? 'Saving...' : editing ? 'Update Project' : 'Create Project'}
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

export default ManageProjects;
