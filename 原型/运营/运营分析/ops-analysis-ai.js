const OpsAnalysisAiEngine = {
  getContext(workspace, timeRange, tab) {
    return {
      workspace: workspace || '全部可见 Workspace',
      timeRange: timeRange || '7d',
      tab: tab || 'overview',
      workspaces: typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG.workspace.options : OPS_MOCK.workspaces
    };
  },

  formatMarkdown(text) {
    return String(text)
      .split('\n\n')
      .map(p => `<p>${p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`)
      .join('');
  },

  analyze(query, snapshot, tab) {
    const q = (query || '').trim().toLowerCase();
    const o = snapshot.overview;
    const ctx = this.getContext(snapshot.workspace === '全部可见 Workspace' ? '' : snapshot.workspace, snapshot.timeRange, tab);

    if (!q) {
      return {
        title: '智能运营概览',
        tags: ['成本优化', '用户增长', '流程效率'],
        citedMetrics: ['活跃用户数', '平台总成本', '审批通过率'],
        content: [
          `**权限范围**：当前视图 **${ctx.workspace}** · ${ctx.timeRange}；可见 **${ctx.workspaces.length}** 个 Workspace。`,
          `**本周摘要**：活跃用户 **${o.activeUsers}**（${o.activeUsersTrend}）；总会话 **${o.sessions.toLocaleString()}**；平台成本 **$${o.totalCost}**（${o.totalCostTrend}）；审批通过率 **${o.approvalPassRate}%**。`,
          `**需关注**：${snapshot.alerts.slice(0, 2).map(a => a.title).join('；') || '暂无显著异常'}。`,
          `**运营建议**：`,
          `1. 对 chat 场景启用 embedding 批处理，预计降本 8–12%`,
          `2. 优先消化 Global WorkSpace 审批积压（>24h 共 4 项）`,
          `3. 对 7 日零调用 Skill 做下架或 Skillhub 曝光优化`
        ].join('\n\n')
      };
    }

    if (/成本|费用|花钱|budget|降本/.test(q)) {
      const c = snapshot.cost;
      return {
        title: '成本分析',
        tags: ['成本优化'],
        citedMetrics: ['平台总成本', 'Model 占比', '预算使用率'],
        content: [
          `**${ctx.workspace}** · ${ctx.timeRange} 总成本 **$${c.total}**（${c.totalTrend}），预算已用 **${c.budgetUsage}**。`,
          `**Model 分布**：${c.models.slice(0, 2).map(m => `${m.model} $${m.cost}（${m.share}）`).join('；')}。`,
          `**Workspace**：${c.byWorkspace.map(w => `${w.name} $${w.cost}`).join('、')}。`,
          `**建议**：将非实时对话路由至 qwen-max；合并 embedding 批请求；对 ops-assistant 设置日成本告警阈值。`
        ].join('\n\n')
      };
    }

    if (/用户|活跃|dau|wau|增长|留存/.test(q)) {
      const u = snapshot.usage;
      return {
        title: '用户增长分析',
        tags: ['用户增长'],
        citedMetrics: ['DAU', 'WAU', '人均会话数'],
        content: [
          `DAU **${u.dau}**（${u.dauTrend}），WAU **${u.wau}**，人均会话 **${u.sessionsPerUser}** 次。`,
          `**Adoption 漏斗**：对话 100% → Agent ${u.funnel[1].pct}% → Skill ${u.funnel[2].pct}% → 检索 ${u.funnel[3].pct}%。`,
          `**Top 用户**：${u.topUsers.slice(0, 2).map(t => `${t.user}（${t.calls} 次调用）`).join('、')}。`,
          `**建议**：在对话入口增加 Skill 推荐；对 feature:kb 场景做新手引导提升检索转化。`
        ].join('\n\n')
      };
    }

    if (/资产|agent|skill|闲置|复用|mcp|tool/.test(q)) {
      const a = snapshot.assets;
      const types = a.typeAnalytics || [];
      return {
        title: '资产运营分析',
        tags: ['资产运营'],
        citedMetrics: ['在线 Agent 数', '平均成功率', '闲置资产'],
        content: [
          `在线 Agent **${a.agentCount}**、Skill **${a.skillCount}**、MCP **${a.mcpCount}**；平均成功率 **${a.successRate}**。`,
          `**分类型效能**：${types.map(t => `${t.type} 调用 ${t.calls7d.toLocaleString()} / 成功率 ${t.successRate}% / 成本 ${t.costShare}%`).join('；')}。`,
          `**类型洞察**：MCP 成功率偏低（${types.find(t => t.key === 'mcp')?.successRate || '—'}%），Tool 调用量小但延迟低；Skill 数量最多但闲置 ${types.find(t => t.key === 'skill')?.idleCount || '—'} 个。`,
          `**建议**：下架长期零调用 Skill；将高复用 Skill 上架 Skillhub；对 prod-mcp-git 做健康检查提升 MCP 成功率。`
        ].join('\n\n')
      };
    }

    if (/审批|发布|积压|等待|l3/.test(q)) {
      const ap = snapshot.approval;
      return {
        title: '审批效率分析',
        tags: ['流程效率'],
        citedMetrics: ['待审批数', '平均等待时长', 'L3 占比'],
        content: [
          `待审批 **${ap.pending}** 项，平均等待 **${ap.avgWait}**；本周通过 **${ap.approvedWeek}** / 拒绝 **${ap.rejectedWeek}**。`,
          `**类型分布**：${ap.byType.map(t => `${t.label} ${t.count}`).join('、')}。`,
          `**积压 Top**：${ap.backlog.slice(0, 2).map(b => b.resource).join('、')}。`,
          `**建议**：优先处理含 export 能力发布；L3级操作补充授权说明可缩短审批轮次。`
        ].join('\n\n')
      };
    }

    if (/错误|质量|满意|反馈|guardrail/.test(q)) {
      const qd = snapshot.quality;
      return {
        title: '质量体验分析',
        tags: ['质量体验'],
        citedMetrics: ['平台错误率', '用户满意度', '反馈数'],
        content: [
          `平台错误率 **${qd.errorRate}**，Trace 失败率 **${qd.traceFailRate}**；满意度 **${qd.satisfaction}/5**；反馈 **${qd.feedbackCount}** 条。`,
          `**高频错误**：${qd.topErrors.map(e => `${e.asset}（${e.count} 次）`).join('、')}。`,
          `**建议**：排查 prod-mcp-git 超时；在 AI观测 查看失败 Trace；对低满意度 Session 抽样复盘。`
        ].join('\n\n')
      };
    }

    return {
      title: '智能分析',
      tags: ['用户增长'],
      citedMetrics: ['活跃用户数', '平台总成本'],
      content: [
        `已基于 **${ctx.workspace}** · ${ctx.timeRange} 理解您的问题：「${query}」`,
        `当前 DAU **${snapshot.usage.dau}**，成本 **$${snapshot.cost.total}**，待审批 **${snapshot.approval.pending}** 项。`,
        `可尝试：「哪个 Workspace 成本最高？」「哪些 Skill 闲置？」「审批瓶颈在哪？」`
      ].join('\n\n')
    };
  },

  analyzeTab(query, snapshot, tab) {
    const tabLabels = {
      overview: '平台总览', usage: '使用分析', assets: '资产效能',
      cost: '成本效率', approval: '审批发布', hub: '集市运营', quality: '质量反馈'
    };
    const base = this.analyze(query, snapshot, tab);
    if (tab !== 'overview' && query) {
      base.title = `${tabLabels[tab] || tab} · ${base.title}`;
    }
    return base;
  },

  explainAlert(alert) {
    return alert.aiInsight || '暂无 AI 解读，请查看对应专业模块明细。';
  },

  generateWeeklyReport(snapshot) {
    const o = snapshot.overview;
    return [
      `# 运营周报 · ${snapshot.workspace}`,
      `**周期**：${snapshot.timeRange}`,
      '',
      '## 核心指标',
      `- 活跃用户：${o.activeUsers}（${o.activeUsersTrend}）`,
      `- 总会话：${o.sessions.toLocaleString()}（${o.sessionsTrend}）`,
      `- 平台成本：$${o.totalCost}（${o.totalCostTrend}）`,
      `- 审批通过率：${o.approvalPassRate}%`,
      `- 用户满意度：${o.satisfaction}/5`,
      '',
      '## 需关注',
      ...snapshot.alerts.map(a => `- [${a.severity}] ${a.title}`),
      '',
      '## 建议',
      '1. 优化 chat 场景 Model 路由降本',
      '2. 消化审批积压，优先 export 类发布',
      '3. 清理闲置 Skill，提升 Skillhub 曝光',
      '4. 修复 prod-mcp-git 超时提升成功率',
      '5. 对夜间高频用户配置时段策略'
    ].join('\n');
  }
};
