const jwt = require('jsonwebtoken');
const User = require('../models/User');
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const formatAvatarUrl = (avatarPath) => {
  if (!avatarPath) return avatarPath;
  if (avatarPath.startsWith('/')) return avatarPath; // legacy local paths
  if (avatarPath.startsWith('http')) return avatarPath; // external urls
  return `/api/auth/avatar/${encodeURIComponent(avatarPath)}`;
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }
    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: formatAvatarUrl(user.avatar),
        company: user.company,
        assignedProjects: user.assignedProjects,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('assignedProjects', 'name status progress');
    const userData = user.toObject();
    userData.avatar = formatAvatarUrl(user.avatar);
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new client (admin only)
// @route   POST /api/auth/create-client
const createClient = async (req, res) => {
  try {
    const { name, email, password, phone, company } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role: 'client', phone, company });
    res.status(201).json({ message: 'Client created successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all clients
// @route   GET /api/auth/clients
const getClients = async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }).populate('assignedProjects', 'name status progress');
    // Map avatars for clients
    const clientsData = clients.map(client => {
      const clientObj = client.toObject();
      clientObj.avatar = formatAvatarUrl(client.avatar);
      return clientObj;
    });
    res.json(clientsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update client
// @route   PUT /api/auth/clients/:id
const updateClient = async (req, res) => {
  try {
    const { name, phone, company, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, company, isActive },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'Client not found' });
    const userObj = user.toObject();
    userObj.avatar = formatAvatarUrl(user.avatar);
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, company } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.phone = phone !== undefined ? phone : user.phone;
    user.company = company !== undefined ? company : user.company;

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const fileName = `avatars/${uuidv4()}${ext}`;

      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_PROFILE_IMAGES_BUCKET || 'profile-images')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (error) throw new Error(`Supabase upload error: ${error.message}`);

      // Delete old avatar if it exists and is a supabase path
      if (user.avatar && !user.avatar.startsWith('/') && !user.avatar.startsWith('http')) {
        await supabase.storage
          .from(process.env.SUPABASE_PROFILE_IMAGES_BUCKET || 'profile-images')
          .remove([user.avatar]);
      }

      user.avatar = fileName;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: formatAvatarUrl(updatedUser.avatar),
      company: updatedUser.company,
      phone: updatedUser.phone,
      assignedProjects: updatedUser.assignedProjects,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user._id);
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user avatar
// @route   GET /api/auth/avatar/:path
const getAvatar = async (req, res) => {
  try {
    const avatarPath = req.params.path;
    if (!avatarPath) return res.status(400).json({ message: 'Path is required' });

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_PROFILE_IMAGES_BUCKET || 'profile-images')
      .createSignedUrl(avatarPath, 300);

    if (error) return res.status(500).json({ message: error.message });
    
    res.redirect(data.signedUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login, getMe, createClient, getClients, updateClient, updateProfile, updatePassword, getAvatar };
