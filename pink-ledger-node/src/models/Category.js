const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
      defaultValue: 'expense',
      comment: '分类类型：income-收入，expense-支出'
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '图标名称'
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '颜色代码'
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否系统分类（系统分类不可删除）'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '用户ID，null表示系统分类，有值表示用户自定义分类'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序顺序，数字越小越靠前'
    }
  }, {
    tableName: 'categories',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['type']
      }
    ]
  });

  return Category;
};

