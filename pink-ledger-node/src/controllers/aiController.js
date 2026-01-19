const axios = require('axios');
const { Op } = require('sequelize');
const { Category } = require('../models');
const sendResponse = require('../utils/response');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const buildCategoryData = (categories) => categories.map((cat) => ({
  id: cat.id,
  name: cat.name,
  type: cat.type
}));

const normalizeBills = (bills, categories) => {
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));
  const today = new Date().toISOString().split('T')[0];

  return bills
    .map((bill) => {
      const categoryId = Number(bill.categoryId);
      const category = categoryMap.get(categoryId);
      const amount = Number(bill.amount);
      const date = typeof bill.date === 'string' && DATE_REGEX.test(bill.date)
        ? bill.date
        : today;

      if (!category || !Number.isFinite(amount) || amount <= 0) {
        return null;
      }

      return {
        categoryId,
        type: category.type,
        amount,
        date,
        description: String(bill.description || bill.remark || '').trim()
      };
    })
    .filter(Boolean);
};

// AI 智能解析账单
exports.parseSmartBilling = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.userId;

    if (!text || text.trim().length === 0) {
      return sendResponse(res, {
        code: 400,
        msg: '请输入账单描述'
      });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return sendResponse(res, {
        code: 500,
        msg: '未配置 DEEPSEEK_API_KEY'
      });
    }

    const categories = await Category.findAll({
      where: {
        [Op.or]: [
          { isSystem: true },
          { userId }
        ]
      },
      attributes: ['id', 'name', 'type'],
      order: [['sortOrder', 'ASC']]
    });

    if (categories.length === 0) {
      return sendResponse(res, {
        code: 400,
        msg: '暂无可用分类，请先创建分类'
      });
    }

    const aiResult = await callDeepSeekAPI(text.trim(), buildCategoryData(categories));

    if (!aiResult.success) {
      return sendResponse(res, {
        code: 500,
        msg: aiResult.error || 'AI 解析失败'
      });
    }

    const parsedBills = normalizeBills(aiResult.data, categories);

    if (parsedBills.length === 0) {
      return sendResponse(res, {
        code: 400,
        msg: 'AI 未能识别出有效的账单信息'
      });
    }

    return sendResponse(res, {
      code: 200,
      msg: '解析成功',
      data: { bills: parsedBills }
    });
  } catch (error) {
    console.error('AI 智能解析失败:', error);
    return sendResponse(res, {
      code: 500,
      msg: 'AI 解析失败，请稍后重试'
    });
  }
};

const extractJson = (content) => {
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/i)
    || content.match(/```\s*([\s\S]*?)\s*```/i);
  return jsonMatch ? jsonMatch[1] : content;
};

const callDeepSeekAPI = async (userText, categories) => {
  const apiUrl = process.env.DEEPSEEK_API_URL || 'https://www.dmxapi.cn/v1/chat/completions';
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || 'DeepSeek-V3.2';
  const timeout = parseInt(process.env.DEEPSEEK_TIMEOUT_MS, 10) || 30000;

  const today = new Date().toISOString().split('T')[0];
  const payload = {
    model,
    messages: [
      {
        role: 'system',
        content: `你是一个账单处理系统，只返回 JSON 数据，不需要任何其他文字说明。
今天日期：${today}
规则：
1. 从用户描述中提取所有账单项
2. 每笔账单必须包含：categoryId（分类ID）、amount（金额，正数）、date（交易日期，YYYY-MM-DD）、description（备注）
3. 如果用户未明确日期，date 使用今天（YYYY-MM-DD）
4. 根据分类的 type 字段判断收入还是支出
5. 如果无法识别分类，使用最相近的分类
6. 金额必须是数字，不要包含货币符号
7. 返回格式：[{"categoryId": 数字, "amount": 数字, "date": "YYYY-MM-DD", "description": "字符串"}]`
      },
      {
        role: 'user',
        content: `可用分类数据：\n${JSON.stringify(categories, null, 2)}`
      },
      {
        role: 'user',
        content: `用户账单描述：${userText}`
      },
      {
        role: 'user',
        content: '请解析账单并返回 JSON 数组格式：[{"categoryId": xxx, "amount": xxx, "date": "YYYY-MM-DD", "description": "xxx"}]'
      }
    ],
    temperature: 0.2
  };

  try {
    const response = await axios.post(apiUrl, payload, {
      headers: {
        // 如需 Bearer 前缀，请在环境变量中自行拼接
        Authorization: apiKey,
        'Content-Type': 'application/json'
      },
      timeout
    });

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      return { success: false, error: 'AI 响应格式异常' };
    }

    const jsonText = extractJson(content.trim());
    const parsed = JSON.parse(jsonText);
    const bills = Array.isArray(parsed) ? parsed : parsed?.bills;

    if (!Array.isArray(bills)) {
      return { success: false, error: 'AI 返回数据格式错误' };
    }

    return { success: true, data: bills };
  } catch (error) {
    console.error('调用 AI API 失败:', error?.response?.data || error.message || error);
    return { success: false, error: 'AI 请求失败' };
  }
};
