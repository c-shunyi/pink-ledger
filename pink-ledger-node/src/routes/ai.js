const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middlewares/auth');

// AI 智能解析账单
router.use(authenticate);
router.post('/parse-billing', aiController.parseSmartBilling);

module.exports = router;
