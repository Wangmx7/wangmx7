/**
 * AI 智能治理 — 基于 mock 数据的规则化分析（原型）
 */
const AiGovernanceEngine = {
  getContext() {
    const cfg = typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG : {};
    return {
      user: cfg.user?.name || '当前用户',
      workspace: cfg.workspace?.label || '人工智能实验室',
      workspaces: cfg.workspace?.options || ['人工智能实验室', 'IT 运维 Workspace', 'Default Workspace']
    };
  },

  analyze(query, workspaceFilter) {
    const ctx = this.getContext();
    const s = GOV_MOCK.stats;
    const q = (query || '').trim().toLowerCase();
    const wsLabel = workspaceFilter || '全部可见 Workspace';
    const alerts = GOV_MOCK.riskAlerts;
    const highAlerts = alerts.filter(a => a.level === 'high');

    if (!q) {
      return {
        title: '智能治理概览',
        tags: ['安全合规', '权限治理', '使用规范'],
        content: [
          `**权限范围**：${ctx.user} 可审计 **${ctx.workspaces.length}** 个 Workspace（${ctx.workspaces.join('、')}），当前视图：${wsLabel}。`,
          `**本周风险摘要**：高风险事件 **${s.highRisk}** 起；${highAlerts.map(a => a.title).join('、') || '无'}。`,
          `**使用概况**：7 日用户操作 **${GOV_MOCK.auditLogs.length * 42}** 条（mock 缩放），工具调用 **${s.toolCalls.toLocaleString()}** 次（${s.toolCallsTrend}）。`,
          `**治理建议**：`,
          `1. 为 **prod-mcp-git** 配置调用限额与超时熔断（近 24h 失败/超时 4 次）`,
          `2. 对 **export** 类操作启用审批流（user_2847 触发 2 次高风险导出）`,
          `3. 关注 **user_2847** 夜间高频调用，建议设置时段策略或告警阈值`
        ].join('\n\n')
      };
    }

    if (/风险|告警|异常|high|危险/.test(q)) {
      return {
        title: '风险分析',
        tags: ['安全合规'],
        content: [
          `在 ${wsLabel} 下，当前有 **${alerts.length}** 条风险告警。`,
          alerts.map(a => `- **${a.level.toUpperCase()}** · ${a.title}：${a.desc}（${a.workspace}）`).join('\n'),
          `建议优先处理 MCP 连续失败与批量导出类事件，并复核权限变更记录。`
        ].join('\n\n')
      };
    }

    if (/导出|export|泄露|数据/.test(q)) {
      const exports = GOV_MOCK.auditLogs.filter(a => a.action === 'export');
      return {
        title: '导出行为分析',
        tags: ['安全合规', '使用规范'],
        content: [
          `共 **${exports.length}** 条导出记录。`,
          exports.map(e => `- ${e.createdAt} · ${e.user} · ${e.resource}（${e.detail?.format || '—'}，${e.detail?.rows || '—'} 行）· 风险 **${e.risk}**`).join('\n'),
          `建议：对 knowledge 全量导出启用二次审批，并记录导出原因字段为必填。`
        ].join('\n\n')
      };
    }

    if (/mcp|工具|skill|agent|智能体/.test(q)) {
      const tools = GOV_MOCK.toolExecutions;
      const mcpFails = tools.filter(t => t.type === 'MCP' && t.status !== 'success');
      return {
        title: '工具与 MCP 执行分析',
        tags: ['使用规范', '成本优化'],
        content: [
          `工具执行 **${tools.length}** 条（当前 mock 样本）。`,
          `**MCP 问题**：${mcpFails.length} 条失败/超时 — ${mcpFails.map(t => t.resource).join('、') || '无'}。`,
          `**类型分布**：${this.countBy(tools, 'type')}`,
          `建议为 prod-mcp-git 增加健康检查与自动降级，Skill 类调用可合并批处理以降低频率。`
        ].join('\n\n')
      };
    }

    if (/用户|user|谁|活跃/.test(q)) {
      return {
        title: '用户行为分析',
        tags: ['权限治理', '使用规范'],
        content: GOV_MOCK.topUsers.map((u, i) =>
          `${i + 1}. **${u.id}**：${u.ops} 次操作 · 风险 **${u.risk}** · ${u.workspace}`
        ).join('\n') + '\n\n' + `user_2847 操作量与风险均为最高，建议安排使用规范培训或临时限流。`
      };
    }

    if (/合规|审批|权限|policy/.test(q)) {
      return {
        title: '合规与权限建议',
        tags: ['安全合规', '权限治理'],
        content: [
          `近 7 日权限变更 **1** 次（user_3301 提升为管理员）。`,
          `API Key 新建 **1** 次，建议复核 scope 与过期时间。`,
          `**建议策略**：export / api_key.create / permission.change 纳入审批中心；MCP 注册需安全扫描。`
        ].join('\n\n')
      };
    }

    if (/配额|限额|成本|频率/.test(q)) {
      return {
        title: '配额与使用频率',
        tags: ['成本优化', '使用规范'],
        content: [
          `7 日工具调用 **${s.toolCalls.toLocaleString()}**（${s.toolCallsTrend}），Agent 占比最高（42%）。`,
          `夜间调用超基线用户：**user_2847**（47 次 / 夜间窗口）。`,
          `建议：按 Workspace 设置日调用上限；对 MCP 按 Server 配置 QPS 限额。`
        ].join('\n\n')
      };
    }

    return {
      title: '智能分析',
      tags: ['使用规范'],
      content: [
        `已基于 ${wsLabel} 的治理数据理解您的问题：「${query}」`,
        `当前高风险 **${s.highRisk}** 起，工具调用 **${s.toolCalls.toLocaleString()}** 次/7日。`,
        `可尝试：「有哪些风险告警？」「谁导出数据最多？」「MCP 失败原因？」「合规建议有哪些？」`
      ].join('\n\n')
    };
  },

  countBy(rows, key) {
    const map = {};
    rows.forEach(r => { map[r[key]] = (map[r[key]] || 0) + 1; });
    return Object.entries(map).map(([k, v]) => `${k} ${v}`).join('、') || '—';
  },

  formatMarkdown(text) {
    return String(text)
      .split('\n\n')
      .map(p => {
        let line = p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        if (line.startsWith('- ')) {
          return `<p>${line}</p>`;
        }
        if (/^\d+\.\s/.test(line)) {
          return `<p>${line}</p>`;
        }
        return `<p>${line}</p>`;
      })
      .join('');
  }
};
