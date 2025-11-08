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

module.exports = {
  sequelize,
  User,
  Category,
  Transaction
};

