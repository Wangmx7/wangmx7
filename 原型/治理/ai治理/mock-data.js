const GOV_MOCK = {
  stats: {
    todayOps: 342,
    todayOpsTrend: '+8.2%',
    highRisk: 7,
    highRiskTrend: '+2',
    activeUsers: 48,
    activeUsersTrend: '+5.1%',
    toolCalls: 4280,
    toolCallsTrend: '+14.3%',
    period: '7d'
  },
  chart: {
    dates: ['06-04', '06-05', '06-06', '06-07', '06-08', '06-09', '06-10'],
    userOps: [420, 480, 445, 510, 532, 498, 542],
    toolExec: [520, 580, 610, 640, 680, 650, 720]
  },
  resourceDist: [
    { type: 'Agent', count: 1840, pct: 42 },
    { type: 'Skill', count: 980, pct: 22 },
    { type: 'MCP', count: 720, pct: 16 },
    { type: 'Tool', count: 560, pct: 13 },
    { type: '知识', count: 380, pct: 7 }
  ],
  topUsers: [
    { id: 'user_2847', ops: 89, risk: 'high', workspace: '人工智能实验室' },
    { id: 'user_1093', ops: 62, risk: 'medium', workspace: '人工智能实验室' },
    { id: 'user_5521', ops: 45, risk: 'low', workspace: 'IT 运维 Workspace' },
    { id: 'user_3301', ops: 38, risk: 'low', workspace: 'Default Workspace' }
  ],
  riskAlerts: [
    { id: 'ra1', level: 'high', title: '异常批量导出', desc: 'user_2847 在 02:15 导出 3 次知识库全量数据', time: '2026-06-10 02:15', workspace: '人工智能实验室' },
    { id: 'ra2', level: 'high', title: 'MCP 连续失败', desc: 'prod-mcp-git 在 1 小时内失败 12 次（timeout）', time: '2026-06-10 07:55', workspace: '人工智能实验室' },
    { id: 'ra3', level: 'medium', title: '非工作时间高频调用', desc: 'user_2847 夜间 Agent 调用 47 次，超出基线 3 倍', time: '2026-06-09 23:40', workspace: '人工智能实验室' },
    { id: 'ra4', level: 'medium', title: '权限变更', desc: 'admin 将 user_3301 提升为 Workspace 管理员', time: '2026-06-09 16:22', workspace: 'Default Workspace' },
    { id: 'ra5', level: 'low', title: '新 MCP 接入', desc: 'prod-mcp-slack 首次被 5 名用户调用', time: '2026-06-09 10:05', workspace: 'IT 运维 Workspace' }
  ],
  auditLogs: [
    { id: 'aud_01', createdAt: '2026-06-10 08:12:03', user: 'user_2847', action: 'login', resourceType: 'session', resource: 'sess_a91f', workspace: '人工智能实验室', risk: 'low', ip: '10.0.12.45', detail: { method: 'sso', device: 'Chrome/Win' }, traceId: null },
    { id: 'aud_02', createdAt: '2026-06-10 07:58:22', user: 'user_1093', action: 'agent.create', resourceType: 'agent', resource: 'ops-assistant-v2', workspace: '人工智能实验室', risk: 'low', ip: '10.0.12.88', detail: { name: 'ops-assistant-v2', model: 'gpt-4o' }, traceId: null },
    { id: 'aud_03', createdAt: '2026-06-10 07:45:08', user: 'user_2847', action: 'export', resourceType: 'knowledge', resource: 'kb-infra-docs', workspace: '人工智能实验室', risk: 'high', ip: '10.0.12.45', detail: { format: 'csv', rows: 12400, reason: 'backup' }, traceId: null },
    { id: 'aud_04', createdAt: '2026-06-10 07:40:15', user: 'admin', action: 'permission.change', resourceType: 'workspace', resource: 'Default Workspace', workspace: 'Default Workspace', risk: 'medium', ip: '10.0.1.10', detail: { target: 'user_3301', role: 'admin', prev: 'member' }, traceId: null },
    { id: 'aud_05', createdAt: '2026-06-10 07:35:00', user: 'user_5521', action: 'workflow.publish', resourceType: 'workflow', resource: 'incident-triage', workspace: 'IT 运维 Workspace', risk: 'low', ip: '10.0.15.22', detail: { version: '1.2.0', nodes: 8 }, traceId: null },
    { id: 'aud_06', createdAt: '2026-06-10 07:28:44', user: 'user_2847', action: 'run.trigger', resourceType: 'agent', resource: 'ops-assistant', workspace: '人工智能实验室', risk: 'low', ip: '10.0.12.45', detail: { input: '分析上周 CPU 异常' }, traceId: 'tr_8f3a2b1c' },
    { id: 'aud_07', createdAt: '2026-06-10 07:22:10', user: 'user_3301', action: 'mcp.register', resourceType: 'mcp', resource: 'prod-mcp-slack', workspace: 'IT 运维 Workspace', risk: 'medium', ip: '10.0.18.5', detail: { endpoint: 'mcp://slack.internal', tools: 4 }, traceId: null },
    { id: 'aud_08', createdAt: '2026-06-10 07:15:33', user: 'user_1093', action: 'skill.publish', resourceType: 'skill', resource: 'log-analyzer', workspace: '人工智能实验室', risk: 'low', ip: '10.0.12.88', detail: { version: '2.0.1' }, traceId: null },
    { id: 'aud_09', createdAt: '2026-06-10 06:55:18', user: 'user_2847', action: 'export', resourceType: 'knowledge', resource: 'kb-security-policies', workspace: '人工智能实验室', risk: 'high', ip: '10.0.12.45', detail: { format: 'json', rows: 890 }, traceId: null },
    { id: 'aud_10', createdAt: '2026-06-10 06:40:02', user: 'user_5521', action: 'api_key.create', resourceType: 'api_key', resource: 'key_ops_automation', workspace: 'IT 运维 Workspace', risk: 'medium', ip: '10.0.15.22', detail: { scope: 'runs:write', expires: '2026-12-31' }, traceId: null },
    { id: 'aud_11', createdAt: '2026-06-10 05:30:45', user: 'user_2847', action: 'login', resourceType: 'session', resource: 'sess_night', workspace: '人工智能实验室', risk: 'medium', ip: '10.0.12.45', detail: { method: 'sso', hour: '05:30' }, traceId: null },
    { id: 'aud_12', createdAt: '2026-06-09 18:22:11', user: 'admin', action: 'agent.delete', resourceType: 'agent', resource: 'test-bot-legacy', workspace: 'Default Workspace', risk: 'low', ip: '10.0.1.10', detail: { reason: 'deprecated' }, traceId: null }
  ],
  toolExecutions: [
    { id: 'tex_01', time: '2026-06-10 08:00:40', user: 'user_2847', type: 'Agent', resource: 'ops-assistant', operation: 'run.trigger', durationMs: 3240, status: 'success', workspace: '人工智能实验室', traceId: 'tr_8f3a2b1c', input: '{"task":"chat","query":"分析上周 CPU"}', output: '{"status":"completed"}', error: null, agent: 'ops-assistant', workflow: null },
    { id: 'tex_02', time: '2026-06-10 07:58:12', user: 'user_1093', type: 'Skill', resource: 'log-analyzer', operation: 'skill.execute', durationMs: 1890, status: 'success', workspace: '人工智能实验室', traceId: 'tr_7e2d9c4a', input: '{"log_source":"k8s","namespace":"prod"}', output: '{"anomalies":2}', error: null, agent: 'ops-assistant', workflow: 'incident-triage' },
    { id: 'tex_03', time: '2026-06-10 07:55:03', user: 'user_2847', type: 'Tool', resource: 'tool-call-weather', operation: 'tool.invoke', durationMs: 4520, status: 'failed', workspace: '人工智能实验室', traceId: 'tr_6d1b8f3e', input: '{"city":"Beijing"}', output: null, error: 'timeout after 4500ms', agent: 'ops-assistant', workflow: null },
    { id: 'tex_04', time: '2026-06-10 07:52:30', user: 'user_2847', type: 'MCP', resource: 'prod-mcp-git', operation: 'mcp.call', durationMs: 820, status: 'success', workspace: '人工智能实验室', traceId: 'tr_8f3a2b1c', input: '{"tool":"search_repo","query":"cpu alert"}', output: '{"files":3}', error: null, agent: 'ops-assistant', workflow: null },
    { id: 'tex_05', time: '2026-06-10 07:48:22', user: 'user_5521', type: 'Agent', resource: 'chat-support', operation: 'run.trigger', durationMs: 5680, status: 'success', workspace: 'IT 运维 Workspace', traceId: 'tr_4b9f6d1c', input: '{"message":"继续上次话题"}', output: '{"turn":3}', error: null, agent: 'chat-support', workflow: null },
    { id: 'tex_06', time: '2026-06-10 07:45:08', user: 'user_5521', type: 'MCP', resource: 'prod-mcp-slack', operation: 'mcp.call', durationMs: 340, status: 'success', workspace: 'IT 运维 Workspace', traceId: 'tr_slack_01', input: '{"tool":"post_message","channel":"#ops"}', output: '{"ok":true}', error: null, agent: null, workflow: 'incident-triage' },
    { id: 'tex_07', time: '2026-06-10 07:40:15', user: 'user_1093', type: 'MCP', resource: 'prod-mcp-git', operation: 'mcp.call', durationMs: 5100, status: 'timeout', workspace: '人工智能实验室', traceId: 'tr_git_fail', input: '{"tool":"clone","repo":"large-repo"}', output: null, error: 'MCP server timeout', agent: 'ops-assistant', workflow: null },
    { id: 'tex_08', time: '2026-06-10 07:35:00', user: 'user_3301', type: 'Skill', resource: 'data-export', operation: 'skill.execute', durationMs: 1200, status: 'success', workspace: 'Default Workspace', traceId: 'tr_export_01', input: '{"dataset":"users","limit":100}', output: '{"rows":100}', error: null, agent: null, workflow: null },
    { id: 'tex_09', time: '2026-06-10 07:28:44', user: 'user_2847', type: 'Tool', resource: 'embedding-batch', operation: 'tool.invoke', durationMs: 890, status: 'success', workspace: '人工智能实验室', traceId: 'tr_5c0a7e2d', input: '{"batch":128}', output: '{"vectors":128}', error: null, agent: null, workflow: 'rag-pipeline' },
    { id: 'tex_10', time: '2026-06-10 07:22:10', user: 'user_3301', type: 'MCP', resource: 'prod-mcp-slack', operation: 'mcp.call', durationMs: 280, status: 'success', workspace: 'IT 运维 Workspace', traceId: 'tr_slack_02', input: '{"tool":"list_channels"}', output: '{"channels":12}', error: null, agent: null, workflow: null },
    { id: 'tex_11', time: '2026-06-10 06:55:18', user: 'user_2847', type: 'Agent', resource: 'ops-assistant', operation: 'run.trigger', durationMs: 2100, status: 'success', workspace: '人工智能实验室', traceId: 'tr_night_01', input: '{"task":"export_prep"}', output: '{"ready":true}', error: null, agent: 'ops-assistant', workflow: null },
    { id: 'tex_12', time: '2026-06-10 05:30:45', user: 'user_2847', type: 'MCP', resource: 'prod-mcp-git', operation: 'mcp.call', durationMs: 4800, status: 'failed', workspace: '人工智能实验室', traceId: 'tr_git_night', input: '{"tool":"search"}', output: null, error: 'connection reset', agent: 'ops-assistant', workflow: null }
  ]
};
