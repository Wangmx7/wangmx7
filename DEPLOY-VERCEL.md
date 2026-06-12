# Vercel 部署指南（密码门 + 原型 + PRD）

静态站点部署到 Vercel，访问方式与 GitHub Pages 类似：打开链接 → 输入团队密码 → 浏览原型与 PRD。

## 一、推送代码到 GitHub

```powershell
cd "d:\OneDrive - Lenovo\99.个人\Cursor\xSparkOps"
git add .
git commit -m "update: prototype and Vercel config"
git push -u origin main
```

## 二、部署到 Vercel

### 方式 A：CLI（推荐）

```powershell
# 首次需登录（浏览器授权）
npx vercel login

# 预览部署
npx vercel

# 生产部署
npx vercel --prod
```

### 方式 B：Vercel 控制台

1. 打开 [vercel.com/new](https://vercel.com/new)
2. Import GitHub 仓库 `wangmx7/wangmx7`
3. **Root Directory** 留空（仓库根即 xSparkOps 内容）
4. **Framework Preset** 选 Other（无构建）
5. Deploy

后续 `git push main` 可开启 Vercel 自动部署。

## 三、配置访问密码

编辑 [`共享/gate/site-config.js`](共享/gate/site-config.js)：

```javascript
window.XSPARK_SITE = {
  accessPassword: '你的团队密码',
  sessionHours: 24,
  repoSegment: '',        // Vercel 根域名部署留空
  gateEnabled: true
};
```

修改后 commit 并 push（或再次 `npx vercel --prod`）。

## 四、发给同事的链接

| 内容 | 链接 |
|------|------|
| 原型入口 | `https://你的项目.vercel.app/index.html` |
| PRD 文档 | `https://你的项目.vercel.app/prd/index.html` |

同时私信发送访问密码。

## 五、与 GitHub Pages 的差异

| 项 | GitHub Pages | Vercel |
|----|--------------|--------|
| `repoSegment` | 填仓库名，如 `wangmx7` | 留空 `''` |
| 路径前缀 | `user.github.io/仓库名/` | `项目.vercel.app/` |
| 自动部署 | GitHub Actions | Vercel Git 集成或 CLI |

## 六、故障排查

| 问题 | 处理 |
|------|------|
| Sidebar 跳转 404 | 确认 `site-config.js` 中 `repoSegment` 为 `''` |
| PRD 加载失败 | 确认 `需求/归档/` 与 `manifest.json` 已 push |
| 中文路径 404 | 检查 Vercel 项目是否包含完整目录结构 |
