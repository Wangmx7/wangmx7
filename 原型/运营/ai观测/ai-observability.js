/**
 * AI 智能观测 — 基于 mock 数据的规则化分析（原型）
 */
const AiObservabilityEngine = {
  getContext() {
    const cfg = typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG : {};
    return {
      user: cfg.user?.name || '当前用户',
      workspace: cfg.workspace?.label || '人工智能实验室',
      workspaces: cfg.workspace?.options || ['人工智能实验室', 'IT 运维 Workspace', 'Global WorkSpace']
    };
  },

  analyzeDashboard(query) {
    const ctx = this.getContext();
    const s = OBS_MOCK.stats;
    const q = (query || '').trim().toLowerCase();
    const topModel = OBS_MOCK.models[0];

    if (!q) {
      return {
        title: '可观测性概览',
        content: [
          `**权限范围**：${ctx.user} 可查看 Workspace「${ctx.workspace}」下的 Trace、成本与延迟指标。`,
          `**整体健康度**：近 7 日 Trace 量 ${s.traces.toLocaleString()}（${s.tracesTrend}），错误率 **${s.errorRate}%**，平均延迟 **${s.avgLatency}ms**（${s.latencyTrend}），整体运行平稳。`,
          `**成本**：总成本 $${s.totalCost.toFixed(2)}（${s.costTrend}），${topModel.name} 占比最高（$${topModel.cost}，${topModel.traces.toLocaleString()} traces）。`,
          `**建议**：关注 tool-call-weather 类 Tool 超时，并监控 gpt-4o 的 P95 延迟与 Token 用量。`
        ].join('\n\n')
      };
    }

    if (/成本|cost|费用|花钱/.test(q)) {
      return {
        title: '成本分析',
        content: [
          `在「${ctx.workspace}」权限范围内，7 日总成本 **$${s.totalCost.toFixed(2)}**（${s.costTrend}）。`,
          `**模型成本 Top 3**：${OBS_MOCK.models.slice(0, 3).map(m => `${m.name} $${m.cost}`).join('、')}。`,
          `gpt-4o 单次 Trace 平均成本较高，embedding 类任务成本较低。若成本持续上升，建议检查 GENERATION 的 prompt 长度与重复调用。`
        ].join('\n\n')
      };
    }

    if (/错误|失败|error|异常|成功率/.test(q)) {
      return {
        title: '错误与成功率',
        content: [
          `当前 Workspace 错误率 **${s.errorRate}%**，较上周改善 0.3%。`,
          `典型失败：` + '`tool-call-weather`' + `（Tool 超时，user_2847）。`,
          `WARNING 级别事件含 guardrail-check（PII 规则），均已通过。建议为外部 Tool 配置重试与超时告警。`
        ].join('\n\n')
      };
    }

    if (/延迟|latency|ttft|慢|性能/.test(q)) {
      return {
        title: '延迟分析',
        content: [
          `平均延迟 **${s.avgLatency}ms**（${s.latencyTrend}），P95 约 2.8s，TTFT P50 380ms。`,
          `**模型延迟**：${OBS_MOCK.models.map(m => `${m.name} ${m.avgLatency}ms`).join('；')}。`,
          `claude-3-5-sonnet 与 qwen-max 延迟优于 gpt-4o；RAG 链路中 RETRIEVER + GENERATION 串联是主要耗时来源。`
        ].join('\n\n')
      };
    }

    if (/模型|model|gpt|claude|qwen/.test(q)) {
      return {
        title: '模型用量',
        content: OBS_MOCK.models.map((m, i) =>
          `${i + 1}. **${m.name}**：${m.traces.toLocaleString()} traces · ${m.tokens} tokens · $${m.cost} · 均延迟 ${m.avgLatency}ms`
        ).join('\n')
      };
    }

    return {
      title: '智能分析',
      content: [
        `已基于「${ctx.workspace}」的可观测数据理解您的问题：「${query}」`,
        `当前 Trace ${s.traces.toLocaleString()} 条/7日，错误率 ${s.errorRate}%，总成本 $${s.totalCost.toFixed(2)}。`,
        `如需更细分析，可尝试提问：「最近成本为什么上升？」「哪个 Trace 失败最多？」「延迟最高的是哪个模型？」`
      ].join('\n\n')
    };
  },

  analyzeTracing(rows, query, filters) {
    const ctx = this.getContext();
    const ws = filters?.workspace || ctx.workspace;
    const scope = ws ? `Workspace「${ws}」` : '全部 Workspace';
    const q = (query || '').trim().toLowerCase();

    const total = rows.length;
    const okRows = rows.filter(r => r.status === 'ok');
    const errRows = rows.filter(r => r.status === 'error');
    const warnRows = rows.filter(r => r.level === 'WARNING');
    const genRows = rows.filter(r => r.type === 'GENERATION');
    const traceIds = [...new Set(rows.map(r => r.traceId))];

    const avgLatency = total
      ? Math.round(rows.reduce((s, r) => s + (r.latencyMs || 0), 0) / total)
      : 0;

    const overview = [
      `**分析范围**：${scope} · 当前筛选 **${total}** 条 Observation · **${traceIds.length}** 个 Trace`,
      `**成功 / 失败**：成功 **${okRows.length}** 条，失败 **${errRows.length}** 条${warnRows.length ? `，警告 **${warnRows.length}** 条` : ''}，成功率 **${total ? ((okRows.length / total) * 100).toFixed(1) : 0}%**`,
      errRows.length
        ? `**失败明细**：${errRows.map(r => `${r.name}（${r.traceName}）`).join('；')}`
        : '**失败明细**：当前筛选内无失败记录。',
      `**类型分布**：${this.countBy(rows, 'type')}`,
      genRows.length
        ? `**GENERATION TTFT**：平均 ${(genRows.reduce((s, r) => s + (r.ttftMs || 0), 0) / genRows.length / 1000).toFixed(2)}s`
        : '',
      `**平均延迟**：${avgLatency}ms`
    ].filter(Boolean).join('\n\n');

    if (!q) {
      return { title: 'Tracing 成功 / 失败概览', content: overview };
    }

    if (/失败|错误|error|异常|超时|timeout/.test(q)) {
      if (!errRows.length) {
        return { title: '失败分析', content: overview + '\n\n当前筛选条件下未发现失败 Trace，可扩大时间范围或切换 Workspace 查看。' };
      }
      return {
        title: '失败根因分析',
        content: overview + '\n\n' + [
          `**根因推断**：${errRows[0].name} 返回 timeout，metadata 显示 retry=2，属外部 Tool 依赖不可用。`,
          `**影响**：关联 Trace ${errRows[0].traceName}，User ${errRows[0].userId}。`,
          `**建议**：检查 weather-api 可用性，调高超时阈值或增加熔断降级。`
        ].join('\n\n')
      };
    }

    if (/成功|正常|ok|健康/.test(q)) {
      return {
        title: '成功率分析',
        content: overview + '\n\n' + `健康 Trace 以 QA-Chatbot、RAG-Pipeline 为主，GENERATION 与 RETRIEVER 链路完整，无异常中断。`
      };
    }

    if (/延迟|latency|慢|ttft/.test(q)) {
      const slowest = [...rows].sort((a, b) => (b.latencyMs || 0) - (a.latencyMs || 0))[0];
      return {
        title: '延迟分析',
        content: overview + '\n\n' + [
          `**最慢 Observation**：${slowest?.name || '—'}（${this.formatLatency(slowest?.latencyMs)}）`,
          `multi-turn-dialogue 与 tool-call-weather 延迟偏高，Tool 调用是主要瓶颈。`
        ].join('\n\n')
      };
    }

    if (/模型|model|gpt|claude|embedding/.test(q)) {
      const withModel = rows.filter(r => r.model);
      return {
        title: '模型分布',
        content: overview + '\n\n' + (withModel.length
          ? withModel.map(r => `- ${r.model} · ${r.name} · ${r.type}`).join('\n')
          : '当前筛选无模型调用记录。')
      };
    }

    return {
      title: '追问分析',
      content: overview + '\n\n' + [
        `针对「${query}」：在 ${scope} 下，建议结合左侧 Filters 缩小到 ERROR 级别或指定 Trace Name 后再次分析。`,
        `也可提问：「失败原因是什么？」「哪个 Observation 最慢？」「用了哪些模型？」`
      ].join('\n\n')
    };
  },

  countBy(rows, key) {
    const map = {};
    rows.forEach(r => { map[r[key]] = (map[r[key]] || 0) + 1; });
    return Object.entries(map).map(([k, v]) => `${k} ${v}`).join('、') || '—';
  },

  formatLatency(ms) {
    if (ms == null) return '—';
    return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
  },

  formatMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }
};
