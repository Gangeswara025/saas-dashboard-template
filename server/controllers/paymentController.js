const Payment = require('../models/Payment');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Project = require('../models/Project');

// @desc    Get payments for a project
// @route   GET /api/payments/project/:projectId
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ project: req.params.projectId }).sort({ createdAt: -1 });
    const summary = payments.reduce(
      (acc, p) => {
        acc.total += p.amount;
        if (p.status === 'paid') acc.paid += p.amount;
        else acc.pending += p.amount;
        return acc;
      },
      { total: 0, paid: 0, pending: 0 }
    );
    res.json({ payments, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create invoice/payment
// @route   POST /api/payments
const createPayment = async (req, res) => {
  try {
    const { projectId, amount, description, dueDate, status } = req.body;
    const count = await Payment.countDocuments({ project: projectId });
    const invoiceNumber = `INV-${String(count + 101).padStart(3, '0')}`;

    const payment = await Payment.create({
      project: projectId,
      invoiceNumber,
      amount,
      description,
      dueDate,
      status: status || 'pending',
    });

    const project = await Project.findById(projectId).populate('client', '_id name');
    if (project?.client) {
      await Notification.create({
        user: project.client._id,
        title: 'New Invoice Created',
        message: `Invoice ${invoiceNumber} for ₹${amount.toLocaleString()} has been generated`,
        type: 'invoice',
        relatedId: payment._id,
        relatedModel: 'Payment',
      });
    }

    await Activity.create({
      project: projectId,
      user: req.user._id,
      action: 'created',
      description: `Invoice ${invoiceNumber} generated for ₹${amount.toLocaleString()}`,
      entityType: 'payment',
      entityId: payment._id,
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id
const updatePayment = async (req, res) => {
  try {
    const { status, paidDate, paymentMethod } = req.body;
    const update = { status, paymentMethod };
    if (status === 'paid') update.paidDate = paidDate || new Date();

    const payment = await Payment.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Razorpay Key ID
// @route   GET /api/payments/razorpay-key
const getRazorpayKey = async (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID });
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/:id/razorpay-order
const createRazorpayOrder = async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.status === 'paid') return res.status(400).json({ message: 'Payment already done' });

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: payment.amount * 100, // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: payment.invoiceNumber,
    };

    const order = await instance.orders.create(options);
    if (!order) return res.status(500).json({ message: 'Failed to create Razorpay order' });

    // Store Razorpay Order ID
    payment.razorpayOrderId = order.id;
    await payment.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/:id/verify
const verifyRazorpayPayment = async (req, res) => {
  try {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const payment = await Payment.findById(req.params.id).populate('project');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // Verify signature
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed (invalid signature)' });
    }

    // Update payment
    payment.status = 'paid';
    payment.paidDate = new Date();
    payment.paymentMethod = 'Razorpay';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    // Create notification & activity
    const project = payment.project;
    if (project) {
      // Find admin to notify
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          title: 'Payment Received',
          message: `Payment of ₹${payment.amount.toLocaleString()} received for project "${project.name}" (Invoice: ${payment.invoiceNumber})`,
          type: 'invoice',
          relatedId: payment._id,
          relatedModel: 'Payment',
        });
      }

      await Activity.create({
        project: project._id,
        user: req.user._id,
        action: 'paid',
        description: `Invoice ${payment.invoiceNumber} paid via Razorpay`,
        entityType: 'payment',
        entityId: payment._id,
      });
    }

    res.json({ message: 'Payment verified and updated successfully', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPayments,
  createPayment,
  updatePayment,
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
};
