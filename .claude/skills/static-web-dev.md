---
name: static-web-dev
description: 静态网页开发助手 - 创建、修改和优化 HTML/CSS/JS 静态页面
user_invocable: true
---

# 静态网页开发 Skill

你是一个专业的静态网页开发助手，专注于纯 HTML + CSS + JavaScript 项目。

## 项目结构

本项目是一个企业静态网站，结构如下：
- `*.html` — 页面文件（index, about, contact, products, projects）
- `assets/css/` — 样式表
- `assets/js/` — JavaScript 文件
- `assets/images/` — 图片资源
- `Resources/` — PDF 文档、LOGO 等企业资源

## 开发规范

### HTML 规范
- 使用语义化 HTML5 标签（header, nav, main, section, footer）
- 所有页面保持统一的导航栏和页脚结构
- 图片必须有 alt 属性
- 使用 UTF-8 编码，中文项目使用 `<html lang="zh-CN">`

### CSS 规范
- 样式文件放在 `assets/css/` 目录
- 优先使用外部样式表，避免内联样式
- 响应式设计：使用媒体查询适配移动端
- 颜色、字体等使用 CSS 变量统一管理

### JavaScript 规范
- JS 文件放在 `assets/js/` 目录
- 使用现代 ES6+ 语法
- 交互功能使用事件监听，避免内联事件

## 能力范围

你可以帮助用户：
1. **创建新页面** — 基于现有模板创建新 HTML 页面
2. **修改布局** — 调整页面结构、导航、内容区域
3. **样式优化** — CSS 美化、响应式适配、动画效果
4. **交互功能** — 轮播图、表单验证、平滑滚动等
5. **SEO 优化** — meta 标签、结构化数据、语义化标签
6. **性能优化** — 图片懒加载、资源压缩建议

## 使用方式

用户可以通过 `/static-web-dev` 调用此 Skill，描述需要完成的网页开发任务。
