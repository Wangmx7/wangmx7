/**
 * xSparkOps 左侧导航配置
 * 菜单 ↔ 原型路径 ↔ 文档 ID 的唯一配置源
 *
 * status: ready | wip | placeholder
 */
const SIDEBAR_CONFIG = {
  brand: {
    name: 'xSparkOps',
    logo: 'XS'
  },
  workspace: {
    label: '人工智能实验室',
    options: ['人工智能实验室', 'IT 运维 Workspace', 'Default Workspace']
  },
  user: {
    name: '王小明',
    avatar: '王',
    menu: [
      { id: 'theme-switch', label: '主题切换' },
      { id: 'profile', label: '用户信息' }
    ]
  },
  aiConsole: {
    label: 'AI 控制台',
    options: [
      { id: 'admin', label: '管理后台', page: '原型/控制台/管理后台/index.html' },
      { id: 'ops', label: '运维后台', page: '原型/控制台/运维后台/index.html' }
    ]
  },
  defaultActive: 'knowledge',
  items: [
    { type: 'section', sectionId: 'overview', label: '概览' },
    { id: 'dashboard', label: '工作台', icon: 'dashboard', route: '/dashboard', featureModule: 'dashboard', manualModule: 'dashboard', status: 'placeholder' },
    { id: 'chat', label: '对话', icon: 'chat', route: '/chat', featureModule: 'chat', manualModule: 'chat', status: 'placeholder' },

    { type: 'section', sectionId: 'marketplace', label: '集市' },
    { id: 'agent-hub', label: 'Agenthub', icon: 'agent-hub', route: '/agent-hub', featureModule: 'agent-hub', manualModule: 'agent-hub', status: 'placeholder' },
    { id: 'skill-hub', label: 'Skillhub', icon: 'skill-hub', route: '/skill-hub', featureModule: 'skill-hub', manualModule: 'skill-hub', status: 'placeholder' },

    { type: 'section', sectionId: 'assets', label: '资产' },
    { id: 'agent', label: '智能体', icon: 'agent', route: '/agent', page: '原型/资产/智能体/index.html', featureModule: 'agent', manualModule: 'agent', status: 'ready' },
    { id: 'skill', label: '技能', icon: 'skill', route: '/skill', featureModule: 'skill', manualModule: 'skill', status: 'placeholder' },
    { id: 'mcp', label: 'MCP', icon: 'mcp', route: '/mcp', featureModule: 'mcp', manualModule: 'mcp', status: 'placeholder' },
    { id: 'plugin', label: '插件', icon: 'plugin', route: '/plugin', featureModule: 'plugin', manualModule: 'plugin', status: 'placeholder' },
    { id: 'knowledge', label: '知识', icon: 'knowledge', route: '/knowledge', page: '原型/资产/知识/index.html', featureModule: 'knowledge', manualModule: 'knowledge', status: 'ready' },

    { type: 'section', sectionId: 'operations', label: '运营' },
    {
      id: 'approval',
      label: '审批中心',
      icon: 'approval',
      route: '/approval',
      page: '原型/运营/审批中心/index.html',
      featureModule: 'approval',
      manualModule: 'approval',
      status: 'ready'
    },
    { id: 'ops-analysis', label: '运营分析', icon: 'ops-analysis', route: '/ops-analysis', page: '原型/运营/运营分析/index.html', featureModule: 'ops-analysis', manualModule: 'ops-analysis', status: 'ready' },
    {
      id: 'ai-observability',
      label: 'AI观测',
      icon: 'ai-observability',
      route: '/ai-observability',
      page: '原型/运营/ai观测/index.html',
      featureModule: 'ai-observability',
      manualModule: 'ai-observability',
      status: 'ready'
    },
    { id: 'feedback', label: '反馈', icon: 'feedback', route: '/feedback', featureModule: 'feedback', manualModule: 'feedback', status: 'placeholder' },

    { type: 'section', sectionId: 'governance', label: '治理' },
    {
      id: 'ai-governance',
      label: 'AI治理',
      icon: 'ai-governance',
      route: '/ai-governance',
      page: '原型/治理/ai治理/index.html',
      featureModule: 'ai-governance',
      manualModule: 'ai-governance',
      status: 'ready'
    },

    { type: 'divider' },
    { id: 'workspace-settings', label: 'Workspace设置', icon: 'settings', route: '/workspace-settings', featureModule: 'workspace-settings', manualModule: 'workspace-settings', status: 'placeholder' }
  ]
};
