# 简阅 ADHD (JianRead ADHD)

面向 ADHD 用户的中文网页阅读器，通过智能提取和简化界面帮助用户抓住重点、保持专注。

## 功能特点

- 🎯 **智能重点提取** - 自动识别文章核心段落
- 🌙 **夜间模式** - 深色主题保护眼睛
- 📝 **专注模式** - 隐藏干扰元素
- 🎨 **字体调节** - 自定义字号和行高
- 📊 **阅读进度** - 实时显示阅读进度
- 🔄 **分段阅读** - 按段加载，避免信息过载
- 💾 **历史记录** - 本地保存阅读历史
- 🤖 **AI 提取** - 可选 AI 更准确提取（需配置）

## 安装方法

### 开发模式安装

1. 克隆仓库
```bash
git clone https://github.com/xuxingling55-sketch/adhd-reader.git
cd adhd-reader
```

2. 安装依赖
```bash
npm install
```

3. 构建插件
```bash
npm run build
```

4. 加载到 Chrome
   - 打开 Chrome，访问 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `dist` 文件夹

## 使用方法

### 开始阅读

1. 打开任意中文网页
2. 点击浏览器工具栏中的插件图标
3. 点击"开始阅读"或直接在阅读界面中点击

### 设置

点击插件图标 → "设置"标签页，可以配置：
- 主题（亮色/夜间）
- 字号大小
- 提取模式（规则/AI）
- DeepSeek API Key（AI 模式需要）
- 高亮显示选项

### AI 提取配置（可选）

1. 访问 https://platform.deepseek.com 注册账号
2. 创建 API Key
3. 在插件设置中输入 API Key
4. 选择"AI 提取"模式

## 技术栈

- TypeScript
- Chrome Extension Manifest V3
- Vite
- @mozilla/readability
- segmentit (中文分词)

## 开发

```bash
# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
