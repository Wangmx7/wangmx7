# GitHub Pages 部署指南（密码门 + 原型 + PRD）

与 [lichris0580-cloud/test](https://lichris0580-cloud.github.io/test/) 类似：静态站点 + **访问密码**，团队输入密码后可浏览交互原型与 PRD。

## 一、准备 GitHub 仓库

**推荐**：单独建仓库，将 **`xSparkOps` 文件夹内的全部内容** 作为仓库根目录（不要多包一层父目录）。

```powershell
cd "d:\OneDrive - Lenovo\99.个人\Cursor\xSparkOps"
git init
git add .
git commit -m "init: xSparkOps prototype and PRD"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

示例：仓库名 `xsparkops` → 访问地址 `https://你的用户名.github.io/xsparkops/`

## 二、启用 GitHub Pages

1. 打开仓库 **Settings → Pages**
2. **Source** 选择 **GitHub Actions**
3. 推送 `main` 分支后，Actions 工作流 `.github/workflows/deploy-pages.yml` 会自动部署
4. 在 Actions 页查看 **Deploy GitHub Pages** 是否成功

## 三、配置访问密码（必做）

编辑 [`共享/gate/site-config.js`](共享/gate/site-config.js)：

```javascript
window.XSPARK_SITE = {
  accessPassword: '你的团队密码',   // ← 改成仅团队知道的密码
  sessionHours: 24,               // 登录有效 24 小时
  repoSegment: 'xsparkops',       // ← 改成你的 GitHub 仓库名；user.github.io 根站留 ''
  gateEnabled: true
};
```

修改后 `git commit` 并 `git push`，等待 Pages 重新部署。

**本地开发**不想每次输密码：临时设 `gateEnabled: false`。

## 四、发给同事的链接

| 内容 | 链接 |
|------|------|
| 原型入口 | `https://你的用户名.github.io/仓库名/index.html` |
| PRD 文档 | `https://你的用户名.github.io/仓库名/prd/index.html` |

**同时私信发送**：访问密码（不要写在 README 或公开 Issue 里）。

首次打开会看到密码框（与参考站点一致），验证通过后 24 小时内同浏览器免重复输入。

## 五、站点内容说明

- **原型**：根目录 `index.html`，左侧 Sidebar 进入各模块（智能体、知识、审批中心等）
- **PRD**：`prd/index.html` 左侧目录浏览 `需求/归档/按模块/` 下 Markdown
- **新增 PRD**：在 `prd/manifest.json` 增加条目并 push

## 六、安全说明

- 密码写在静态 JS 中，**只能防 casual 访问**，无法防懂技术的用户
- 适合 **内部评审、小团队演示**；勿存放真实密钥或敏感业务数据
- 勿将含密码的 `site-config.js` 提交到公开仓库时可改用 Private 仓库 + 仅邀请协作者

## 七、故障排查

| 问题 | 处理 |
|------|------|
| Sidebar 跳转 404 | 确认 `site-config.js` 中 `repoSegment` 与仓库名一致 |
| PRD 加载失败 | 确认 `需求/归档/` 下 md 已 push；检查 `manifest.json` 路径 |
| 样式错乱 | 确认仓库根目录有 `.nojekyll` |
| 密码框不出现 | 确认各 `index.html` 已引入 `gate.js`；或 `gateEnabled` 为 true |

## 八、更新流程

```powershell
# 改原型 / PRD / 密码后
git add .
git commit -m "update prototype"
git push
# 约 1–3 分钟后 Pages 自动更新
```
