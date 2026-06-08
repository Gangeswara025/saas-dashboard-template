import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Circle, ChevronDown, FolderKanban, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProjects, updateProject, updateStages } from '../services/api';
import toast from 'react-hot-toast';

const stageIcons = {
  completed: <CheckCircle2 size={20} className="text-success" />,
  'in-progress': <Clock size={20} className="text-warning" />,
  pending: <Circle size={20} className="text-text-muted" />,
};

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editProgress, setEditProgress] = useState(false);
  const [progressVal, setProgressVal] = useState(0);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data);
      if (data.length > 0) { setSelected(data[0]); setProgressVal(data[0].progress); }
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const handleStageToggle = async (stageIdx) => {
    if (!isAdmin) return;
    const stages = selected.stages.map((s, i) => {
      if (i === stageIdx) {
        const next = s.status === 'completed' ? 'pending' : s.status === 'in-progress' ? 'completed' : 'in-progress';
        return { ...s, status: next, completedAt: next === 'completed' ? new Date() : null };
      }
      return s;
    });
    try {
      const { data } = await updateStages(selected._id, { stages });
      setSelected(data);
      setProjects((prev) => prev.map((p) => (p._id === data._id ? data : p)));
      toast.success('Stage updated');
    } catch { toast.error('Failed to update stage'); }
  };

  const handleProgressSave = async () => {
    setSaving(true);
    try {
      const { data } = await updateProject(selected._id, { ...selected, progress: progressVal });
      setSelected(data);
      setProjects((prev) => prev.map((p) => (p._id === data._id ? data : p)));
      setEditProgress(false);
      toast.success('Progress updated');
    } catch { toast.error('Failed to update progress'); }
    finally { setSaving(false); }
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
          <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
          <p className="text-text-secondary text-sm mt-1">Project timeline and progress tracking</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FolderKanban size={48} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">No projects found</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Project List */}
          <div className="space-y-3">
            {projects.map((p) => (
              <motion.button
                key={p._id}
                onClick={() => { setSelected(p); setProgressVal(p.progress); setEditProgress(false); }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full text-left glass-card p-4 transition-all duration-200 ${selected?._id === p._id ? 'border-primary/50 shadow-glow' : 'hover:border-border-light'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-text-primary text-sm leading-tight">{p.name}</h3>
                  <span className={`badge ml-2 shrink-0 ${p.status === 'active' ? 'badge-success' : p.status === 'completed' ? 'badge-primary' : 'badge-gray'}`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-text-muted mb-3 line-clamp-2">{p.description}</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-text-muted mt-1.5">
                  <span>{p.client?.name}</span>
                  <span>{p.progress}%</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Project Detail */}
          {selected && (
            <motion.div
              key={selected._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-5"
            >
              {/* Header */}
              <div className="glass-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">{selected.name}</h2>
                    <p className="text-text-secondary text-sm mt-1">{selected.description}</p>
                  </div>
                  <span className={`badge self-start ${selected.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                    {selected.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="label mb-1">Client</p>
                    <p className="text-sm font-medium text-text-primary truncate">{selected.client?.name}</p>
                  </div>
                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="label mb-1">Current Stage</p>
                    <p className="text-sm font-medium text-accent">{selected.currentStage || '—'}</p>
                  </div>
                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="label mb-1">Delivery</p>
                    <p className="text-sm font-medium text-text-primary">
                      {selected.estimatedDelivery ? new Date(selected.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="label mb-1">Total Cost</p>
                    <p className="text-sm font-medium text-text-primary">₹{selected.totalCost?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-secondary">Overall Progress</span>
                    <div className="flex items-center gap-2">
                      {isAdmin && editProgress ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="range" min="0" max="100" value={progressVal}
                            onChange={(e) => setProgressVal(Number(e.target.value))}
                            className="w-24 accent-primary"
                          />
                          <span className="text-sm font-bold text-text-primary w-8">{progressVal}%</span>
                          <button onClick={handleProgressSave} disabled={saving} className="btn-primary text-xs py-1 px-2">Save</button>
                          <button onClick={() => setEditProgress(false)} className="btn-secondary text-xs py-1 px-2">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-text-primary">{selected.progress}%</span>
                          {isAdmin && (
                            <button onClick={() => setEditProgress(true)} className="btn-ghost text-xs py-0.5 px-2">Edit</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${selected.progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {selected.techStack?.length > 0 && (
                  <div className="mt-4">
                    <p className="label mb-2">Tech Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.techStack.map((t) => (
                        <span key={t} className="badge badge-primary">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="glass-card p-6">
                <h3 className="section-title mb-5">Project Timeline</h3>
                <div className="relative">
                  <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-border" />
                  <div className="space-y-4">
                    {(selected.stages || []).map((stage, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-4 relative"
                      >
                        <div className={`z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                          ${stage.status === 'completed' ? 'bg-success/10 border-success' :
                            stage.status === 'in-progress' ? 'bg-warning/10 border-warning' : 'bg-surface border-border'}`}>
                          {stageIcons[stage.status]}
                        </div>
                        <div className={`flex-1 p-3 rounded-lg border transition-all ${
                          stage.status === 'completed' ? 'bg-success/5 border-success/20' :
                          stage.status === 'in-progress' ? 'bg-warning/5 border-warning/20' : 'bg-surface-2 border-border'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-medium text-sm ${
                              stage.status === 'completed' ? 'text-text-secondary' :
                              stage.status === 'in-progress' ? 'text-warning' : 'text-text-muted'}`}>
                              {stage.name}
                            </span>
                            <div className="flex items-center gap-2">
                              {stage.status === 'in-progress' && (
                                <span className="badge badge-warning text-xs">In Progress</span>
                              )}
                              {stage.completedAt && (
                                <span className="text-xs text-text-muted">
                                  {new Date(stage.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                              {isAdmin && (
                                <button
                                  onClick={() => handleStageToggle(i)}
                                  className="btn-ghost text-xs py-0.5 px-1.5"
                                >
                                  Update
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;
