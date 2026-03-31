# 简阅 ADHD - 设计文档

## 项目概述

**项目名称：** 简阅 ADHD (JianRead ADHD)

**项目类型：** Chrome 浏览器插件

**核心定位：** 面向 ADHD 用户的中文网页阅读器，通过智能提取和简化界面帮助用户抓住重点、保持专注。

**版本：** v1.0

**创建日期：** 2026-03-31

---

## 需求分析

### 用户画像
- ADHD 用户，注意力难以集中，容易被网页中的广告、侧栏等干扰元素分心
- 需要快速抓住文章重点，避免信息过载
- 技术水平一般，希望产品简单易用

### 核心痛点
1. 网页内容过多，难以聚焦重点
2. 干扰元素（广告、评论、侧栏）分散注意力
3. 长文阅读容易疲劳，需要分段和进度提示
4. 阅读偏好因人而异，需要可定制化

---

## 整体架构

### 技术方案

**方案选择：纯浏览器插件**

**选择理由：**
- 用户需求为"无需登录"、"本地保存"，纯插件完全满足
- 部署简单，只需打包上传到 Chrome Web Store
- 开发成本低，维护方便
- CORS 问题可通过让用户在设置中配置解决

### 架构图

```
┌─────────────────────────────────────────────┐
│           Chrome Extension                 │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐    ┌──────────────┐      │
│  │   Popup UI   │    │ Content Page │      │
│  │   (弹出层)   │◄───│ (阅读界面)   │      │
│  │  设置面板    │    │  高亮展示    │      │
│  └──────┬───────┘    └──────┬───────┘      │
│         │                   │              │
│         ▼                   ▼              │
│  ┌─────────────────────────────┐          │
│  │   Background Service Worker │          │
│  │      (后台服务)             │          │
│  │  - 历史记录管理             │          │
│  │  - AI API 调用             │          │
│  │  - 规则提取逻辑           │          │
│  └─────────────────────────────┘          │
│                                             │
└─────────────────────────────────────────────┘
```

### 核心组件

1. **Manifest** - 插件配置文件，声明权限和组件
2. **Content Script** - 注入到网页，提取内容、显示高亮
3. **Popup** - 点击插件图标显示的设置面板
4. **Background** - 后台服务，处理数据持久化和 API 调用
5. **Options** - 完整设置页面

---

## 功能设计

### 1. 内容提取模块

**功能描述：** 识别网页正文，移除干扰元素

**实现方案：**
- 使用 `@mozilla/readability` 库提取正文
- 正则表达式分段（按段落标点符号）
- 移除广告、导航、评论等干扰元素

**边界情况：**
- 网站有反爬虫：显示友好提示，建议用户复制内容
- 无法识别正文：显示原始链接，让用户确认
- 空内容：显示"无法提取内容"
- PDF 等特殊格式：显示"暂不支持此格式"

### 2. 重点提取模块

**2.1 规则提取（默认免费）**

**提取规则：**
- 首段、尾段
- 包含"总结"、"结论"、"总之"等关键词的句子
- 段落长度 > 50 字符的重点段落
- 包含重复关键词（出现 2 次以上）的句子

**2.2 AI 提取（可选）**

**实现方案：**
- 用户自备 DeepSeek API Key
- Prompt: "请提取这篇文章的核心要点，返回段落序号列表，只返回数字，用逗号分隔"
- API 调用失败自动回退到规则提取

**错误处理：**
- API Key 无效：提示用户重新配置
- API 超时：自动回退到规则提取，并提示用户
- 配额用尽：提示用户

### 3. 高亮显示模块

**功能描述：** 在原文基础上叠加绿色高亮层

**交互方式：**
- 默认显示高亮（绿色 #10B981）
- 一键切换显示/隐藏高亮
- 只显示高亮内容（极速模式）
- 滚动时自动定位到下一段高亮

### 4. 专注模式

**功能描述：** 隐藏侧栏、广告、评论区等干扰元素

**实现方式：**
- CSS 隐藏常见干扰元素的类名
- 提供用户自定义 CSS 规则入口

### 5. 主题系统

**主题选项：**
- 亮色模式（默认）
- 夜间模式（深色背景 #1F2937，浅色文字）

### 6. 字体/字号调节

**调节范围：** 14px - 24px，默认 16px

### 7. 阅读进度显示

**显示内容：**
- 已读段落数量 / 总段落数
- 完成百分比
- 进度条可视化

### 8. 分段阅读

**功能描述：** 按段加载，避免信息过载

**交互方式：**
- 默认显示前 3 段
- 滚动到底部自动加载下一段
- "加载全部"按钮一键加载

### 9. 历史记录

**存储位置：** IndexedDB

**存储内容：**
- 文章 URL、标题
- 阅读时间
- 阅读进度

**清理策略：** 自动清理最旧的记录（超过 100 条时）

### 10. 设置面板

**设置项：**
- 主题选择（亮色/夜间）
- 字号调节
- 提取模式（规则/AI）
- DeepSeek API Key 配置
- 高亮显示开关

---

## 界面设计

### 设计原则

- **极简风格** - 大量留白，简洁清爽
- **绿色系主色调** - #10B981（Emerald）
- **高对比度** - 确保文字清晰可读
- **大字号** - 默认 16px，支持调节

### Popup（弹出设置面板）

