import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, Mail, Phone, Building, CheckCircle, XCircle } from 'lucide-react';
import { getClients, createClient, updateClient } from '../../services/api';
import toast from 'react-hot-toast';

const ManageClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', company: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await getClients();
      setClients(data);
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createClient(form);
      toast.success('Client created!');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', phone: '', company: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create client');
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (client) => {
    try {
      await updateClient(client._id, { isActive: !client.isActive });
      toast.success(`Client ${client.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch { toast.error('Failed to update client'); }
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
          <h1 className="text-2xl font-bold text-text-primary">Manage Clients</h1>
          <p className="text-text-secondary text-sm mt-1">{clients.length} total clients</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          <Plus size={16} /> Add Client
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client, i) => (
          <motion.div key={client._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-sm">{client.name}</p>
                  <p className="text-xs text-text-muted">{client.company || '—'}</p>
                </div>
              </div>
              <span className={`badge ${client.isActive ? 'badge-success' : 'badge-danger'}`}>
                {client.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-text-secondary">
              <div className="flex items-center gap-2"><Mail size={12} className="text-text-muted shrink-0" />{client.email}</div>
              {client.phone && <div className="flex items-center gap-2"><Phone size={12} className="text-text-muted shrink-0" />{client.phone}</div>}
            </div>
            {client.assignedProjects?.length > 0 && (
              <div>
                <p className="label mb-1.5">{client.assignedProjects.length} Project{client.assignedProjects.length > 1 ? 's' : ''}</p>
                <div className="flex flex-wrap gap-1">
                  {client.assignedProjects.map(p => (
                    <span key={p._id} className="badge badge-primary text-xs">{p.name}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="pt-2 border-t border-border/50">
              <button onClick={() => handleToggleActive(client)}
                className={`btn-ghost text-xs w-full justify-center ${client.isActive ? 'text-danger hover:text-danger' : 'text-success hover:text-success'}`}>
                {client.isActive ? <><XCircle size={14} /> Deactivate</> : <><CheckCircle size={14} /> Activate</>}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-card p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-text-primary">Create Client Account</h3>
                <button onClick={() => setShowForm(false)} className="btn-ghost p-1"><X size={18} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="label block mb-1.5">Full Name</label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="input-field" placeholder="John Doe" required />
                  </div>
                  <div className="col-span-2">
                    <label className="label block mb-1.5">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="input-field" placeholder="client@example.com" required />
                  </div>
                  <div className="col-span-2">
                    <label className="label block mb-1.5">Password</label>
                    <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className="input-field" placeholder="••••••••" required minLength={6} />
                  </div>
                  <div>
                    <label className="label block mb-1.5">Phone</label>
                    <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="input-field" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="label block mb-1.5">Company</label>
                    <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      className="input-field" placeholder="Company name" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                    {saving ? 'Creating...' : 'Create Client'}
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

export default ManageClients;
