const AGENT_CAPABILITY_POOL = {
  skills: [
    { id: 'log-analyzer', name: 'log-analyzer', desc: '日志聚合与分析' },
    { id: 'code-reviewer', name: 'code-reviewer', desc: 'PR 代码审查' },
    { id: 'pm-agent', name: 'pm-agent', desc: '敏捷 Story 拆分' },
    { id: 'data-export', name: 'data-export', desc: '数据集导出' }
  ],
  tools: [
    { id: 'web-search', name: 'web-search', desc: '联网搜索' },
    { id: 'sql-query', name: 'sql-query', desc: '只读 SQL 查询' },
    { id: 'k8s-read', name: 'k8s-read', desc: 'K8s 只读' },
    { id: 'ticket-read', name: 'ticket-read', desc: '工单只读' }
  ],
  mcp: [
    { id: 'prod-mcp-git', name: 'prod-mcp-git', desc: 'Git 仓库 MCP' },
    { id: 'prod-mcp-slack', name: 'prod-mcp-slack', desc: 'Slack 通知 MCP' },
    { id: 'finance-mcp-read', name: 'finance-mcp-read', desc: '财务只读 MCP' }
  ],
  knowledgeBases: [
    { id: 'kb-ops-sop', name: '运维 SOP 知识库', desc: '故障处理手册、巡检规范与应急预案', docs: 128 },
    { id: 'kb-finance', name: '财务指标知识库', desc: '报表口径、科目说明与指标定义', docs: 56 },
    { id: 'kb-product', name: '产品文档库', desc: 'PRD、功能说明与用户手册', docs: 210 },
    { id: 'kb-hr', name: 'HR 政策库', desc: '员工手册、福利政策与流程指引', docs: 42 },
    { id: 'kb-dev-wiki', name: '研发 Wiki', desc: '架构设计、API 文档与编码规范', docs: 340 }
  ],
  models: ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet', 'qwen-max'],
  categories: ['运维', '财务', '研发', '客服', '数据分析'],
  autonomyLevels: [
    { id: 'L1', label: 'L1 自动执行', desc: '低风险操作自动执行' },
    { id: 'L2', label: 'L2 通知确认', desc: '执行前通知用户确认' },
    { id: 'L3', label: 'L3 审批拦截', desc: '敏感操作需审批中心放行' }
  ],
  sandboxPolicies: [
    {
      id: 'readonly',
      label: '只读沙箱',
      tag: '最安全',
      desc: '完全隔离的只读运行环境，禁止一切写操作与外部副作用。',
      detail: 'Agent 在隔离沙箱中运行，所有 Tool / MCP 调用强制只读模式。无法修改数据库、文件系统或触发外部 API 写请求。适合纯问答、检索、分析类场景，风险最低。'
    },
    {
      id: 'workspace-rw',
      label: 'Workspace 内读写',
      tag: '推荐',
      desc: '允许在所属 Workspace 范围内读写资源，不可跨空间访问。',
      detail: 'Agent 可读写当前 Workspace 内的知识库、对话上下文与内部资产，但无法访问其他 Workspace 或平台级资源。外部 Tool 调用需通过白名单校验。适合团队协作与知识库增强场景。'
    },
    {
      id: 'limited-api',
      label: '受限外部 API',
      tag: '需审核',
      desc: '经白名单审批后可调用指定外部 API，单次调用有配额限制。',
      detail: 'Agent 可调用预先登记并通过安全评审的外部 API（如财务只读接口、工单查询）。每次调用记录审计日志，设有 QPS 与数据量上限。超出白名单的请求将被拦截。适合需要对接业务系统的场景。'
    },
    {
      id: 'prod-readonly',
      label: '生产只读',
      tag: '运维常用',
      desc: '可连接生产环境进行只读查询，禁止任何变更操作。',
      detail: 'Agent 可连接生产环境的只读数据源（如 K8s 只读、日志查询、监控指标拉取），用于故障诊断与巡检。所有写操作类 Tool 在策略层被强制禁用，L3 操作仍需审批中心放行。适合 IT 运维与 SRE 场景。'
    }
  ]
};

