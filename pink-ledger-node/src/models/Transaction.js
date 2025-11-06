const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '分类ID'
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
      comment: '交易类型：income-收入，expense-支出'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      },
      comment: '金额'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '交易日期'
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '备注'
    },
    accountType: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'cash',
      comment: '账户类型：cash-现金，alipay-支付宝，wechat-微信，bank-银行卡'
    }
  }, {
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['categoryId']
      },
      {
        fields: ['date']
      },
      {
        fields: ['type']
      }
    ]
  });

  return Transaction;
};

