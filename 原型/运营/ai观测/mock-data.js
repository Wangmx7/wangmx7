const OBS_MOCK = {
  stats: {
    traces: 12847,
    tracesTrend: '+12.4%',
    sessions: 3421,
    sessionsTrend: '+8.1%',
    totalCost: 284.56,
    costTrend: '+5.2%',
    avgLatency: 1840,
    latencyTrend: '-3.8%',
    totalTokens: 48_920_000,
    errorRate: 1.2
  },
  chart: {
    dates: ['06-04', '06-05', '06-06', '06-07', '06-08', '06-09', '06-10'],
    traces: [1420, 1680, 1550, 1890, 2010, 1780, 1920],
    cost: [32.1, 38.4, 35.2, 42.8, 45.1, 39.6, 41.2],
    latency: [2100, 1980, 1920, 1860, 1840, 1810, 1790]
  },
  models: [
    { name: 'gpt-4o', traces: 4521, tokens: '18.2M', cost: 142.3, avgLatency: 2100 },
    { name: 'claude-3-5-sonnet', traces: 3102, tokens: '12.8M', cost: 89.4, avgLatency: 1650 },
    { name: 'qwen-max', traces: 2890, tokens: '9.4M', cost: 28.6, avgLatency: 1420 },
    { name: 'text-embedding-3', traces: 2334, tokens: '8.5M', cost: 24.3, avgLatency: 320 }
  ],
  tracingRows: [
    { id: 'obs_a1', startTime: '2026-06-11 08:00:40', type: 'AGENT', name: 'handle-chatbot-message', traceName: 'QA-Chatbot', traceId: 'tr_8f3a2b1c', userId: 'user_2847', sessionId: 'sess_a91f', env: 'prod', level: 'DEFAULT', status: 'ok', isRoot: true, model: null, workspace: '人工智能实验室', latencyMs: 3240, ttftMs: null, tags: ['feature:chat', 'v2.1'], input: '{"task":"chat"}', output: null, metadata: '{"agent":"ops-assistant"}' },
    { id: 'obs_a2', startTime: '2026-06-11 08:00:41', type: 'GENERATION', name: 'llm-synthesis', traceName: 'QA-Chatbot', traceId: 'tr_8f3a2b1c', userId: 'user_2847', sessionId: 'sess_a91f', env: 'prod', level: 'DEFAULT', status: 'ok', isRoot: false, model: 'gpt-4o', workspace: '人工智能实验室', latencyMs: 1720, ttftMs: 420, tags: ['feature:chat'], input: '帮我分析上周服务器 CPU 异常', output: '根据监控数据，上周三 CPU 峰值达 92%…', metadata: '{"tokens":4820}' },
    { id: 'obs_b1', startTime: '2026-06-11 07:58:12', type: 'RETRIEVER', name: 'kb-search', traceName: 'RAG-Pipeline', traceId: 'tr_7e2d9c4a', userId: 'user_1093', sessionId: 'sess_b22e', env: 'prod', level: 'DEFAULT', status: 'ok', isRoot: true, model: 'text-embedding-3', workspace: '人工智能实验室', latencyMs: 680, ttftMs: null, tags: ['feature:kb'], input: 'CPU 异常 上周', output: '{"docs":5}', metadata: '{"top_k":5}' },
    { id: 'obs_c1', startTime: '2026-06-11 07:55:03', type: 'TOOL', name: 'tool-call-weather', traceName: 'Agent-Ops', traceId: 'tr_6d1b8f3e', userId: 'user_2847', sessionId: 'sess_a91f', env: 'prod', level: 'ERROR', status: 'error', isRoot: true, model: null, workspace: '人工智能实验室', latencyMs: 4520, ttftMs: null, tags: ['agent:ops'], input: '{"city":"Beijing"}', output: '{"error":"timeout"}', metadata: '{"retry":2}' },
    { id: 'obs_d1', startTime: '2026-06-11 07:52:00', type: 'SPAN', name: 'embedding-batch', traceName: 'Batch-Embed', traceId: 'tr_5c0a7e2d', userId: 'system', sessionId: null, env: 'prod', level: 'DEFAULT', status: 'ok', isRoot: true, model: 'text-embedding-3', workspace: '人工智能实验室', latencyMs: 890, ttftMs: null, tags: ['batch'], input: '{"batch":128}', output: '{"vectors":128}', metadata: '{}' },
    { id: 'obs_e1', startTime: '2026-06-11 07:48:22', type: 'GENERATION', name: 'multi-turn-dialogue', traceName: 'QA-Chatbot', traceId: 'tr_4b9f6d1c', userId: 'user_5521', sessionId: 'sess_c33d', env: 'staging', level: 'DEFAULT', status: 'ok', isRoot: true, model: 'claude-3-5-sonnet', workspace: 'IT 运维 Workspace', latencyMs: 5680, ttftMs: 560, tags: ['feature:chat'], input: '继续上次的话题', output: '好的，我们继续讨论…', metadata: '{"turn":3}' },
    { id: 'obs_f1', startTime: '2026-06-11 07:45:08', type: 'EVENT', name: 'guardrail-check', traceName: 'Safety-Guard', traceId: 'tr_3a8e5c0b', userId: 'user_1093', sessionId: 'sess_b22e', env: 'prod', level: 'WARNING', status: 'ok', isRoot: true, model: null, workspace: '人工智能实验室', latencyMs: 420, ttftMs: null, tags: ['safety'], input: '{"text":"..."}', output: '{"passed":true}', metadata: '{"rule":"pii"}' },
    { id: 'obs_g1', startTime: '2026-06-11 07:40:15', type: 'CHAIN', name: 'rag-retrieval-chain', traceName: 'RAG-Pipeline', traceId: 'tr_7e2d9c4a', userId: 'user_1093', sessionId: 'sess_b22e', env: 'prod', level: 'DEFAULT', status: 'ok', isRoot: false, model: null, workspace: '人工智能实验室', latencyMs: 1100, ttftMs: null, tags: ['feature:kb'], input: '{"query":"..."}', output: null, metadata: '{}' },
    { id: 'obs_h1', startTime: '2026-06-11 07:35:00', type: 'SPAN', name: 'vector-db-query', traceName: 'RAG-Pipeline', traceId: 'tr_7e2d9c4a', userId: 'user_1093', sessionId: 'sess_b22e', env: 'prod', level: 'DEFAULT', status: 'ok', isRoot: false, model: null, workspace: '人工智能实验室', latencyMs: 420, ttftMs: null, tags: ['feature:kb'], input: '{"top_k":5}', output: '{"hits":5}', metadata: '{"latency_ms":420}' }
  ],
  traces: [
    { id: 'tr_8f3a2b1c', name: 'agent-chat-completion', user: 'user_2847', session: 'sess_a91f', env: 'prod', latency: 3240, tokens: 4820, cost: 0.142, tags: ['feature:chat', 'v2.1'], status: 'ok', time: '2026-06-10 14:32:18' },
    { id: 'tr_7e2d9c4a', name: 'rag-retrieval-chain', user: 'user_1093', session: 'sess_b22e', env: 'prod', latency: 1890, tokens: 2150, cost: 0.068, tags: ['feature:kb'], status: 'ok', time: '2026-06-10 14:28:05' },
    { id: 'tr_6d1b8f3e', name: 'tool-call-weather', user: 'user_2847', session: 'sess_a91f', env: 'prod', latency: 4520, tokens: 6200, cost: 0.198, tags: ['agent:ops'], status: 'error', time: '2026-06-10 14:25:41' },
    { id: 'tr_5c0a7e2d', name: 'embedding-batch', user: 'system', session: null, env: 'prod', latency: 890, tokens: 12400, cost: 0.032, tags: ['batch'], status: 'ok', time: '2026-06-10 14:20:00' },
    { id: 'tr_4b9f6d1c', name: 'multi-turn-dialogue', user: 'user_5521', session: 'sess_c33d', env: 'staging', latency: 5680, tokens: 8900, cost: 0.256, tags: ['feature:chat'], status: 'ok', time: '2026-06-10 14:15:22' },
    { id: 'tr_3a8e5c0b', name: 'guardrail-check', user: 'user_1093', session: 'sess_b22e', env: 'prod', latency: 420, tokens: 180, cost: 0.004, tags: ['safety'], status: 'ok', time: '2026-06-10 14:12:08' }
  ],
  sessions: [
    { id: 'sess_a91f', user: 'user_2847', traces: 8, duration: '12m 34s', tokens: 28400, cost: 0.82, firstSeen: '2026-06-10 14:10:00', lastSeen: '2026-06-10 14:32:18' },
    { id: 'sess_b22e', user: 'user_1093', traces: 5, duration: '8m 12s', tokens: 15200, cost: 0.45, firstSeen: '2026-06-10 13:55:00', lastSeen: '2026-06-10 14:28:05' },
    { id: 'sess_c33d', user: 'user_5521', traces: 12, duration: '24m 08s', tokens: 45600, cost: 1.28, firstSeen: '2026-06-10 13:20:00', lastSeen: '2026-06-10 14:15:22' }
  ],
  users: [
    { id: 'user_2847', traces: 142, sessions: 28, tokens: '1.2M', cost: 34.2, lastActive: '2026-06-10 14:32' },
    { id: 'user_1093', traces: 89, sessions: 15, tokens: '680K', cost: 18.6, lastActive: '2026-06-10 14:28' },
    { id: 'user_5521', traces: 67, sessions: 12, tokens: '520K', cost: 14.8, lastActive: '2026-06-10 14:15' }
  ],
  traceDetail: {
    id: 'tr_8f3a2b1c',
    name: 'handle-chatbot-message',
    traceName: 'QA-Chatbot',
    user: 'user_2847',
    session: 'sess_a91f',
    workspace: '人工智能实验室',
    env: 'prod',
    time: '2026-06-11 08:00:40.137',
    latency: 3240,
    tokens: { prompt: 2840, completion: 1980, total: 4820 },
    cost: 0.142,
    tags: ['feature:chat', 'v2.1', 'qa-chatbot'],
    metadata: { agent_id: 'ops-assistant', version: '2.1.0', channel: 'web' },
    input: { messages: [{ role: 'user', content: 'What can I use Langfuse for?' }] },
    output: { content: 'Langfuse 是面向 LLM 应用的开源可观测性与评估平台，支持 Trace 全链路追踪、Prompt 管理、评估与数据集…' },
    observations: [
      { id: 'obs_1', type: 'AGENT', name: 'handle-chatbot-message', start: 0, duration: 3240, parent: null,
        children: ['obs_2', 'obs_3', 'obs_5'],
        input: { task: 'chat' }, output: null, tokens: null, model: null, cost: 0.142 },
      { id: 'obs_2', type: 'SPAN', name: 'get-langfuse-prompt', start: 80, duration: 320, parent: 'obs_1',
        children: [], input: { name: 'qa-chatbot' }, output: { version: 3 }, tokens: null, model: null },
      { id: 'obs_3', type: 'SPAN', name: 'create-mcp-client', start: 420, duration: 540, parent: 'obs_1',
        children: ['obs_4'],
        input: { server: 'langfuse-docs' }, output: null, tokens: null, model: null },
      { id: 'obs_4', type: 'TOOL', name: 'searchLangfuseDocs', start: 520, duration: 680, parent: 'obs_3',
        children: [], input: { query: 'use cases' }, output: { hits: 8 }, tokens: null, model: null },
      { id: 'obs_5', type: 'GENERATION', name: 'ai.streamText', start: 1520, duration: 1720, parent: 'obs_1',
        children: ['obs_6'],
        input: { messages: [{ role: 'user', content: 'What can I use Langfuse for?' }] },
        output: { content: 'Langfuse 是面向 LLM 应用的开源可观测性…' },
        tokens: { prompt: 2840, completion: 1980, total: 4820 },
        model: 'gpt-4o', ttft: 420, cost: 0.142 },
      { id: 'obs_6', type: 'SPAN', name: 'ai.streamText.doStream', start: 1680, duration: 1560, parent: 'obs_5',
        children: [], input: {}, output: { chunks: 42 }, tokens: null, model: 'gpt-4o' }
    ]
  },
  traceDetails: {
    'tr_7e2d9c4a': {
      id: 'tr_7e2d9c4a',
      name: 'rag-retrieval-chain',
      traceName: 'RAG-Pipeline',
      user: 'user_1093',
      session: 'sess_b22e',
      workspace: '人工智能实验室',
      env: 'prod',
      time: '2026-06-11 07:58:12.004',
      latency: 1890,
      tokens: { prompt: 1200, completion: 950, total: 2150 },
      cost: 0.068,
      tags: ['feature:kb'],
      metadata: { pipeline: 'rag-v2' },
      input: { query: 'CPU 异常 上周' },
      output: { docs: 5, answer: '根据知识库检索结果…' },
      observations: [
        { id: 'obs_r1', type: 'CHAIN', name: 'rag-retrieval-chain', start: 0, duration: 1890, parent: null,
          children: ['obs_r2', 'obs_r3'],
          input: { query: 'CPU 异常 上周' }, output: null, tokens: null, model: null, cost: 0.068 },
        { id: 'obs_r2', type: 'RETRIEVER', name: 'kb-search', start: 40, duration: 680, parent: 'obs_r1',
          children: ['obs_r4'],
          input: { query: 'CPU 异常 上周' }, output: { docs: 5 }, tokens: { total: 0 }, model: 'text-embedding-3' },
        { id: 'obs_r4', type: 'SPAN', name: 'vector-db-query', start: 120, duration: 420, parent: 'obs_r2',
          children: [], input: { top_k: 5 }, output: { hits: 5 }, tokens: null, model: null },
        { id: 'obs_r3', type: 'GENERATION', name: 'llm-synthesis', start: 780, duration: 1100, parent: 'obs_r1',
          children: [],
          input: { context: '...' }, output: { content: '根据知识库…' },
          tokens: { prompt: 1200, completion: 950, total: 2150 }, model: 'gpt-4o', ttft: 380, cost: 0.068 }
      ]
    },
    'tr_6d1b8f3e': {
      id: 'tr_6d1b8f3e',
      name: 'tool-call-weather',
      traceName: 'Agent-Ops',
      user: 'user_2847',
      session: 'sess_a91f',
      workspace: '人工智能实验室',
      env: 'prod',
      time: '2026-06-11 07:55:03.221',
      latency: 4520,
      tokens: { prompt: 3200, completion: 3000, total: 6200 },
      cost: 0.198,
      tags: ['agent:ops'],
      metadata: { tool: 'weather-api' },
      input: { city: 'Beijing' },
      output: { error: 'timeout' },
      observations: [
        { id: 'obs_t1', type: 'AGENT', name: 'tool-call-weather', start: 0, duration: 4520, parent: null,
          children: ['obs_t2', 'obs_t3'],
          input: { city: 'Beijing' }, output: { error: 'timeout' }, tokens: null, model: null, cost: 0.198 },
        { id: 'obs_t2', type: 'TOOL', name: 'weather-api', start: 200, duration: 4200, parent: 'obs_t1',
          children: [], input: { city: 'Beijing' }, output: { error: 'timeout' }, tokens: null, model: null },
        { id: 'obs_t3', type: 'GENERATION', name: 'error-handler', start: 4400, duration: 120, parent: 'obs_t1',
          children: [],
          input: { error: 'timeout' }, output: { message: '服务超时，请稍后重试' },
          tokens: { prompt: 200, completion: 80, total: 280 }, model: 'gpt-4o', ttft: 320, cost: 0.004 }
      ]
    }
  }
};
