const OPS_MOCK = {
  workspaces: ['人工智能实验室', 'IT 运维 Workspace', 'Default Workspace'],

  getScale(workspace) {
    if (!workspace) return 1;
    const map = { '人工智能实验室': 0.52, 'IT 运维 Workspace': 0.28, 'Default Workspace': 0.20 };
    return map[workspace] || 0.33;
  },

  getSnapshot(workspace, timeRange) {
    const s = this.getScale(workspace);
    const tr = timeRange === '30d' ? 1.15 : timeRange === '90d' ? 1.35 : 1;
    const mul = (n) => Math.round(n * s * tr);
    const mulF = (n, d = 2) => +(n * s * tr).toFixed(d);

    return {
      workspace: workspace || '全部可见 Workspace',
      timeRange,
      overview: {
        activeUsers: mul(284),
        activeUsersTrend: '+8.2%',
        sessions: mul(3421),
        sessionsTrend: '+8.1%',
        agentCalls: mul(8920),
        agentCallsTrend: '+11.3%',
        skillCalls: mul(5640),
        skillCallsTrend: '+6.7%',
        totalCost: mulF(284.56),
        totalCostTrend: '+5.2%',
        sessionCost: mulF(0.083, 3),
        sessionCostTrend: '-2.1%',
        approvalPassRate: workspace ? 91 : 87,
        approvalPassRateTrend: '+3pp',
        satisfaction: workspace ? 4.3 : 4.1,
        satisfactionTrend: '+0.2'
      },
      chart: {
        dates: ['06-04', '06-05', '06-06', '06-07', '06-08', '06-09', '06-10'],
        sessions: [420, 480, 450, 520, 560, 490, 510].map(mul),
        cost: [32.1, 38.4, 35.2, 42.8, 45.1, 39.6, 41.2].map(mulF)
      },
      workspaceCompare: [
        { name: '人工智能实验室', sessions: mul(1780), cost: mulF(148.2), users: mul(148) },
        { name: 'IT 运维 Workspace', sessions: mul(960), cost: mulF(79.6), users: mul(82) },
        { name: 'Default Workspace', sessions: mul(681), cost: mulF(56.8), users: mul(54) }
      ],
      healthRadar: [
        { dim: '使用', score: Math.min(95, Math.round(72 * s * 100) / 100 + 20) },
        { dim: '成本', score: Math.round(68 + s * 10) },
        { dim: '质量', score: Math.round(82 - s * 5) },
        { dim: '合规', score: Math.round(88 - (1 - s) * 8) },
        { dim: '审批时效', score: Math.round(74 + s * 12) }
      ],
      alerts: [
        { id: 'a1', severity: 'high', category: '成本', title: '人工智能实验室本周 LLM 成本 +18%', workspace: '人工智能实验室', trend: '+18%', aiInsight: '主因 feature:chat 场景 DAU 上升 40%，gpt-4o 调用占比达 62%。建议对 embedding 批处理合并请求，并将非实时对话降级至 qwen-max。' },
        { id: 'a2', severity: 'high', category: '审批', title: '平台发布审批积压 4 项超 24h', workspace: 'Default Workspace', trend: '4 项', aiInsight: 'data-export Skill 与 test-bot Agent 等待最久。建议管理员优先处理含 export 能力的发布类审批。' },
        { id: 'a3', severity: 'medium', category: '质量', title: 'ops-assistant 错误率升至 2.8%', workspace: '人工智能实验室', trend: '+1.6pp', aiInsight: 'prod-mcp-git 超时占失败 70%。建议在 AI观测 查看 Tool 失败 Trace，并为 MCP 配置熔断。' },
        { id: 'a4', severity: 'medium', category: '资产', title: '12 个 Skill 7 日零调用', workspace: '全平台', trend: '12', aiInsight: '闲置资产集中在 Default Workspace。建议下架或合并至 Skillhub 公开分类提升曝光。' },
        { id: 'a5', severity: 'medium', category: '用户', title: 'user_2847 夜间调用超基线 47 次', workspace: '人工智能实验室', trend: '+47', aiInsight: '夜间窗口调用量为团队均值 3.2 倍。建议设置时段策略或联系 Owner 确认是否为批任务。' }
      ].filter(a => !workspace || a.workspace === workspace || a.workspace === '全平台'),

      usage: {
        dau: mul(186),
        dauTrend: '+6.4%',
        wau: mul(412),
        wauTrend: '+9.1%',
        mau: mul(892),
        mauTrend: '+12.0%',
        sessionsPerUser: (4.2 * (s || 1)).toFixed(1),
        sessionsPerUserTrend: '+0.3',
        newUserPct: '18%',
        newUserPctTrend: '+2pp',
        completionRate: '76%',
        completionRateTrend: '+4pp',
        activeTrend: [120, 132, 128, 145, 152, 148, 156].map(mul),
        funnel: [
          { step: '对话', count: mul(3200), pct: 100 },
          { step: 'Agent 调用', count: mul(8920), pct: 78 },
          { step: 'Skill 调用', count: mul(5640), pct: 52 },
          { step: '知识检索', count: mul(2180), pct: 34 }
        ],
        topUsers: [
          { user: 'user_2847', sessions: mul(28), calls: mul(142), lastActive: '2026-06-11 09:12', workspace: '人工智能实验室' },
          { user: 'user_1093', sessions: mul(15), calls: mul(89), lastActive: '2026-06-11 08:45', workspace: 'IT 运维 Workspace' },
          { user: 'user_5521', sessions: mul(12), calls: mul(67), lastActive: '2026-06-11 07:48', workspace: '人工智能实验室' },
          { user: 'user_3301', sessions: mul(8), calls: mul(41), lastActive: '2026-06-10 16:20', workspace: 'Default Workspace' },
          { user: 'system', sessions: mul(6), calls: mul(38), lastActive: '2026-06-11 07:52', workspace: '人工智能实验室' }
        ],
        topTags: [
          { tag: 'feature:chat', sessions: mul(1240), share: '36%' },
          { tag: 'feature:kb', sessions: mul(680), share: '20%' },
          { tag: 'agent:ops', sessions: mul(520), share: '15%' },
          { tag: 'batch', sessions: mul(310), share: '9%' },
          { tag: 'safety', sessions: mul(180), share: '5%' }
        ]
      },

      assets: {
        agentCount: mul(24),
        skillCount: mul(56),
        mcpCount: mul(12),
        successRate: '94.2%',
        successRateTrend: '+1.1pp',
        typeDist: [
          { type: 'Agent', count: mul(24), pct: 24 },
          { type: 'Skill', count: mul(56), pct: 56 },
          { type: 'MCP', count: mul(12), pct: 12 },
          { type: 'Tool', count: mul(8), pct: 8 }
        ],
        typeAnalytics: [
          {
            type: 'Agent', key: 'agent', count: mul(24), calls7d: mul(8920), successRate: 95,
            avgLatency: '2.1s', costShare: 42, idleCount: mul(2), activeCount: mul(22),
            trend: [820, 910, 880, 1020, 1100, 980, 1050].map(mul),
            top: { name: 'ops-assistant', calls: mul(4521), success: 96 }
          },
          {
            type: 'Skill', key: 'skill', count: mul(56), calls7d: mul(5640), successRate: 97,
            avgLatency: '1.6s', costShare: 28, idleCount: mul(12), activeCount: mul(44),
            trend: [620, 680, 710, 750, 820, 790, 830].map(mul),
            top: { name: 'log-analyzer', calls: mul(2890), success: 98 }
          },
          {
            type: 'MCP', key: 'mcp', count: mul(12), calls7d: mul(2180), successRate: 84,
            avgLatency: '3.4s', costShare: 18, idleCount: mul(3), activeCount: mul(9),
            trend: [240, 280, 310, 290, 350, 320, 390].map(mul),
            top: { name: 'prod-mcp-git', calls: mul(720), success: 82 }
          },
          {
            type: 'Tool', key: 'tool', count: mul(8), calls7d: mul(1240), successRate: 91,
            avgLatency: '0.9s', costShare: 12, idleCount: mul(1), activeCount: mul(7),
            trend: [140, 160, 155, 180, 190, 175, 200].map(mul),
            top: { name: 'tool-call-weather', calls: mul(480), success: 89 }
          }
        ],
        topAssets: [
          { name: 'ops-assistant', calls: mul(4521), success: 96 },
          { name: 'log-analyzer', calls: mul(2890), success: 98 },
          { name: 'chat-support', calls: mul(2102), success: 94 },
          { name: 'data-export', calls: mul(890), success: 88 },
          { name: 'prod-mcp-git', calls: mul(720), success: 82 }
        ],
        idleTrend: [8, 9, 10, 11, 12, 11, 12].map(mul),
        assetRows: [
          { name: 'ops-assistant', type: 'Agent', workspace: '人工智能实验室', calls7d: mul(4521), successRate: '96%', avgLatency: '2.1s', costShare: '28%', status: '活跃' },
          { name: 'log-analyzer', type: 'Skill', workspace: 'IT 运维 Workspace', calls7d: mul(2890), successRate: '98%', avgLatency: '1.4s', costShare: '12%', status: '活跃' },
          { name: 'data-export', type: 'Skill', workspace: 'Default Workspace', calls7d: mul(890), successRate: '88%', avgLatency: '3.2s', costShare: '8%', status: '活跃' },
          { name: 'legacy-parser', type: 'Skill', workspace: 'Default Workspace', calls7d: 0, successRate: '—', avgLatency: '—', costShare: '0%', status: '闲置' },
          { name: 'test-bot', type: 'Agent', workspace: 'Default Workspace', calls7d: mul(12), successRate: '75%', avgLatency: '4.8s', costShare: '1%', status: '低活跃' },
          { name: 'prod-mcp-git', type: 'MCP', workspace: '人工智能实验室', calls7d: mul(720), successRate: '82%', avgLatency: '3.8s', costShare: '9%', status: '活跃' },
          { name: 'tool-call-weather', type: 'Tool', workspace: '人工智能实验室', calls7d: mul(480), successRate: '89%', avgLatency: '0.8s', costShare: '4%', status: '活跃' }
        ].filter(r => !workspace || r.workspace === workspace)
      },

      cost: {
        total: mulF(284.56),
        totalTrend: '+5.2%',
        tokens: (48.92 * s * tr).toFixed(1) + 'M',
        tokensTrend: '+4.8%',
        sessionCost: mulF(0.083, 3),
        sessionCostTrend: '-2.1%',
        unitCost: mulF(0.032, 3),
        unitCostTrend: '-1.4%',
        budgetUsage: Math.min(98, Math.round(72 * s + 15)) + '%',
        budgetUsageTrend: '+6pp',
        costTrend: [32.1, 38.4, 35.2, 42.8, 45.1, 39.6, 41.2].map(mulF),
        byWorkspace: [
          { name: '人工智能实验室', cost: mulF(148.2), pct: 52 },
          { name: 'IT 运维 Workspace', cost: mulF(79.6), pct: 28 },
          { name: 'Default Workspace', cost: mulF(56.8), pct: 20 }
        ],
        byAgent: [
          { name: 'ops-assistant', cost: mulF(79.8), calls: mul(4521) },
          { name: 'chat-support', cost: mulF(42.1), calls: mul(2102) },
          { name: 'log-analyzer', cost: mulF(28.6), calls: mul(2890) }
        ],
        models: [
          { model: 'gpt-4o', traces: mul(4521), tokens: mulF(18.2) + 'M', cost: mulF(142.3), share: '50%', trend: '+6.2%' },
          { model: 'claude-3-5-sonnet', traces: mul(3102), tokens: mulF(12.8) + 'M', cost: mulF(89.4), share: '31%', trend: '+3.1%' },
          { model: 'qwen-max', traces: mul(2890), tokens: mulF(9.4) + 'M', cost: mulF(28.6), share: '10%', trend: '+8.4%' },
          { model: 'text-embedding-3', traces: mul(2334), tokens: mulF(8.5) + 'M', cost: mulF(24.3), share: '9%', trend: '+2.0%' }
        ]
      },

      approval: {
        pending: mul(6),
        pendingTrend: '+2',
        avgWait: '5h 12m',
        avgWaitTrend: '+48m',
        approvedWeek: mul(18),
        approvedWeekTrend: '+4',
        rejectedWeek: mul(3),
        rejectedWeekTrend: '-1',
        l3Ratio: '33%',
        l3RatioTrend: '+5pp',
        byType: [
          { type: 'l3_exec', label: 'L3级操作', count: mul(8) },
          { type: 'platform_publish', label: '平台发布', count: mul(12) },
          { type: 'skillhub_publish', label: 'Skillhub 发布', count: mul(6) }
        ],
        slaDist: [
          { bucket: '<4h', count: mul(14), pct: 52 },
          { bucket: '4-24h', count: mul(8), pct: 30 },
          { bucket: '>24h', count: mul(5), pct: 18 }
        ],
        backlog: [
          { resource: 'data-export', type: '平台发布', waiting: '19h 7m', workspace: 'Default Workspace', submitter: 'user_3301' },
          { resource: 'ops-assistant-v2', type: '平台发布', waiting: '4h 57m', workspace: '人工智能实验室', submitter: 'user_1093' },
          { resource: 'ops-assistant', type: 'L3级操作', waiting: '2h 15m', workspace: '人工智能实验室', submitter: 'user_2847' },
          { resource: 'pm-agent', type: 'Skillhub 发布', waiting: '6h 16m', workspace: '全平台', submitter: 'user_5521' },
          { resource: 'log-analyzer', type: 'L3级操作', waiting: '3h 42m', workspace: 'IT 运维 Workspace', submitter: 'user_1093' }
        ].filter(r => !workspace || r.workspace === workspace || r.workspace === '全平台'),
        recent: [
          { resource: 'chat-support', version: '—', result: '已通过', approver: '王小明', time: '2026-06-09 11:35' },
          { resource: 'ops-assistant', version: '2.0.0', result: '已拒绝', approver: '王小明', time: '2026-06-08 10:45' },
          { resource: 'legacy-parser', version: '0.9.0', result: '已通过', approver: '王小明', time: '2026-06-07 15:30' }
        ]
      },

      hub: {
        skillListings: mul(42),
        skillListingsTrend: '+6',
        agentViews: mul(12840),
        agentViewsTrend: '+14%',
        downloads: mul(892),
        downloadsTrend: '+22%',
        contributors: mul(18),
        contributorsTrend: '+3',
        listingTrend: {
          dates: ['W1', 'W2', 'W3', 'W4'],
          skill: [6, 8, 10, 12].map(mul),
          agent: [2, 3, 4, 5].map(mul)
        },
        categories: [
          { name: '项目管理', count: mul(12), pct: 28 },
          { name: '研发效能', count: mul(10), pct: 24 },
          { name: '数据处理', count: mul(8), pct: 19 },
          { name: '运维', count: mul(7), pct: 17 },
          { name: '通用', count: mul(5), pct: 12 }
        ],
        topSkills: [
          { name: 'pm-agent', category: '项目管理', version: '5.0.0', downloads: mul(284), rating: 4.8, listedAt: '2026-05-20' },
          { name: 'code-reviewer', category: '研发效能', version: '2.2.1', downloads: mul(196), rating: 4.6, listedAt: '2026-05-15' },
          { name: 'legacy-parser', category: '数据处理', version: '0.9.0', downloads: mul(142), rating: 4.2, listedAt: '2026-06-01' },
          { name: 'log-analyzer', category: '运维', version: '1.2.0', downloads: mul(128), rating: 4.7, listedAt: '2026-04-28' }
        ]
      },

      quality: {
        errorRate: (1.2 * (2 - s)).toFixed(1) + '%',
        errorRateTrend: '-0.3pp',
        traceFailRate: (1.8 * (2 - s)).toFixed(1) + '%',
        traceFailRateTrend: '-0.2pp',
        feedbackCount: mul(47),
        feedbackCountTrend: '+12',
        satisfaction: (4.1 + s * 0.2).toFixed(1),
        satisfactionTrend: '+0.2',
        guardrailHits: mul(23),
        guardrailHitsTrend: '+5',
        errorTrend: [1.8, 1.6, 1.5, 1.4, 1.3, 1.2, 1.2].map(v => +(v * (2 - s)).toFixed(1)),
        feedbackCategories: [
          { name: '功能', count: mul(18), pct: 38 },
          { name: '性能', count: mul(12), pct: 26 },
          { name: '安全', count: mul(9), pct: 19 },
          { name: '其他', count: mul(8), pct: 17 }
        ],
        topErrors: [
          { asset: 'ops-assistant', type: 'Agent', count: mul(28), workspace: '人工智能实验室' },
          { asset: 'prod-mcp-git', type: 'MCP', count: mul(18), workspace: '人工智能实验室' },
          { asset: 'data-export', type: 'Skill', count: mul(9), workspace: 'Default Workspace' }
        ].filter(r => !workspace || r.workspace === workspace),
        feedbacks: [
          { user: 'user_2847', category: '性能', summary: '对话响应偶尔超过 5 秒', time: '2026-06-11 08:30' },
          { user: 'user_1093', category: '功能', summary: '希望 log-analyzer 支持更多日志格式', time: '2026-06-10 14:20' },
          { user: 'user_5521', category: '安全', summary: '询问 pm-agent 数据处理方式', time: '2026-06-09 16:00' }
        ]
      }
    };
  }
};
