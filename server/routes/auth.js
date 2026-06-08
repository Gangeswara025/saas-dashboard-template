const express = require('express');
const router = express.Router();
const { login, getMe, createClient, getClients, updateClient, updateProfile, updatePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { roleCheck } = require('../middlewares/roleCheck');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${unique}${path.extname(file.originalname)}`);
  },
});

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

module.exports = router;
