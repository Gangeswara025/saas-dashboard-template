import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Plus, X, Pin, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProjects, getNotes, createNote, deleteNote } from '../services/api';
import toast from 'react-hot-toast';

const Notes = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { if (selectedProject) loadNotes(); }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data);
      if (data.length > 0) setSelectedProject(data[0]);
    } finally { setLoading(false); }
  };

  const loadNotes = async () => {
    try {
      const { data } = await getNotes(selectedProject._id);
      setNotes(data);
    } catch { toast.error('Failed to load updates'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      await createNote({ content, projectId: selectedProject._id, pinned });
      toast.success('Update posted!');
      setShowForm(false);
      setContent('');
      setPinned(false);
      loadNotes();
    } catch { toast.error('Failed to post update'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Delete this update?')) return;
    try {
      await deleteNote(noteId);
      toast.success('Update deleted');
      loadNotes();
    } catch { toast.error('Failed to delete update'); }
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
          <h1 className="text-2xl font-bold text-text-primary">Project Updates</h1>
          <p className="text-text-secondary text-sm mt-1">Notes and updates from the team</p>
        </div>
        <div className="flex items-center gap-2">
          {projects.length > 1 && (
            <select className="select-field text-sm w-40" value={selectedProject?._id || ''}
              onChange={e => setSelectedProject(projects.find(p => p._id === e.target.value))}>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          )}
          {isAdmin && (
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm shrink-0">
              <Plus size={16} /> Post Update
            </button>
          )}
        </div>
      </div>

      {/* New Note Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Post Update</h3>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <textarea value={content} onChange={e => setContent(e.target.value)}
                className="input-field h-28 resize-none" placeholder="Write your project update here..." required />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)}
                    className="rounded border-border" />
                  <span className="text-sm text-text-secondary flex items-center gap-1">
                    <Pin size={13} /> Pin this update
                  </span>
                </label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
                  <button type="submit" disabled={saving || !content.trim()} className="btn-primary text-sm">
                    {saving ? 'Posting...' : 'Post Update'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Feed */}
      <div className="space-y-4">
        {notes.length === 0 && (
          <div className="glass-card p-12 text-center">
            <StickyNote size={40} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">No updates posted yet</p>
            {isAdmin && (
              <button onClick={() => setShowForm(true)} className="btn-primary mt-4 mx-auto">
                <Plus size={16} /> Post First Update
              </button>
            )}
          </div>
        )}
        {notes.map((note, i) => (
          <motion.div
            key={note._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-5 group relative ${note.pinned ? 'border-primary/30 bg-primary/5' : ''}`}
          >
            {note.pinned && (
              <div className="absolute top-4 right-12 text-primary-light">
                <Pin size={14} />
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-light font-semibold text-sm shrink-0 mt-0.5">
                {note.author?.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-text-primary">{note.author?.name}</span>
                  <span className="badge badge-primary text-xs">{note.author?.role}</span>
                  <span className="text-xs text-text-muted ml-auto">
                    {new Date(note.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
              </div>
            </div>
            {isAdmin && (
              <button onClick={() => handleDelete(note._id)}
                className="absolute top-4 right-4 btn-ghost p-1 opacity-0 group-hover:opacity-100 text-danger">
                <Trash2 size={14} />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Notes;
