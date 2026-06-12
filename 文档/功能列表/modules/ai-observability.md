# AI 观测 — 功能详情

> 关联原型：`原型/运营/ai观测/index.html`  
> 需求归档：`需求/归档/按模块/ai观测/2026-06-11-初版PRD.md` §3

## 全局框架（P0）

- 复用 xSparkOps Sidebar + 顶栏
- Tab：Dashboard、Tracing（无 Sessions / Users）
- 页头仅标题，**无**全局时间范围、**无**全局搜索
- Workspace 与 Sidebar 联动

## Dashboard

| 功能 | 优先级 | 状态 |
|------|--------|------|
| KPI 卡片（Traces / Sessions / Cost / Latency / Error Rate） | P0 | mock |
| AI 智能观测问答 | P1 | mock |
| Trace 7 天趋势图 | P1 | mock |
| 成本与延迟摘要 | P1 | mock |
| 模型用量排行表 | P1 | mock |
| 看板维度自定义 | P2 | 占位 |

## Tracing 列表

| 功能 | 优先级 | 状态 |
|------|--------|------|
| Observation 级 12 列列表 | P0 | 已实现 |
| Workspace 工具栏筛选 | P0 | 已实现 |
| Show/Hide Filters + 角标 | P0 | 已实现 |
| 列表搜索（IDs/Names、All fields） | P0 | 已实现 |
| 行点击 → 详情抽屉 | P0 | 已实现 |
| 工具栏时间范围 1d/7d | P1 | UI |
| 分页 | P1 | UI |
| AI 观测面板（概览 + 追问） | P1 | mock |
| 自动刷新 / Columns 配置 | P2 | 占位 |

## Filters

- **P0**：Type、Trace Name、Name、Model、Tags、User/Session/Trace ID、Status、Is Root
- **P1**：AI 筛选（中文自然语言）
- **不做**：Level、Environment

## Trace 详情抽屉

| 功能 | 优先级 | 状态 |
|------|--------|------|
| Observation 树 + 树内搜索 | P0/P1 | 已实现 |
| Topology 拓扑图 | P1 | 已实现 |
| 元数据徽章 + Tags | P0/P1 | 已实现 |
| Preview：Input / Output / Token | P0 | 已实现 |
| Scores / Log View | P2 | 占位 |
| 上一条/下一条 / 全屏 | P2 | 占位 |

## 后端依赖

- P0：Observation 上报、列表查询、Trace 详情、Workspace 隔离
- P1：成本计算、AI 分析服务