```
┌─────────────────────────────┐
│  📖 简阅 ADHD              │
├─────────────────────────────┤
│                             │
│  [阅读模式]  [设置]         │
│                             │
│  最近阅读：                 │
│  • 示例文章标题...         │
│  • 另一篇文章...           │
│                             │
│  ┌─────────────────────┐   │
│  │ 输入网址或选择...   │   │
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

### 阅读界面（Content Page）

```
┌─────────────────────────────────────┐
│  [◀ 退出阅读]  [🌙 夜间]  [⚙️ 设置] │
├─────────────────────────────────────┤
│                                     │
│  标题：示例文章标题                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  进度：████░░░░░░░ 30% (3/10段)     │
│                                     │
│  [段落1 - 原文...]                  │
│                                     │
│  [段落2 - 🟢 高亮重点...]           │
│                                     │
│  [段落3 - 原文...]                  │
│                                     │
└─────────────────────────────────────┘
```

---

## 数据结构设计

### 用户设置（localStorage）

```typescript
interface UserSettings {
  theme: 'light' | 'dark';        // 主题
  fontSize: number;               // 字号 14-24
  extractMode: 'rule' | 'ai';     // 提取模式
  showHighlight: boolean;         // 显示高亮
  highlightOnly: boolean;         // 只显示高亮
  apiKey?: string;                // DeepSeek API Key
}
```

### 历史记录（IndexedDB）

```typescript
interface Article {
  id: string;
  url: string;
  title: string;
  content: string[];              // 分段内容
  highlights: number[];           // 高亮段落索引
  readAt: number;                // 阅读时间
  readProgress: number;          // 阅读进度百分比
}
```

### AI API 调用

```typescript
interface AIExtractRequest {
  apiKey: string;
  paragraphs: string[];          // 文章段落
}

interface AIExtractResponse {
  highlightIndices: number[];    // 需要高亮的段落索引
}
```

---

## 技术实现

### 技术栈

- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Chrome Extension Manifest V3** - 插件标准
- **@mozilla/readability** - 内容提取
- **segmentit** - 中文分词

### 项目结构

```
adhd-reader/
├── manifest.json          # 插件配置
├── background/
│   └── service-worker.ts  # 后台服务
├── content/
│   ├── content.ts         # 内容注入脚本
│   ├── styles.css         # 阅读界面样式
│   └── extractor.ts       # 内容提取逻辑
├── popup/
│   ├── popup.html
│   ├── popup.ts
│   └── popup.css
├── options/
│   ├── options.html
│   ├── options.ts
│   └── options.css
├── shared/
│   ├── storage.ts         # 存储封装
│   └── types.ts           # 类型定义
└── dist/                  # 打包输出
```

### 关键实现细节

**1. Content Script 注入**

```typescript
// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContent') {
    const content = extractContent();
    const highlights = extractHighlights(content);
    sendResponse({ content, highlights });
  }
});
```

**2. 重点高亮叠加**

```typescript
function overlayHighlights(content: string[], highlights: number[]): void {
  content.forEach((paragraph, index) => {
    if (highlights.includes(index)) {
      addHighlightClass(paragraph);
    }
  });
}
```

**3. 存储封装**

```typescript
class StorageManager {
  async getSettings(): Promise<UserSettings> {
    return JSON.parse(localStorage.getItem('settings') || '{}');
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    localStorage.setItem('settings', JSON.stringify(settings));
  }
}
```

---

## 部署方案

### 开发阶段

1. 使用 Chrome 开发者模式加载未打包插件
2. 使用 `vite build` 热重载便于调试

### 发布阶段

1. 打包为 `.crx` 文件
2. 上传到 Chrome Web Store
3. 审核通过后用户可安装

### 更新维护

1. 通过 manifest 中的 version 字段控制版本
2. Chrome Store 自动更新机制

---

## 错误处理

### 1. 网页抓取失败
- **网站有反爬虫**：显示友好提示，建议用户复制内容
- **无法识别正文**：显示原始链接，让用户确认是否继续

### 2. AI API 调用失败
- **API Key 无效**：提示用户重新配置
- **API 超时**：自动回退到规则提取，并提示用户
- **配额用尽**：提示用户

### 3. 数据存储限制
- **localStorage 满**：自动清理最旧的历史记录
- **IndexedDB 失败**：降级到 localStorage（只存最近10篇）

### 4. 边界情况处理
- **空内容**：显示"无法提取内容"
- **内容过长**：提示并分段加载
- **特殊网站（如 PDF）**：显示"暂不支持此格式"

---

## 测试策略

### 功能测试

- ✅ 不同类型网页的内容提取
- ✅ 规则提取和 AI 提取的正确性
- ✅ 高亮显示的准确性
- ✅ 主题切换
- ✅ 字号调节
- ✅ 历史记录的存储和读取

### 兼容性测试

- ✅ Chrome 浏览器（主要）
- ✅ Edge 浏览器（Chromium 内核）

### 性能测试

- ✅ 长文章加载时间
- ✅ 大量历史记录的查询性能

---

## 后续扩展（可选）

1. **多浏览器支持** - Firefox、Safari
2. **云端同步** - 可选的跨设备同步服务
3. **朗读功能** - 浏览器内置语音或第三方语音服务
4. **词高亮/翻译** - 双击单词高亮翻译
5. **社区贡献** - 开源到 GitHub

---

## 项目时间表

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| 第1周 | 项目搭建、内容提取模块 | 3 天 |
| 第1-2周 | 重点提取、高亮显示 | 4 天 |
| 第2周 | UI 界面、主题系统 | 3 天 |
| 第2周 | 历史记录、设置面板 | 3 天 |
| 第3周 | 测试、优化、打包发布 | 4 天 |

**总计：约 2-3 周**

---

## 附录

### 参考资料

- [Chrome Extension 开发文档](https://developer.chrome.com/docs/extensions/)
- [Readability 算法](https://github.com/mozilla/readability)
- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)

### 联系方式

如有问题或建议，请通过 GitHub Issues 反馈。
