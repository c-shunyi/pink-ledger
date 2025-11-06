#!/bin/bash

# Pink Ledger 后端服务部署脚本
# 功能：拉取最新代码，安装依赖，使用PM2重启服务

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目配置
APP_NAME="pink-ledger-node-8860"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_MAIN="src/app.js"

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 切换到项目目录
cd "$APP_DIR"
log_info "当前目录: $APP_DIR"

# 1. 拉取最新代码
log_info "正在拉取最新代码..."
if git pull origin main; then
    log_info "代码拉取成功"
else
    log_error "代码拉取失败"
    exit 1
fi

# 2. 检查依赖是否有更新
log_info "检查并安装依赖..."
if [ -f "package.json" ]; then
    if command -v pnpm &> /dev/null; then
        log_info "使用 pnpm 安装依赖..."
        pnpm install --prod
    else
        log_error "未找到 pnpm"
        exit 1
    fi
    log_info "依赖安装完成"
else
    log_error "未找到 package.json 文件"
    exit 1
fi

# 3. 使用PM2重启应用
log_info "正在重启应用..."

# 检查PM2是否安装
if ! command -v pm2 &> /dev/null; then
    log_error "未找到 PM2，请先安装: pnpm add -g pm2"
    exit 1
fi

# 检查应用是否已经在PM2中运行
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    log_info "应用已存在，正在重启..."
    pm2 restart "$APP_NAME"
else
    log_info "应用不存在，正在启动..."
    pm2 start "$APP_MAIN" --name "$APP_NAME" \
        --time \
        --max-memory-restart 500M \
        --error logs/error.log \
        --output logs/output.log \
        --merge-logs
fi

# 4. 保存PM2配置
pm2 save

# 5. 显示应用状态
log_info "应用状态："
pm2 list
pm2 info "$APP_NAME"

log_info "================================"
log_info "部署完成！"
log_info "================================"
log_info "查看日志: pm2 logs $APP_NAME"
log_info "查看状态: pm2 status"
log_info "停止应用: pm2 stop $APP_NAME"
log_info "重启应用: pm2 restart $APP_NAME"

