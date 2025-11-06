const { sequelize } = require('../config/database');

// 导入模型
const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Transaction = require('./Transaction')(sequelize);

// 定义关联关系
// User 和 Category 的关系
User.hasMany(Category, {
  foreignKey: 'userId',
  as: 'categories',
  onDelete: 'CASCADE'
});
Category.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User 和 Transaction 的关系
User.hasMany(Transaction, {
  foreignKey: 'userId',
  as: 'transactions',
  onDelete: 'CASCADE'
});
Transaction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Category 和 Transaction 的关系
Category.hasMany(Transaction, {
  foreignKey: 'categoryId',
  as: 'transactions',
  onDelete: 'RESTRICT'
});
Transaction.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

// 清理数据库备份表
const cleanupBackupTables = async () => {
  try {
    const [results] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup'"
    );
    
    for (const table of results) {
      await sequelize.query(`DROP TABLE IF EXISTS \`${table.name}\``);
      console.log(`🗑️  已清理备份表: ${table.name}`);
    }
  } catch (error) {
    console.warn('⚠️  清理备份表时出错:', error.message);
  }
};

// 同步数据库（开发环境）
const syncDatabase = async () => {
  try {
    // 首先清理可能存在的备份表
    await cleanupBackupTables();
    
    // 使用更安全的同步方式，避免数据丢失
    // 对于开发环境使用 alter，但增加重试机制
    if (process.env.NODE_ENV === 'development') {
      try {
        await sequelize.sync({ alter: true });
      } catch (alterError) {
        console.warn('⚠️  数据库 alter 模式失败，尝试基础同步模式:', alterError.message);
        // 如果 alter 失败，使用基础同步模式
        await sequelize.sync();
      }
    } else {
      // 生产环境使用安全的同步模式
      await sequelize.sync();
    }
    
    console.log('✅ 数据库模型同步成功');
    
    // 初始化系统分类
    await initSystemCategories();
  } catch (error) {
    console.error('❌ 数据库同步失败:', error);
    throw error;
  }
};

// 初始化系统分类
const initSystemCategories = async () => {
  const systemCategories = [
    // 支出分类
    { name: '餐饮', type: 'expense', icon: '🍽️', color: '#FF6B6B', isSystem: true, userId: null },
    { name: '交通', type: 'expense', icon: '🚗', color: '#4ECDC4', isSystem: true, userId: null },
    { name: '购物', type: 'expense', icon: '🛒', color: '#FFE66D', isSystem: true, userId: null },
    { name: '娱乐', type: 'expense', icon: '🎮', color: '#A8E6CF', isSystem: true, userId: null },
    { name: '医疗', type: 'expense', icon: '💊', color: '#FF8B94', isSystem: true, userId: null },
    { name: '住房', type: 'expense', icon: '🏠', color: '#C7CEEA', isSystem: true, userId: null },
    { name: '学习', type: 'expense', icon: '📚', color: '#FFDAB9', isSystem: true, userId: null },
    { name: '其他支出', type: 'expense', icon: '💸', color: '#B4A7D6', isSystem: true, userId: null },
    
    // 收入分类
    { name: '工资', type: 'income', icon: '💰', color: '#06D6A0', isSystem: true, userId: null },
    { name: '兼职', type: 'income', icon: '💼', color: '#118AB2', isSystem: true, userId: null },
    { name: '投资', type: 'income', icon: '📈', color: '#EF476F', isSystem: true, userId: null },
    { name: '红包', type: 'income', icon: '🧧', color: '#FFD166', isSystem: true, userId: null },
    { name: '其他收入', type: 'income', icon: '💵', color: '#06FFA5', isSystem: true, userId: null }
  ];

  for (const category of systemCategories) {
    await Category.findOrCreate({
      where: { name: category.name, type: category.type, isSystem: true },
      defaults: category
    });
  }

  console.log('✅ 系统分类初始化完成');
};

module.exports = {
  sequelize,
  User,
  Category,
  Transaction,
  syncDatabase
};

