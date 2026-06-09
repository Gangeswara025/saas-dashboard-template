const express = require('express');
const router = express.Router();
const { login, getMe, createClient, getClients, updateClient, updateProfile, updatePassword, getAvatar } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { roleCheck } = require('../middlewares/roleCheck');

const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Not an image! Please upload only images.'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/create-client', protect, roleCheck('admin'), createClient);
router.get('/clients', protect, roleCheck('admin'), getClients);
router.put('/clients/:id', protect, roleCheck('admin'), updateClient);

router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/password', protect, updatePassword);

router.get('/avatar/:path', getAvatar);

module.exports = router;
