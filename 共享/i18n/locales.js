var XSPARK_LOCALES = {
  zh: {
    common: {
      lang: { zh: '中文', en: 'English' },
      notify: '通知',
      help: '帮助',
      language: '语言',
      themeSwitch: '主题切换',
      lightMode: '浅色模式',
      profile: '用户信息',
      prototypeNotify: '原型演示：您有 3 条未读通知',
      prototypeHelp: '原型演示：打开帮助中心',
      prototypeDemo: '原型演示：{label}',
      allWorkspaces: 'All Workspaces',
      exportReport: '导出报告',
      exportWeekly: '导出周报',
      vsLastWeek: 'vs 上周',
      wow: '环比上周',
      yoy: '同比（占位）',
      days7: '7d Past 7 days',
      days30: '30d Past 30 days',
      days90: '90d Past 90 days',
      day1: '1d Past 1 day',
      analyze: '智能分析',
      clear: '清除',
      close: '关闭',
      high: '高',
      medium: '中',
      sessions: '会话',
      cost: '成本',
      count: '个',
      active: '活跃',
      idle: '闲置',
      type: '类型',
      recommend: '建议',
      docFeatureList: '功能列表',
      docManual: '用户手册',
      placeholderWip: '{desc}（原型 WIP）',
      placeholderPending: '{desc}（原型待建设）',
      selectMenuHint: '在左侧选择功能模块，查看说明与文档链接；已上线的模块（如 AI 观测、审批中心）将打开完整原型页'
    },
    workspace: {
      aiLab: '人工智能实验室',
      itOps: 'IT 运维 Workspace',
      default: 'Default Workspace',
      global: '全平台',
      allVisible: '全部可见 Workspace'
    },
    sidebar: {
      aiConsole: 'AI 控制台',
      sections: {
        overview: '概览',
        marketplace: '集市',
        assets: '资产',
        operations: '运营',
        governance: '治理'
      },
      items: {
        dashboard: '工作台',
        chat: '对话',
        'agent-hub': 'Agenthub',
        'skill-hub': 'Skillhub',
        agent: '智能体',
        skill: '技能',
        mcp: 'MCP',
        plugin: '插件',
        knowledge: '知识',
        approval: '审批中心',
        'ops-analysis': '运营分析',
        'ai-observability': 'AI观测',
        feedback: '反馈',
        'ai-governance': 'AI治理',
        'workspace-settings': 'Workspace设置'
      },
      aiConsoleOptions: {
        admin: '管理后台',
        ops: '运维后台'
      }
    },
    root: {
      title: 'xSparkOps — AI 原生多智能体协作平台',
      pages: {
        dashboard: { title: '工作台', desc: '一站式查看当前 Workspace 的关键指标、待办与常用入口，快速开始今天的工作' },
        chat: { title: '对话', desc: '与智能体多轮对话，调用 Skill 与工具，完成问答、分析与自动化任务' },
        agent: { title: '智能体', desc: '创建、调试并发布智能体，配置模型、提示词、工具与发布范围' },
        skill: { title: '技能', desc: '编写、测试并发布 Skill，供智能体与工作流复用与组合' },
        mcp: { title: 'MCP', desc: '注册与管理 MCP 服务连接，查看可用性、调用量与健康状态' },
        plugin: { title: '插件', desc: '安装与管理平台插件，扩展对话、资产管理与第三方集成能力' },
        knowledge: { title: '知识', desc: '上传与组织知识库文档，配置检索策略并评测问答效果' },
        'agent-hub': { title: 'Agenthub', desc: '浏览、搜索并安装社区 Agent，也可分享您自研的智能体' },
        'skill-hub': { title: 'Skillhub', desc: '发现与下载 Skill 模板，或将自研 Skill 发布到集市供他人使用' },
        approval: { title: '审批中心', desc: '集中处理待办审批：L3 敏感操作、平台发布与 Skillhub 上架，含 AI 风险总结与预审' },
        'ops-analysis': { title: '运营分析', desc: '汇总使用、资产、成本、审批、集市与质量等指标，一屏掌握平台运营健康度与 AI 运营建议' },
        'ai-observability': { title: 'AI观测', desc: '追踪 LLM 调用全链路，分析 Session 与 Trace，监控 Token 消耗、成本与错误' },
        feedback: { title: '反馈', desc: '收集、分类并跟进用户反馈，跟踪满意度与高频问题' },
        'ai-governance': { title: 'AI治理', desc: '审计用户操作与 Agent/Skill/MCP 工具执行，识别风险并获取 AI 治理建议' },
        'workspace-settings': { title: 'Workspace设置', desc: '管理成员与角色、模型与配额，以及 Workspace 级安全与协作配置' }
      }
    },
    ops: {
      pageTitle: '运营分析 — xSparkOps',
      page: {
        title: '运营分析',
        subtitle: '汇总各 Workspace 的使用、资产、成本、审批、集市与质量指标，用数据驱动运营决策，并获取 AI 运营建议'
      },
      tabs: {
        overview: '平台总览',
        usage: '使用分析',
        assets: '资产效能',
        cost: '成本效率',
        approval: '审批发布',
        hub: '集市运营',
        quality: '质量反馈'
      },
      tabsAria: '运营分析看板',
      ai: {
        title: 'AI 智能运营',
        desc: '基于跨域运营指标，提供业务解读与可执行建议；支持中文自然语言追问。',
        placeholder: '例如：哪个 Workspace 成本增长最快？审批瓶颈在哪？哪些 Skill 复用率低？',
        tabFab: '看板 AI 追问',
        tabAnalyze: '分析',
        weeklyAlert: '原型演示：运营周报预览\n\n',
        exportAlert: '原型演示：导出运营分析报告 PDF'
      },
      kpi: {
        activeUsers: '活跃用户数',
        sessions: '总会话数',
        agentCalls: 'Agent 调用量',
        skillCalls: 'Skill 调用量',
        totalCost: '平台总成本',
        sessionCost: '平均会话成本',
        approvalPassRate: '审批通过率',
        satisfaction: '用户满意度',
        dau: 'DAU',
        wau: 'WAU',
        mau: 'MAU',
        sessionsPerUser: '人均会话',
        newUserPct: '新用户占比',
        completionRate: '对话完成率',
        onlineAgents: '在线 Agent',
        onlineSkills: '在线 Skill',
        mcpConnections: 'MCP 连接',
        avgSuccessRate: '平均成功率',
        totalCostShort: '总成本',
        tokenTotal: 'Token 总量',
        unitCost: '单位成功调用成本',
        budgetUsage: '预算使用率',
        pending: '待审批',
        avgWait: '平均等待',
        approvedWeek: '本周通过',
        rejectedWeek: '本周拒绝',
        l3Ratio: 'L3级操作占比',
        skillListings: 'Skillhub 上架',
        agentViews: 'Agenthub 浏览量',
        downloads: '下载/安装量',
        contributors: '活跃贡献者',
        errorRate: '平台错误率',
        traceFailRate: 'Trace 失败率',
        feedbackCount: '用户反馈数',
        avgSatisfaction: '平均满意度',
        guardrailHits: 'Guardrail 拦截'
      },
      card: {
        usageCostTrend: '使用 × 成本趋势（7 天）',
        sessionsVsCost: '会话 vs 成本 ($)',
        workspaceCompare: 'Workspace 对比',
        healthRadar: '健康度雷达（5 维）',
        alerts: '本周需关注',
        clickAlertAi: '点击行查看 AI 解读',
        activeTrend: '活跃用户趋势',
        adoptionFunnel: '功能 Adoption 漏斗',
        topUsers: 'Top 用户',
        topTags: 'Top 场景 / Tag',
        assetTypeOverview: 'AI 资产类型概览',
        assetTypeSub: 'Agent / Skill / MCP / Tool 四类对比',
        typeCompare: '类型效能对比',
        typeCompareSub: '调用量 vs 成功率',
        typeCostShare: '类型成本占比',
        typeTrend7d: '各类型 7 日调用趋势',
        assetDist: '资产数量分布',
        topAssets: 'Top 资产调用量（全类型）',
        idleAlert: '闲置资产预警（7 日零调用 Skill 数）',
        assetDetail: '资产明细',
        costTrend7d: '成本趋势（7 天）',
        costTopWs: '成本 Top Workspace',
        costTopAgent: '成本 Top Agent',
        modelUsage: 'Model 用量',
        approvalByType: '三类审批量',
        approvalSla: '审批时效分布',
        approvalBacklog: '审批积压 Top 5',
        recentPublish: '近期发布记录',
        listingTrend: '上架趋势（Skill vs Agent）',
        categoryDist: '分类分布',
        hubAssets: '集市资产',
        errorTrend: '错误率趋势',
        feedbackCategory: '反馈分类',
        topErrors: '高频错误 Top Agent/Skill',
        recentFeedback: '近期用户反馈'
      },
      table: {
        level: '级别',
        category: '类别',
        item: '事项',
        trend: '趋势'
      },
      asset: {
        calls7d: '7d 调用',
        successRate: '成功率',
        avgLatency: '平均延迟',
        costShare: '成本占比',
        calls7dCol: '7d 调用量'
      },
      link: {
        observability: '查看 AI观测 明细 →',
        governance: '查看 AI治理 风险 →',
        approval: '查看审批中心 →',
        traceDetail: '查看 Trace 明细 → AI观测',
        approvalCenter: '→ 审批中心',
        governanceLink: '→ AI治理',
        errorTrace: '查看 AI观测 错误 Trace →'
      },
      legend: { sessions: '会话', costX10: '成本×10', skill: 'Skill', agent: 'Agent', calls: '次调用' }
    },
    approval: {
      pageTitle: '审批中心 — xSparkOps',
      page: {
        title: '审批中心',
        subtitle: '查看待办、处理审批并追溯历史；覆盖 L3 敏感操作、平台发布与 Skillhub 上架，支持 AI 风险总结与提交前预审'
      },
      tabs: {
        pending: '待我审批',
        history: '审批历史',
        mine: '我发起的'
      },
      tabsAria: '审批状态',
      types: {
        l3_exec: 'L3级操作',
        platform_publish: '平台发布',
        skillhub_publish: 'Skillhub 发布'
      },
      status: {
        pending: '待审批',
        approved: '已通过',
        rejected: '已拒绝',
        draft: '草稿'
      },
      filter: {
        allTypes: '全部类型',
        resourceType: '资源类型',
        status: '状态',
        pendingHint: '待我审批',
        searchPlaceholder: '搜索资源 / 提交人…',
        empty: 'No results match current filters'
      },
      ai: {
        summary: 'AI 总结',
        riskLevels: { high: '高风险', medium: '中风险', low: '低风险' },
        titles: {
          l3_exec: 'L3 执行风险分析',
          platform_publish_agent: 'Agent 平台发布分析',
          platform_publish_skill: 'Skill 平台发布分析',
          platform_publish_knowledge: '知识库发布分析',
          skillhub_publish: 'Skillhub 上架分析'
        },
        hints: {
          l3_exec: {
            approver: '聚焦 Run 输入范围、Tool 写权限与执行可逆性',
            submitter: '自查是否涉及自动修复/写操作，授权是否最小化',
            viewer: '回顾 L3 敏感执行类审批的风险点'
          },
          platform_publish_agent: {
            approver: '关注 Tool/MCP 权限扩张、模型与 RAG 变更影响',
            submitter: '逐条说明 Agent 配置变更与风险边界',
            viewer: '回顾 Agent 平台发布审批的风险评估'
          },
          platform_publish_skill: {
            approver: '重点核对数据导出范围、依赖 Tool 与调用配额',
            submitter: '说明 Skill 导出上限与禁止场景',
            viewer: '回顾 Skill 平台发布审批的风险评估'
          },
          platform_publish_knowledge: {
            approver: '抽检文档敏感级、可见范围与 Agent 检索授权',
            submitter: '完成文档分级并明确知识库可见范围',
            viewer: '回顾知识库发布审批的风险评估'
          },
          skillhub_publish: {
            approver: '核对安全扫描、集市曝光面与发布说明完整性',
            submitter: '补齐安全材料与 Skillhub 展示说明',
            viewer: '回顾 Skillhub 上架审批的风险评估'
          }
        },
        riskScore: '综合风险分',
        viewFull: '查看完整分析',
        submitPreview: '提交前 AI 预审',
        submitPreviewTitle: '提交前 AI 预审',
        submitPreviewDesc: '模拟发起人在提交审批前的风险自查（原型演示）',
        draft: '待提交草稿',
        backEdit: '返回修改',
        confirmSubmit: '确认提交审批',
        approvedAlert: '原型演示：已通过\n备注：{comment}',
        rejectedAlert: '原型演示：已拒绝\n备注：{comment}',
        submittedAlert: '原型演示：已提交审批\n提交前 AI 总结已随审批单一并送达审批人',
        noComment: '（无）'
      },
      drawer: {
        l3Badge: '级操作 · 需审批',
        runInput: 'Run 输入摘要',
        configSummary: '配置摘要',
        authScope: '授权能力说明',
        publishScope: '发布范围',
        versionChange: '版本 / 变更说明',
        aiReview: 'AI 预审报告',
        purpose: '用途说明',
        riskBoundary: '风险边界',
        categoryTags: '分类 / 标签',
        hubPreview: 'Skillhub 展示预览',
        securityScan: '安全扫描',
        aiResult: 'AI 审核结果',
        publishNote: '发布说明',
        result: '审批结果',
        approver: '审批人',
        comment: '备注',
        submittedAt: '提交时间',
        commentPlaceholder: '审批备注（可选）',
        approve: '通过',
        reject: '拒绝',
        submitter: '提交人',
        viewAgent: '查看智能体配置 →',
        viewKnowledge: '查看知识库 →'
      },
      fields: { type: '类型', resource: '资源', version: '版本' }
    },
    gov: {
      pageTitle: 'AI治理 — xSparkOps',
      page: {
        title: 'AI治理',
        subtitle: '审计用户操作与 Agent/Skill/MCP 工具执行记录，识别高风险行为并获取 AI 治理建议与周报'
      },
      tabs: { overview: '概览', audit: '用户操作', tools: '工具执行' },
      tabsAria: '治理模块',
      ai: {
        title: 'AI 智能治理',
        desc: '基于您有权限的全部 Workspace 数据，提供风险洞察与治理建议；也可输入问题进一步追问。',
        placeholder: '例如：有哪些高风险事件？谁导出数据最多？MCP 失败怎么办？',
        weekly: '生成周报',
        subscribe: '订阅告警'
      },
      kpi: {
        todayOps: '今日操作数',
        highRisk: '高风险事件',
        activeUsers: '活跃用户数',
        toolCalls: '工具调用量'
      }
    },
    knowledge: {
      pageTitle: '知识 — xSparkOps',
      page: {
        title: '知识',
        subtitle: '上传与组织知识库文档，配置检索策略并评测问答效果'
      },
      tabsAria: '知识库范围',
      tabs: {
        all: '全部知识库',
        mine: '我的知识库'
      },
      filterStatus: '知识状态',
      filterScope: '公开范围',
      allStatus: '全部',
      allScope: '全部',
      legendTitle: '公开范围与状态说明',
      scopeSearchPlaceholder: '搜索公开范围',
      scopeSearchEmpty: '无匹配的公开范围',
      searchPlaceholder: '搜索知识库名称 / Workspace',
      allWorkspaces: '全部 Workspace',
      allVisibility: '全部可见范围',
      visibility: '可见范围',
      emptyMine: '您还没有创建知识库，点击右上角创建',
      rejectHint: '驳回原因：{reason}',
      pendingHint: '发布审批进行中',
      sortUpdated: '最近更新',
      create: '创建知识库',
      createAlert: '原型演示：打开创建知识库向导',
      createWizard: {
        title: '创建知识库',
        subtitle: '填写基本信息并设定公开范围，创建后为草稿',
        name: '知识库名称',
        namePlaceholder: '例如：产品 FAQ 知识库',
        description: '描述',
        descPlaceholder: '简要说明用途与文档类型（可选）',
        publishScope: '公开范围',
        scopeLabels: {
          workspace: '不公开',
          public: '公开'
        },
        scopeDesc: {
          workspace: '当前 Workspace 可见，即当前团队成员可检索引用',
          public: '全部 Workspace 可见，即平台级公开'
        },
        slugPreview: '标识：{slug}',
        publicNote: '选择「公开」后，发布时需走审批流程',
        scopeSearchPlaceholder: '搜索公开范围',
        cancel: '取消',
        submit: '创建',
        success: '知识库「{name}」已创建为草稿',
        validationName: '请输入知识库名称',
        validationNameMin: '名称至少 2 个字符',
        validationWorkspace: '请选择 Workspace',
        validationDuplicate: '已存在同名知识库，请更换名称'
      },
      sortAlert: '原型演示：按最近更新排序',
      moreAlert: '原型演示：更多操作菜单',
      docCount: '文档数',
      sliceCount: '切片数',
      refCount: '引用数',
      updated: '更新',
      more: '更多',
      empty: '暂无匹配的知识库',
      editAlert: '原型演示：编辑知识库「{name}」',
      deleteConfirm: '确定删除知识库「{name}」？此操作不可撤销。',
      publishAlert: '原型演示：提交知识库发布审批',
      publishedApproval: '已提交知识库发布审批：{id}',
      viewApprovalPrompt: '是否前往审批中心查看？',
      actions: {
        edit: '编辑',
        publish: '发布',
        republish: '重新发布',
        delete: '删除',
        viewApproval: '查看审批',
        publishedEditAlert: '已发布知识库需先下架或创建新版本后再编辑（原型演示）'
      },
      status: {
        draft: '草稿',
        pending_approval: '待审批',
        published: '已发布',
        rejected: '已驳回'
      },
      statusDesc: {
        draft: '编辑中，未提交发布；仅创建者可见，可自由修改文档与配置',
        pending_approval: '已提交发布审批，等待管理员审核；审批期间不可修改或删除',
        published: '审批已通过，按可见范围对外提供 Agent 检索；变更需重新走发布审批',
        rejected: '发布审批被驳回，需根据意见修改后重新提交'
      },
      scopeDesc: {
        workspace: '当前 Workspace 可见，即当前团队成员可检索引用',
        public: '全部 Workspace 可见，即平台级公开；发布需审批'
      },
      total: '共 {count} 个知识库',
      pageOf: '第 {page} / {total} 页',
      pageSize: '每页条数',
      prev: '上一页',
      next: '下一页',
      tags: {
        workspace: '不公开',
        public: '公开'
      }
    },
    agent: {
      pageTitle: '智能体 — xSparkOps',
      page: {
        title: '智能体',
        subtitle: '创建、调试并发布智能体，配置模型、提示词、工具与发布范围；提交审批后由审批中心放行'
      },
      searchPlaceholder: '搜索 Agent 名称 / slug / Workspace',
      allStatus: '全部',
      create: '创建 Agent',
      empty: '暂无匹配的智能体',
      viewApproval: '查看审批中心 →',
      approvalId: '审批单',
      rejectReason: '驳回原因',
      status: {
        draft: '草稿',
        pending_approval: '待审批',
        published: '已发布',
        rejected: '已驳回'
      },
      fields: {
        slug: '标识 (slug)',
        name: '名称',
        summary: '摘要',
        category: '分类',
        workspace: 'Workspace',
        icon: '图标',
        model: '模型',
        temperature: '温度',
        systemPrompt: '系统提示词',
        startupInstruction: '启动指令',
        outputFormat: '输出要求',
        autonomyLevel: '自主级别',
        sandboxPolicy: '沙箱策略',
        publishScope: '发布范围',
        version: '版本号',
        changeLog: '变更说明',
        purpose: '用途说明',
        riskBoundary: '风险边界',
        knowledgeBase: '知识库'
      },
      actions: {
        edit: '编辑',
        submitApproval: '提交审批',
        viewConfig: '查看配置',
        viewApproval: '查看审批',
        view: '查看',
        viewDetail: '查看详情',
        viewRuns: '执行记录',
        playground: '调试',
        chat: '对话体验',
        clone: '克隆'
      },
      chat: {
        back: '返回列表',
        you: '你',
        send: '发送',
        placeholder: '输入消息，Enter 发送，Shift+Enter 换行…',
        greeting: '你好，我是 {name}。有什么可以帮你的？',
        mockReply: '【{name}】这是原型演示回复。\n\n您说：「{input}」\n\n基于 {model} 生成的示例回答。',
        unpublishedHint: '当前为体验模式：未发布 Agent 可对话预览；对外正式接入需审批通过。',
        viewTrace: '查看 Trace →'
      },
      detail: {
        backToList: '返回列表',
        tabs: {
          config: '配置',
          approval: '审批',
          publish: '发布',
          runs: '执行记录',
          versions: '版本历史'
        },
        approvalStatus: '审批状态',
        submittedAt: '提交时间',
        publishedAt: '发布时间',
        publisher: '发布人',
        versionStatus: '版本状态'
      },
      integration: {
        intro: '配置 Agent 接入外部 Agent 平台或业务系统的集成方式，支持前端页面嵌入与 OpenAI 兼容 API 调用。',
        unpublishedHint: 'Agent 尚未发布：可先预览接入配置，保存与对外调用需审批通过并发布后方可启用。',
        enabled: '启用',
        save: '保存接入配置',
        copied: '已复制到剪贴板',
        saved: '接入配置已保存',
        keyRegenerated: 'API Key 已轮换，请同步更新外部系统',
        copy: '复制',
        docs: '查看接入文档 →',
        frontend: {
          title: '前端嵌入',
          desc: '通过 iframe 或 JS SDK 将对话组件嵌入您的 Web / 门户 / 低代码页面。',
          embedUrl: '嵌入页面 URL',
          theme: '主题',
          themeAuto: '跟随系统',
          themeLight: '浅色',
          themeDark: '深色',
          size: '默认尺寸',
          origins: '允许嵌入域名（CORS / postMessage）',
          originsPh: '每行一个域名，支持通配符，如 https://*.example.com',
          showHeader: '显示 Agent 标题栏',
          iframe: 'iframe 嵌入代码',
          script: 'JS SDK 嵌入代码'
        },
        api: {
          title: 'API 嵌入',
          desc: '通过 REST API 从服务端或移动端调用 Agent，兼容 Chat Completions 风格请求体。',
          endpoint: 'API Endpoint',
          apiKey: 'API Key',
          regenerate: '轮换 Key',
          rateLimit: '速率限制',
          webhook: 'Webhook（可选）',
          webhookPh: 'https://your-app.com/hooks/agent-events',
          authHint: '请求头：Authorization: Bearer {apiKey}；所有调用写入 AI 观测 Trace（trigger: api）。'
        }
      },
      versions: {
        empty: '暂无版本历史',
        status: {
          published: '当前版本',
          superseded: '已替代',
          draft: '草稿',
          pending_approval: '待审批',
          rejected: '已驳回'
        }
      },
      debug: {
        title: 'Playground 调试',
        hint: '编辑时可实时调试，调用详情与 AI 观测联动',
        resize: '拖拽调整宽度',
        traceTitle: '调用详情',
        openObs: '在 AI 观测中查看 →',
        noRun: '输入问题并运行，查看回复与 Trace',
        traceEmpty: '运行后将展示 Span 链路'
      },
      drawer: {
        tabs: {
          summary: '配置摘要',
          runs: '执行记录',
          playground: 'Playground'
        }
      },
      runs: {
        startedAt: '开始时间',
        triggerCol: '触发来源',
        input: '输入摘要',
        statusLabel: '状态',
        duration: '耗时',
        empty: '暂无执行记录',
        trigger: {
          playground: 'Playground',
          chat: '对话',
          workflow: '工作流',
          scheduled: '定时'
        },
        status: {
          running: '运行中',
          succeeded: '成功',
          failed: '失败',
          waiting_approval: '待审批'
        }
      },
      playground: {
        desc: '在 Playground 调试中心验证 Agent 配置与回答效果，运行记录写入执行记录（trigger: playground）',
        placeholder: '输入测试问题…',
        run: '运行',
        outputHint: '运行结果将显示在此处',
        result: '运行成功。Trace ID: {traceId}（已写入执行记录）',
        defaultInput: 'Playground 测试',
        unpublishedHint: '当前 Agent 尚未发布，可在 Playground 自由调试；对外正式运行（对话 / 工作流）需审批通过后方可启用。'
      },
      wizard: {
        createTitle: '创建 Agent',
        editTitle: '编辑 Agent',
        step1: '基础信息',
        step2: '灵魂与 Prompt',
        step3: '能力授权',
        step4: '风险与审批',
        step5: '发布预览',
        step1Desc: '填写名称与标识，定义 Agent 的基本身份',
        step2Desc: '配置模型参数与系统提示词，塑造 Agent 行为',
        step3Desc: '授权 Skill、Tool、MCP 与知识库，扩展 Agent 能力',
        step4Desc: '设置自主级别与沙箱策略，控制运行风险边界',
        step5Desc: '确认发布范围与变更说明，提交审批中心审核',
        previewTitle: '发布预览',
        capabilities: '能力配置',
        backToList: '返回列表',
        progress: '第 {step} / {total} 步',
        namePlaceholder: '例如：运维助手',
        summaryPlaceholder: '简要描述 Agent 的用途与能力范围',
        promptPlaceholder: '定义 Agent 的角色、行为准则与回答风格…',
        slugAuto: '根据名称语义自动生成，可手动修改',
        slugManual: '已手动编辑标识，不再随名称自动更新',
        slugPreview: '预览 agent/{slug}',
        addCapability: '添加',
        capEmpty: '暂未添加，点击「添加」选择',
        pickCapability: '选择{type}',
        addSelected: '添加所选',
        sandboxIntro: '沙箱策略决定 Agent 可访问的资源范围与操作权限，请根据使用场景选择：',
        sandboxSelected: '已选择：{name}',
        docs: '篇文档',
        cancel: '取消',
        prev: '上一步',
        next: '下一步',
        saveDraft: '保存草稿',
        submitApproval: '提交审批',
        savedDraft: '草稿已保存',
        submittedApproval: '已提交审批，状态：待审批（审批单 {id}）',
        readonlyHint: '当前 Agent 处于待审批或已发布状态，向导为只读预览',
        validationName: '请填写 Agent 名称',
        validationBasic: '请填写标识 (slug)',
        validationSlug: '标识仅允许小写字母、数字与连字符',
        validationPrompt: '请填写系统提示词'
      }
    },
    obs: {
      pageTitle: 'AI观测 — xSparkOps',
      page: {
        title: 'AI观测',
        subtitle: '查看 LLM 应用运行概览，下钻 Trace 定位延迟与错误，并跟踪 Session、Token 与成本变化'
      },
      tabs: { dashboard: 'Dashboard', traces: 'Tracing' },
      tabsAria: '观测模块',
      ai: {
        title: 'AI 智能观测',
        desc: '基于您有权限的 Workspace「{workspace}」数据，智能分析当前可观测性状况；也可输入问题进一步追问。',
        placeholder: '例如：最近成本为什么上升？哪个模型延迟最高？错误主要来自哪里？',
        tracingTitle: 'AI 观测',
        tracingDesc: '概览当前 Tracing 成功 / 失败情况，支持输入问题深入分析',
        tracingPlaceholder: '例如：失败原因是什么？哪个 Trace 延迟最高？',
        overview: '概览分析',
        followUp: '追问'
      }
    }
  },
  en: {
    common: {
      lang: { zh: '中文', en: 'English' },
      notify: 'Notifications',
      help: 'Help',
      language: 'Language',
      themeSwitch: 'Theme',
      lightMode: 'Light mode',
      profile: 'Profile',
      prototypeNotify: 'Prototype: You have 3 unread notifications',
      prototypeHelp: 'Prototype: Open help center',
      prototypeDemo: 'Prototype: {label}',
      allWorkspaces: 'All Workspaces',
      exportReport: 'Export report',
      exportWeekly: 'Export weekly report',
      vsLastWeek: 'vs last week',
      wow: 'WoW',
      yoy: 'YoY (placeholder)',
      days7: '7d Past 7 days',
      days30: '30d Past 30 days',
      days90: '90d Past 90 days',
      day1: '1d Past 1 day',
      analyze: 'Analyze',
      clear: 'Clear',
      close: 'Close',
      high: 'High',
      medium: 'Medium',
      sessions: 'Sessions',
      cost: 'Cost',
      count: '',
      active: 'Active',
      idle: 'Idle',
      type: 'Type',
      recommend: 'Recommendations',
      docFeatureList: 'Feature list',
      docManual: 'User manual',
      placeholderWip: '{desc} (prototype WIP)',
      placeholderPending: '{desc} (prototype pending)',
      selectMenuHint: 'Select a module on the left to view its description and docs; ready modules (e.g. AI Observability, Approval Center) open full prototype pages'
    },
    workspace: {
      aiLab: 'AI Lab',
      itOps: 'IT Ops Workspace',
      default: 'Default Workspace',
      global: 'Platform-wide',
      allVisible: 'All visible Workspaces'
    },
    sidebar: {
      aiConsole: 'AI Console',
      sections: {
        overview: 'Overview',
        marketplace: 'Marketplace',
        assets: 'Assets',
        operations: 'Operations',
        governance: 'Governance'
      },
      items: {
        dashboard: 'Dashboard',
        chat: 'Chat',
        'agent-hub': 'Agenthub',
        'skill-hub': 'Skillhub',
        agent: 'Agents',
        skill: 'Skills',
        mcp: 'MCP',
        plugin: 'Plugins',
        knowledge: 'Knowledge',
        approval: 'Approval Center',
        'ops-analysis': 'Ops Analytics',
        'ai-observability': 'AI Observability',
        feedback: 'Feedback',
        'ai-governance': 'AI Governance',
        'workspace-settings': 'Workspace Settings'
      },
      aiConsoleOptions: {
        admin: 'Admin Console',
        ops: 'Ops Console'
      }
    },
    root: {
      title: 'xSparkOps — AI-native multi-agent platform',
      pages: {
        dashboard: { title: 'Dashboard', desc: 'See key metrics, to-dos, and shortcuts for your workspace — start your day in one place' },
        chat: { title: 'Chat', desc: 'Chat with agents across turns, invoke skills and tools for Q&A, analysis, and automation' },
        agent: { title: 'Agents', desc: 'Create, debug, and publish agents — configure models, prompts, tools, and release scope' },
        skill: { title: 'Skills', desc: 'Build, test, and publish skills for agents and workflows to reuse and compose' },
        mcp: { title: 'MCP', desc: 'Register and manage MCP connections; monitor availability, usage, and health' },
        plugin: { title: 'Plugins', desc: 'Install and manage platform plugins to extend chat, assets, and integrations' },
        knowledge: { title: 'Knowledge', desc: 'Upload and organize knowledge bases, tune retrieval, and evaluate Q&A quality' },
        'agent-hub': { title: 'Agenthub', desc: 'Browse, search, and install community agents — or share your own' },
        'skill-hub': { title: 'Skillhub', desc: 'Discover and download skill templates, or publish your skills to the marketplace' },
        approval: { title: 'Approval Center', desc: 'Handle pending approvals for L3 operations, platform releases, and Skillhub listings — with AI risk summaries' },
        'ops-analysis': { title: 'Ops Analytics', desc: 'Unify usage, assets, cost, approval, marketplace, and quality metrics — see platform health and AI ops insights at a glance' },
        'ai-observability': { title: 'AI Observability', desc: 'Trace end-to-end LLM calls, analyze sessions and traces, and track tokens, cost, and errors' },
        feedback: { title: 'Feedback', desc: 'Collect, categorize, and follow up on user feedback; track satisfaction and recurring issues' },
        'ai-governance': { title: 'AI Governance', desc: 'Audit user actions and agent/skill/MCP tool runs; surface risks and AI governance recommendations' },
        'workspace-settings': { title: 'Workspace Settings', desc: 'Manage members and roles, models and quotas, plus workspace security and collaboration settings' }
      }
    },
    ops: {
      pageTitle: 'Ops Analytics — xSparkOps',
      page: {
        title: 'Ops Analytics',
        subtitle: 'Unify usage, assets, cost, approval, marketplace, and quality across workspaces — drive decisions with data and AI ops insights'
      },
      tabs: {
        overview: 'Overview',
        usage: 'Usage',
        assets: 'Asset Performance',
        cost: 'Cost Efficiency',
        approval: 'Approval & Publish',
        hub: 'Marketplace',
        quality: 'Quality & Feedback'
      },
      tabsAria: 'Ops analytics dashboards',
      ai: {
        title: 'AI Ops Insights',
        desc: 'Cross-domain metrics with actionable recommendations; ask follow-up questions in natural language.',
        placeholder: 'e.g. Which workspace cost grew fastest? Where is the approval bottleneck?',
        tabFab: 'Dashboard AI Q&A',
        tabAnalyze: 'Analyze',
        weeklyAlert: 'Prototype: Weekly ops report preview\n\n',
        exportAlert: 'Prototype: Export ops analytics report PDF'
      },
      kpi: {
        activeUsers: 'Active users',
        sessions: 'Total sessions',
        agentCalls: 'Agent calls',
        skillCalls: 'Skill calls',
        totalCost: 'Total cost',
        sessionCost: 'Avg session cost',
        approvalPassRate: 'Approval pass rate',
        satisfaction: 'User satisfaction',
        dau: 'DAU',
        wau: 'WAU',
        mau: 'MAU',
        sessionsPerUser: 'Sessions per user',
        newUserPct: 'New user share',
        completionRate: 'Chat completion rate',
        onlineAgents: 'Online agents',
        onlineSkills: 'Online skills',
        mcpConnections: 'MCP connections',
        avgSuccessRate: 'Avg success rate',
        totalCostShort: 'Total cost',
        tokenTotal: 'Total tokens',
        unitCost: 'Cost per successful call',
        budgetUsage: 'Budget utilization',
        pending: 'Pending',
        avgWait: 'Avg wait time',
        approvedWeek: 'Approved this week',
        rejectedWeek: 'Rejected this week',
        l3Ratio: 'L3 ops share',
        skillListings: 'Skillhub listings',
        agentViews: 'Agenthub views',
        downloads: 'Downloads / installs',
        contributors: 'Active contributors',
        errorRate: 'Platform error rate',
        traceFailRate: 'Trace failure rate',
        feedbackCount: 'User feedback count',
        avgSatisfaction: 'Avg satisfaction',
        guardrailHits: 'Guardrail blocks'
      },
      card: {
        usageCostTrend: 'Usage × cost trend (7d)',
        sessionsVsCost: 'Sessions vs cost ($)',
        workspaceCompare: 'Workspace comparison',
        healthRadar: 'Health radar (5 dimensions)',
        alerts: 'Needs attention this week',
        clickAlertAi: 'Click a row for AI insight',
        activeTrend: 'Active user trend',
        adoptionFunnel: 'Feature adoption funnel',
        topUsers: 'Top users',
        topTags: 'Top scenarios / tags',
        assetTypeOverview: 'AI asset types',
        assetTypeSub: 'Agent / Skill / MCP / Tool comparison',
        typeCompare: 'Type performance',
        typeCompareSub: 'Call volume vs success rate',
        typeCostShare: 'Cost share by type',
        typeTrend7d: '7-day call trend by type',
        assetDist: 'Asset count distribution',
        topAssets: 'Top assets by calls (all types)',
        idleAlert: 'Idle asset alert (zero-call skills, 7d)',
        assetDetail: 'Asset details',
        costTrend7d: 'Cost trend (7d)',
        costTopWs: 'Top workspaces by cost',
        costTopAgent: 'Top agents by cost',
        modelUsage: 'Model usage',
        approvalByType: 'Approvals by type',
        approvalSla: 'Approval SLA distribution',
        approvalBacklog: 'Top 5 approval backlog',
        recentPublish: 'Recent publish records',
        listingTrend: 'Listing trend (Skill vs Agent)',
        categoryDist: 'Category distribution',
        hubAssets: 'Marketplace assets',
        errorTrend: 'Error rate trend',
        feedbackCategory: 'Feedback categories',
        topErrors: 'Top errors by agent/skill',
        recentFeedback: 'Recent user feedback'
      },
      table: {
        level: 'Level',
        category: 'Category',
        item: 'Item',
        trend: 'Trend'
      },
      asset: {
        calls7d: '7d calls',
        successRate: 'Success rate',
        avgLatency: 'Avg latency',
        costShare: 'Cost share',
        calls7dCol: '7d call volume'
      },
      link: {
        observability: 'View AI Observability →',
        governance: 'View AI Governance risks →',
        approval: 'View Approval Center →',
        traceDetail: 'View trace details → AI Observability',
        approvalCenter: '→ Approval Center',
        governanceLink: '→ AI Governance',
        errorTrace: 'View error traces in AI Observability →'
      },
      legend: { sessions: 'Sessions', costX10: 'Cost ×10', skill: 'Skill', agent: 'Agent', calls: 'calls' }
    },
    approval: {
      pageTitle: 'Approval Center — xSparkOps',
      page: {
        title: 'Approval Center',
        subtitle: 'View pending items, approve or reject, and browse history — L3 ops, platform releases, and Skillhub listings, with AI risk summaries'
      },
      tabs: {
        pending: 'Pending my approval',
        history: 'History',
        mine: 'My submissions'
      },
      tabsAria: 'Approval status',
      types: {
        l3_exec: 'L3 Operations',
        platform_publish: 'Platform Publish',
        skillhub_publish: 'Skillhub Publish'
      },
      status: {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        draft: 'Draft'
      },
      filter: {
        allTypes: 'All types',
        resourceType: 'Resource type',
        status: 'Status',
        pendingHint: 'Pending my approval',
        searchPlaceholder: 'Search resource / submitter…',
        empty: 'No results match current filters'
      },
      ai: {
        summary: 'AI Summary',
        riskLevels: { high: 'High risk', medium: 'Medium risk', low: 'Low risk' },
        titles: {
          l3_exec: 'L3 execution risk analysis',
          platform_publish_agent: 'Agent platform publish analysis',
          platform_publish_skill: 'Skill platform publish analysis',
          platform_publish_knowledge: 'Knowledge base publish analysis',
          skillhub_publish: 'Skillhub listing analysis'
        },
        hints: {
          l3_exec: {
            approver: 'Focus on run input scope, tool write permissions, and reversibility',
            submitter: 'Self-check for auto-fix/write ops and minimize authorization',
            viewer: 'Review risk points for L3 execution approvals'
          },
          platform_publish_agent: {
            approver: 'Watch for tool/MCP expansion and model or RAG changes',
            submitter: 'Document agent config changes and risk boundaries',
            viewer: 'Review agent platform publish risk assessment'
          },
          platform_publish_skill: {
            approver: 'Verify export scope, dependent tools, and quotas',
            submitter: 'State export limits and prohibited scenarios',
            viewer: 'Review skill platform publish risk assessment'
          },
          platform_publish_knowledge: {
            approver: 'Check document sensitivity, visibility, and retrieval ACLs',
            submitter: 'Complete doc classification and visibility settings',
            viewer: 'Review knowledge base publish risk assessment'
          },
          skillhub_publish: {
            approver: 'Verify security scan, marketplace exposure, and listing notes',
            submitter: 'Complete security materials and Skillhub listing copy',
            viewer: 'Review Skillhub listing risk assessment'
          }
        },
        riskScore: 'Risk score',
        viewFull: 'View full analysis',
        submitPreview: 'Pre-submit AI review',
        submitPreviewTitle: 'Pre-submit AI review',
        submitPreviewDesc: 'Simulated risk self-check before submission (prototype)',
        draft: 'Draft to submit',
        backEdit: 'Back to edit',
        confirmSubmit: 'Confirm submission',
        approvedAlert: 'Prototype: Approved\nComment: {comment}',
        rejectedAlert: 'Prototype: Rejected\nComment: {comment}',
        submittedAlert: 'Prototype: Submitted\nAI summary sent to approvers with the request',
        noComment: '(none)'
      },
      drawer: {
        l3Badge: 'operation · approval required',
        runInput: 'Run input summary',
        configSummary: 'Config summary',
        authScope: 'Authorized capabilities',
        publishScope: 'Publish scope',
        versionChange: 'Version / changelog',
        aiReview: 'AI pre-review report',
        purpose: 'Purpose',
        riskBoundary: 'Risk boundary',
        categoryTags: 'Category / tags',
        hubPreview: 'Skillhub listing preview',
        securityScan: 'Security scan',
        aiResult: 'AI review result',
        publishNote: 'Publish notes',
        result: 'Approval result',
        approver: 'Approver',
        comment: 'Comment',
        submittedAt: 'Submitted at',
        commentPlaceholder: 'Approval comment (optional)',
        approve: 'Approve',
        reject: 'Reject',
        submitter: 'Submitter',
        viewAgent: 'View agent config →',
        viewKnowledge: 'View knowledge base →'
      },
      fields: { type: 'Type', resource: 'Resource', version: 'Version' }
    },
    gov: {
      pageTitle: 'AI Governance — xSparkOps',
      page: {
        title: 'AI Governance',
        subtitle: 'Audit user actions and agent/skill/MCP tool runs; spot high-risk behavior and get AI governance insights and weekly reports'
      },
      tabs: { overview: 'Overview', audit: 'User actions', tools: 'Tool execution' },
      tabsAria: 'Governance modules',
      ai: {
        title: 'AI Governance Insights',
        desc: 'Risk insights and recommendations across your visible workspaces; ask follow-up questions.',
        placeholder: 'e.g. What high-risk events occurred? Who exported the most data?',
        weekly: 'Weekly report',
        subscribe: 'Subscribe to alerts'
      },
      kpi: {
        todayOps: 'Operations today',
        highRisk: 'High-risk events',
        activeUsers: 'Active users',
        toolCalls: 'Tool calls'
      }
    },
    knowledge: {
      pageTitle: 'Knowledge — xSparkOps',
      page: {
        title: 'Knowledge',
        subtitle: 'Upload and organize knowledge bases, tune retrieval, and evaluate Q&A quality'
      },
      tabsAria: 'Knowledge base scope',
      tabs: {
        all: 'All knowledge bases',
        mine: 'My knowledge bases'
      },
      filterStatus: 'Status',
      filterScope: 'Publish scope',
      allStatus: 'All',
      allScope: 'All',
      legendTitle: 'Publish scope & status guide',
      scopeSearchPlaceholder: 'Search publish scope',
      scopeSearchEmpty: 'No matching scope',
      searchPlaceholder: 'Search knowledge base / workspace',
      allWorkspaces: 'All workspaces',
      allVisibility: 'All visibility',
      visibility: 'Visibility',
      emptyMine: 'You have not created any knowledge bases yet',
      rejectHint: 'Rejected: {reason}',
      pendingHint: 'Publish approval in progress',
      sortUpdated: 'Recently updated',
      create: 'Create knowledge base',
      createAlert: 'Prototype: Open create knowledge base wizard',
      createWizard: {
        title: 'Create knowledge base',
        subtitle: 'Set basics and publish scope; new libraries start as drafts',
        name: 'Name',
        namePlaceholder: 'e.g. Product FAQ knowledge base',
        description: 'Description',
        descPlaceholder: 'Purpose and document types (optional)',
        publishScope: 'Publish scope',
        scopeLabels: {
          workspace: 'Workspace only',
          public: 'Public'
        },
        scopeDesc: {
          workspace: 'Visible within the current workspace (current team)',
          public: 'Visible across all workspaces (platform-wide)'
        },
        slugPreview: 'ID: {slug}',
        publicNote: 'Choosing Public requires publish approval',
        scopeSearchPlaceholder: 'Search publish scope',
        cancel: 'Cancel',
        submit: 'Create',
        success: 'Knowledge base "{name}" created as draft',
        validationName: 'Enter a knowledge base name',
        validationNameMin: 'Name must be at least 2 characters',
        validationWorkspace: 'Select a workspace',
        validationDuplicate: 'A knowledge base with this name already exists'
      },
      sortAlert: 'Prototype: Sort by last updated',
      moreAlert: 'Prototype: More actions menu',
      docCount: 'Documents',
      sliceCount: 'Chunks',
      refCount: 'References',
      updated: 'updated',
      more: 'More',
      empty: 'No knowledge bases match your filters',
      editAlert: 'Prototype: Edit knowledge base "{name}"',
      deleteConfirm: 'Delete knowledge base "{name}"? This cannot be undone.',
      publishAlert: 'Prototype: Submit knowledge base publish approval',
      publishedApproval: 'Knowledge base publish approval submitted: {id}',
      viewApprovalPrompt: 'Open Approval Center now?',
      actions: {
        edit: 'Edit',
        publish: 'Publish',
        republish: 'Resubmit',
        delete: 'Delete',
        viewApproval: 'View approval',
        publishedEditAlert: 'Published knowledge bases must be unpublished or versioned before editing (prototype)'
      },
      status: {
        draft: 'Draft',
        pending_approval: 'Pending approval',
        published: 'Published',
        rejected: 'Rejected'
      },
      statusDesc: {
        draft: 'In progress, not submitted; only the owner can see and edit',
        pending_approval: 'Publish approval submitted; locked until review completes',
        published: 'Approved and searchable per visibility scope; changes require re-approval',
        rejected: 'Publish rejected; update per feedback and resubmit'
      },
      scopeDesc: {
        workspace: 'Visible within the current workspace (current team)',
        public: 'Visible across all workspaces; publish approval required'
      },
      total: '{count} knowledge bases',
      pageOf: 'Page {page} of {total}',
      pageSize: 'Page size',
      prev: 'Previous',
      next: 'Next',
      tags: {
        workspace: 'Workspace only',
        public: 'Public'
      }
    },
    agent: {
      pageTitle: 'Agents — xSparkOps',
      page: {
        title: 'Agents',
        subtitle: 'Create, debug, and publish agents — configure models, prompts, tools, and scope; approvals go through Approval Center'
      },
      searchPlaceholder: 'Search agent name / slug / workspace',
      allStatus: 'All',
      create: 'Create Agent',
      empty: 'No agents match your filters',
      viewApproval: 'View Approval Center →',
      approvalId: 'Approval ID',
      rejectReason: 'Rejection reason',
      status: {
        draft: 'Draft',
        pending_approval: 'Pending approval',
        published: 'Published',
        rejected: 'Rejected'
      },
      fields: {
        slug: 'Slug',
        name: 'Name',
        summary: 'Summary',
        category: 'Category',
        workspace: 'Workspace',
        icon: 'Icon',
        model: 'Model',
        temperature: 'Temperature',
        systemPrompt: 'System prompt',
        startupInstruction: 'Startup instruction',
        outputFormat: 'Output format',
        autonomyLevel: 'Autonomy level',
        sandboxPolicy: 'Sandbox policy',
        publishScope: 'Publish scope',
        version: 'Version',
        changeLog: 'Changelog',
        purpose: 'Purpose',
        riskBoundary: 'Risk boundary',
        knowledgeBase: 'Knowledge base'
      },
      actions: {
        edit: 'Edit',
        submitApproval: 'Submit for approval',
        viewConfig: 'View config',
        viewApproval: 'View approval',
        view: 'View',
        viewDetail: 'View details',
        viewRuns: 'Run history',
        playground: 'Playground',
        chat: 'Try chat',
        clone: 'Clone'
      },
      chat: {
        back: 'Back to list',
        you: 'You',
        send: 'Send',
        placeholder: 'Type a message — Enter to send, Shift+Enter for newline…',
        greeting: 'Hi, I\'m {name}. How can I help you today?',
        mockReply: '[{name}] Prototype demo reply.\n\nYou said: "{input}"\n\nSample answer generated with {model}.',
        unpublishedHint: 'Preview mode: unpublished agents can be tried in chat; formal integration requires publish approval.',
        viewTrace: 'View trace →'
      },
      detail: {
        backToList: 'Back to list',
        tabs: {
          config: 'Configuration',
          approval: 'Approval',
          publish: 'Publish',
          runs: 'Run history',
          versions: 'Version history'
        },
        approvalStatus: 'Approval status',
        submittedAt: 'Submitted at',
        publishedAt: 'Published at',
        publisher: 'Publisher',
        versionStatus: 'Version status'
      },
      integration: {
        intro: 'Configure how this agent integrates with external agent platforms or your apps — via embedded UI or API.',
        unpublishedHint: 'This agent is not published yet. You can preview integration settings; saving and external calls require publish approval.',
        enabled: 'Enabled',
        save: 'Save integration',
        copied: 'Copied to clipboard',
        saved: 'Integration settings saved',
        keyRegenerated: 'API key rotated — update external systems',
        copy: 'Copy',
        docs: 'Integration docs →',
        frontend: {
          title: 'Frontend embed',
          desc: 'Embed the chat widget in your web app, portal, or low-code page via iframe or JS SDK.',
          embedUrl: 'Embed page URL',
          theme: 'Theme',
          themeAuto: 'System',
          themeLight: 'Light',
          themeDark: 'Dark',
          size: 'Default size',
          origins: 'Allowed embed origins (CORS / postMessage)',
          originsPh: 'One domain per line; wildcards supported, e.g. https://*.example.com',
          showHeader: 'Show agent header',
          iframe: 'iframe snippet',
          script: 'JS SDK snippet'
        },
        api: {
          title: 'API embed',
          desc: 'Call the agent from server or mobile via REST; Chat Completions–style request body.',
          endpoint: 'API endpoint',
          apiKey: 'API key',
          regenerate: 'Rotate key',
          rateLimit: 'Rate limit',
          webhook: 'Webhook (optional)',
          webhookPh: 'https://your-app.com/hooks/agent-events',
          authHint: 'Header: Authorization: Bearer {apiKey}. All calls are traced in AI Observability (trigger: api).'
        }
      },
      versions: {
        empty: 'No version history yet',
        status: {
          published: 'Current',
          superseded: 'Superseded',
          draft: 'Draft',
          pending_approval: 'Pending approval',
          rejected: 'Rejected'
        }
      },
      debug: {
        title: 'Playground',
        hint: 'Debug while editing; call details link to AI Observability',
        resize: 'Drag to resize',
        traceTitle: 'Call details',
        openObs: 'View in AI Observability →',
        noRun: 'Run a prompt to see response and trace',
        traceEmpty: 'Spans appear after a run'
      },
      drawer: {
        tabs: {
          summary: 'Config summary',
          runs: 'Run history',
          playground: 'Playground'
        }
      },
      runs: {
        startedAt: 'Started at',
        triggerCol: 'Trigger',
        input: 'Input summary',
        statusLabel: 'Status',
        duration: 'Duration',
        empty: 'No run records yet',
        trigger: {
          playground: 'Playground',
          chat: 'Chat',
          workflow: 'Workflow',
          scheduled: 'Scheduled'
        },
        status: {
          running: 'Running',
          succeeded: 'Succeeded',
          failed: 'Failed',
          waiting_approval: 'Waiting approval'
        }
      },
      playground: {
        desc: 'Use Playground to validate config and responses; runs are saved to run history (trigger: playground)',
        placeholder: 'Enter a test prompt…',
        run: 'Run',
        outputHint: 'Output will appear here',
        result: 'Run succeeded. Trace ID: {traceId} (saved to run history)',
        defaultInput: 'Playground test',
        unpublishedHint: 'This agent is not published yet — Playground debugging is available. Formal runs (chat / workflow) require publish approval.'
      },
      wizard: {
        createTitle: 'Create Agent',
        editTitle: 'Edit Agent',
        step1: 'Basic info',
        step2: 'Soul & prompt',
        step3: 'Capabilities',
        step4: 'Risk & approval',
        step5: 'Publish preview',
        step1Desc: 'Set name and slug to define the agent identity',
        step2Desc: 'Configure model and system prompt to shape behavior',
        step3Desc: 'Authorize Skills, Tools, MCP, and knowledge bases',
        step4Desc: 'Set autonomy level and sandbox policy for risk control',
        step5Desc: 'Confirm publish scope and changelog, then submit for approval',
        previewTitle: 'Publish preview',
        capabilities: 'Capabilities',
        backToList: 'Back to list',
        progress: 'Step {step} of {total}',
        namePlaceholder: 'e.g. Ops Assistant',
        summaryPlaceholder: 'Briefly describe what this agent does',
        promptPlaceholder: 'Define role, behavior rules, and response style…',
        slugAuto: 'Semantically generated from name; you can edit manually',
        slugManual: 'Slug manually edited; no longer auto-updated from name',
        slugPreview: 'Preview agent/{slug}',
        addCapability: 'Add',
        capEmpty: 'None yet — click Add to select',
        pickCapability: 'Select {type}',
        addSelected: 'Add selected',
        sandboxIntro: 'Sandbox policy controls resource access and operation permissions:',
        sandboxSelected: 'Selected: {name}',
        docs: 'docs',
        cancel: 'Cancel',
        prev: 'Previous',
        next: 'Next',
        saveDraft: 'Save draft',
        submitApproval: 'Submit for approval',
        savedDraft: 'Draft saved',
        submittedApproval: 'Submitted for approval — status: pending (approval {id})',
        readonlyHint: 'Agent is pending approval or published; wizard is read-only preview',
        validationName: 'Please enter an agent name',
        validationBasic: 'Please enter a slug',
        validationSlug: 'Slug allows lowercase letters, digits, and hyphens only',
        validationPrompt: 'Please fill in the system prompt'
      }
    },
    obs: {
      pageTitle: 'AI Observability — xSparkOps',
      page: {
        title: 'AI Observability',
        subtitle: 'See LLM app health at a glance, drill into traces for latency and errors, and track sessions, tokens, and cost'
      },
      tabs: { dashboard: 'Dashboard', traces: 'Tracing' },
      tabsAria: 'Observability modules',
      ai: {
        title: 'AI Observability Insights',
        desc: 'Analyze observability for workspace「{workspace}」; ask follow-up questions.',
        placeholder: 'e.g. Why did cost rise recently? Which model has highest latency?',
        tracingTitle: 'AI Observability',
        tracingDesc: 'Overview of tracing success/failure; ask for deeper analysis',
        tracingPlaceholder: 'e.g. What caused failures? Which trace has highest latency?',
        overview: 'Overview',
        followUp: 'Follow up'
      }
    }
  }
};

if (typeof window !== 'undefined') {
  window.XSPARK_LOCALES = XSPARK_LOCALES;
}
