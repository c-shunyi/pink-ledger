const { Category } = require('../models');
const { Op } = require('sequelize');
const sendResponse = require('../utils/response');

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
      order: [['isSystem', 'DESC'], ['sortOrder', 'ASC'], ['createdAt', 'ASC']]
    });

    return sendResponse(res, {
      code: 200,
      msg: '获取成功',
      data: { categories }
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return sendResponse(res, {
      code: 500,
      msg: '获取分类列表失败'
    });
  }
};

// 创建分类
exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;
    const userId = req.userId;

    if (!name || !type) {
      return sendResponse(res, {
        code: 400,
        msg: '分类名称和类型不能为空'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return sendResponse(res, {
        code: 400,
        msg: '分类类型必须是 income 或 expense'
      });
    }

    // 获取该类型分类的最大排序值
    const maxSortOrder = await Category.max('sortOrder', {
      where: {
        type,
        [Op.or]: [
          { isSystem: true },
          { userId }
        ]
      }
    });

    const category = await Category.create({
      name,
      type,
      icon,
      color,
      userId,
      isSystem: false,
      sortOrder: (maxSortOrder || 0) + 1
    });

    return sendResponse(res, {
      code: 200,
      msg: '创建成功',
      data: { category }
    });
  } catch (error) {
    console.error('创建分类失败:', error);
    return sendResponse(res, {
      code: 500,
      msg: '创建分类失败'
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
      return sendResponse(res, {
        code: 404,
        msg: '分类不存在或无权限修改'
      });
    }

    if (category.isSystem) {
      return sendResponse(res, {
        code: 403,
        msg: '系统分类不能修改'
      });
    }

    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();

    return sendResponse(res, {
      code: 200,
      msg: '更新成功',
      data: { category }
    });
  } catch (error) {
    console.error('更新分类失败:', error);
    return sendResponse(res, {
      code: 500,
      msg: '更新分类失败'
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
      return sendResponse(res, {
        code: 404,
        msg: '分类不存在或无权限删除'
      });
    }

    if (category.isSystem) {
      return sendResponse(res, {
        code: 403,
        msg: '系统分类不能删除'
      });
    }

    await category.destroy();

    return sendResponse(res, {
      code: 200,
      msg: '删除成功'
    });
  } catch (error) {
    console.error('删除分类失败:', error);
    return sendResponse(res, {
      code: 500,
      msg: '删除分类失败'
    });
  }
};

// 更新分类排序
exports.updateCategoryOrder = async (req, res) => {
  try {
    const { categoryIds } = req.body;
    const userId = req.userId;

    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return sendResponse(res, {
        code: 400,
        msg: '分类ID列表不能为空'
      });
    }

    // 验证所有分类都属于当前用户或系统分类
    const categories = await Category.findAll({
      where: {
        id: categoryIds,
        [Op.or]: [
          { isSystem: true },
          { userId }
        ]
      }
    });

    if (categories.length !== categoryIds.length) {
      return sendResponse(res, {
        code: 403,
        msg: '部分分类不存在或无权限修改'
      });
    }

    // 批量更新排序
    const updatePromises = categoryIds.map((categoryId, index) => {
      return Category.update(
        { sortOrder: index + 1 },
        { where: { id: categoryId } }
      );
    });

    await Promise.all(updatePromises);

    return sendResponse(res, {
      code: 200,
      msg: '排序更新成功'
    });
  } catch (error) {
    console.error('更新分类排序失败:', error);
    return sendResponse(res, {
      code: 500,
      msg: '更新分类排序失败'
    });
  }
};

