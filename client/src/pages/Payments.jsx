import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, TrendingUp, AlertCircle, CheckCircle, Plus, X, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getProjects,
  getPayments,
  createPayment,
  updatePayment,
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../services/api';
import toast from 'react-hot-toast';

const statusConfig = {
  paid: { label: 'Paid', cls: 'badge-success', icon: CheckCircle },
  pending: { label: 'Pending', cls: 'badge-warning', icon: AlertCircle },
  overdue: { label: 'Overdue', cls: 'badge-danger', icon: AlertCircle },
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Payments = () => {
  const { isAdmin, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [data, setData] = useState({ payments: [], summary: { total: 0, paid: 0, pending: 0 } });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', description: '', dueDate: '', status: 'pending' });
  const [saving, setSaving] = useState(false);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) loadPayments(selectedProject._id);
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const { data: p } = await getProjects();
      setProjects(p);
      if (p.length > 0) setSelectedProject(p[0]);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const loadPayments = async (projectId) => {
    try {
      const { data: d } = await getPayments(projectId);
      setData(d);
    } catch { toast.error('Failed to load payments'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createPayment({ ...form, projectId: selectedProject._id, amount: Number(form.amount) });
      toast.success('Invoice created!');
      setShowForm(false);
      setForm({ amount: '', description: '', dueDate: '', status: 'pending' });
      loadPayments(selectedProject._id);
    } catch { toast.error('Failed to create invoice'); }
    finally { setSaving(false); }
  };

  const handleStatusUpdate = async (paymentId, status) => {
    try {
      await updatePayment(paymentId, { status });
      toast.success('Payment status updated');
      loadPayments(selectedProject._id);
    } catch { toast.error('Failed to update payment'); }
  };

  const handlePayment = async (payment) => {
    setPayingId(payment._id);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error('Razorpay SDK failed to load. Are you offline?');
      setPayingId(null);
      return;
    }

    try {
      // 1. Create Order on backend
      const { data: order } = await createRazorpayOrder(payment._id);
      // 2. Fetch Razorpay key ID from backend
      const { data: keyRes } = await getRazorpayKey();

      const options = {
        key: keyRes.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Trintz Solutions",
        description: payment.description || "Invoice Payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            // 3. Verify Payment Signature
            await verifyRazorpayPayment(payment._id, response);
            toast.success('Payment Received Successfully!');
            loadPayments(selectedProject._id);
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setPayingId(null);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: () => {
            setPayingId(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setPayingId(null);
    }
  };

  const paidPercent = data.summary.total ? Math.round((data.summary.paid / data.summary.total) * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Payments</h1>
          <p className="text-text-secondary text-sm mt-1">Invoice and payment tracking</p>
        </div>
        <div className="flex items-center gap-3">
          {projects.length > 1 && (
            <select className="select-field text-sm w-48" value={selectedProject?._id || ''} onChange={(e) => setSelectedProject(projects.find(p => p._id === e.target.value))}>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          )}
          {isAdmin && (
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm shrink-0">
              <Plus size={16} /> New Invoice
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Cost', value: data.summary.total, color: 'text-text-primary', bg: 'bg-surface-2' },
          { label: 'Amount Paid', value: data.summary.paid, color: 'text-success', bg: 'bg-success/5 border border-success/20' },
          { label: 'Remaining', value: data.summary.pending, color: 'text-warning', bg: 'bg-warning/5 border border-warning/20' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`glass-card p-5 ${s.bg}`}>
            <p className="label mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>₹{s.value?.toLocaleString() || 0}</p>
          </motion.div>
        ))}
      </div>

      {/* Payment Progress */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Payment Progress</h2>
          <span className="text-lg font-bold text-text-primary">{paidPercent}%</span>
        </div>
        <div className="progress-bar h-3">
          <motion.div
            className="progress-fill h-3"
            initial={{ width: 0 }}
            animate={{ width: `${paidPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-2">
          <span>₹{data.summary.paid?.toLocaleString()} paid</span>
          <span>₹{data.summary.pending?.toLocaleString()} remaining</span>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="section-title">Invoice History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Invoice #', 'Description', 'Amount', 'Due Date', 'Paid Date', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left label">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.payments.map((payment, i) => {
                const sc = statusConfig[payment.status] || statusConfig.pending;
                return (
                  <motion.tr
                    key={payment._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-surface-2/50 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-mono font-medium text-primary-light">{payment.invoiceNumber}</td>
                    <td className="px-5 py-4 text-sm text-text-secondary">{payment.description || '—'}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-text-primary">₹{payment.amount?.toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-text-secondary">
                      {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-text-secondary">
                      {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${sc.cls}`}>{sc.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      {isAdmin ? (
                        payment.status !== 'paid' && (
                          <select
                            className="select-field text-xs w-28 py-1"
                            value={payment.status}
                            onChange={(e) => handleStatusUpdate(payment._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Mark Paid</option>
                            <option value="overdue">Overdue</option>
                          </select>
                        )
                      ) : (
                        payment.status !== 'paid' && (
                          <button
                            disabled={payingId === payment._id}
                            onClick={() => handlePayment(payment)}
                            className="btn-primary text-xs py-1 px-3"
                          >
                            {payingId === payment._id ? 'Processing...' : 'Pay Now'}
                          </button>
                        )
                      )}
                    </td>
                  </motion.tr>
                );
              })}
              {data.payments.length === 0 && (
                <tr><td colSpan={7} className="text-center text-text-muted py-10">No invoices yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-text-primary">Create Invoice</h3>
                <button onClick={() => setShowForm(false)} className="btn-ghost p-1"><X size={18} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label block mb-1.5">Amount (₹)</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="input-field" placeholder="5000" required min="1" />
                </div>
                <div>
                  <label className="label block mb-1.5">Description</label>
                  <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="input-field" placeholder="Milestone payment..." />
                </div>
                <div>
                  <label className="label block mb-1.5">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="input-field" />
                </div>
                <div>
                  <label className="label block mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="select-field">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                    {saving ? 'Creating...' : 'Create Invoice'}
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

export default Payments;
