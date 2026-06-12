const TRACE_FILTER_DEFS = [
  { key: 'type', label: 'Type', options: ['GENERATION', 'SPAN', 'TOOL', 'AGENT', 'RETRIEVER', 'CHAIN', 'EVENT'] },
  { key: 'status', label: 'Status', options: ['ok', 'error'] },
  { key: 'isRoot', label: 'Is Root', options: ['true', 'false'] },
  { key: 'model', label: 'Model', options: ['gpt-4o', 'claude-3-5-sonnet', 'text-embedding-3'] },
  { key: 'tags', label: 'Tags', options: ['feature:chat', 'feature:kb', 'agent:ops', 'safety', 'batch', 'v2.1'] },
  { key: 'userId', label: 'User', options: ['user_2847', 'user_1093', 'user_5521', 'system'] }
];

const TraceFilterEngine = {
  emptyFilters() {
    return {
      type: '', status: '', isRoot: '', model: '', tags: '', userId: '',
      workspace: '', search: ''
    };
  },

  apply(rows, filters) {
    return rows.filter(row => {
      if (filters.workspace && row.workspace !== filters.workspace) return false;
      if (filters.type && row.type !== filters.type) return false;
      if (filters.status && row.status !== filters.status) return false;
      if (filters.isRoot) {
        const root = row.isRoot ? 'true' : 'false';
        if (root !== filters.isRoot) return false;
      }
      if (filters.model && (row.model || '') !== filters.model) return false;
      if (filters.tags && !(row.tags || []).includes(filters.tags)) return false;
      if (filters.userId && row.userId !== filters.userId) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const blob = [row.id, row.name, row.traceName, row.traceId, row.userId, row.input, row.output].join(' ').toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  },

  parseNaturalLanguage(text) {
    const t = text.toLowerCase();
    const f = this.emptyFilters();
    const applied = [];

    if (/error|错误|失败|异常/.test(t)) {
      f.status = 'error'; applied.push('Status = error');
    }
    if (/warning|警告/.test(t)) { f.tags = 'safety'; applied.push('Tags = safety'); }

    if (/generation|llm|生成/.test(t)) { f.type = 'GENERATION'; applied.push('Type = GENERATION'); }
    if (/tool|工具/.test(t)) { f.type = 'TOOL'; applied.push('Type = TOOL'); }
    if (/agent|智能体/.test(t)) { f.type = 'AGENT'; applied.push('Type = AGENT'); }
    if (/retriev|检索|rag/.test(t)) { f.type = 'RETRIEVER'; applied.push('Type = RETRIEVER'); }

    if (/chat|对话/.test(t)) { f.tags = 'feature:chat'; applied.push('Tags = feature:chat'); }
    if (/知识库|kb/.test(t)) { f.tags = 'feature:kb'; applied.push('Tags = feature:kb'); }
    if (/gpt-4|gpt4/.test(t)) { f.model = 'gpt-4o'; applied.push('Model = gpt-4o'); }

    const userMatch = t.match(/user[_\s]?(\d+)/);
    if (userMatch) { f.userId = `user_${userMatch[1]}`; applied.push(`User = user_${userMatch[1]}`); }

    if (/root|根节点|根观察/.test(t)) { f.isRoot = 'true'; applied.push('Is Root = true'); }

    if (/人工智能实验室|ai.lab|ai lab/.test(t)) { f.workspace = '人工智能实验室'; applied.push('Workspace = 人工智能实验室'); }
    if (/it.?运维|运维 workspace/.test(t)) { f.workspace = 'IT 运维 Workspace'; applied.push('Workspace = IT 运维 Workspace'); }
    if (/default workspace|默认 workspace/.test(t)) { f.workspace = 'Default Workspace'; applied.push('Workspace = Default Workspace'); }

    if (!applied.length) {
      f.search = text.trim();
      applied.push(`Search = "${text.trim()}"`);
    }

    return { filters: f, applied, summary: applied.join(' · ') };
  }
};
