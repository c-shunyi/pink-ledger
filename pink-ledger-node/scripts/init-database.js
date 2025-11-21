#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * ⚠️  仅用于项目首次初始化
 * 
 * 功能：
 *   - 检查数据库是否已存在
 *   - 如已存在则停止运行，避免误操作
 *   - 如不存在则创建全新数据库并初始化数据
 * 
 * 使用方法：
 *   node scripts/init-database.js [options]
 * 
 * 选项：
 *   --help     显示帮助信息
 */

const fs = require('fs');
const path = require('path');
const { sequelize } = require('../src/config/database');
const { User, Category, Transaction } = require('../src/models');
require('dotenv').config();

// 解析命令行参数
const args = process.argv.slice(2);
const showHelp = args.includes('--help');

// 显示帮助信息
if (showHelp) {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║      🌸 Pink Ledger 数据库初始化脚本                  ║
╚═══════════════════════════════════════════════════════╝

⚠️  注意：此脚本仅用于项目首次初始化！

使用方法：
  node scripts/init-database.js

功能说明：
  1. 检查数据库文件是否已存在
  2. 如果已存在，停止运行（避免误操作）
  3. 如果不存在，创建全新数据库并初始化：
     ✅ 创建所有数据表
     ✅ 初始化系统分类
     ✅ 显示数据库状态

使用场景：
  - ✅ 项目首次部署
  - ✅ 重建开发环境数据库（需先手动删除旧数据库文件）
  - ❌ 不适用于数据库结构更新（会被自动拦截）

示例：
  # 首次初始化
  node scripts/init-database.js

  # 重建数据库（先删除旧文件）
  rm database.sqlite
  node scripts/init-database.js
  `);
  process.exit(0);
}

// 获取数据库文件路径
const getDatabasePath = () => {
  return process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');
};

// 检查数据库文件是否存在
const checkDatabaseExists = () => {
  const dbPath = getDatabasePath();
  return fs.existsSync(dbPath);
};

// 初始化系统分类
const initSystemCategories = async () => {
  console.log('📦 正在初始化系统分类...');
  
  const systemCategories = [
    // 支出分类
    { name: '餐饮', type: 'expense', icon: '🍽️', color: '#FF6B6B', isSystem: true, userId: null, sortOrder: 1 },
    { name: '交通', type: 'expense', icon: '🚗', color: '#4ECDC4', isSystem: true, userId: null, sortOrder: 2 },
    { name: '购物', type: 'expense', icon: '🛒', color: '#FFE66D', isSystem: true, userId: null, sortOrder: 3 },
    { name: '娱乐', type: 'expense', icon: '🎮', color: '#A8E6CF', isSystem: true, userId: null, sortOrder: 4 },
    { name: '医疗', type: 'expense', icon: '💊', color: '#FF8B94', isSystem: true, userId: null, sortOrder: 5 },
    { name: '住房', type: 'expense', icon: '🏠', color: '#C7CEEA', isSystem: true, userId: null, sortOrder: 6 },
    { name: '学习', type: 'expense', icon: '📚', color: '#FFDAB9', isSystem: true, userId: null, sortOrder: 7 },
    { name: '零食', type: 'expense', icon: '🍭', color: '#FFB6D9', isSystem: true, userId: null, sortOrder: 8 },
    { name: '日用', type: 'expense', icon: '🧴', color: '#A0E7E5', isSystem: true, userId: null, sortOrder: 9 },
    { name: '其他支出', type: 'expense', icon: '💸', color: '#B4A7D6', isSystem: true, userId: null, sortOrder: 10 },
    
    // 收入分类
    { name: '工资', type: 'income', icon: '💰', color: '#06D6A0', isSystem: true, userId: null, sortOrder: 1 },
    { name: '兼职', type: 'income', icon: '💼', color: '#118AB2', isSystem: true, userId: null, sortOrder: 2 },
    { name: '投资', type: 'income', icon: '📈', color: '#EF476F', isSystem: true, userId: null, sortOrder: 3 },
    { name: '红包', type: 'income', icon: '🧧', color: '#FFD166', isSystem: true, userId: null, sortOrder: 4 },
    { name: '其他收入', type: 'income', icon: '💵', color: '#06FFA5', isSystem: true, userId: null, sortOrder: 5 }
  ];

  let createdCount = 0;
  let existingCount = 0;
  let updatedCount = 0;

  for (const category of systemCategories) {
    const [categoryInstance, created] = await Category.findOrCreate({
      where: { name: category.name, type: category.type, isSystem: true },
      defaults: category
    });
    
    if (created) {
      createdCount++;
      console.log(`   ✓ 创建分类: ${category.icon} ${category.name}`);
    } else {
      existingCount++;
      // 如果分类已存在但没有 sortOrder，则更新它
      if (categoryInstance.sortOrder === 0 || categoryInstance.sortOrder === null) {
        categoryInstance.sortOrder = category.sortOrder;
        await categoryInstance.save();
        updatedCount++;
        console.log(`   ↻ 更新分类排序: ${category.icon} ${category.name}`);
      }
    }
  }

  console.log(`✅ 系统分类初始化完成 (新建: ${createdCount}, 已存在: ${existingCount}, 更新排序: ${updatedCount})`);
};

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
};

// 创建数据库（全新创建）
const createDatabase = async () => {
  try {
    console.log('🔧 正在创建数据库表结构...');
    
    // 使用 force: true 创建全新的数据库
    await sequelize.sync({ force: true });
    console.log('✅ 数据库表结构创建成功');
    
    return true;
  } catch (error) {
    console.error('❌ 数据库创建失败:', error.message);
    return false;
  }
};

// 显示数据库状态
const showDatabaseStatus = async () => {
  try {
    console.log('\n📊 数据库状态:');
    
    const userCount = await User.count();
    const categoryCount = await Category.count();
    const transactionCount = await Transaction.count();
    
    console.log(`   - 用户数: ${userCount}`);
    console.log(`   - 分类数: ${categoryCount}`);
    console.log(`   - 交易记录数: ${transactionCount}`);
  } catch (error) {
    console.warn('⚠️  无法获取数据库状态:', error.message);
  }
};

// 主函数
const main = async () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║      🌸 Pink Ledger 数据库初始化（首次使用）         ║
╚═══════════════════════════════════════════════════════╝
  `);

  const dbPath = getDatabasePath();
  console.log(`📂 数据库文件路径: ${dbPath}\n`);

  try {
    // 1. 检查数据库是否已存在
    console.log('1️⃣  检查数据库文件...');
    if (checkDatabaseExists()) {
      console.log('');
      console.log('╔═══════════════════════════════════════════════════════╗');
      console.log('║  ⚠️  数据库已存在！                                   ║');
      console.log('╚═══════════════════════════════════════════════════════╝');
      console.log('');
      console.log('检测到数据库文件已存在，无需再次初始化。');
      console.log('');
      console.log('💡 提示：');
      console.log('   - 如果要启动服务器，请直接运行: npm start 或 pnpm start');
      console.log('   - 如果要重建数据库，请先手动删除数据库文件：');
      console.log(`     rm ${dbPath}`);
      console.log('     然后重新运行此脚本');
      console.log('');
      process.exit(0);
    }
    
    console.log('✅ 数据库文件不存在，准备创建...\n');

    // 2. 测试数据库连接
    console.log('2️⃣  测试数据库连接...');
    const connected = await testConnection();
    if (!connected) {
      process.exit(1);
    }

    // 3. 创建数据库表结构
    console.log('\n3️⃣  创建数据库表结构...');
    const created = await createDatabase();
    if (!created) {
      process.exit(1);
    }

    // 4. 初始化系统分类
    console.log('\n4️⃣  初始化系统分类...');
    await initSystemCategories();

    // 5. 显示数据库状态
    await showDatabaseStatus();

    console.log(`
╔═══════════════════════════════════════════════════════╗
║      ✅ 数据库初始化完成！                            ║
║                                                       ║
║      💡 提示：现在可以启动服务器了                    ║
║         命令: npm start 或 pnpm start                 ║
╚═══════════════════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 初始化失败:', error);
    process.exit(1);
  }
};

// 运行主函数
main();

