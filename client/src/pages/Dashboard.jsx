import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, AlertCircle, CheckSquare, CreditCard, ArrowRight,
  Calendar, Clock, Activity, ChevronRight, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProjects, getTasks, getPayments, getIssues, getActivities } from '../services/api';

const StatCard = ({ title, value, subtitle, icon: Icon, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    className="stat-card glass-card-hover group"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="label">{title}</p>
        <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
        {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2.5 rounded-xl ${color} transition-transform group-hover:scale-110`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </motion.div>
);

const StatusDot = ({ status }) => {
  const colors = {
    completed: 'bg-success', 'in-progress': 'bg-warning', pending: 'bg-text-muted',
    open: 'bg-danger', resolved: 'bg-success',
  };
  return <span className={`w-2 h-2 rounded-full inline-block ${colors[status] || 'bg-text-muted'}`} />;
};

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState({ summary: { total: 0, paid: 0, pending: 0 }, payments: [] });
  const [issues, setIssues] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: projects } = await getProjects();
      if (projects.length > 0) {
        const p = projects[0];
        setProject(p);
        const [taskRes, payRes, issueRes, actRes] = await Promise.all([
          getTasks(p._id), getPayments(p._id), getIssues(p._id), getActivities(p._id),
        ]);
        setTasks(taskRes.data || []);
        setPayments(payRes.data || { summary: {}, payments: [] });
        setIssues(issueRes.data || []);
        setActivities(actRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const openIssues = issues.filter((i) => i.status !== 'resolved').length;
  const pendingPayment = payments.summary?.pending || 0;
  const progress = project?.progress || 0;

  const groupActivitiesByDate = (activities) => {
    const groups = {};
    activities.forEach((a) => {
      const date = new Date(a.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      let key;
      if (date.toDateString() === today.toDateString()) key = 'Today';
      else if (date.toDateString() === yesterday.toDateString()) key = 'Yesterday';
      else key = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return groups;
  };

  const activityGroups = groupActivitiesByDate(activities.slice(0, 10));

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {isAdmin ? 'Here\'s your project overview for today' : 'Track your project progress and updates'}
          </p>
        </div>
        {project && (
          <Link to="/projects" className="btn-secondary text-sm shrink-0">
            View All Projects <ArrowRight size={14} />
          </Link>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Project Progress" value={`${progress}%`} subtitle={project?.currentStage} icon={TrendingUp} color="bg-primary" index={0} />
        <StatCard title="Open Issues" value={openIssues} subtitle={`${issues.length} total issues`} icon={AlertCircle} color="bg-danger" index={1} />
        <StatCard title="Completed Tasks" value={completedTasks} subtitle={`of ${tasks.length} tasks`} icon={CheckSquare} color="bg-success" index={2} />
        <StatCard title="Pending Payment" value={`₹${(pendingPayment / 1000).toFixed(0)}K`} subtitle="Outstanding amount" icon={CreditCard} color="bg-warning" index={3} />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Project Progress - 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="section-title">Project Overview</h2>
            <Link to="/projects" className="btn-ghost text-xs">
              Details <ChevronRight size={14} />
            </Link>
          </div>

          {project ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-text-primary text-lg">{project.name}</h3>
                    <p className="text-text-secondary text-sm mt-0.5">{project.description}</p>
                  </div>
                  <span className={`badge ${project.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                    {project.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-secondary font-medium">Overall Progress</span>
                  <span className="text-text-primary font-bold">{progress}%</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Project Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-surface-2 rounded-lg">
                  <p className="label mb-1">Current Stage</p>
                  <p className="text-sm font-medium text-accent">{project.currentStage || '—'}</p>
                </div>
                <div className="p-3 bg-surface-2 rounded-lg">
                  <p className="label mb-1">Est. Delivery</p>
                  <p className="text-sm font-medium text-text-primary">
                    {project.estimatedDelivery ? new Date(project.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </p>
                </div>
                <div className="p-3 bg-surface-2 rounded-lg">
                  <p className="label mb-1">Total Cost</p>
                  <p className="text-sm font-medium text-text-primary">₹{project.totalCost?.toLocaleString() || '—'}</p>
                </div>
              </div>

              {/* Stages Timeline */}
              <div>
                <p className="label mb-3">Project Timeline</p>
                <div className="space-y-2">
                  {(project.stages || []).map((stage, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs
                        ${stage.status === 'completed' ? 'bg-success text-white' :
                          stage.status === 'in-progress' ? 'bg-warning text-black' : 'bg-surface-2 border border-border text-text-muted'}`}>
                        {stage.status === 'completed' ? '✓' : stage.status === 'in-progress' ? '⟳' : '○'}
                      </div>
                      <span className={`text-sm ${stage.status === 'completed' ? 'text-text-secondary line-through' :
                        stage.status === 'in-progress' ? 'text-warning font-medium' : 'text-text-muted'}`}>
                        {stage.name}
                      </span>
                      {stage.status === 'in-progress' && (
                        <span className="badge-warning badge text-xs ml-auto">In Progress</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Zap size={32} className="text-text-muted mx-auto mb-2" />
              <p className="text-text-muted">No projects assigned yet</p>
            </div>
          )}
        </motion.div>

        {/* Right Column - Activity + Quick Stats */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Payments</h2>
              <Link to="/payments" className="btn-ghost text-xs">View <ChevronRight size={12} /></Link>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Total</span>
                <span className="font-semibold text-text-primary">₹{payments.summary?.total?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-success">Paid</span>
                <span className="font-semibold text-success">₹{payments.summary?.paid?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-warning">Pending</span>
                <span className="font-semibold text-warning">₹{payments.summary?.pending?.toLocaleString() || 0}</span>
              </div>
              <div className="progress-bar mt-3">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${payments.summary?.total ? (payments.summary.paid / payments.summary.total) * 100 : 0}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
              <p className="text-xs text-text-muted text-right">
                {payments.summary?.total ? Math.round((payments.summary.paid / payments.summary.total) * 100) : 0}% paid
              </p>
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <Activity size={16} className="text-primary-light" /> Activity
              </h2>
            </div>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {Object.entries(activityGroups).length === 0 ? (
                <p className="text-text-muted text-sm text-center py-4">No recent activity</p>
              ) : (
                Object.entries(activityGroups).map(([date, acts]) => (
                  <div key={date}>
                    <p className="label mb-2">{date}</p>
                    <div className="space-y-2">
                      {acts.map((a) => (
                        <div key={a._id} className="flex gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-light mt-1.5 shrink-0" />
                          <p className="text-text-secondary leading-relaxed">{a.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Tasks & Issues Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Tasks</h2>
            <Link to="/tasks" className="btn-ghost text-xs">View all <ChevronRight size={12} /></Link>
          </div>
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <div key={task._id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <StatusDot status={task.status} />
                <span className={`text-sm flex-1 ${task.status === 'completed' ? 'line-through text-text-muted' : 'text-text-secondary'}`}>
                  {task.title}
                </span>
                <span className={`badge text-xs ${task.priority === 'high' ? 'badge-danger' : task.priority === 'medium' ? 'badge-warning' : 'badge-gray'}`}>
                  {task.priority}
                </span>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-text-muted text-sm text-center py-4">No tasks yet</p>}
          </div>
        </motion.div>

        {/* Recent Issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Issues</h2>
            <Link to="/issues" className="btn-ghost text-xs">View all <ChevronRight size={12} /></Link>
          </div>
          <div className="space-y-2">
            {issues.slice(0, 5).map((issue) => (
              <div key={issue._id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <StatusDot status={issue.status} />
                <span className="text-sm flex-1 text-text-secondary truncate">{issue.title}</span>
                <span className={`badge text-xs ${issue.status === 'open' ? 'badge-danger' : issue.status === 'in-progress' ? 'badge-warning' : 'badge-success'}`}>
                  {issue.status}
                </span>
              </div>
            ))}
            {issues.length === 0 && <p className="text-text-muted text-sm text-center py-4">No issues reported</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
