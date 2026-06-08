require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Payment = require('../models/Payment');
const Issue = require('../models/Issue');
const File = require('../models/File');
const Note = require('../models/Note');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Project.deleteMany({}), Task.deleteMany({}),
      Payment.deleteMany({}), Issue.deleteMany({}), File.deleteMany({}),
      Note.deleteMany({}), Activity.deleteMany({}), Notification.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create admin
    const admin = await User.create({
      name: 'Trintz Admin',
      email: 'admin@trintz.com',
      password: 'admin123',
      role: 'admin',
      company: 'Trintz Solutions',
      phone: '+91 98765 43210',
    });

    // Create client
    const client = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'client123',
      role: 'client',
      company: 'John\'s E-commerce',
      phone: '+91 87654 32109',
    });

    // Create project
    const project = await Project.create({
      name: 'E-commerce Website',
      description: 'A full-featured e-commerce platform with product catalog, cart, and payment integration.',
      client: client._id,
      progress: 75,
      currentStage: 'Payment Integration',
      estimatedDelivery: new Date('2026-06-20'),
      status: 'active',
      totalCost: 20000,
      techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      stages: [
        { name: 'Requirements Gathering', status: 'completed', completedAt: new Date('2026-03-10'), order: 1 },
        { name: 'UI Design', status: 'completed', completedAt: new Date('2026-03-25'), order: 2 },
        { name: 'Product Catalog', status: 'completed', completedAt: new Date('2026-04-15'), order: 3 },
        { name: 'Shopping Cart', status: 'completed', completedAt: new Date('2026-05-01'), order: 4 },
        { name: 'Payment Integration', status: 'in-progress', order: 5 },
        { name: 'Testing', status: 'pending', order: 6 },
        { name: 'Deployment', status: 'pending', order: 7 },
      ],
    });

    await User.findByIdAndUpdate(client._id, { $push: { assignedProjects: project._id } });

    // Tasks
    const tasks = await Task.insertMany([
      { title: 'Setup project repository', description: 'Initialize Git repo and project structure', project: project._id, status: 'completed', priority: 'high', completedAt: new Date('2026-03-08') },
      { title: 'Design wireframes', description: 'Create low-fidelity wireframes for all pages', project: project._id, status: 'completed', priority: 'high', completedAt: new Date('2026-03-20') },
      { title: 'Implement product listing', description: 'Build product catalog with filters and search', project: project._id, status: 'completed', priority: 'high', completedAt: new Date('2026-04-10') },
      { title: 'Shopping cart functionality', description: 'Add to cart, update quantity, remove items', project: project._id, status: 'completed', priority: 'high', completedAt: new Date('2026-04-28') },
      { title: 'Stripe payment integration', description: 'Integrate Stripe payment gateway with webhooks', project: project._id, status: 'in-progress', priority: 'high' },
      { title: 'Write test cases', description: 'Unit and integration tests for all modules', project: project._id, status: 'todo', priority: 'medium' },
      { title: 'Deploy to production', description: 'Deploy on VPS with Nginx and SSL certificate', project: project._id, status: 'todo', priority: 'high' },
    ]);

    // Payments
    const payments = await Payment.insertMany([
      {
        project: project._id,
        invoiceNumber: 'INV-101',
        amount: 8000,
        status: 'paid',
        description: 'Initial payment - 40% advance',
        dueDate: new Date('2026-03-15'),
        paidDate: new Date('2026-03-14'),
        paymentMethod: 'Bank Transfer',
      },
      {
        project: project._id,
        invoiceNumber: 'INV-102',
        amount: 7000,
        status: 'paid',
        description: 'Milestone 2 - UI & Catalog completion',
        dueDate: new Date('2026-04-20'),
        paidDate: new Date('2026-04-19'),
        paymentMethod: 'UPI',
      },
      {
        project: project._id,
        invoiceNumber: 'INV-103',
        amount: 5000,
        status: 'pending',
        description: 'Final payment - on project delivery',
        dueDate: new Date('2026-06-25'),
      },
    ]);

    // Issues
    const issues = await Issue.insertMany([
      {
        title: 'Product images not loading on mobile',
        description: 'On mobile devices, product images fail to load on the catalog page. Tested on iPhone 13 and Samsung Galaxy S21.',
        project: project._id,
        reportedBy: client._id,
        priority: 'high',
        status: 'in-progress',
        adminNotes: 'Investigating CDN caching issue. Fix in progress.',
      },
      {
        title: 'Cart total miscalculation with discounts',
        description: 'When applying a coupon code along with a percentage discount, the cart total shows an incorrect amount.',
        project: project._id,
        reportedBy: client._id,
        priority: 'medium',
        status: 'open',
      },
      {
        title: 'Login page slow on first load',
        description: 'The login page takes about 5-6 seconds to load initially. Subsequent loads are fast.',
        project: project._id,
        reportedBy: client._id,
        priority: 'low',
        status: 'resolved',
        resolvedAt: new Date('2026-05-15'),
        adminNotes: 'Fixed by implementing lazy loading and code splitting.',
      },
    ]);

    // Files (mock metadata - no actual files)
    await File.insertMany([
      { name: 'wireframes-v1.pdf', originalName: 'UI Wireframes v1.pdf', path: 'uploads/wireframes-v1.pdf', mimeType: 'application/pdf', size: 2457600, project: project._id, uploadedBy: admin._id, version: 1, category: 'document', description: 'Initial wireframe designs' },
      { name: 'brand-assets.zip', originalName: 'Brand Assets.zip', path: 'uploads/brand-assets.zip', mimeType: 'application/zip', size: 15728640, project: project._id, uploadedBy: admin._id, version: 1, category: 'archive', description: 'Logo, colors, and typography files' },
      { name: 'homepage-design.png', originalName: 'Homepage Design.png', path: 'uploads/homepage-design.png', mimeType: 'image/png', size: 1048576, project: project._id, uploadedBy: admin._id, version: 1, category: 'image', description: 'Final homepage design mockup' },
      { name: 'api-docs.pdf', originalName: 'API Documentation.pdf', path: 'uploads/api-docs.pdf', mimeType: 'application/pdf', size: 819200, project: project._id, uploadedBy: admin._id, version: 1, category: 'document', description: 'Backend API documentation' },
      { name: 'db-schema.pdf', originalName: 'Database Schema.pdf', path: 'uploads/db-schema.pdf', mimeType: 'application/pdf', size: 512000, project: project._id, uploadedBy: admin._id, version: 2, category: 'document', description: 'Updated database schema v2' },
    ]);

    // Notes
    await Note.insertMany([
      { content: '🎉 Homepage design completed and approved by client. Moving to product catalog development.', project: project._id, author: admin._id, pinned: true },
      { content: '📦 Product catalog with 200+ items implemented. Search and filter functionality working perfectly.', project: project._id, author: admin._id },
      { content: '🛒 Shopping cart with session persistence implemented. Testing shows no issues.', project: project._id, author: admin._id },
      { content: '💳 Payment gateway integration started. Stripe test environment setup complete. Expecting completion by next week.', project: project._id, author: admin._id, pinned: true },
    ]);

    // Activities
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    await Activity.insertMany([
      { project: project._id, user: admin._id, action: 'created', description: 'Project "E-commerce Website" was created', entityType: 'project', entityId: project._id, createdAt: new Date(now - 60 * dayMs) },
      { project: project._id, user: admin._id, action: 'completed', description: 'Requirements Gathering stage completed', entityType: 'project', entityId: project._id, createdAt: new Date(now - 45 * dayMs) },
      { project: project._id, user: admin._id, action: 'uploaded', description: 'File "UI Wireframes v1.pdf" uploaded', entityType: 'file', createdAt: new Date(now - 40 * dayMs) },
      { project: project._id, user: admin._id, action: 'created', description: 'Invoice INV-101 generated for ₹8,000', entityType: 'payment', createdAt: new Date(now - 35 * dayMs) },
      { project: project._id, user: client._id, action: 'reported', description: 'Issue "Product images not loading on mobile" reported', entityType: 'issue', createdAt: new Date(now - 10 * dayMs) },
      { project: project._id, user: admin._id, action: 'created', description: 'Invoice INV-102 generated for ₹7,000', entityType: 'payment', createdAt: new Date(now - 5 * dayMs) },
      { project: project._id, user: admin._id, action: 'posted', description: 'New update: Payment gateway integration started', entityType: 'note', createdAt: new Date(now - 2 * dayMs) },
      { project: project._id, user: admin._id, action: 'updated', description: 'Project progress updated to 75%', entityType: 'project', entityId: project._id, createdAt: new Date(now - 1 * dayMs) },
    ]);

    // Notifications
    await Notification.insertMany([
      { user: client._id, title: 'New Invoice Created', message: 'Invoice INV-103 for ₹5,000 has been generated', type: 'invoice', read: false },
      { user: client._id, title: 'New File Uploaded', message: '"Database Schema.pdf" has been uploaded to your project', type: 'file', read: false },
      { user: client._id, title: 'Issue Status Updated', message: 'Your issue "Product images not loading" is now in-progress', type: 'issue', read: true },
      { user: client._id, title: 'Project Updated', message: 'Project "E-commerce Website" progress updated to 75%', type: 'progress', read: true },
      { user: admin._id, title: 'New Issue Reported', message: '"Cart total miscalculation" reported by John Doe — Priority: medium', type: 'issue', read: false },
    ]);

    console.log('✅ Seed data created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@trintz.com / admin123');
    console.log('   Client: john@example.com / client123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
