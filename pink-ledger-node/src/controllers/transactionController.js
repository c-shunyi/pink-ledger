const { Transaction, Category } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

// 获取账单列表
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      type,
      categoryId,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = { userId };

    // 按类型筛选
    if (type && ['income', 'expense'].includes(type)) {
      whereClause.type = type;
    }

    // 按分类筛选
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    // 按日期范围筛选
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      whereClause.date = {
        [Op.gte]: startDate
      };
    } else if (endDate) {
      whereClause.date = {
        [Op.lte]: endDate
      };
    }

    // 计算分页
    const offset = (page - 1) * limit;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type', 'icon', 'color']
        }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取账单列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取账单列表失败',
      error: error.message
    });
  }
};

// 获取单条账单详情
exports.getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const transaction = await Transaction.findOne({
      where: { id, userId },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type', 'icon', 'color']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: '账单不存在'
      });
    }

    res.json({
      success: true,
      data: {
        transaction
      }
    });
  } catch (error) {
    console.error('获取账单详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取账单详情失败',
      error: error.message
    });
  }
};

// 创建账单
exports.createTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const { categoryId, type, amount, date, description, accountType } = req.body;

    // 验证必填字段
    if (!categoryId || !type || !amount) {
      return res.status(400).json({
        success: false,
        message: '分类、类型和金额不能为空'
      });
    }

    // 验证类型
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: '类型必须是 income 或 expense'
      });
    }

    // 验证金额
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: '金额必须大于0'
      });
    }

    // 验证分类是否存在
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    const transaction = await Transaction.create({
      userId,
      categoryId,
      type,
      amount,
      date: date || new Date(),
      description,
      accountType
    });

    // 获取完整的交易记录（包含分类信息）
    const fullTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type', 'icon', 'color']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: '创建成功',
      data: {
        transaction: fullTransaction
      }
    });
  } catch (error) {
    console.error('创建账单失败:', error);
    res.status(500).json({
      success: false,
      message: '创建账单失败',
      error: error.message
    });
  }
};

// 更新账单
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { categoryId, type, amount, date, description, accountType } = req.body;

    const transaction = await Transaction.findOne({
      where: { id, userId }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: '账单不存在'
      });
    }

    // 如果更新分类，验证分类是否存在
    if (categoryId && categoryId !== transaction.categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: '分类不存在'
        });
      }
      transaction.categoryId = categoryId;
    }

    // 更新其他字段
    if (type && ['income', 'expense'].includes(type)) {
      transaction.type = type;
    }
    if (amount && parseFloat(amount) > 0) {
      transaction.amount = amount;
    }
    if (date) {
      transaction.date = date;
    }
    if (description !== undefined) {
      transaction.description = description;
    }
    if (accountType) {
      transaction.accountType = accountType;
    }

    await transaction.save();

    // 获取完整的交易记录（包含分类信息）
    const fullTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type', 'icon', 'color']
        }
      ]
    });

    res.json({
      success: true,
      message: '更新成功',
      data: {
        transaction: fullTransaction
      }
    });
  } catch (error) {
    console.error('更新账单失败:', error);
    res.status(500).json({
      success: false,
      message: '更新账单失败',
      error: error.message
    });
  }
};

// 删除账单
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const transaction = await Transaction.findOne({
      where: { id, userId }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: '账单不存在'
      });
    }

    await transaction.destroy();

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除账单失败:', error);
    res.status(500).json({
      success: false,
      message: '删除账单失败',
      error: error.message
    });
  }
};

// 获取统计数据
exports.getStatistics = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    const whereClause = { userId };

    // 按日期范围筛选
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    // 统计总收入和总支出
    const summary = await Transaction.findAll({
      where: whereClause,
      attributes: [
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: ['type'],
      raw: true
    });

    // 按分类统计
    const categoryStats = await Transaction.findAll({
      where: whereClause,
      attributes: [
        'Transaction.type',
        'Transaction.categoryId',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('Transaction.id')), 'count']
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color']
        }
      ],
      group: ['Transaction.type', 'Transaction.categoryId', 'category.id'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']]
    });

    // 格式化数据
    const totalIncome = summary.find(s => s.type === 'income')?.total || 0;
    const totalExpense = summary.find(s => s.type === 'expense')?.total || 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalIncome: parseFloat(totalIncome),
          totalExpense: parseFloat(totalExpense),
          balance: parseFloat(totalIncome) - parseFloat(totalExpense)
        },
        categoryStats
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error.message
    });
  }
};

