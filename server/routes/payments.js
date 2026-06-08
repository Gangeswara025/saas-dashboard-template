const express = require('express');
const router = express.Router();
const {
  getPayments,
  createPayment,
  updatePayment,
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');
const { roleCheck } = require('../middlewares/roleCheck');

router.get('/project/:projectId', protect, getPayments);
router.post('/', protect, roleCheck('admin'), createPayment);
router.put('/:id', protect, roleCheck('admin'), updatePayment);
router.get('/razorpay-key', protect, getRazorpayKey);
router.post('/:id/razorpay-order', protect, createRazorpayOrder);
router.post('/:id/verify', protect, verifyRazorpayPayment);

module.exports = router;
