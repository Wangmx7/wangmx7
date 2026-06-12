const AUDIT_FILTER_DEFS = [
  { key: 'action', label: 'Action', options: ['login', 'agent.create', 'agent.delete', 'export', 'permission.change', 'workflow.publish', 'run.trigger', 'mcp.register', 'skill.publish', 'api_key.create'] },
  { key: 'resourceType', label: 'Resource Type', options: ['agent', 'skill', 'mcp', 'workflow', 'knowledge', 'workspace', 'session', 'api_key'] },
  { key: 'risk', label: 'Risk', options: ['low', 'medium', 'high'] }
];

const TOOL_FILTER_DEFS = [
  { key: 'type', label: 'Type', options: ['Agent', 'Skill', 'MCP', 'Tool'] },
  { key: 'status', label: 'Status', options: ['success', 'failed', 'timeout'] },
  { key: 'resource', label: 'Resource', options: ['ops-assistant', 'log-analyzer', 'prod-mcp-git', 'tool-call-weather', 'data-export', 'chat-support', 'embedding-batch'] }
];

const GovFilterEngine = {
  emptyAuditFilters() {
    return { action: '', resourceType: '', risk: '', workspace: xsparkDefaultWorkspaceFilter(), search: '' };
  },

  emptyToolFilters() {
    return { type: '', status: '', resource: '', workspace: xsparkDefaultWorkspaceFilter(), search: '' };
  },

  applyAudit(rows, filters) {
    return rows.filter(row => {
      if (filters.workspace && row.workspace !== filters.workspace) return false;
      if (filters.action && row.action !== filters.action) return false;
      if (filters.resourceType && row.resourceType !== filters.resourceType) return false;
      if (filters.risk && row.risk !== filters.risk) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const blob = [row.user, row.action, row.resourceType, row.resource, row.workspace, row.ip].join(' ').toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  },

  applyTool(rows, filters) {
    return rows.filter(row => {
      if (filters.workspace && row.workspace !== filters.workspace) return false;
      if (filters.type && row.type !== filters.type) return false;
      if (filters.status && row.status !== filters.status) return false;
      if (filters.resource && row.resource !== filters.resource) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const blob = [row.user, row.type, row.resource, row.operation, row.traceId, row.workspace].join(' ').toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }
};
