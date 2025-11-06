# TabBar 图标说明

请在此目录下放置以下图标文件（建议尺寸 81x81px，PNG 格式）：

## 需要的图标

1. **bill.png** - 账单图标（未选中状态）
2. **bill-active.png** - 账单图标（选中状态）
3. **chart.png** - 统计图标（未选中状态）
4. **chart-active.png** - 统计图标（选中状态）
5. **profile.png** - 个人图标（未选中状态）
6. **profile-active.png** - 个人图标（选中状态）

## 图标建议

- 尺寸：81x81px（推荐）或 40x40px
- 格式：PNG（支持透明背景）
- 颜色：
  - 未选中：灰色（#999999）
  - 选中：粉红色（#FF9A9E）

## 图标资源

如果没有图标，可以从以下网站获取：

- [iconfont](https://www.iconfont.cn/) - 阿里巴巴矢量图标库
- [iconpark](https://iconpark.oceanengine.com/) - 字节跳动图标库
- [flaticon](https://www.flaticon.com/) - 免费图标库

## 临时方案

如果暂时没有图标，可以注释掉 `pages.json` 中 tabBar 的图标配置：

```json
{
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "账单"
        // "iconPath": "static/tabbar/bill.png",
        // "selectedIconPath": "static/tabbar/bill-active.png"
      }
    ]
  }
}
```

这样会显示纯文字的 TabBar。

