const TRACE_FILTER_DEFS = [
  { key: 'type', label: 'Type', type: 'checkbox', options: ['GENERATION', 'SPAN', 'TOOL', 'AGENT', 'RETRIEVER', 'CHAIN', 'EVENT'] },
  { key: 'isRoot', label: 'Is Root', type: 'checkbox', options: ['true', 'false'] },
  { key: 'traceName', label: 'Trace Name', type: 'text', placeholder: 'Filter trace name…' },
  { key: 'name', label: 'Name', type: 'text', placeholder: 'Filter name…' },
  { key: 'model', label: 'Model', type: 'checkbox', options: ['gpt-4o', 'claude-3-5-sonnet', 'text-embedding-3'] },
  { key: 'tags', label: 'Tags', type: 'checkbox', options: ['feature:chat', 'feature:kb', 'agent:ops', 'safety', 'batch', 'v2.1'] },
  { key: 'userId', label: 'User ID', type: 'text', placeholder: 'user_2847' },
  { key: 'sessionId', label: 'Session ID', type: 'text', placeholder: 'session id…' },
  { key: 'traceId', label: 'Trace ID', type: 'text', placeholder: 'tr_…' },
  { key: 'status', label: 'Status', type: 'checkbox', options: ['ok', 'error'] }
];

const TraceFilterEngine = {
  emptyFilters() {
    return {
      type: [], status: [], isRoot: [], model: [], tags: [],
      traceName: '', name: '', userId: '', sessionId: '', traceId: '',
      workspace: xsparkDefaultWorkspaceFilter(), search: ''
    };
  },

  activeCount(filters) {
    let n = 0;
    TRACE_FILTER_DEFS.forEach(def => {
      const v = filters[def.key];
      if (def.type === 'checkbox') n += (v || []).length;
      else if (typeof v === 'string' && v.trim()) n += 1;
    });
    return n;
  },

  apply(rows, filters) {
    return rows.filter(row => {
      if (filters.workspace && row.workspace !== filters.workspace) return false;
      if (filters.type?.length && !filters.type.includes(row.type)) return false;
      if (filters.status?.length && !filters.status.includes(row.status)) return false;
      if (filters.isRoot?.length) {
        const root = row.isRoot ? 'true' : 'false';
        if (!filters.isRoot.includes(root)) return false;
      }
      if (filters.model?.length && !filters.model.includes(row.model || '')) return false;
      if (filters.tags?.length && !(row.tags || []).some(t => filters.tags.includes(t))) return false;
      if (filters.traceName?.trim() && !(row.traceName || '').toLowerCase().includes(filters.traceName.toLowerCase())) return false;
      if (filters.name?.trim() && !(row.name || '').toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.userId?.trim() && row.userId !== filters.userId.trim()) return false;
      if (filters.sessionId?.trim() && row.sessionId !== filters.sessionId.trim()) return false;
      if (filters.traceId?.trim() && row.traceId !== filters.traceId.trim()) return false;
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
      f.status = ['error']; applied.push('Status = error');
    }
    if (/warning|警告/.test(t)) { f.tags = ['safety']; applied.push('Tags = safety'); }

    if (/generation|llm|生成/.test(t)) { f.type = ['GENERATION']; applied.push('Type = GENERATION'); }
    if (/tool|工具/.test(t)) { f.type = ['TOOL']; applied.push('Type = TOOL'); }
    if (/agent|智能体/.test(t)) { f.type = ['AGENT']; applied.push('Type = AGENT'); }
    if (/retriev|检索|rag/.test(t)) { f.type = ['RETRIEVER']; applied.push('Type = RETRIEVER'); }

    if (/chat|对话/.test(t)) { f.tags = ['feature:chat']; applied.push('Tags = feature:chat'); }
    if (/知识库|kb/.test(t)) { f.tags = ['feature:kb']; applied.push('Tags = feature:kb'); }
    if (/gpt-4|gpt4/.test(t)) { f.model = ['gpt-4o']; applied.push('Model = gpt-4o'); }

    const userMatch = t.match(/user[_\s]?(\d+)/);
    if (userMatch) { f.userId = `user_${userMatch[1]}`; applied.push(`User = user_${userMatch[1]}`); }

    if (/root|根节点|根观察/.test(t)) { f.isRoot = ['true']; applied.push('Is Root = true'); }

    if (/人工智能实验室|ai.lab|ai lab/.test(t)) { f.workspace = '人工智能实验室'; applied.push('Workspace = 人工智能实验室'); }
    if (/it.?运维|运维 workspace/.test(t)) { f.workspace = 'IT 运维 Workspace'; applied.push('Workspace = IT 运维 Workspace'); }
    if (/global workspace|default workspace|默认 workspace/.test(t)) { f.workspace = 'Global WorkSpace'; applied.push('Workspace = Global WorkSpace'); }

    if (!applied.length) {
      f.search = text.trim();
      applied.push(`Search = "${text.trim()}"`);
    }

    return { filters: f, applied, summary: applied.join(' · ') };
  }
};
