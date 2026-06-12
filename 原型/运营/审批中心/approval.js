function apvT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('approval.' + k, p) : k;
}
function apvCommonT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('common.' + k, p) : k;
}

const Approval = {
  tab: 'pending',
  filters: ApprovalFilterEngine.emptyFilters(),
  search: '',
  drawerOpen: false,
  drawerId: null,
  comment: '',
  submitPreviewOpen: false,

  getCurrentUser() {
    return APPROVAL_MOCK.currentUser || (typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG.user?.name : '王小明');
  },

  getWorkspaceOptions() {
    return typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG.workspace.options : ['人工智能实验室', 'IT 运维 Workspace', 'Global WorkSpace'];
  },

  wsLabel(name) {
    return typeof XSparkI18n !== 'undefined' ? XSparkI18n.workspaceLabel(name) : name;
  },

  typeLabel(type) {
    return typeof XSparkI18n !== 'undefined' ? XSparkI18n.approvalType(type) : (APPROVAL_TYPE_LABELS[type] || type);
  },

  init() {
    if (typeof ApprovalBridge !== 'undefined') {
      APPROVAL_MOCK.items = ApprovalBridge.loadApprovals(APPROVAL_MOCK.items);
    }
    this.content = document.getElementById('apvContent');
    this.tabs = document.querySelectorAll('.apv-tab');
    this.tabs.forEach(t => {
      t.addEventListener('click', () => this.setTab(t.dataset.tab));
    });
    if (typeof XSparkI18n !== 'undefined') {
      XSparkI18n.applyDom(document);
      XSparkI18n.onChange(() => {
        XSparkI18n.applyDom(document);
        this.render();
      });
    }
    this.filters.workspace = xsparkDefaultWorkspaceFilter();
    this.render();
    this.openFromQuery();
  },

  openFromQuery() {
    const openId = new URLSearchParams(window.location.search).get('id');
    if (!openId) return;
    const item = this.getItem(openId);
    if (!item) return;
    const user = this.getCurrentUser();
    if (item.status === 'pending' && item.assignedTo === user) this.setTab('pending');
    else if (item.submitter === user) this.setTab('mine');
    else this.setTab('history');
    this.openDrawer(openId);
  },

  setTab(tab) {
    this.tab = tab;
    this.closeDrawer(false);
    this.filters.historyStatus = '';
    this.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    this.render();
  },

  closeDrawer(rerender = true) {
    this.drawerOpen = false;
    this.drawerId = null;
    this.comment = '';
    if (rerender) this.render();
  },

  openDrawer(id) {
    this.drawerOpen = true;
    this.drawerId = id;
    this.comment = '';
    this.render();
  },

  getFilteredItems() {
    const f = { ...this.filters, search: this.search };
    return ApprovalFilterEngine.apply(APPROVAL_MOCK.items, f, this.tab, this.getCurrentUser());
  },

  getItem(id) {
    return APPROVAL_MOCK.items.find(i => i.id === id);
  },

  aiSparkleSvg() {
    return '<svg class="apv-ai-sparkle" viewBox="0 0 20 20" fill="none"><path d="M10 2l1.2 4.2L15.5 7.5 11.2 8.7 10 13l-1.2-4.3L4.5 7.5l4.3-1.3L10 2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M15 12l.6 2.1 2.1.6-2.1.6L15 17.4l-.6-2.1-2.1-.6 2.1-.6.6-2.1z" fill="currentColor" opacity=".6"/></svg>';
  },

  getViewerRole(item) {
    const me = this.getCurrentUser();
    if (this.tab === 'pending' && item.assignedTo === me && item.status === 'pending') return 'approver';
    if (this.tab === 'mine' || item.submitter === me) return 'submitter';
    return 'viewer';
  },

  getDraftItem() {
    const draft = APPROVAL_MOCK.submitDraft;
    return {
      id: 'draft',
      type: draft.type,
      resource: draft.resource,
      resourceType: draft.resourceType,
      version: draft.version,
      submitter: this.getCurrentUser(),
      workspace: draft.workspace,
      status: 'draft',
      detail: draft.detail
    };
  },

  render() {
    const html = this.renderMain();
    this.content.classList.add('apv-content--list');
    const drawerHtml = this.drawerOpen ? this.renderDrawer() : '';
    const previewHtml = this.submitPreviewOpen ? this.renderSubmitPreview() : '';
    this.content.innerHTML = html + drawerHtml + previewHtml;
    this.bindEvents();
  },

  renderKpi() {
    if (this.tab !== 'pending') return '';
    const s = ApprovalFilterEngine.getPendingStats(APPROVAL_MOCK.items, this.getCurrentUser());
    const cards = [
      { type: 'l3_exec', label: this.typeLabel('l3_exec'), count: s.l3_exec, cls: 'apv-kpi-l3' },
      { type: 'platform_publish', label: this.typeLabel('platform_publish'), count: s.platform_publish, cls: 'apv-kpi-plat' },
      { type: 'skillhub_publish', label: this.typeLabel('skillhub_publish'), count: s.skillhub_publish, cls: 'apv-kpi-hub' }
    ];
    return `
      <div class="apv-kpi-row">
        ${cards.map(c => `
          <button type="button" class="apv-kpi-card ${c.cls}${this.filters.typeDropdown === c.type ? ' active' : ''}" data-kpi-type="${c.type}">
            <div class="apv-kpi-card-label">${c.label}</div>
            <div class="apv-kpi-card-value">${c.count}</div>
            <div class="apv-kpi-card-hint">${apvT('filter.pendingHint')}</div>
          </button>`).join('')}
      </div>`;
  },

  typeBadge(type) {
    const cls = { l3_exec: 'apv-type-l3', platform_publish: 'apv-type-plat', skillhub_publish: 'apv-type-hub' }[type] || '';
    return `<span class="apv-type-badge ${cls}">${this.typeLabel(type)}</span>`;
  },

  statusBadge(status) {
    const map = {
      pending: 'apv-status-pending',
      approved: 'apv-status-ok',
      rejected: 'apv-status-err'
    };
    const cls = map[status] || '';
    const label = typeof XSparkI18n !== 'undefined' ? XSparkI18n.approvalStatus(status) : status;
    return `<span class="apv-status ${cls}">${label}</span>`;
  },

  renderToolbarSelect(id, label, value, options) {
    return `
      <select class="apv-tb-btn apv-tb-select" id="${id}" aria-label="${label}">
        <option value=""${!value ? ' selected' : ''}>${label}</option>
        ${options.map(o => `<option value="${o.v}"${value === o.v ? ' selected' : ''}>${o.l}</option>`).join('')}
      </select>`;
  },

  renderMain() {
    const rows = this.getFilteredItems();
    const showHistoryStatus = this.tab === 'history';

    return `
      <div class="apv-list">
        ${this.tab === 'pending' ? `<div class="apv-kpi-wrap">${this.renderKpi()}</div>` : ''}
        <div class="apv-list-toolbar">
          <h2>${apvT('tabs.' + this.tab)}</h2>
          ${this.renderToolbarSelect('apvTypeDropdown', apvT('filter.allTypes'), this.filters.typeDropdown, [
            { v: 'l3_exec', l: this.typeLabel('l3_exec') },
            { v: 'platform_publish', l: this.typeLabel('platform_publish') },
            { v: 'skillhub_publish', l: this.typeLabel('skillhub_publish') }
          ])}
          <select class="apv-tb-btn apv-tb-select" id="apvWorkspace" aria-label="Workspace">
            <option value=""${!this.filters.workspace ? ' selected' : ''}>${apvCommonT('allWorkspaces')}</option>
            ${this.getWorkspaceOptions().map(ws => `<option value="${ws}"${this.filters.workspace === ws ? ' selected' : ''}>${this.wsLabel(ws)}</option>`).join('')}
            <option value="全平台"${this.filters.workspace === '全平台' ? ' selected' : ''}>${this.wsLabel('全平台')}</option>
          </select>
          ${this.renderToolbarSelect('apvResourceType', apvT('filter.resourceType'), this.filters.resourceType, [
            { v: 'Agent', l: 'Agent' },
            { v: 'Skill', l: 'Skill' },
            { v: 'KnowledgeBase', l: 'KnowledgeBase' }
          ])}
          ${showHistoryStatus ? this.renderToolbarSelect('apvHistoryStatus', apvT('filter.status'), this.filters.historyStatus, [
            { v: 'approved', l: XSparkI18n ? XSparkI18n.approvalStatus('approved') : '已通过' },
            { v: 'rejected', l: XSparkI18n ? XSparkI18n.approvalStatus('rejected') : '已拒绝' }
          ]) : ''}
          <div class="apv-tb-search">
            <svg viewBox="0 0 16 16" width="13" height="13"><circle cx="7" cy="7" r="4.5" stroke="currentColor" fill="none" stroke-width="1.4"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <input type="search" id="apvSearch" placeholder="${apvT('filter.searchPlaceholder')}" value="${this.search}">
          </div>
          ${this.tab === 'mine' ? `<button type="button" class="apv-tb-btn apv-tb-ai" id="apvSubmitPreview">${this.aiSparkleSvg()} ${apvT('ai.submitPreview')}</button>` : ''}
          <span class="apv-tb-spacer"></span>
        </div>
        <div class="apv-list-main">
          <div class="apv-list-table-wrap">
            <table class="apv-table" id="apvTable">
              <thead>${this.renderTableHead()}</thead>
              <tbody>${rows.length ? rows.map(r => this.renderRow(r)).join('') : `<tr><td colspan="9"><div class="apv-empty">${apvT('filter.empty')}</div></td></tr>`}</tbody>
            </table>
          </div>
          <div class="apv-list-footer">
            <span>Rows per page</span>
            <select><option>50</option></select>
            <span>Page 1 of 1 · ${rows.length} rows</span>
          </div>
        </div>
      </div>`;
  },

  renderTableHead() {
    return `<tr>
      <th>Submitted At ↓</th><th>Type</th><th>Resource</th><th>Resource Type</th>
      <th>Version</th><th>Submitter</th><th>Workspace</th><th>Waiting</th><th>Status</th>
    </tr>`;
  },

  renderRow(r) {
    const active = this.drawerId === r.id ? ' apv-row-active' : '';
    return `
      <tr class="apv-data-row${active}" data-id="${r.id}">
        <td style="font-size:12px;color:var(--apv-text-2);white-space:nowrap">${r.submittedAt}</td>
        <td>${this.typeBadge(r.type)}</td>
        <td class="mono" style="font-size:12px;font-weight:500">${r.resource}</td>
        <td>${r.resourceType}</td>
        <td class="mono" style="font-size:12px">${r.version || '—'}</td>
        <td class="mono" style="font-size:12px">${r.submitter}</td>
        <td>${r.workspace}</td>
        <td style="font-size:12px">${r.status === 'pending' ? r.waitingDuration : '—'}</td>
        <td>${this.statusBadge(r.status)}</td>
      </tr>`;
  },

  renderAiSummaryBlock(item, role) {
    const result = ApprovalAiSummaryEngine.summarize(item, role);
    const summaryKey = ApprovalAiSummaryEngine.getSummaryKey(item);
    const levelCls = ApprovalAiSummaryEngine.riskLevelClass(result.riskLevel);
    const levelLabel = ApprovalAiSummaryEngine.riskLevelLabel(result.riskLevel);
    return `
      <div class="apv-ai-summary apv-ai-summary--${summaryKey}">
        <div class="apv-ai-summary-head">
          ${this.aiSparkleSvg()}
          <div class="apv-ai-summary-head-text">
            <div class="apv-ai-summary-title">${ApprovalAiSummaryEngine.summaryTitle(item)}</div>
            <div class="apv-ai-summary-hint">${ApprovalAiSummaryEngine.roleHint(item, role)}</div>
          </div>
          <span class="apv-ai-risk-badge ${levelCls}">${levelLabel}</span>
        </div>
        <div class="apv-ai-summary-score">${apvT('ai.riskScore')} <strong>${result.score}</strong>/100</div>
        <ul class="apv-ai-risk-list">
          ${result.risks.map(r => `<li>${r.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}
        </ul>
        <div class="apv-ai-summary-rec-title">${apvCommonT('recommend')}</div>
        <ul class="apv-ai-rec-list">
          ${result.recommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>
        <details class="apv-ai-summary-detail">
          <summary>${apvT('ai.viewFull')}</summary>
          <div class="apv-ai-summary-body">${ApprovalAiSummaryEngine.formatMarkdown(result.summary)}</div>
        </details>
        ${typeof ApprovalAiChat !== 'undefined' ? ApprovalAiChat.renderPanel(item, role) : ''}
      </div>`;
  },

  renderSubmitPreview() {
    const draft = this.getDraftItem();
    const role = 'submitter';
    return `
      <div class="apv-modal-backdrop" id="apvSubmitPreviewBackdrop"></div>
      <div class="apv-submit-preview" id="apvSubmitPreviewModal" role="dialog" aria-labelledby="apvSubmitPreviewTitle">
        <header class="apv-submit-preview-head">
          <div>
            <h3 id="apvSubmitPreviewTitle">${apvT('ai.submitPreviewTitle')}</h3>
            <p>${apvT('ai.submitPreviewDesc')}</p>
          </div>
          <button type="button" class="apv-drawer-close" id="apvSubmitPreviewClose">✕</button>
        </header>
        <div class="apv-submit-preview-body">
          <div class="apv-submit-draft">
            <div class="apv-drawer-section-title">${apvT('ai.draft')}</div>
            <div class="apv-submit-draft-grid">
              <span><em>${apvT('fields.type')}</em>${this.typeLabel(draft.type)}</span>
              <span><em>${apvT('fields.resource')}</em>${draft.resource}</span>
              <span><em>${apvT('fields.version')}</em>${draft.version}</span>
              <span><em>Workspace</em>${draft.workspace}</span>
            </div>
            <p class="apv-submit-draft-note">${draft.detail.changeLog}</p>
          </div>
          ${this.renderAiSummaryBlock(draft, role)}
        </div>
        <footer class="apv-submit-preview-foot">
          <button type="button" class="apv-btn apv-btn-ghost" id="apvSubmitPreviewCancel">${apvT('ai.backEdit')}</button>
          <button type="button" class="apv-btn apv-btn-primary" id="apvSubmitPreviewConfirm">${apvT('ai.confirmSubmit')}</button>
        </footer>
      </div>`;
  },

  renderDrawer() {
    const item = this.getItem(this.drawerId);
    if (!item) return '';
    const d = item.detail || {};
    const role = this.getViewerRole(item);
    const readonly = this.tab !== 'pending' || item.status !== 'pending';
    const aiSummary = this.renderAiSummaryBlock(item, role);
    let body = '';

    if (item.type === 'l3_exec') {
      body = `
        <div class="apv-drawer-section"><span class="apv-l3-badge">L3</span> ${apvT('drawer.l3Badge')}</div>
        ${d.workflow ? `<div class="apv-drawer-section"><div class="apv-drawer-section-title">Workflow</div><p class="mono">${d.workflow}</p></div>` : ''}
        <div class="apv-drawer-section"><div class="apv-drawer-section-title">${apvT('drawer.runInput')}</div><pre class="apv-io">${this.escapeHtml(d.runInput || '—')}</pre></div>
        <div class="apv-drawer-section"><div class="apv-drawer-section-title">${apvT('drawer.configSummary')}</div><p>${d.configSummary || '—'}</p></div>
        <div class="apv-drawer-section"><div class="apv-drawer-section-title">${apvT('drawer.authScope')}</div><p>${d.authScope || '—'}</p></div>`;
    } else if (item.type === 'platform_publish') {
      const agentLink = item.resourceType === 'Agent'
        ? `<div class="apv-drawer-section"><a href="../../资产/智能体/index.html" target="_blank" rel="noopener" style="color:var(--apv-primary);font-size:13px">${apvT('drawer.viewAgent')}</a></div>`
        : '';
      const knowledgeLink = item.resourceType === 'KnowledgeBase'
        ? `<div class="apv-drawer-section"><a href="../../资产/知识/index.html" target="_blank" rel="noopener" style="color:var(--apv-primary);font-size:13px">${apvT('drawer.viewKnowledge')}</a></div>`
        : '';
      body = `
        ${d.configSummary ? `<div class="apv-drawer-section"><div class="apv-drawer-section-title">${apvT('drawer.configSummary')}</div><p>${d.configSummary}</p></div>` : ''}
        <div class="apv-drawer-section"><div class="apv-drawer-section-title">${apvT('drawer.publishScope')}</div><p>${d.publishScope || item.workspace}</p></div>
        <div class="apv-drawer-section"><div class="apv-drawer-section-title">${apvT('drawer.versionChange')}</div><p><span class="mono">${item.version}</span> — ${d.changeLog || '—'}</p></div>
        <div class="apv-drawer-section apv-ai-review"><div class="apv-drawer-section-title">${apvT('drawer.aiReview')}</div><p>${d.aiReview || '—'}</p></div>
        <div class="apv-drawer-section"><div class="apv-drawer-section-title">${apvT('drawer.purpose')}</div><p>${d.purpose || '—'}</p></div>
        <div class="apv-drawer-section"><div class="apv-drawer-section-title">${apvT('drawer.riskBoundary')}</div><p>${d.riskBoundary || '—'}</p></div>
        ${agentLink}${knowledgeLink}`;
    } else {
      body = `
        <div class="apv-drawer-section"><div class="apv-drawer-section-title">${apvT('drawer.categoryTags')}</div><p>${d.category || '—'} · ${(d.tags || []).join(', ')}</p></div>
        <div class="apv-drawer-section apv-hub-preview">
          <div class="apv-drawer-section-title">${apvT('drawer.hubPreview')}</div>
          <div class="apv-hub-card"><strong>${d.hubPreview?.title || item.resource}</strong><p>${d.hubPreview?.desc || ''}</p></div>
        </div>
        <div class="apv-drawer-section"><div class="apv-drawer-section-title">${apvT('drawer.securityScan')}</div><p>${d.securityScan || '—'}</p></div>
        <div class="apv-drawer-section apv-ai-review"><div class="apv-drawer-section-title">${apvT('drawer.aiResult')}</div><p>${d.aiReview || '—'}</p></div>
        <div class="apv-drawer-section"><div class="apv-drawer-section-title">${apvT('drawer.publishNote')}</div><p>${d.publishNote || '—'}</p></div>`;
    }

    const historyBlock = item.status !== 'pending' ? `
      <div class="apv-drawer-history">
        <div class="apv-drawer-section-title">${apvT('drawer.result')}</div>
        <p>${apvT('drawer.approver')}：${item.approver || '—'} · ${item.approvedAt || '—'}</p>
        <p>${apvT('drawer.comment')}：${item.comment || '—'}</p>
      </div>` : '';

    const actions = !readonly ? `
      <div class="apv-drawer-actions">
        <textarea class="apv-comment-input" id="apvComment" placeholder="${apvT('drawer.commentPlaceholder')}">${this.comment}</textarea>
        <div class="apv-action-btns">
          <button type="button" class="apv-btn apv-btn-approve" id="apvApprove">${apvT('drawer.approve')}</button>
          <button type="button" class="apv-btn apv-btn-reject" id="apvReject">${apvT('drawer.reject')}</button>
        </div>
      </div>` : '';

    return `
      <div class="apv-drawer-backdrop" id="apvDrawerBackdrop"></div>
      <aside class="apv-drawer open" id="apvDrawer">
        <header class="apv-drawer-header">
          <div>
            <div class="apv-drawer-title">${this.typeLabel(item.type)} · ${item.resource}</div>
            <div class="apv-drawer-sub">${item.resourceType} · ${apvT('drawer.submitter')} ${item.submitter}</div>
          </div>
          <button type="button" class="apv-drawer-close" id="apvDrawerClose">✕</button>
        </header>
        <div class="apv-drawer-badges">
          <span class="apv-drawer-badge"><em>${apvT('drawer.submittedAt')}</em>${item.submittedAt}</span>
          <span class="apv-drawer-badge"><em>Workspace</em>${item.workspace}</span>
          <span class="apv-drawer-badge"><em>${apvT('filter.status')}</em>${this.statusBadge(item.status)}</span>
          ${item.version ? `<span class="apv-drawer-badge"><em>${apvT('fields.version')}</em>${item.version}</span>` : ''}
        </div>
        <div class="apv-drawer-body">${aiSummary}${body}${historyBlock}</div>
        ${actions}
      </aside>`;
  },

  escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  refreshTable() {
    const rows = this.getFilteredItems();
    const tbody = document.querySelector('#apvTable tbody');
    const footer = document.querySelector('.apv-list-footer span:nth-of-type(2)');
    if (!tbody) return;
    tbody.innerHTML = rows.length ? rows.map(r => this.renderRow(r)).join('') : `<tr><td colspan="9"><div class="apv-empty">${apvT('filter.empty')}</div></td></tr>`;
    if (footer) footer.textContent = `Page 1 of 1 · ${rows.length} rows`;
    this.bindRowClicks();
  },

  bindEvents() {
    document.getElementById('apvTypeDropdown')?.addEventListener('change', e => {
      this.filters.typeDropdown = e.target.value;
      this.refreshTable();
      if (this.tab === 'pending') this.updateKpiActive();
    });

    document.getElementById('apvWorkspace')?.addEventListener('change', e => {
      this.filters.workspace = e.target.value;
      this.refreshTable();
    });

    document.getElementById('apvResourceType')?.addEventListener('change', e => {
      this.filters.resourceType = e.target.value;
      this.refreshTable();
    });

    document.getElementById('apvHistoryStatus')?.addEventListener('change', e => {
      this.filters.historyStatus = e.target.value;
      this.refreshTable();
    });

    document.getElementById('apvSearch')?.addEventListener('input', e => {
      this.search = e.target.value;
      this.filters.search = e.target.value;
      this.refreshTable();
    });

    document.querySelectorAll('[data-kpi-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.dataset.kpiType;
        this.filters.typeDropdown = this.filters.typeDropdown === t ? '' : t;
        const sel = document.getElementById('apvTypeDropdown');
        if (sel) sel.value = this.filters.typeDropdown;
        this.render();
      });
    });

    document.getElementById('apvSubmitPreview')?.addEventListener('click', () => {
      this.submitPreviewOpen = true;
      this.render();
    });

    this.bindRowClicks();
    this.bindDrawerEvents();
    this.bindSubmitPreviewEvents();
    this.bindAiChatEvents();
  },

  bindAiChatEvents() {
    if (typeof ApprovalAiChat === 'undefined') return;
    const item = this.drawerOpen ? this.getItem(this.drawerId) : null;
    if (item) {
      ApprovalAiChat.bindPanel(item, this.getViewerRole(item), () => this.render());
      return;
    }
    if (this.submitPreviewOpen) {
      const draft = this.getDraftItem();
      ApprovalAiChat.bindPanel(draft, 'submitter', () => this.render());
    }
  },

  updateKpiActive() {
    document.querySelectorAll('[data-kpi-type]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.kpiType === this.filters.typeDropdown);
    });
  },

  bindRowClicks() {
    document.querySelectorAll('.apv-data-row').forEach(row => {
      row.addEventListener('click', () => this.openDrawer(row.dataset.id));
    });
  },

  bindDrawerEvents() {
    document.getElementById('apvDrawerClose')?.addEventListener('click', () => this.closeDrawer());
    document.getElementById('apvDrawerBackdrop')?.addEventListener('click', () => this.closeDrawer());

    document.getElementById('apvApprove')?.addEventListener('click', () => {
      const c = document.getElementById('apvComment')?.value || '';
      const id = this.drawerId;
      if (typeof ApprovalBridge !== 'undefined' && id) {
        ApprovalBridge.resolveApproval(id, { approved: true, comment: c });
        APPROVAL_MOCK.items = ApprovalBridge.loadApprovals(APPROVAL_MOCK.items);
      } else if (id) {
        const item = this.getItem(id);
        if (item) {
          item.status = 'approved';
          item.approver = this.getCurrentUser();
          item.approvedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
          item.comment = c;
        }
      }
      alert(apvT('ai.approvedAlert', { comment: c || apvT('ai.noComment') }));
      this.closeDrawer();
    });

    document.getElementById('apvReject')?.addEventListener('click', () => {
      const c = document.getElementById('apvComment')?.value || '';
      const id = this.drawerId;
      if (typeof ApprovalBridge !== 'undefined' && id) {
        ApprovalBridge.resolveApproval(id, { approved: false, comment: c });
        APPROVAL_MOCK.items = ApprovalBridge.loadApprovals(APPROVAL_MOCK.items);
      } else if (id) {
        const item = this.getItem(id);
        if (item) {
          item.status = 'rejected';
          item.approver = this.getCurrentUser();
          item.approvedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
          item.comment = c;
        }
      }
      alert(apvT('ai.rejectedAlert', { comment: c || apvT('ai.noComment') }));
      this.closeDrawer();
    });
  },

  closeSubmitPreview() {
    this.submitPreviewOpen = false;
    this.render();
  },

  bindSubmitPreviewEvents() {
    document.getElementById('apvSubmitPreviewClose')?.addEventListener('click', () => this.closeSubmitPreview());
    document.getElementById('apvSubmitPreviewBackdrop')?.addEventListener('click', () => this.closeSubmitPreview());
    document.getElementById('apvSubmitPreviewCancel')?.addEventListener('click', () => this.closeSubmitPreview());
    document.getElementById('apvSubmitPreviewConfirm')?.addEventListener('click', () => {
      alert(apvT('ai.submittedAlert'));
      this.closeSubmitPreview();
    });
  }
};
