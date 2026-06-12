/**
 * Agent ↔ 审批中心 localStorage 桥接（HTML 原型）
 */
const ApprovalBridge = {
  KEYS: {
    agents: 'xs-agents-v1',
    approvals: 'xs-approvals-dynamic-v1',
    runs: 'xs-agent-runs-v1',
    knowledge: 'xs-knowledge-v1'
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

  _seedKnowledge() {
    return typeof KNOWLEDGE_MOCK !== 'undefined' ? (KNOWLEDGE_MOCK.items || []) : [];
  },

  loadKnowledge() {
    const stored = this._read(this.KEYS.knowledge, {});
    const seed = this._seedKnowledge();
    const map = {};
    seed.forEach(k => {
      map[k.id] = { ...k, status: k.status || 'draft', slug: k.slug || k.id };
    });
    Object.keys(stored).forEach(id => {
      if (stored[id]._deleted) {
        delete map[id];
        return;
      }
      map[id] = { ...map[id], ...stored[id] };
    });
    return Object.values(map).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  },

  getKnowledge(id) {
    return this.loadKnowledge().find(k => k.id === id) || null;
  },

  saveKnowledge(kb) {
    const stored = this._read(this.KEYS.knowledge, {});
    const now = this._nowStr();
    const item = {
      ...kb,
      slug: kb.slug || kb.id,
      updatedAt: now,
      owner: kb.owner || this._currentUser()
    };
    if (!item.createdAt) item.createdAt = now;
    stored[item.id] = item;
    this._write(this.KEYS.knowledge, stored);
    return item;
  },

  deleteKnowledge(id) {
    const stored = this._read(this.KEYS.knowledge, {});
    stored[id] = { ...(stored[id] || {}), _deleted: true };
    this._write(this.KEYS.knowledge, stored);
  },

  submitKnowledgeForApproval(kb) {
    const version = kb.pendingVersion || kb.version || '1.0.0';
    const approvalId = 'apv_kb_' + Date.now();
    const now = this._nowStr();
    const submitter = this._currentUser();
    const workspace = kb.workspace || (typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG.workspace?.label : '人工智能实验室');

    const approval = {
      id: approvalId,
      type: 'platform_publish',
      resource: kb.slug || kb.id,
      resourceType: 'KnowledgeBase',
      version,
      submitter,
      workspace,
      submittedAt: now,
      waitingDuration: '刚刚',
      status: 'pending',
      assignedTo: '王小明',
      knowledgeId: kb.id,
      detail: {
        publishScope: kb.tag === 'public' ? '全部 Workspace 可见（平台公开）' : `${workspace}（当前团队）`,
        changeLog: kb.changeLog || `发布知识库「${kb.name}」v${version}`,
        aiReview: 'AI 预审：检查可见范围、文档敏感级与 Agent 检索权限配置',
        purpose: `供 Agent / Skill 检索：${kb.name}（${kb.docCount} 篇文档，${kb.sliceCount} 切片）`,
        riskBoundary: kb.tag === 'public'
          ? '全部 Workspace 可见，需人工复核敏感文档'
          : `仅限 ${workspace} 内成员与授权 Agent 检索`,
        configSummary: `公开范围 ${kb.tag === 'public' ? '公开' : '不公开'} · 文档 ${kb.docCount} · 切片 ${kb.sliceCount} · 引用 ${kb.refCount ?? '—'}`
      }
    };

    const dynamic = this._loadDynamicApprovals();
    dynamic.push(approval);
    this._saveDynamicApprovals(dynamic);

    const updated = this.saveKnowledge({
      ...kb,
      status: 'pending_approval',
      approvalId,
      pendingVersion: version,
      submittedAt: now,
      rejectComment: null
    });

    return { approvalId, knowledge: updated };
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

    const knowledgeId = approval?.knowledgeId;
    if (knowledgeId) {
      const stored = this._read(this.KEYS.knowledge, {});
      const cur = stored[knowledgeId] || this.getKnowledge(knowledgeId) || {};
      const next = { ...cur, id: knowledgeId };
      if (approved) {
        next.status = 'published';
        next.publishedAt = now;
        next.publishedVersion = approval?.version || next.pendingVersion || next.version || '1.0.0';
        next.version = next.publishedVersion;
        next.tag = next.tag === 'private' ? 'team' : next.tag;
        next.rejectComment = null;
      } else {
        next.status = 'rejected';
        next.rejectComment = comment || '审批驳回';
      }
      stored[knowledgeId] = next;
      this._write(this.KEYS.knowledge, stored);
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
