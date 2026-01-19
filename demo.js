/**
 * DMXAPI 对话接口调用示例
 * 功能：使用 gpt-5-mini 模型进行智能对话
 */

const https = require('https');

// ==================== API 配置 ====================

// API 接口地址
const url = "https://www.dmxapi.cn/v1/chat/completions";

// 请求头配置
const headers = {
    "Authorization": "sk-GwTsGxoPmDCsO47P6aT5oF2IWoJS7taY5EL6KNbqrIs2Yo3V",  // 替换为你的 DMXAPI 令牌
    "Content-Type": "application/json"
};

// ==================== 请求参数 ====================

// 构造请求数据
const payload = {
    model: "DeepSeek-V3.2",  // 选择使用的模型
    messages: [
        {
            role: "system",
            content: `
            你是一个账单处理系统，并且只返回JSON数据，不需要标记是什么数据，只要返回JSON`  // 系统提示词：定义 AI 助手的角色
        },
        {
            role: "user",
            content: `
            分类数据为：
            [{type: "餐饮", id: "25"},
            {type: "零食", id: "22"},
            {type: "日用", id: "23"},
            {type: "交通", id: "24"}]
            `
        },
        {
            role: "user",
            content: `
            我的账单是：早餐在麦当劳吃了2个汉堡，花费了25元，然后打车回家花了了了40
            `
        },
        {
            role: "user",
            content: `
            基于分类数据整理账单
            请分类并且返回JSON格式数据
            [{"typeId": xxx, "money": xxx, "remark": xxx}]
            `
        }
    ]
};

// ==================== 发送请求 ====================

const data = JSON.stringify(payload);

const options = {
    method: 'POST',
    headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = https.request(url, options, (res) => {
    let responseData = '';

    // 接收数据
    res.on('data', (chunk) => {
        responseData += chunk;
    });

    // 请求完成
    res.on('end', () => {
        try {
            console.log("=".repeat(50));
            console.log("API 响应结果：");
            console.log("=".repeat(50));
            console.log(JSON.stringify(JSON.parse(responseData), null, 2));
        } catch (error) {
            console.error("❌ 解析响应失败:", error.message);
            console.log("原始响应:", responseData);
        }
    });
});

// 错误处理
req.on('error', (error) => {
    console.error(`❌ 请求失败: ${error.message}`);
});

// 发送请求数据
req.write(data);
req.end();
