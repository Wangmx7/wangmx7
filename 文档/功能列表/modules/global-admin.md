# 全局管理 — 功能详情

> 关联原型：`原型/治理/全局管理/index.html`  
> 可见范围：平台超级管理员 · Global WorkSpace

## 准入与导航（P0）

- 侧边栏「全局管理」仅当 Workspace = `Global WorkSpace` 且用户角色 = `super_admin` 时显示
- 切换到 Global WorkSpace 时，超级管理员自动跳转至全局管理页
- 离开 Global WorkSpace 时，若当前在全局管理页则重定向至知识页

## 平台配置（P0）

顶部 Tab 导航：

| Tab | 状态 |
|-----|------|
| 用户管理 | 已实现 |
| 用户准入 | 占位 |
| 集群资源 | 占位 |
| 全局资产 | 占位 |
| 用户挂载 | 占位 |
| 沙箱运维 | 占位 |
| 角色管理 | 占位 |
| 模型可见性 | 占位 |

### 用户管理

- 搜索用户名、邮箱（回车触发）
- 显示平台用户总数（mock：132 人）
- 用户行：头像、中英文名、邮箱
- 角色下拉样式：管理员 / 普通用户
- 启停开关
- 「配额」操作（原型占位）

## 国际化

- `globalAdmin.configTabs.*`、`globalAdmin.users.*`
- 侧边栏 `sidebar.items.global-admin`