const AGENT_MOCK = {
  items: [
    {
      id: 'agt_01',
      slug: 'ops-assistant',
      name: '运维助手',
      summary: 'IT 运维问答与故障分析，支持 RAG 与只读 K8s Tool',
      category: '运维',
      icon: '🛠',
      workspace: '人工智能实验室',
      owner: 'user_2847',
      status: 'published',
      version: '2.0.0',
      publishedVersion: '2.0.0',
      publishedAt: '2026-06-08 15:00:00',
      updatedAt: '2026-06-10 18:30:00',
      integration: {
        frontend: {
          enabled: true,
          allowedOrigins: 'https://portal.corp.example.com\nhttps://*.internal.example.com',
          theme: 'auto',
          width: '100%',
          height: '640px',
          showHeader: true
        },
        api: {
          enabled: true,
          apiKey: 'xsk_live_agt01_7f3a9c2e',
          rateLimit: '60/min',
          webhookUrl: 'https://portal.corp.example.com/hooks/agent'
        }
      },
      config: {
        model: 'gpt-4o',
        temperature: 0.3,
        systemPrompt: '你是 IT 运维专家，帮助分析故障与给出修复建议。',
        skills: ['log-analyzer'],
        tools: ['k8s-read', 'web-search'],
        mcp: ['prod-mcp-git'],
        knowledgeBases: ['kb-ops-sop'],
        autonomyLevel: 'L2',
        sandboxPolicy: '生产只读'
      },
      publishScope: '人工智能实验室',
      purpose: 'IT 运维问答与故障分析',
      riskBoundary: '禁止自动执行写操作类 Tool'
    },
    {
      id: 'agt_02',
      slug: 'finance-helper',
      name: '财务助手',
      summary: '财务报表查询与指标解读，绑定 finance-mcp-read',
      category: '财务',
      icon: '💰',
      workspace: 'Global WorkSpace',
      owner: '王小明',
      status: 'draft',
      version: '0.1.0',
      updatedAt: '2026-06-11 10:20:00',
      config: {
        model: 'gpt-4o-mini',
        temperature: 0.2,
        systemPrompt: '你是财务分析助手，仅提供只读报表查询。',
        skills: ['data-export'],
        tools: ['sql-query'],
        mcp: ['finance-mcp-read'],
        autonomyLevel: 'L1',
        sandboxPolicy: '只读沙箱'
      },
      publishScope: 'Global WorkSpace',
      purpose: '财务部门自助查询',
      riskBoundary: '只读财务系统，禁止批量导出'
    },
    {
      id: 'agt_03',
      slug: 'chat-support',
      name: '客服 Agent',
      summary: '工单场景自动回复，L3 敏感操作需审批',
      category: '客服',
      icon: '💬',
      workspace: 'IT 运维 Workspace',
      owner: 'user_5521',
      status: 'published',
      version: '1.2.0',
      publishedVersion: '1.2.0',
      publishedAt: '2026-06-09 11:35:00',
      updatedAt: '2026-06-09 14:00:00',
      integration: {
        frontend: {
          enabled: true,
          allowedOrigins: 'https://support.example.com',
          theme: 'light',
          width: '420px',
          height: '720px',
          showHeader: false
        },
        api: {
          enabled: true,
          apiKey: 'xsk_live_agt03_b4e8d1f0',
          rateLimit: '120/min',
          webhookUrl: ''
        }
      },
      config: {
        model: 'gpt-4o',
        temperature: 0.5,
        systemPrompt: '你是客服助手，帮助处理工单与常见问题。',
        skills: [],
        tools: ['ticket-read'],
        mcp: [],
        autonomyLevel: 'L3',
        sandboxPolicy: 'Workspace 内读写'
      },
      publishScope: 'IT 运维 Workspace',
      purpose: '客服工单自动回复',
      riskBoundary: '只读工单 API'
    },
    {
      id: 'agt_04',
      slug: 'data-analyst',
      name: '数据分析师',
      summary: '数据分析与可视化建议，待发布审批中',
      category: '数据分析',
      icon: '📊',
      workspace: '人工智能实验室',
      owner: '王小明',
      status: 'pending_approval',
      version: '1.0.0',
      pendingVersion: '1.0.0',
      approvalId: 'apv_dyn_seed_01',
      submittedAt: '2026-06-11 09:00:00',
      updatedAt: '2026-06-11 09:00:00',
      config: {
        model: 'claude-3-5-sonnet',
        temperature: 0.4,
        systemPrompt: '你是数据分析专家，帮助解读指标与生成洞察。',
        skills: ['data-export'],
        tools: ['sql-query', 'web-search'],
        mcp: [],
        autonomyLevel: 'L2',
        sandboxPolicy: '受限外部 API'
      },
      publishScope: '人工智能实验室',
      changeLog: '初版：SQL 查询 + 导出 Skill',
      purpose: '业务数据分析',
      riskBoundary: '单次查询上限 1000 行',
      configSummary: '模型: claude-3-5-sonnet；自主级别: L2；Skill: data-export；Tool: sql-query, web-search'
    },
    {
      id: 'agt_05',
      slug: 'test-bot',
      name: '测试 Bot',
      summary: '内部测试 Agent，MCP 权限被驳回',
      category: '研发',
      icon: '🧪',
      workspace: 'Global WorkSpace',
      owner: '王小明',
      status: 'rejected',
      version: '0.1.0',
      pendingVersion: '0.1.0',
      approvalId: 'apv_08',
      rejectComment: 'MCP 权限范围过大，请缩小后重新提交',
      updatedAt: '2026-06-08 10:45:00',
      config: {
        model: 'gpt-4o-mini',
        temperature: 0.7,
        systemPrompt: '测试用 Agent',
        skills: [],
        tools: ['k8s-read'],
        mcp: ['prod-mcp-git', 'prod-mcp-slack'],
        autonomyLevel: 'L3',
        sandboxPolicy: '生产只读'
      },
      publishScope: 'Global WorkSpace',
      changeLog: '初版发布',
      purpose: '内部测试',
      riskBoundary: '—'
    }
  ],
  runsByAgentId: {
    agt_01: [
      { id: 'run_101', startedAt: '2026-06-11 08:30:12', trigger: 'chat', inputSummary: '分析 prod 集群 CPU 飙升原因', status: 'succeeded', durationMs: 4520, tokens: 2840, traceId: 'tr_ops_001' },
      { id: 'run_102', startedAt: '2026-06-11 07:15:00', trigger: 'workflow', inputSummary: 'incident-triage 工作流触发', status: 'succeeded', durationMs: 8900, tokens: 5120, traceId: 'tr_ops_002' },
      { id: 'run_103', startedAt: '2026-06-10 16:40:22', trigger: 'playground', inputSummary: '测试 RAG 链路响应', status: 'succeeded', durationMs: 2100, tokens: 980, traceId: 'tr_ops_003' },
      { id: 'run_104', startedAt: '2026-06-10 14:00:00', trigger: 'scheduled', inputSummary: '定时健康检查', status: 'failed', durationMs: 1200, tokens: 450, traceId: 'tr_ops_004' }
    ],
    agt_02: [
      { id: 'run_201', startedAt: '2026-06-11 10:05:00', trigger: 'playground', inputSummary: '查询 Q2 营收同比', status: 'succeeded', durationMs: 1800, tokens: 720, traceId: 'tr_fin_001' }
    ],
    agt_03: [
      { id: 'run_301', startedAt: '2026-06-11 09:12:03', trigger: 'chat', inputSummary: '工单 INC-8821 自动回复', status: 'waiting_approval', durationMs: 0, tokens: 320, traceId: 'tr_chat_001' },
      { id: 'run_302', startedAt: '2026-06-10 11:20:00', trigger: 'chat', inputSummary: '用户咨询退款流程', status: 'succeeded', durationMs: 3200, tokens: 1100, traceId: 'tr_chat_002' },
      { id: 'run_303', startedAt: '2026-06-09 15:00:00', trigger: 'playground', inputSummary: '测试工单模板', status: 'succeeded', durationMs: 1500, tokens: 600, traceId: 'tr_chat_003' }
    ],
    agt_04: [],
    agt_05: [
      { id: 'run_501', startedAt: '2026-06-08 09:30:00', trigger: 'playground', inputSummary: '测试 MCP 连接', status: 'failed', durationMs: 800, tokens: 200, traceId: 'tr_test_001' }
    ]
  },
  versionHistoryByAgentId: {
    agt_01: [
      { version: '2.0.0', status: 'published', publishedAt: '2026-06-08 15:00:00', publisher: 'user_2847', changeLog: '升级 RAG 链路；默认模型 gpt-4o', approvalId: 'apv_hist_01' },
      { version: '1.5.0', status: 'superseded', publishedAt: '2026-05-20 10:00:00', publisher: 'user_2847', changeLog: '新增 log-analyzer Skill', approvalId: 'apv_hist_02' },
      { version: '1.0.0', status: 'superseded', publishedAt: '2026-04-01 09:00:00', publisher: 'user_2847', changeLog: '初版发布', approvalId: 'apv_hist_03' }
    ],
    agt_02: [
      { version: '0.1.0', status: 'draft', publishedAt: '—', publisher: '王小明', changeLog: '草稿：财务查询初版', approvalId: null }
    ],
    agt_03: [
      { version: '1.2.0', status: 'published', publishedAt: '2026-06-09 11:35:00', publisher: 'user_5521', changeLog: '优化工单回复模板', approvalId: 'apv_hist_04' },
      { version: '1.0.0', status: 'superseded', publishedAt: '2026-05-01 14:00:00', publisher: 'user_5521', changeLog: '初版客服 Agent', approvalId: 'apv_hist_05' }
    ],
    agt_04: [
      { version: '1.0.0', status: 'pending_approval', publishedAt: '—', publisher: '王小明', changeLog: '初版：SQL 查询 + 导出 Skill', approvalId: 'apv_dyn_seed_01' }
    ],
    agt_05: [
      { version: '0.1.0', status: 'rejected', publishedAt: '—', publisher: '王小明', changeLog: '初版发布（已驳回）', approvalId: 'apv_08', rejectComment: 'MCP 权限范围过大' }
    ]
  }
};

const AGENT_MOCK_DYNAMIC_APPROVALS = [
  {
    id: 'apv_dyn_seed_01',
    type: 'platform_publish',
    resource: 'data-analyst',
    resourceType: 'Agent',
    version: '1.0.0',
    submitter: '王小明',
    workspace: '人工智能实验室',
    submittedAt: '2026-06-11 09:00:00',
    waitingDuration: '2h',
    status: 'pending',
    assignedTo: '王小明',
    agentId: 'agt_04',
    detail: {
      publishScope: '人工智能实验室',
      changeLog: '初版：SQL 查询 + 导出 Skill',
      aiReview: 'AI 预审：待人工复核 Tool 权限',
      purpose: '业务数据分析',
      riskBoundary: '单次查询上限 1000 行',
      configSummary: '模型: claude-3-5-sonnet；自主级别: L2；Skill: data-export；Tool: sql-query, web-search'
    }
  }
];

AGENT_MOCK.dynamicApprovals = AGENT_MOCK_DYNAMIC_APPROVALS;
