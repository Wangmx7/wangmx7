# xSparkOps 产品原型仓库

全平台 HTML 原型、功能列表、用户手册与需求文档的统一维护目录。

## 快速预览

1. 用浏览器打开根目录 [`index.html`](index.html)，或使用 Live Server 启动仓库根目录
2. 左侧 Sidebar 可导航至各模块；**AI 控制台** 可进入管理后台 / 运维后台
3. **团队在线分享**见 [`DEPLOY-GITHUB-PAGES.md`](DEPLOY-GITHUB-PAGES.md)（GitHub Pages + 访问密码）

## 目录说明

| 目录 | 用途 | 主要维护人 |
|------|------|-----------|
| [`共享/sidebar/`](共享/sidebar/) | 全平台导航壳；菜单与原型路径见 `sidebar-config.js` | PM + 前端 |
| [`原型/`](原型/) | 各模块 HTML/CSS/JS 高保真原型 | 设计 + 前端 |
| [`文档/`](文档/) | **当前有效**的功能列表与用户手册 | PM |
| [`需求/`](需求/) | **历次**需求文档归档（只增不改历史） | PM |

## 维护流程

1. 新需求 → 写入 `需求/归档/按模块/` 或 `需求/归档/按版本/`
2. 更新 `文档/功能列表/index.json` 与对应 `modules/*.md`
3. 修改 `原型/` 下对应模块 HTML
4. 同步 `文档/用户手册/modules/`
5. 必要时更新 `共享/sidebar/sidebar-config.js` 中的 `status` / `page`

## 模块状态（sidebar-config）

- `ready`：可跳转至完整原型页
- `wip`：原型开发中
- `placeholder`：根页占位说明
