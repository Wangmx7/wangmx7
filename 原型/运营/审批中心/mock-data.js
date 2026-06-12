const APPROVAL_TYPE_LABELS = {
  l3_exec: 'L3级操作',
  platform_publish: '平台发布',
  skillhub_publish: 'Skillhub 发布'
};

const APPROVAL_MOCK = {
  currentUser: '王小明',
  /** 提交前预审演示：尚未提交的草稿 */
  submitDraft: {
    type: 'platform_publish',
    resource: 'finance-assistant',
    resourceType: 'Agent',
    version: '1.0.0',
    workspace: '人工智能实验室',
    detail: {
      publishScope: '人工智能实验室',
      changeLog: '新增财务报表查询 Tool；绑定 finance-mcp-read',
      purpose: '财务部门自助查询报表与指标',
      riskBoundary: '只读财务系统，禁止批量导出'
    }
  },
  items: [
    {
      id: 'apv_01',
      type: 'l3_exec',
      resource: 'ops-assistant',
      resourceType: 'Agent',
      version: null,
      submitter: 'user_2847',
      workspace: '人工智能实验室',
      submittedAt: '2026-06-11 09:12:03',
      waitingDuration: '2h 15m',
      status: 'pending',
      assignedTo: '王小明',
      detail: {
        riskLevel: 'L3',
        workflow: 'incident-triage',
        runInput: '{"task":"分析生产环境 CPU 异常并执行修复脚本"}',
        configSummary: '绑定 MCP: prod-mcp-git, prod-mcp-slack；可写知识库',
        authScope: '允许调用外部 Tool、读写 Workspace 知识库'
      }
    },
    {
      id: 'apv_02',
      type: 'l3_exec',
      resource: 'log-analyzer',
      resourceType: 'Skill',
      version: null,
      submitter: 'user_1093',
      workspace: 'IT 运维 Workspace',
      submittedAt: '2026-06-11 08:45:22',
      waitingDuration: '3h 42m',
      status: 'pending',
      assignedTo: '王小明',
      detail: {
        riskLevel: 'L3',
        workflow: 'batch-log-scan',
        runInput: '{"namespace":"prod","window":"24h"}',
        configSummary: 'Skill 含 kubectl 只读 + 日志聚合',
        authScope: '只读 K8s 日志，禁止写操作'
      }
    },
    {
      id: 'apv_03',
      type: 'platform_publish',
      resource: 'ops-assistant-v2',
      resourceType: 'Agent',
      version: '2.1.0',
      submitter: 'user_1093',
      workspace: '人工智能实验室',
      submittedAt: '2026-06-11 07:30:10',
      waitingDuration: '4h 57m',
      status: 'pending',
      assignedTo: '王小明',
      detail: {
        publishScope: '人工智能实验室',
        changeLog: '新增 RAG 链路；升级 gpt-4o 默认模型',
        aiReview: 'AI 预审通过：Prompt 无敏感词；Tool 权限在 Workspace 策略内',
        purpose: 'IT 运维问答与故障分析',
        riskBoundary: '禁止自动执行写操作类 Tool'
      }
    },
    {
      id: 'apv_kb_01',
      type: 'platform_publish',
      resource: 'test-case-kb',
      resourceType: 'KnowledgeBase',
      version: '1.0.0',
      submitter: '王小明',
      workspace: '人工智能实验室',
      submittedAt: '2026-06-11 10:05:00',
      waitingDuration: '1h 22m',
      status: 'pending',
      assignedTo: '王小明',
      detail: {
        publishScope: '人工智能实验室',
        changeLog: '发布知识库「测试用例知识库」v1.0.0',
        configSummary: '可见范围 private · 文档 17 · 切片 9 · 引用 12',
        aiReview: 'AI 预审：检查可见范围、文档敏感级与 Agent 检索权限配置',
        purpose: '供 Agent / Skill 检索测试用例与验收文档',
        riskBoundary: '仅限 Workspace 内授权调用，禁止全平台公开检索'
      }
    },
    {
      id: 'apv_04',
      type: 'platform_publish',
      resource: 'data-export',
      resourceType: 'Skill',
      version: '1.0.3',
      submitter: 'user_3301',
      workspace: 'Global WorkSpace',
      submittedAt: '2026-06-10 16:20:00',
      waitingDuration: '19h 7m',
      status: 'pending',
      assignedTo: '王小明',
      detail: {
        publishScope: 'Global WorkSpace',
        changeLog: '支持 CSV/JSON 导出模板',
        aiReview: 'AI 预审提示：含 export 能力，建议管理员复核数据范围',
        purpose: '数据集导出与备份',
        riskBoundary: '单次导出上限 1000 行'
      }
    },
    {
      id: 'apv_05',
      type: 'skillhub_publish',
      resource: 'pm-agent',
      resourceType: 'Skill',
      version: '5.0.0',
      submitter: 'user_5521',
      workspace: '全平台',
      submittedAt: '2026-06-11 06:10:45',
      waitingDuration: '6h 16m',
      status: 'pending',
      assignedTo: '王小明',
      detail: {
        category: '项目管理',
        tags: ['敏捷', 'Story 拆分', 'DevOps'],
        hubPreview: { title: 'pm-agent', desc: '敏捷 Story 拆分与 DevOps 任务创建助手' },
        securityScan: '安全扫描通过：无硬编码密钥；依赖包无高危 CVE',
        aiReview: 'AI 审核通过，待平台管理员确认上架范围',
        publishNote: '面向全平台 PM 角色开放'
      }
    },
    {
      id: 'apv_06',
      type: 'skillhub_publish',
      resource: 'code-reviewer',
      resourceType: 'Skill',
      version: '2.2.1',
      submitter: '李开发',
      workspace: '全平台',
      submittedAt: '2026-06-10 14:00:00',
      waitingDuration: '21h 27m',
      status: 'pending',
      assignedTo: '王小明',
      detail: {
        category: '研发效能',
        tags: ['代码审查', '安全'],
        hubPreview: { title: 'code-reviewer', desc: 'PR 安全与规范审查 Skill' },
        securityScan: '扫描通过；建议标注仅用于非生产代码',
        aiReview: 'AI 审核通过',
        publishNote: '上架 Skillhub 公开分类'
      }
    },
    {
      id: 'apv_07',
      type: 'l3_exec',
      resource: 'chat-support',
      resourceType: 'Agent',
      version: null,
      submitter: 'user_5521',
      workspace: 'IT 运维 Workspace',
      submittedAt: '2026-06-09 11:20:00',
      waitingDuration: '—',
      status: 'approved',
      assignedTo: '王小明',
      approver: '王小明',
      approvedAt: '2026-06-09 11:35:00',
      comment: '工单场景已确认，允许执行',
      detail: {
        riskLevel: 'L3',
        workflow: 'ticket-auto-reply',
        runInput: '{"ticket_id":"INC-8821"}',
        configSummary: '客服 Agent，只读工单系统',
        authScope: '只读工单 API'
      }
    },
    {
      id: 'apv_08',
      type: 'platform_publish',
      resource: 'ops-assistant',
      resourceType: 'Agent',
      version: '2.0.0',
      submitter: 'user_2847',
      workspace: '人工智能实验室',
      submittedAt: '2026-06-08 10:00:00',
      waitingDuration: '—',
      status: 'rejected',
      assignedTo: '王小明',
      approver: '王小明',
      approvedAt: '2026-06-08 10:45:00',
      comment: 'MCP 权限范围过大，请缩小后重新提交',
      detail: {
        publishScope: '人工智能实验室',
        changeLog: '初版发布',
        aiReview: 'AI 预审：MCP git 写权限需人工复核',
        purpose: '运维助手',
        riskBoundary: '—'
      }
    },
    {
      id: 'apv_09',
      type: 'skillhub_publish',
      resource: 'legacy-parser',
      resourceType: 'Skill',
      version: '0.9.0',
      submitter: 'user_3301',
      workspace: '全平台',
      submittedAt: '2026-06-07 09:00:00',
      waitingDuration: '—',
      status: 'approved',
      assignedTo: '王小明',
      approver: '王小明',
      approvedAt: '2026-06-07 15:30:00',
      comment: '已上架 Skillhub',
      detail: {
        category: '数据处理',
        tags: ['解析', 'CSV'],
        hubPreview: { title: 'legacy-parser', desc: '旧版日志解析 Skill' },
        securityScan: '通过',
        aiReview: '通过',
        publishNote: '—'
      }
    },
    {
      id: 'apv_10',
      type: 'platform_publish',
      resource: 'test-bot',
      resourceType: 'Agent',
      version: '0.1.0',
      submitter: '王小明',
      workspace: 'Global WorkSpace',
      submittedAt: '2026-06-11 08:00:00',
      waitingDuration: '4h 27m',
      status: 'pending',
      assignedTo: 'admin',
      detail: {
        publishScope: 'Global WorkSpace',
        changeLog: '测试 Agent 草稿',
        aiReview: '待审核',
        purpose: '内部测试',
        riskBoundary: '沙箱环境'
      }
    },
    {
      id: 'apv_11',
      type: 'l3_exec',
      resource: 'data-export',
      resourceType: 'Skill',
      version: null,
      submitter: '王小明',
      workspace: 'Global WorkSpace',
      submittedAt: '2026-06-10 20:00:00',
      waitingDuration: '—',
      status: 'approved',
      assignedTo: 'admin',
      approver: 'admin',
      approvedAt: '2026-06-10 20:15:00',
      comment: '导出范围已限制',
      detail: {
        riskLevel: 'L3',
        workflow: null,
        runInput: '{"dataset":"users","limit":50}',
        configSummary: '导出 Skill L3',
        authScope: '限 50 行'
      }
    },
    {
      id: 'apv_12',
      type: 'skillhub_publish',
      resource: 'my-helper',
      resourceType: 'Skill',
      version: '1.0.0',
      submitter: '王小明',
      workspace: '全平台',
      submittedAt: '2026-06-09 14:00:00',
      waitingDuration: '—',
      status: 'rejected',
      assignedTo: 'admin',
      approver: 'admin',
      approvedAt: '2026-06-09 16:00:00',
      comment: '描述不完整，请补充安全说明',
      detail: {
        category: '通用',
        tags: ['助手'],
        hubPreview: { title: 'my-helper', desc: '个人助手 Skill' },
        securityScan: '需补充',
        aiReview: '未通过：缺少数据处理方式说明',
        publishNote: '—'
      }
    }
  ]
};
