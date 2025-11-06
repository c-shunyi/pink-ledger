const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middlewares/auth');

// 所有账单路由都需要认证
router.use(authenticate);

router.get('/', transactionController.getTransactions);
router.get('/statistics', transactionController.getStatistics);
router.get('/:id', transactionController.getTransaction);
router.post('/', transactionController.createTransaction);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;

