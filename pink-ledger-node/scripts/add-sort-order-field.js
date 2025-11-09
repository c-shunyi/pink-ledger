#!/usr/bin/env node

/**
 * 数据库迁移脚本：为分类表添加排序字段
 * 
 * 功能：
 *   - 为 categories 表添加 sortOrder 字段
 *   - 为现有数据设置默认排序值
 * 
 * 使用方法：
 *   node scripts/add-sort-order-field.js
 */

const fs = require('fs');
const path = require('path');
const { sequelize } = require('../src/config/database');
const { Category } = require('../src/models');
require('dotenv').config();

// 获取数据库文件路径（与数据库配置保持一致）
const getDatabasePath = () => {
  // 使用与数据库配置相同的路径计算逻辑
  // 从 src/config/database.js: path.join(__dirname, '../../database.sqlite')
  // 其中 __dirname 是 src/config，所以 ../../ 指向 pink-ledger-node/database.sqlite
  // 在 scripts 目录中，../ 指向 pink-ledger-node/database.sqlite
  return process.env.DB_PATH || path.join(__dirname, '../database.sqlite');
};

// 执行 SQL 迁移
const migrateDatabase = async () => {
  try {
    console.log('🔧 正在添加 sortOrder 字段...');
    
    // 检查字段是否已存在
    const [results] = await sequelize.query(`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='categories'
    `);
    
    if (results.length > 0 && results[0].sql.includes('sortOrder')) {
      console.log('✅ sortOrder 字段已存在，跳过迁移');
      return true;
    }
    
    // 添加 sortOrder 字段
    await sequelize.query(`
      ALTER TABLE categories ADD COLUMN sortOrder INTEGER DEFAULT 0
    `);
    
    console.log('✅ sortOrder 字段添加成功');
    
    // 为现有数据设置排序值
    console.log('🔧 正在为现有分类设置排序值...');
    
    const categories = await Category.findAll({
      order: [['isSystem', 'DESC'], ['createdAt', 'ASC']]
    });
    
    // 按类型分组设置排序
    const expenseCategories = categories.filter(cat => cat.type === 'expense');
    const incomeCategories = categories.filter(cat => cat.type === 'income');
    
    // 更新支出分类排序
    for (let i = 0; i < expenseCategories.length; i++) {
      await expenseCategories[i].update({ sortOrder: i + 1 });
    }
    
    // 更新收入分类排序
    for (let i = 0; i < incomeCategories.length; i++) {
      await incomeCategories[i].update({ sortOrder: i + 1 });
    }
    
    console.log(`✅ 已为 ${categories.length} 个分类设置排序值`);
    
    return true;
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    return false;
  }
};

// 主函数
const main = async () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║      🌸 Pink Ledger 数据库迁移：添加排序字段         ║
╚═══════════════════════════════════════════════════════╝
  `);

  const dbPath = getDatabasePath();
  console.log(`📂 数据库文件路径: ${dbPath}\n`);

  // 检查数据库是否存在
  if (!fs.existsSync(dbPath)) {
    console.log('❌ 数据库文件不存在，请先运行初始化脚本');
    console.log('   命令: node scripts/init-database.js');
    process.exit(1);
  }

  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 执行迁移
    const success = await migrateDatabase();
    
    if (success) {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║      ✅ 数据库迁移完成！                              ║
╚═══════════════════════════════════════════════════════╝
      `);
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ 迁移失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// 运行主函数
main();

