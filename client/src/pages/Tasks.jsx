import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Circle, Clock, Plus, X, Trash2, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProjects, getTasks, createTask, updateTask, deleteTask } from '../services/api';
import toast from 'react-hot-toast';

const statusConfig = {
  todo: { label: 'To Do', cls: 'badge-gray', icon: Circle, color: 'text-text-muted' },
  'in-progress': { label: 'In Progress', cls: 'badge-warning', icon: Clock, color: 'text-warning' },
  completed: { label: 'Completed', cls: 'badge-success', icon: CheckSquare, color: 'text-success' },
};

const Tasks = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '', status: 'todo' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { if (selectedProject) loadTasks(); }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data);
      if (data.length > 0) setSelectedProject(data[0]);
    } finally { setLoading(false); }
  };

  const loadTasks = async () => {
    try {
      const { data } = await getTasks(selectedProject._id);
      setTasks(data);
    } catch { toast.error('Failed to load tasks'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTask({ ...form, projectId: selectedProject._id });
      toast.success('Task created!');
      setShowForm(false);
      setForm({ title: '', description: '', priority: 'medium', dueDate: '', status: 'todo' });
      loadTasks();
    } catch { toast.error('Failed to create task'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTask(taskId, { status });
      toast.success('Task updated');
      loadTasks();
    } catch { toast.error('Failed to update task'); }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      toast.success('Task deleted');
      loadTasks();
    } catch { toast.error('Failed to delete task'); }
  };

  const filtered = filterStatus ? tasks.filter(t => t.status === filterStatus) : tasks;
  const completed = tasks.filter(t => t.status === 'completed').length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tasks</h1>
          <p className="text-text-secondary text-sm mt-1">{completed} of {tasks.length} tasks completed</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {projects.length > 1 && (
            <select className="select-field text-sm w-40" value={selectedProject?._id || ''}
              onChange={e => setSelectedProject(projects.find(p => p._id === e.target.value))}>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          )}
          <select className="select-field text-sm w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Tasks</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          {isAdmin && (
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm shrink-0">
              <Plus size={16} /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-text-secondary">Task Completion</span>
          <span className="font-bold text-text-primary">{tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${tasks.length ? (completed / tasks.length) * 100 : 0}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Tasks by Status */}
      {['todo', 'in-progress', 'completed'].map((status) => {
        const statusTasks = filtered.filter(t => t.status === status);
        if (filterStatus && filterStatus !== status) return null;
        const cfg = statusConfig[status];
        const Icon = cfg.icon;
        return (
          <div key={status}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={16} className={cfg.color} />
              <h2 className="font-semibold text-text-secondary text-sm">{cfg.label}</h2>
              <span className="badge badge-gray">{statusTasks.length}</span>
            </div>
            <div className="space-y-2">
              {statusTasks.map((task, i) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`glass-card p-4 flex items-start gap-4 group ${task.status === 'completed' ? 'opacity-70' : ''}`}
                >
                  {isAdmin ? (
                    <select
                      className="select-field text-xs py-1 w-28 shrink-0"
                      value={task.status}
                      onChange={e => handleStatusChange(task._id, e.target.value)}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5
                      ${task.status === 'completed' ? 'bg-success border-success' : task.status === 'in-progress' ? 'border-warning' : 'border-border'}`}>
                      {task.status === 'completed' && <span className="text-white text-xs">✓</span>}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-text-muted mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${task.priority === 'high' ? 'badge-danger' : task.priority === 'medium' ? 'badge-warning' : 'badge-gray'}`}>
                      {task.priority}
                    </span>
                    {isAdmin && (
                      <button onClick={() => handleDelete(task._id)} className="btn-ghost p-1 opacity-0 group-hover:opacity-100 text-danger">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              {statusTasks.length === 0 && (
                <div className="glass-card p-4 text-center text-text-muted text-sm">
                  No {cfg.label.toLowerCase()} tasks
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Create Task Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-card p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-text-primary">Create Task</h3>
                <button onClick={() => setShowForm(false)} className="btn-ghost p-1"><X size={18} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label block mb-1.5">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="input-field" placeholder="Task title" required />
                </div>
                <div>
                  <label className="label block mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="input-field h-20 resize-none" placeholder="Task description..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label block mb-1.5">Priority</label>
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="select-field">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="label block mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="select-field">
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label block mb-1.5">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                    {saving ? 'Creating...' : 'Create Task'}
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

export default Tasks;
