const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const categoryRoutes = require('./categories');
const transactionRoutes = require('./transactions');

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// API 路由
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);

module.exports = router;

