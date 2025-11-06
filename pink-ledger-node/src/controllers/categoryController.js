const { Category } = require('../models');
const { Op } = require('sequelize');

// 获取分类列表
exports.getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const userId = req.userId;

    const whereClause = {
      [Op.or]: [
        { isSystem: true }, // 系统分类
        { userId } // 用户自定义分类
      ]
    };

    if (type && ['income', 'expense'].includes(type)) {
      whereClause.type = type;
    }

    const categories = await Category.findAll({
      where: whereClause,
      order: [['isSystem', 'DESC'], ['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败',
      error: error.message
    });
  }
};

// 创建分类
exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;
    const userId = req.userId;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: '分类名称和类型不能为空'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: '分类类型必须是 income 或 expense'
      });
    }

    const category = await Category.create({
      name,
      type,
      icon,
      color,
      userId,
      isSystem: false
    });

    res.status(201).json({
      success: true,
      message: '创建成功',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('创建分类失败:', error);
    res.status(500).json({
      success: false,
      message: '创建分类失败',
      error: error.message
    });
  }
};

// 更新分类
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;
    const userId = req.userId;

    const category = await Category.findOne({
      where: { id, userId }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在或无权限修改'
      });
    }

    if (category.isSystem) {
      return res.status(403).json({
        success: false,
        message: '系统分类不能修改'
      });
    }

    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();

    res.json({
      success: true,
      message: '更新成功',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('更新分类失败:', error);
    res.status(500).json({
      success: false,
      message: '更新分类失败',
      error: error.message
    });
  }
};

// 删除分类
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const category = await Category.findOne({
      where: { id, userId }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在或无权限删除'
      });
    }

    if (category.isSystem) {
      return res.status(403).json({
        success: false,
        message: '系统分类不能删除'
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({
      success: false,
      message: '删除分类失败',
      error: error.message
    });
  }
};

