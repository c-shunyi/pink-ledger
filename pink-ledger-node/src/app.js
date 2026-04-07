const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { testConnection } = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;
const isAutoInitDatabaseEnabled = process.env.AUTO_INIT_DATABASE === 'true';

// 中间件配置
app.use(cors()); // 跨域支持
app.use(bodyParser.json()); // 解析 JSON 请求体
app.use(bodyParser.urlencoded({ extended: true })); // 解析 URL 编码请求体

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API 路由
app.use('/api', routes);

// 404 处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();

    // 启动服务器
    app.listen(PORT, () => {
      const databaseInitHint = isAutoInitDatabaseEnabled
        ? '容器启动时已自动检查数据库初始化'
        : '首次运行请先执行数据库初始化脚本';
      const databaseInitCommand = isAutoInitDatabaseEnabled
        ? '已自动执行: node scripts/init-database.js'
        : '命令: node scripts/init-database.js';

      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌸 Pink Ledger API Server is running!             ║
║                                                       ║
║   📍 Port: ${PORT}                                    ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}            ║
║   📚 API Documentation: http://localhost:${PORT}/api/health  ║
║                                                       ║
║   ⚠️  提示: ${databaseInitHint}        ║
║      ${databaseInitCommand}             ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 捕获未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
});

// 捕获未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 启动服务器
startServer();

module.exports = app;
