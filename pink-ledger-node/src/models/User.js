const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: [6, 255]
      }
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    // 微信登录相关字段
    wechat_openid: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      comment: '微信小程序 openid'
    },
    wechat_unionid: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '微信 unionid'
    },
    wechat_session_key: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '微信会话密钥'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      // 密码加密钩子
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // 实例方法：验证密码
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  // 实例方法：返回安全的用户信息（排除密码）
  User.prototype.toSafeObject = function() {
    return {
      id: this.id,
      username: this.username,
      nickname: this.nickname,
      avatar: this.avatar,
      wechat_openid: this.wechat_openid,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  };

  return User;
};

