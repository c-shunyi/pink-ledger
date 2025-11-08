const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

// 公开路由
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/wechat-login', authController.wechatLogin);

// 需要认证的路由
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;

