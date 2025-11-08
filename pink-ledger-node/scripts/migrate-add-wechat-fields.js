/**
 * 数据库迁移脚本 - 添加微信登录字段
 * 
 * 此脚本用于为现有数据库添加微信登录相关字段：
 * - wechat_openid: 微信小程序 openid
 * - wechat_unionid: 微信 unionid
 * - wechat_session_key: 微信会话密钥
 * 
 * 同时将 username 和 password 字段改为可为空（支持纯微信登录用户）
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');

// 检查数据库文件是否存在
const fs = require('fs');
if (!fs.existsSync(dbPath)) {
  console.error('❌ 数据库文件不存在！');
  console.log('请先运行: node scripts/init-database.js');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 无法连接到数据库:', err.message);
    process.exit(1);
  }
  console.log('✅ 已连接到数据库');
});

// 执行迁移
async function migrate() {
  try {
    console.log('\n🔄 开始数据库迁移...\n');

    // 检查字段是否已存在
    const checkField = (fieldName) => {
      return new Promise((resolve, reject) => {
        db.all("PRAGMA table_info(users)", (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          const exists = rows.some(row => row.name === fieldName);
          resolve(exists);
        });
      });
    };

    // 检查 wechat_openid 是否已存在
    const wechatOpenidExists = await checkField('wechat_openid');
    
    if (wechatOpenidExists) {
      console.log('✅ 微信登录字段已存在，无需迁移');
      db.close();
      return;
    }

    console.log('📝 添加微信登录字段...');

    // SQLite 不支持直接修改字段为可空，需要重建表
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        // 1. 创建新表
        db.run(`
          CREATE TABLE users_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            nickname TEXT,
            avatar TEXT,
            wechat_openid TEXT UNIQUE,
            wechat_unionid TEXT,
            wechat_session_key TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
          )
        `, (err) => {
          if (err) {
            reject(err);
            return;
          }
        });

        // 2. 复制数据
        db.run(`
          INSERT INTO users_new (id, username, password, nickname, avatar, createdAt, updatedAt)
          SELECT id, username, password, nickname, avatar, createdAt, updatedAt
          FROM users
        `, (err) => {
          if (err) {
            reject(err);
            return;
          }
        });

        // 3. 删除旧表
        db.run('DROP TABLE users', (err) => {
          if (err) {
            reject(err);
            return;
          }
        });

        // 4. 重命名新表
        db.run('ALTER TABLE users_new RENAME TO users', (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });

    console.log('✅ 微信登录字段添加成功\n');
    console.log('📋 新增字段：');
    console.log('  - wechat_openid: 微信小程序 openid（唯一）');
    console.log('  - wechat_unionid: 微信 unionid');
    console.log('  - wechat_session_key: 微信会话密钥');
    console.log('  - username 和 password 已改为可空（支持纯微信登录）\n');
    console.log('✨ 迁移完成！');

  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    process.exit(1);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('关闭数据库连接时出错:', err.message);
      }
    });
  }
}

// 执行迁移
migrate();

