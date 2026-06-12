function agtT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('agent.' + k, p) : k;
}

const Agent = {
  search: '',
  statusFilter: '',
  detailId: null,
  detailTab: 'config',
  chatAgentId: null,
  chatMessages: {},
  chatInput: '',
  toast: null,

  init() {
    this.root = document.getElementById('agtContent');
    if (typeof XSparkI18n !== 'undefined') {
      XSparkI18n.applyDom(document);
      XSparkI18n.onChange(() => { XSparkI18n.applyDom(document); this.render(); });
    }
    this.render();
  },

  getAgents() { return ApprovalBridge.loadAgents(); },

  wsLabel(name) {
    return typeof XSparkI18n !== 'undefined' ? XSparkI18n.workspaceLabel(name) : name;
  },

  approvalCenterUrl(approvalId) {
    const base = '../../运营/审批中心/index.html';
    return approvalId ? `${base}?id=${encodeURIComponent(approvalId)}` : base;
  },

  goApprovalCenter(approvalId) {
    window.location.href = this.approvalCenterUrl(approvalId);
  },

  getFilteredAgents() {
    const q = this.search.trim().toLowerCase();
    return this.getAgents().filter(a => {
      if (this.statusFilter && a.status !== this.statusFilter) return false;
      if (q) {
        const ws = (a.workspace || '').toLowerCase();
        const wsLabel = this.wsLabel(a.workspace || '').toLowerCase();
        const match = a.name.toLowerCase().includes(q)
          || a.slug.toLowerCase().includes(q)
          || ws.includes(q)
          || wsLabel.includes(q);
        if (!match) return false;
      }
      return true;
    });
  },

  getAgent(id) { return ApprovalBridge.getAgent(id); },

  getVersionHistory(agentId) {
    const seed = typeof AGENT_MOCK !== 'undefined' ? (AGENT_MOCK.versionHistoryByAgentId || {}) : {};
    return seed[agentId] || [];
  },

  statusLabel(status) { return agtT('status.' + status) || status; },
  triggerLabel(trigger) { return agtT('runs.trigger.' + trigger) || trigger; },
  runStatusLabel(status) { return agtT('runs.status.' + status) || status; },
  versionStatusLabel(s) { return agtT('versions.status.' + s) || s; },

  defaultIntegration(agent) {
    const slug = agent.slug || 'agent';
    const ws = encodeURIComponent(agent.workspace || 'default');
    return {
      frontend: {
        enabled: agent.status === 'published',
        allowedOrigins: '',
        theme: 'auto',
        width: '100%',
        height: '640px',
        showHeader: true
      },
      api: {
        enabled: agent.status === 'published',
        apiKey: 'xsk_live_' + (agent.id || 'new').replace(/[^a-z0-9]/gi, '').slice(-8) + '_' + Math.random().toString(36).slice(2, 10),
        rateLimit: '60/min',
        webhookUrl: ''
      },
      _urls: {
        embed: `https://app.xsparkops.io/embed/agents/${slug}?workspace=${ws}`,
        api: `https://api.xsparkops.io/v1/agents/${slug}/chat/completions`
      }
    };
  },

  getIntegration(agent) {
    const base = this.defaultIntegration(agent);
    const saved = agent.integration || {};
    return {
      frontend: { ...base.frontend, ...saved.frontend },
      api: { ...base.api, ...saved.api },
      embedUrl: saved.embedUrl || base._urls.embed,
      apiEndpoint: saved.apiEndpoint || base._urls.api
    };
  },

  maskSecret(value, visible = 8) {
    const s = String(value || '');
    if (s.length <= visible) return s;
    return s.slice(0, visible) + '••••••••';
  },

  buildIframeSnippet(integration) {
    const w = integration.frontend.width || '100%';
    const h = integration.frontend.height || '640px';
    return `<iframe\n  src="${integration.embedUrl}"\n  width="${w}"\n  height="${h}"\n  frameborder="0"\n  allow="microphone; clipboard-write"\n  title="xSparkOps Agent"\n></iframe>`;
  },

  buildScriptSnippet(integration, agent) {
    const theme = integration.frontend.theme || 'auto';
    const header = integration.frontend.showHeader !== false;
    return `<script src="https://cdn.xsparkops.io/embed/v1/agent.js"><\/script>\n<div id="xs-agent-${agent.slug}"></div>\n<script>\n  XSparkAgent.mount({\n    container: '#xs-agent-${agent.slug}',\n    agent: '${agent.slug}',\n    embedUrl: '${integration.embedUrl}',\n    theme: '${theme}',\n    showHeader: ${header}\n  });\n<\/script>`;
  },

  buildCurlSnippet(integration) {
    return `curl -X POST '${integration.apiEndpoint}' \\\n  -H 'Authorization: Bearer ${integration.api.apiKey}' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\n    "messages": [{"role": "user", "content": "你好"}],\n    "stream": false\n  }'`;
  },

  buildFetchSnippet(integration) {
    return `const res = await fetch('${integration.apiEndpoint}', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer ${integration.api.apiKey}',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    messages: [{ role: 'user', content: '你好' }],\n    stream: false\n  })\n});\nconst data = await res.json();`;
  },

  copyText(text) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => this.showToast(agtT('integration.copied')));
    } else {
      this.showToast(agtT('integration.copied'));
    }
  },

  saveIntegrationConfig() {
    const agent = this.getAgent(this.detailId);
    if (!agent) return;
    const feEnabled = document.getElementById('agtIntFeEnabled')?.checked ?? false;
    const apiEnabled = document.getElementById('agtIntApiEnabled')?.checked ?? false;
    const integration = {
      embedUrl: document.getElementById('agtIntEmbedUrl')?.value?.trim() || this.getIntegration(agent).embedUrl,
      apiEndpoint: document.getElementById('agtIntApiEndpoint')?.value?.trim() || this.getIntegration(agent).apiEndpoint,
      frontend: {
        enabled: feEnabled,
        allowedOrigins: document.getElementById('agtIntOrigins')?.value || '',
        theme: document.getElementById('agtIntTheme')?.value || 'auto',
        width: document.getElementById('agtIntWidth')?.value?.trim() || '100%',
        height: document.getElementById('agtIntHeight')?.value?.trim() || '640px',
        showHeader: document.getElementById('agtIntShowHeader')?.checked ?? true
      },
      api: {
        enabled: apiEnabled,
        apiKey: agent.integration?.api?.apiKey || this.getIntegration(agent).api.apiKey,
        rateLimit: document.getElementById('agtIntRateLimit')?.value?.trim() || '60/min',
        webhookUrl: document.getElementById('agtIntWebhook')?.value?.trim() || ''
      }
    };
    ApprovalBridge.saveAgent({ ...agent, integration });
    this.showToast(agtT('integration.saved'));
    this.render();
  },

  regenerateApiKey() {
    const agent = this.getAgent(this.detailId);
    if (!agent) return;
    const integration = this.getIntegration(agent);
    const newKey = 'xsk_live_' + (agent.id || 'new').replace(/[^a-z0-9]/gi, '').slice(-8) + '_' + Math.random().toString(36).slice(2, 10);
    ApprovalBridge.saveAgent({
      ...agent,
      integration: {
        ...agent.integration,
        embedUrl: integration.embedUrl,
        apiEndpoint: integration.apiEndpoint,
        frontend: integration.frontend,
        api: { ...integration.api, apiKey: newKey }
      }
    });
    this.showToast(agtT('integration.keyRegenerated'));
    this.render();
  },

  refreshList() { this.render(); },

  showToast(msg, link) {
    this.toast = { msg, link };
    this.render();
    setTimeout(() => { this.toast = null; this.render(); }, 5000);
  },

  openDetail(id, tab) {
    this.detailId = id;
    this.detailTab = tab || 'config';
    this.render();
  },

  closeDetail() {
    this.detailId = null;
    this.render();
  },

  openChat(id) {
    const agent = this.getAgent(id);
    if (!agent) return;
    this.chatAgentId = id;
    this.chatInput = '';
    if (!this.chatMessages[id]?.length) {
      this.chatMessages[id] = [{
        role: 'assistant',
        content: agtT('chat.greeting', { name: agent.name }),
        time: this.nowStr()
      }];
    }
    this.render();
  },

  closeChat() {
    this.chatAgentId = null;
    this.render();
  },

  nowStr() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())}`;
  },

  mockChatReply(agent, userMsg) {
    const model = agent.config?.model || 'gpt-4o';
    const snippet = userMsg.length > 60 ? userMsg.slice(0, 60) + '…' : userMsg;
    return agtT('chat.mockReply', { name: agent.name, model, input: snippet });
  },

  sendChatMessage() {
    const id = this.chatAgentId;
    const agent = this.getAgent(id);
    const text = (this.chatInput || document.getElementById('agtChatInput')?.value || '').trim();
    if (!id || !agent || !text) return;

    const list = this.chatMessages[id] || [];
    list.push({ role: 'user', content: text, time: this.nowStr() });
    const reply = this.mockChatReply(agent, text);
    list.push({ role: 'assistant', content: reply, time: this.nowStr() });
    this.chatMessages[id] = list;
    this.chatInput = '';

    const run = ApprovalBridge.appendRunRecord(id, {
      trigger: 'chat',
      inputSummary: text.slice(0, 80),
      status: 'succeeded'
    });
    list[list.length - 1].traceId = run.traceId;

    this.render();
    const box = document.getElementById('agtChatMessages');
    if (box) box.scrollTop = box.scrollHeight;
  },

  isSubView() {
    return AgentWizard.open || !!this.detailId || !!this.chatAgentId;
  },

  render() {
    const pageHead = document.querySelector('.agt-page-head');
    if (pageHead) pageHead.style.display = this.isSubView() ? 'none' : '';

    const toastHtml = this.toast
      ? `<div class="agt-toast">${this.escapeHtml(this.toast.msg)}${this.toast.link ? `<a href="${this.escapeAttr(this.toast.link)}">${agtT('viewApproval')}</a>` : ''}</div>`
      : '';

    if (AgentWizard.open) {
      this.root.innerHTML = AgentWizard.render() + toastHtml;
      AgentWizard.bindEvents();
      return;
    }

    if (this.chatAgentId) {
      this.root.innerHTML = this.renderChatPage() + toastHtml;
      this.bindChatEvents();
      return;
    }

    if (this.detailId) {
      this.root.innerHTML = this.renderDetailPage() + toastHtml;
      this.bindDetailEvents();
      return;
    }

    const agents = this.getFilteredAgents();
    this.root.innerHTML = `
      <div class="agt-panel">
        ${this.renderToolbar()}
        <div class="agt-grid-wrap">
          <div class="agt-grid">
            ${agents.length ? agents.map(a => this.renderCard(a)).join('') : `<div class="agt-empty">${agtT('empty')}</div>`}
          </div>
        </div>
      </div>${toastHtml}`;
    this.bindListEvents();
  },

  renderToolbar() {
    const statuses = ['', 'draft', 'pending_approval', 'published', 'rejected'];
    return `
      <div class="agt-toolbar">
        <div class="agt-toolbar-left">
          <label class="agt-search">
            <svg viewBox="0 0 16 16" width="16" height="16"><circle cx="7" cy="7" r="4.5" stroke="currentColor" fill="none" stroke-width="1.4"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <input type="search" id="agtSearch" placeholder="${agtT('searchPlaceholder')}" value="${this.escapeAttr(this.search)}">
          </label>
          <div class="agt-status-tabs">
            ${statuses.map(s => `<button type="button" class="agt-status-tab${this.statusFilter === s ? ' active' : ''}" data-status="${s}">${s ? this.statusLabel(s) : agtT('allStatus')}</button>`).join('')}
          </div>
        </div>
        <button type="button" class="agt-btn-primary" id="agtCreate">${agtT('create')}</button>
      </div>`;
  },

  renderCard(agent) {
    const version = agent.status === 'published' ? (agent.publishedVersion || agent.version) : (agent.pendingVersion || agent.version);
    const metaRight = agent.status === 'pending_approval'
      ? (agent.approvalId
        ? `<a class="agt-approval-link" href="${this.approvalCenterUrl(agent.approvalId)}">${agtT('approvalId')}: ${this.escapeHtml(agent.approvalId)}</a>`
        : `${agtT('approvalId')}: —`)
      : agent.status === 'rejected'
        ? (agent.approvalId
          ? `<a class="agt-approval-link" href="${this.approvalCenterUrl(agent.approvalId)}">${this.escapeHtml(agent.rejectComment || agtT('rejectReason'))}</a>`
          : this.escapeHtml(agent.rejectComment || ''))
        : `${this.escapeHtml(agent.owner || '')} · ${this.escapeHtml(agent.updatedAt || '')}`;
    return `
      <article class="agt-card" data-id="${agent.id}">
        <div class="agt-card-inner">
          <div class="agt-card-head">
            <div>
              <div class="agt-card-title-row"><span class="agt-card-icon">${agent.icon || '🤖'}</span><span class="agt-card-name">${this.escapeHtml(agent.name)}</span></div>
              <div class="agt-card-slug">${this.escapeHtml(agent.slug)}${version ? ` · v${version}` : ''}</div>
              <div class="agt-card-ws" title="${agtT('fields.workspace')}">${this.escapeHtml(this.wsLabel(agent.workspace || '—'))}</div>
            </div>
            <span class="agt-tag agt-tag--${agent.status}">${this.statusLabel(agent.status)}</span>
          </div>
          <p class="agt-card-summary">${this.escapeHtml(agent.summary || '')}</p>
          <div class="agt-card-meta"><span>${this.escapeHtml(agent.category || '')}</span><span>${metaRight}</span></div>
          <div class="agt-card-foot">
            <button type="button" class="agt-btn-primary agt-card-chat" data-chat-id="${agent.id}">${agtT('actions.chat')}</button>
            <button type="button" class="agt-btn-ghost agt-card-detail" data-detail-id="${agent.id}">${agtT('actions.viewDetail')}</button>
          </div>
        </div>
      </article>`;
  },

  renderChatPage() {
    const agent = this.getAgent(this.chatAgentId);
    if (!agent) return '';
    const messages = this.chatMessages[this.chatAgentId] || [];
    const unpublished = agent.status !== 'published';
    const obsBase = '../../运营/ai观测/index.html';

    return `
      <div class="agt-chat-page">
        <header class="agt-chat-topbar">
          <button type="button" class="agt-create-back" id="agtChatBack">← ${agtT('chat.back')}</button>
          <div class="agt-chat-hero">
            <span class="agt-chat-icon">${agent.icon || '🤖'}</span>
            <div>
              <h2>${this.escapeHtml(agent.name)}</h2>
              <p><span class="mono">agent/${this.escapeHtml(agent.slug)}</span> · <span class="agt-tag agt-tag--${agent.status}">${this.statusLabel(agent.status)}</span></p>
            </div>
          </div>
          <div class="agt-chat-actions">
            <button type="button" class="agt-btn-ghost" id="agtChatDetail">${agtT('actions.viewDetail')}</button>
          </div>
        </header>
        ${unpublished ? `<div class="agt-chat-banner">${agtT('chat.unpublishedHint')}</div>` : ''}
        <div class="agt-chat-messages" id="agtChatMessages">
          ${messages.map(m => `
            <div class="agt-chat-msg agt-chat-msg--${m.role}">
              <div class="agt-chat-msg-head">
                <span class="agt-chat-msg-role">${m.role === 'user' ? agtT('chat.you') : agent.name}</span>
                <span class="agt-chat-msg-time">${m.time || ''}</span>
              </div>
              <div class="agt-chat-msg-body">${this.escapeHtml(m.content).replace(/\n/g, '<br>')}</div>
              ${m.traceId ? `<a class="agt-trace-link agt-chat-trace" href="${obsBase}?traceId=${encodeURIComponent(m.traceId)}" target="_blank" rel="noopener">${agtT('chat.viewTrace')} ${m.traceId}</a>` : ''}
            </div>`).join('')}
        </div>
        <footer class="agt-chat-composer">
          <textarea id="agtChatInput" rows="2" placeholder="${agtT('chat.placeholder')}">${this.escapeHtml(this.chatInput)}</textarea>
          <button type="button" class="agt-btn-primary" id="agtChatSend">${agtT('chat.send')}</button>
        </footer>
      </div>`;
  },

  renderDetailPage() {
    const agent = this.getAgent(this.detailId);
    if (!agent) return `<div class="agt-empty">${agtT('empty')}</div>`;

    const tabs = [
      { id: 'config', label: agtT('detail.tabs.config') },
      { id: 'approval', label: agtT('detail.tabs.approval') },
      { id: 'publish', label: agtT('detail.tabs.publish') },
      { id: 'runs', label: agtT('detail.tabs.runs') },
      { id: 'versions', label: agtT('detail.tabs.versions') }
    ];
    const body = {
      config: () => this.renderDetailConfig(agent),
      approval: () => this.renderDetailApproval(agent),
      publish: () => this.renderDetailPublish(agent),
      runs: () => this.renderDetailRuns(agent),
      versions: () => this.renderDetailVersions(agent)
    }[this.detailTab]?.() || '';

    const version = agent.status === 'published' ? (agent.publishedVersion || agent.version) : (agent.pendingVersion || agent.version);

    return `
      <div class="agt-detail-page">
        <header class="agt-detail-topbar">
          <button type="button" class="agt-create-back" id="agtDetailBack">← ${agtT('detail.backToList')}</button>
          <div class="agt-detail-hero">
            <span class="agt-detail-icon">${agent.icon || '🤖'}</span>
            <div>
              <h2>${this.escapeHtml(agent.name)}</h2>
              <p><span class="mono">agent/${this.escapeHtml(agent.slug)}</span>${version ? ` · v${version}` : ''} · <span class="agt-tag agt-tag--${agent.status}">${this.statusLabel(agent.status)}</span></p>
            </div>
          </div>
          <div class="agt-detail-actions">
            <button type="button" class="agt-btn-primary" id="agtDetailChat">${agtT('actions.chat')}</button>
            ${agent.status === 'draft' || agent.status === 'rejected' ? `<button type="button" class="agt-btn-ghost" id="agtDetailEdit">${agtT('actions.edit')}</button>` : ''}
            ${agent.status === 'draft' || agent.status === 'rejected' ? `<button type="button" class="agt-btn-ghost" id="agtDetailSubmit">${agtT('actions.submitApproval')}</button>` : ''}
            ${agent.status === 'pending_approval' ? `<button type="button" class="agt-btn-ghost" id="agtDetailApproval">${agtT('actions.viewApproval')}</button>` : ''}
            <button type="button" class="agt-btn-ghost" id="agtDetailClone">${agtT('actions.clone')}</button>
          </div>
        </header>
        <nav class="agt-detail-tabs">
          ${tabs.map(t => `<button type="button" class="agt-detail-tab${this.detailTab === t.id ? ' active' : ''}" data-detail-tab="${t.id}">${t.label}</button>`).join('')}
        </nav>
        <div class="agt-detail-body">${body}</div>
      </div>`;
  },

  renderDetailConfig(agent) {
    const c = agent.config || {};
    return `
      <div class="agt-detail-grid">
        <section class="agt-detail-section"><h3>${agtT('fields.summary')}</h3><p>${this.escapeHtml(agent.summary || '—')}</p></section>
        <section class="agt-detail-section"><h3>${agtT('fields.model')}</h3><p>${c.model || '—'} · temp ${c.temperature ?? '—'}</p></section>
        <section class="agt-detail-section agt-detail-section--wide"><h3>${agtT('fields.systemPrompt')}</h3><pre>${this.escapeHtml(c.systemPrompt || '—')}</pre></section>
        <section class="agt-detail-section"><h3>${agtT('wizard.capabilities')}</h3><p>${ApprovalBridge.buildConfigSummary(agent)}</p></section>
        <section class="agt-detail-section"><h3>${agtT('fields.autonomyLevel')}</h3><p>${c.autonomyLevel || '—'} · ${c.sandboxPolicy || '—'}</p></section>
        <section class="agt-detail-section"><h3>${agtT('fields.publishScope')}</h3><p>${this.escapeHtml(agent.publishScope || '—')}</p></section>
      </div>`;
  },

  renderDetailPublish(agent) {
    const integration = this.getIntegration(agent);
    const fe = integration.frontend;
    const api = integration.api;
    const unpublished = agent.status !== 'published';
    const iframeCode = this.buildIframeSnippet(integration);
    const scriptCode = this.buildScriptSnippet(integration, agent);
    const curlCode = this.buildCurlSnippet(integration);
    const fetchCode = this.buildFetchSnippet(integration);

    return `
      ${unpublished ? `<div class="agt-int-banner">${agtT('integration.unpublishedHint')}</div>` : ''}
      <p class="agt-int-intro">${agtT('integration.intro')}</p>
      <div class="agt-int-layout">
        <section class="agt-int-card">
          <div class="agt-int-card-head">
            <div>
              <h3>${agtT('integration.frontend.title')}</h3>
              <p>${agtT('integration.frontend.desc')}</p>
            </div>
            <label class="agt-int-toggle">
              <input type="checkbox" id="agtIntFeEnabled"${fe.enabled ? ' checked' : ''}${unpublished ? ' disabled' : ''}>
              <span>${agtT('integration.enabled')}</span>
            </label>
          </div>
          <div class="agt-int-form">
            <div class="agt-form-row">
              <label>${agtT('integration.frontend.embedUrl')}</label>
              <input type="url" id="agtIntEmbedUrl" value="${this.escapeAttr(integration.embedUrl)}"${unpublished ? ' readonly' : ''}>
            </div>
            <div class="agt-form-grid">
              <div class="agt-form-row">
                <label>${agtT('integration.frontend.theme')}</label>
                <select id="agtIntTheme"${unpublished ? ' disabled' : ''}>
                  <option value="auto"${fe.theme === 'auto' ? ' selected' : ''}>${agtT('integration.frontend.themeAuto')}</option>
                  <option value="light"${fe.theme === 'light' ? ' selected' : ''}>${agtT('integration.frontend.themeLight')}</option>
                  <option value="dark"${fe.theme === 'dark' ? ' selected' : ''}>${agtT('integration.frontend.themeDark')}</option>
                </select>
              </div>
              <div class="agt-form-row">
                <label>${agtT('integration.frontend.size')}</label>
                <div class="agt-int-size-row">
                  <input type="text" id="agtIntWidth" placeholder="100%" value="${this.escapeAttr(fe.width || '100%')}"${unpublished ? ' readonly' : ''}>
                  <span>×</span>
                  <input type="text" id="agtIntHeight" placeholder="640px" value="${this.escapeAttr(fe.height || '640px')}"${unpublished ? ' readonly' : ''}>
                </div>
              </div>
            </div>
            <div class="agt-form-row">
              <label>${agtT('integration.frontend.origins')}</label>
              <textarea id="agtIntOrigins" rows="3" placeholder="${agtT('integration.frontend.originsPh')}"${unpublished ? ' readonly' : ''}>${this.escapeHtml(fe.allowedOrigins || '')}</textarea>
            </div>
            <label class="agt-int-check">
              <input type="checkbox" id="agtIntShowHeader"${fe.showHeader !== false ? ' checked' : ''}${unpublished ? ' disabled' : ''}>
              <span>${agtT('integration.frontend.showHeader')}</span>
            </label>
          </div>
          <div class="agt-int-snippet">
            <div class="agt-int-snippet-head">
              <span>${agtT('integration.frontend.iframe')}</span>
              <button type="button" class="agt-btn-ghost agt-int-copy" data-copy-target="agtIntIframeCode">${agtT('integration.copy')}</button>
            </div>
            <pre id="agtIntIframeCode" class="agt-code-block">${this.escapeHtml(iframeCode)}</pre>
          </div>
          <div class="agt-int-snippet">
            <div class="agt-int-snippet-head">
              <span>${agtT('integration.frontend.script')}</span>
              <button type="button" class="agt-btn-ghost agt-int-copy" data-copy-target="agtIntScriptCode">${agtT('integration.copy')}</button>
            </div>
            <pre id="agtIntScriptCode" class="agt-code-block">${this.escapeHtml(scriptCode)}</pre>
          </div>
        </section>

        <section class="agt-int-card">
          <div class="agt-int-card-head">
            <div>
              <h3>${agtT('integration.api.title')}</h3>
              <p>${agtT('integration.api.desc')}</p>
            </div>
            <label class="agt-int-toggle">
              <input type="checkbox" id="agtIntApiEnabled"${api.enabled ? ' checked' : ''}${unpublished ? ' disabled' : ''}>
              <span>${agtT('integration.enabled')}</span>
            </label>
          </div>
          <div class="agt-int-form">
            <div class="agt-form-row">
              <label>${agtT('integration.api.endpoint')}</label>
              <input type="url" id="agtIntApiEndpoint" value="${this.escapeAttr(integration.apiEndpoint)}"${unpublished ? ' readonly' : ''}>
            </div>
            <div class="agt-form-row">
              <label>${agtT('integration.api.apiKey')}</label>
              <div class="agt-int-key-row">
                <input type="text" id="agtIntApiKey" value="${this.escapeAttr(this.maskSecret(api.apiKey))}" readonly>
                <button type="button" class="agt-btn-ghost" id="agtIntCopyKey" data-key="${this.escapeAttr(api.apiKey)}"${unpublished ? ' disabled' : ''}>${agtT('integration.copy')}</button>
                <button type="button" class="agt-btn-ghost" id="agtIntRegenKey"${unpublished ? ' disabled' : ''}>${agtT('integration.api.regenerate')}</button>
              </div>
            </div>
            <div class="agt-form-grid">
              <div class="agt-form-row">
                <label>${agtT('integration.api.rateLimit')}</label>
                <input type="text" id="agtIntRateLimit" value="${this.escapeAttr(api.rateLimit || '60/min')}"${unpublished ? ' readonly' : ''}>
              </div>
              <div class="agt-form-row">
                <label>${agtT('integration.api.webhook')}</label>
                <input type="url" id="agtIntWebhook" placeholder="${agtT('integration.api.webhookPh')}" value="${this.escapeAttr(api.webhookUrl || '')}"${unpublished ? ' readonly' : ''}>
              </div>
            </div>
            <p class="agt-int-hint">${agtT('integration.api.authHint')}</p>
          </div>
          <div class="agt-int-snippet">
            <div class="agt-int-snippet-head">
              <span>cURL</span>
              <button type="button" class="agt-btn-ghost agt-int-copy" data-copy-target="agtIntCurlCode">${agtT('integration.copy')}</button>
            </div>
            <pre id="agtIntCurlCode" class="agt-code-block">${this.escapeHtml(curlCode)}</pre>
          </div>
          <div class="agt-int-snippet">
            <div class="agt-int-snippet-head">
              <span>JavaScript (fetch)</span>
              <button type="button" class="agt-btn-ghost agt-int-copy" data-copy-target="agtIntFetchCode">${agtT('integration.copy')}</button>
            </div>
            <pre id="agtIntFetchCode" class="agt-code-block">${this.escapeHtml(fetchCode)}</pre>
          </div>
        </section>
      </div>
      <div class="agt-int-foot">
        <button type="button" class="agt-btn-primary" id="agtIntSave"${unpublished ? ' disabled' : ''}>${agtT('integration.save')}</button>
        <a class="agt-btn-ghost" href="https://docs.xsparkops.io/agents/integration" target="_blank" rel="noopener">${agtT('integration.docs')}</a>
      </div>`;
  },

  renderDetailApproval(agent) {
    const rows = [];
    if (agent.approvalId) {
      rows.push(`<tr><td>${agtT('approvalId')}</td><td class="mono"><a class="agt-approval-link" href="${this.approvalCenterUrl(agent.approvalId)}">${agent.approvalId}</a></td></tr>`);
    }
    rows.push(`<tr><td>${agtT('detail.approvalStatus')}</td><td><span class="agt-tag agt-tag--${agent.status}">${this.statusLabel(agent.status)}</span></td></tr>`);
    if (agent.submittedAt) rows.push(`<tr><td>${agtT('detail.submittedAt')}</td><td>${agent.submittedAt}</td></tr>`);
    if (agent.publishedAt) rows.push(`<tr><td>${agtT('detail.publishedAt')}</td><td>${agent.publishedAt}</td></tr>`);
    if (agent.rejectComment) rows.push(`<tr><td>${agtT('rejectReason')}</td><td style="color:var(--agt-err)">${this.escapeHtml(agent.rejectComment)}</td></tr>`);
    if (agent.changeLog) rows.push(`<tr><td>${agtT('fields.changeLog')}</td><td>${this.escapeHtml(agent.changeLog)}</td></tr>`);
    if (agent.purpose) rows.push(`<tr><td>${agtT('fields.purpose')}</td><td>${this.escapeHtml(agent.purpose)}</td></tr>`);
    if (agent.riskBoundary) rows.push(`<tr><td>${agtT('fields.riskBoundary')}</td><td>${this.escapeHtml(agent.riskBoundary)}</td></tr>`);

    return `
      <div class="agt-detail-section">
        <div class="agt-detail-section-head">
          <h3>${agtT('detail.tabs.approval')}</h3>
          <a class="agt-btn-ghost" href="${this.approvalCenterUrl(agent.approvalId)}">${agtT('viewApproval')}</a>
        </div>
        <table class="agt-detail-table"><tbody>${rows.join('')}</tbody></table>
      </div>`;
  },

  renderDetailRuns(agent) {
    const runs = ApprovalBridge.getRunRecords(agent.id);
    if (!runs.length) return `<p class="agt-detail-empty">${agtT('runs.empty')}</p>`;
    const obsBase = '../../运营/ai观测/index.html';
    return `
      <table class="agt-run-table agt-run-table--detail">
        <thead><tr>
          <th>${agtT('runs.startedAt')}</th><th>${agtT('runs.triggerCol')}</th><th>${agtT('runs.input')}</th>
          <th>${agtT('runs.statusLabel')}</th><th>${agtT('runs.duration')}</th><th>Token</th><th>Trace</th>
        </tr></thead>
        <tbody>${runs.map(r => `
          <tr>
            <td>${r.startedAt}</td>
            <td>${this.triggerLabel(r.trigger)}</td>
            <td>${this.escapeHtml((r.inputSummary || '').slice(0, 50))}</td>
            <td class="agt-run-status--${r.status}">${this.runStatusLabel(r.status)}</td>
            <td>${r.durationMs ? r.durationMs + 'ms' : '—'}</td>
            <td>${r.tokens || '—'}</td>
            <td><a class="agt-trace-link" href="${obsBase}?traceId=${encodeURIComponent(r.traceId)}" target="_blank" rel="noopener">${r.traceId}</a></td>
          </tr>`).join('')}</tbody>
      </table>`;
  },

  renderDetailVersions(agent) {
    const versions = this.getVersionHistory(agent.id);
    if (!versions.length) return `<p class="agt-detail-empty">${agtT('versions.empty')}</p>`;
    return `
      <table class="agt-run-table agt-run-table--detail">
        <thead><tr>
          <th>${agtT('fields.version')}</th><th>${agtT('detail.versionStatus')}</th><th>${agtT('detail.publishedAt')}</th>
          <th>${agtT('detail.publisher')}</th><th>${agtT('fields.changeLog')}</th><th>${agtT('approvalId')}</th>
        </tr></thead>
        <tbody>${versions.map(v => `
          <tr>
            <td class="mono">v${v.version}</td>
            <td><span class="agt-tag agt-tag--${v.status === 'published' ? 'published' : v.status === 'rejected' ? 'rejected' : v.status === 'pending_approval' ? 'pending_approval' : 'draft'}">${this.versionStatusLabel(v.status)}</span></td>
            <td>${v.publishedAt}</td>
            <td>${this.escapeHtml(v.publisher || '—')}</td>
            <td>${this.escapeHtml(v.changeLog || '—')}</td>
            <td>${v.approvalId ? `<a class="agt-approval-link mono" href="${this.approvalCenterUrl(v.approvalId)}">${v.approvalId}</a>` : '—'}</td>
          </tr>`).join('')}</tbody>
      </table>`;
  },

  cloneAgent(id) {
    const src = this.getAgent(id);
    if (!src) return;
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = 'agt_new_' + Date.now();
    copy.slug = src.slug + '-copy';
    copy.name = src.name + ' (副本)';
    copy.status = 'draft';
    copy.approvalId = null;
    copy.rejectComment = null;
    copy.publishedAt = null;
    copy.publishedVersion = null;
    ApprovalBridge.saveAgent(copy);
    AgentWizard.openEdit(copy, false);
  },

  quickSubmit(id) {
    const agent = this.getAgent(id);
    if (!agent) return;
    const updated = ApprovalBridge.saveAgent({ ...agent, configSummary: ApprovalBridge.buildConfigSummary(agent) });
    const { approvalId } = ApprovalBridge.submitForApproval(updated);
    this.showToast(agtT('wizard.submittedApproval', { id: approvalId }), this.approvalCenterUrl(approvalId));
    this.openDetail(id, 'approval');
  },

  bindListEvents() {
    document.getElementById('agtSearch')?.addEventListener('input', e => { this.search = e.target.value; this.render(); });
    document.querySelectorAll('.agt-status-tab').forEach(btn => {
      btn.addEventListener('click', () => { this.statusFilter = btn.dataset.status; this.render(); });
    });
    document.getElementById('agtCreate')?.addEventListener('click', () => AgentWizard.openCreate());
    document.querySelectorAll('.agt-card-chat').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        this.openChat(btn.dataset.chatId);
      });
    });
    document.querySelectorAll('.agt-card-detail').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        this.openDetail(btn.dataset.detailId, 'config');
      });
    });
    document.querySelectorAll('.agt-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('button') || e.target.closest('a')) return;
        this.openDetail(card.dataset.id, 'config');
      });
    });
    document.querySelectorAll('.agt-approval-link').forEach(link => {
      link.addEventListener('click', e => e.stopPropagation());
    });
  },

  bindChatEvents() {
    document.getElementById('agtChatBack')?.addEventListener('click', () => this.closeChat());
    document.getElementById('agtChatDetail')?.addEventListener('click', () => {
      const id = this.chatAgentId;
      this.chatAgentId = null;
      this.detailId = null;
      this.openDetail(id, 'config');
    });
    document.getElementById('agtChatSend')?.addEventListener('click', () => this.sendChatMessage());
    const input = document.getElementById('agtChatInput');
    if (input) {
      input.addEventListener('input', () => { this.chatInput = input.value; });
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendChatMessage();
        }
      });
    }
    const box = document.getElementById('agtChatMessages');
    if (box) box.scrollTop = box.scrollHeight;
  },

  bindDetailEvents() {
    document.getElementById('agtDetailBack')?.addEventListener('click', () => this.closeDetail());
    document.getElementById('agtDetailChat')?.addEventListener('click', () => this.openChat(this.detailId));
    document.querySelectorAll('.agt-detail-tab').forEach(tab => {
      tab.addEventListener('click', () => { this.detailTab = tab.dataset.detailTab; this.render(); });
    });
    document.getElementById('agtDetailEdit')?.addEventListener('click', () => {
      const agent = this.getAgent(this.detailId);
      this.detailId = null;
      AgentWizard.openEdit(agent, false);
    });
    document.getElementById('agtDetailSubmit')?.addEventListener('click', () => this.quickSubmit(this.detailId));
    document.getElementById('agtDetailApproval')?.addEventListener('click', () => {
      const agent = this.getAgent(this.detailId);
      this.goApprovalCenter(agent?.approvalId);
    });
    document.getElementById('agtDetailClone')?.addEventListener('click', () => {
      this.cloneAgent(this.detailId);
      this.detailId = null;
    });
    if (this.detailTab === 'publish') this.bindPublishEvents();
  },

  bindPublishEvents() {
    document.getElementById('agtIntSave')?.addEventListener('click', () => this.saveIntegrationConfig());
    document.getElementById('agtIntRegenKey')?.addEventListener('click', () => this.regenerateApiKey());
    document.getElementById('agtIntCopyKey')?.addEventListener('click', e => {
      this.copyText(e.currentTarget.dataset.key || '');
    });
    document.querySelectorAll('.agt-int-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const el = document.getElementById(btn.dataset.copyTarget);
        if (el) this.copyText(el.textContent);
      });
    });
  },

  escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  escapeAttr(str) {
    return this.escapeHtml(str).replace(/"/g, '&quot;');
  }
};
