const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// 创建 SQLite 数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || path.join(__dirname, '../../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  timezone: '+00:00', // 使用 UTC 时区，避免时区问题
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
});

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };

