/**
 * Agent ↔ 审批中心 localStorage 桥接（HTML 原型）
 */
const ApprovalBridge = {
  KEYS: {
    agents: 'xs-agents-v1',
    approvals: 'xs-approvals-dynamic-v1',
    runs: 'xs-agent-runs-v1'
  },

  _read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  _write(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  _nowStr() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  },

  _currentUser() {
    return (typeof APPROVAL_MOCK !== 'undefined' && APPROVAL_MOCK.currentUser)
      || (typeof SIDEBAR_CONFIG !== 'undefined' && SIDEBAR_CONFIG.user?.name)
      || '王小明';
  },

  _seedAgents() {
    return typeof AGENT_MOCK !== 'undefined' ? (AGENT_MOCK.items || []) : [];
  },

  loadAgents() {
    const stored = this._read(this.KEYS.agents, {});
    const seed = this._seedAgents();
    const map = {};
    seed.forEach(a => { map[a.id] = { ...a }; });
    Object.keys(stored).forEach(id => {
      map[id] = { ...map[id], ...stored[id] };
    });
    return Object.values(map).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  },

  getAgent(id) {
    return this.loadAgents().find(a => a.id === id) || null;
  },

  saveAgent(agent) {
    const stored = this._read(this.KEYS.agents, {});
    const now = this._nowStr();
    const item = {
      ...agent,
      updatedAt: now,
      owner: agent.owner || this._currentUser()
    };
    if (!item.createdAt) item.createdAt = now;
    stored[item.id] = item;
    this._write(this.KEYS.agents, stored);
    return item;
  },

  _loadDynamicApprovals() {
    let stored = this._read(this.KEYS.approvals, []);
    if (!stored.length && typeof AGENT_MOCK !== 'undefined' && AGENT_MOCK.dynamicApprovals?.length) {
      stored = AGENT_MOCK.dynamicApprovals;
      this._saveDynamicApprovals(stored);
    }
    return stored;
  },

  _saveDynamicApprovals(list) {
    this._write(this.KEYS.approvals, list);
  },

  loadApprovals(staticItems) {
    const base = staticItems || (typeof APPROVAL_MOCK !== 'undefined' ? APPROVAL_MOCK.items : []);
    const dynamic = this._loadDynamicApprovals();
    const merged = [...base];
    dynamic.forEach(d => {
      const idx = merged.findIndex(m => m.id === d.id);
      if (idx >= 0) merged[idx] = d;
      else merged.push(d);
    });
    return merged;
  },

  submitForApproval(agent) {
    const version = agent.pendingVersion || agent.version || '1.0.0';
    const approvalId = 'apv_dyn_' + Date.now();
    const now = this._nowStr();
    const submitter = this._currentUser();
    const workspace = agent.workspace || (typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG.workspace?.label : '人工智能实验室');

    const approval = {
      id: approvalId,
      type: 'platform_publish',
      resource: agent.slug,
      resourceType: 'Agent',
      version,
      submitter,
      workspace,
      submittedAt: now,
      waitingDuration: '刚刚',
      status: 'pending',
      assignedTo: '王小明',
      agentId: agent.id,
      detail: {
        publishScope: agent.publishScope || workspace,
        changeLog: agent.changeLog || agent.summary || '—',
        aiReview: 'AI 预审：待人工复核 Agent 配置与 Tool 权限',
        purpose: agent.purpose || agent.summary || '—',
        riskBoundary: agent.riskBoundary || agent.config?.sandboxPolicy || '—',
        configSummary: agent.configSummary || this.buildConfigSummary(agent)
      }
    };

    const dynamic = this._loadDynamicApprovals();
    dynamic.push(approval);
    this._saveDynamicApprovals(dynamic);

    const updated = this.saveAgent({
      ...agent,
      status: 'pending_approval',
      approvalId,
      pendingVersion: version,
      submittedAt: now,
      rejectComment: null
    });

    return { approvalId, agent: updated };
  },

  buildConfigSummary(agent) {
    const c = agent.config || {};
    const parts = [];
    if (c.model) parts.push(`模型: ${c.model}`);
    if (c.autonomyLevel) parts.push(`自主级别: ${c.autonomyLevel}`);
    if (c.skills?.length) parts.push(`Skill: ${c.skills.join(', ')}`);
    if (c.tools?.length) parts.push(`Tool: ${c.tools.join(', ')}`);
    if (c.mcp?.length) parts.push(`MCP: ${c.mcp.join(', ')}`);
    if (c.knowledgeBases?.length) parts.push(`知识库: ${c.knowledgeBases.join(', ')}`);
    return parts.join('；') || '—';
  },

  resolveApproval(id, { approved, comment }) {
    const dynamic = this._loadDynamicApprovals();
    const idx = dynamic.findIndex(a => a.id === id);
    const now = this._nowStr();
    const approver = this._currentUser();

    let approval = null;
    if (idx >= 0) {
      approval = {
        ...dynamic[idx],
        status: approved ? 'approved' : 'rejected',
        approver,
        approvedAt: now,
        comment: comment || '',
        waitingDuration: '—'
      };
      dynamic[idx] = approval;
      this._saveDynamicApprovals(dynamic);
    }

    const agentId = approval?.agentId;
    const slug = approval?.resource;
    const agents = this._read(this.KEYS.agents, {});
    let targetKey = agentId;
    if (!targetKey && slug) {
      const found = this.loadAgents().find(a => a.slug === slug);
      if (found) targetKey = found.id;
    }

    if (targetKey) {
      const cur = agents[targetKey] || this.getAgent(targetKey) || {};
      const next = { ...cur, id: targetKey };
      if (approved) {
        next.status = 'published';
        next.publishedAt = now;
        next.publishedVersion = approval?.version || next.pendingVersion || next.version || '1.0.0';
        next.version = next.publishedVersion;
        next.rejectComment = null;
      } else {
        next.status = 'rejected';
        next.rejectComment = comment || '审批驳回';
      }
      agents[targetKey] = next;
      this._write(this.KEYS.agents, agents);
    }

    if (!approval && typeof APPROVAL_MOCK !== 'undefined') {
      const staticItem = APPROVAL_MOCK.items.find(i => i.id === id);
      if (staticItem && staticItem.type === 'platform_publish' && staticItem.resourceType === 'Agent') {
        staticItem.status = approved ? 'approved' : 'rejected';
        staticItem.approver = approver;
        staticItem.approvedAt = now;
        staticItem.comment = comment || '';
        staticItem.waitingDuration = '—';
        const found = this.loadAgents().find(a => a.slug === staticItem.resource);
        if (found) {
          this.saveAgent({
            ...found,
            status: approved ? 'published' : 'rejected',
            publishedAt: approved ? now : found.publishedAt,
            publishedVersion: approved ? (staticItem.version || found.version) : found.publishedVersion,
            version: approved ? (staticItem.version || found.version) : found.version,
            rejectComment: approved ? null : (comment || '审批驳回')
          });
        }
      }
    }

    return approval;
  },

  getRunRecords(agentId) {
    const stored = this._read(this.KEYS.runs, {});
    const seed = typeof AGENT_MOCK !== 'undefined' ? (AGENT_MOCK.runsByAgentId || {}) : {};
    const merged = [...(seed[agentId] || []), ...(stored[agentId] || [])];
    return merged.sort((a, b) => (b.startedAt || '').localeCompare(a.startedAt || ''));
  },

  appendRunRecord(agentId, run) {
    const stored = this._read(this.KEYS.runs, {});
    const list = stored[agentId] || [];
    const item = {
      id: 'run_' + Date.now(),
      startedAt: this._nowStr(),
      status: 'succeeded',
      durationMs: 1200 + Math.floor(Math.random() * 3000),
      tokens: 800 + Math.floor(Math.random() * 2000),
      traceId: 'tr_' + Math.random().toString(36).slice(2, 10),
      ...run
    };
    list.unshift(item);
    stored[agentId] = list;
    this._write(this.KEYS.runs, stored);
    return item;
  }
};
