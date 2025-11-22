#!/usr/bin/env node

/**
 * 更新分类图标和颜色脚本
 * 将emoji图标更新为图片路径，并统一背景色
 * 
 * 使用方法：
 *   node scripts/update-category-icons.js
 */

const { sequelize } = require('../src/config/database');
const { Category } = require('../src/models');
require('dotenv').config();

// 统一的背景色
const UNIFIED_COLOR = '#6b72e8';

// 图标映射表：分类名称 -> 图片路径
const iconMapping = {
  // 支出分类
  '餐饮': '/static/category-icon/rice.png',
  '交通': '/static/category-icon/car.png',
  '购物': '/static/category-icon/shopping.png',
  '娱乐': '/static/category-icon/game.png',
  '医疗': '/static/category-icon/others.png',
  '住房': '/static/category-icon/home.png',
  '学习': '/static/category-icon/book.png',
  '零食': '/static/category-icon/candy.png',
  '日用': '/static/category-icon/others.png',
  '其他支出': '/static/category-icon/others.png',
  
  // 收入分类
  '工资': '/static/category-icon/others.png',
  '兼职': '/static/category-icon/others.png',
  '投资': '/static/category-icon/others.png',
  '红包': '/static/category-icon/others.png',
  '其他收入': '/static/category-icon/others.png'
};

// 主函数
const main = async () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║      🌸 Pink Ledger 分类图标更新脚本                  ║
╚═══════════════════════════════════════════════════════╝
  `);

  try {
    // 测试数据库连接
    console.log('1️⃣  测试数据库连接...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 获取所有分类
    console.log('2️⃣  获取所有分类...');
    const categories = await Category.findAll({
      order: [['type', 'ASC'], ['sortOrder', 'ASC']]
    });
    console.log(`✅ 找到 ${categories.length} 个分类\n`);

    // 显示当前分类
    console.log('📋 当前分类列表:');
    console.log('ID\t名称\t\t类型\t\t当前图标');
    console.log('─'.repeat(60));
    categories.forEach(cat => {
      const typeText = cat.type === 'expense' ? '支出' : '收入';
      console.log(`${cat.id}\t${cat.name}\t\t${typeText}\t\t${cat.icon}`);
    });
    console.log('');

    // 更新图标和颜色
    console.log('3️⃣  开始更新图标和颜色...');
    let updatedCount = 0;
    let skippedCount = 0;

    for (const category of categories) {
      const newIcon = iconMapping[category.name];
      
      if (newIcon) {
        const oldIcon = category.icon;
        const oldColor = category.color;
        category.icon = newIcon;
        category.color = UNIFIED_COLOR;
        await category.save();
        updatedCount++;
        console.log(`   ✓ 更新: ${category.name}`);
        console.log(`      图标: ${oldIcon} → ${newIcon}`);
        console.log(`      颜色: ${oldColor} → ${UNIFIED_COLOR}`);
      } else {
        // 即使没有图标映射，也更新颜色
        const oldColor = category.color;
        category.color = UNIFIED_COLOR;
        await category.save();
        skippedCount++;
        console.log(`   ⊘ 跳过图标: ${category.name} (未找到对应图标)`);
        console.log(`      颜色: ${oldColor} → ${UNIFIED_COLOR}`);
      }
    }

    console.log('');
    console.log(`✅ 图标和颜色更新完成！`);
    console.log(`   - 已更新图标: ${updatedCount} 个`);
    console.log(`   - 仅更新颜色: ${skippedCount} 个`);
    console.log(`   - 统一颜色: ${UNIFIED_COLOR}`);

    // 显示更新后的分类
    console.log('\n4️⃣  更新后的分类列表:');
    const updatedCategories = await Category.findAll({
      order: [['type', 'ASC'], ['sortOrder', 'ASC']]
    });
    console.log('ID\t名称\t\t类型\t\t图标\t\t\t\t颜色');
    console.log('─'.repeat(100));
    updatedCategories.forEach(cat => {
      const typeText = cat.type === 'expense' ? '支出' : '收入';
      console.log(`${cat.id}\t${cat.name}\t\t${typeText}\t\t${cat.icon}\t${cat.color}`);
    });

    console.log(`
╔═══════════════════════════════════════════════════════╗
║      ✅ 分类图标和颜色更新完成！                      ║
╚═══════════════════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 更新失败:', error);
    process.exit(1);
  }
};

// 运行主函数
main();
