function kbT(k, p) {
  const fullKey = 'knowledge.' + k;
  if (typeof XSparkI18n !== 'undefined') {
    const v = XSparkI18n.t(fullKey, p);
    if (typeof v === 'string' && v !== fullKey) return v;
  }
  const locales = (typeof window !== 'undefined' && window.XSPARK_LOCALES)
    || (typeof XSPARK_LOCALES !== 'undefined' ? XSPARK_LOCALES : null);
  if (locales) {
    const loc = (typeof XSparkI18n !== 'undefined' && XSparkI18n.locale) || 'zh';
    let val = locales[loc] || locales.zh;
    for (const part of fullKey.split('.')) {
      val = val?.[part];
      if (val === undefined) break;
    }
    if (typeof val === 'string') {
      if (p) return val.replace(/\{(\w+)\}/g, (_, key) => (p[key] != null ? String(p[key]) : ''));
      return val;
    }
  }
  return k;
}

const Knowledge = {
  tab: 'all',
  statusFilter: '',
  search: '',
  workspace: '',
  visibility: '',
  pageSize: 12,
  page: 1,
  openMenuId: null,

  iconSvg() {
    return `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5.5h5v11H3zM8 4.5h9v12H8z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M5.5 8.5h2M5.5 11h2M10 7h5M10 10h5M10 13h3" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity=".85"/>
    </svg>`;
  },

  searchSvg() {
    return `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="7" cy="7" r="4.5" stroke="currentColor" fill="none" stroke-width="1.4"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`;
  },

  moreSvg() {
    return `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="4" r="1.2" fill="currentColor"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><circle cx="8" cy="12" r="1.2" fill="currentColor"/></svg>`;
  },

  getWorkspaceOptions() {
    return typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG.workspace.options : [];
  },

  wsLabel(name) {
    return typeof XSparkI18n !== 'undefined' ? XSparkI18n.workspaceLabel(name) : name;
  },

  normalizeTag(tag) {
    if (tag === 'private' || tag === 'team') return 'workspace';
    return tag || 'workspace';
  },

  tagLabel(tag) {
    return kbT('tags.' + this.normalizeTag(tag)) || tag;
  },

  statusLabel(status) {
    return kbT('status.' + status) || status;
  },

  scopeDesc(tag) {
    return kbT('scopeDesc.' + this.normalizeTag(tag)) || '';
  },

  statusDesc(status) {
    return kbT('statusDesc.' + (status || 'draft')) || '';
  },

  SCOPES: ['workspace', 'public'],
  STATUSES: ['draft', 'pending_approval', 'published', 'rejected'],

  approvalCenterUrl(approvalId) {
    const base = '../../运营/审批中心/index.html';
    return approvalId ? `${base}?id=${encodeURIComponent(approvalId)}` : base;
  },

  showToast(message, linkUrl) {
    if (linkUrl) {
      if (confirm(message + '\n\n' + kbT('viewApprovalPrompt'))) {
        window.location.href = linkUrl;
      }
      return;
    }
    document.querySelectorAll('.kb-toast').forEach(el => el.remove());
    const toast = document.createElement('div');
    toast.className = 'kb-toast';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  },

  getCurrentUser() {
    return (typeof APPROVAL_MOCK !== 'undefined' && APPROVAL_MOCK.currentUser)
      || (typeof SIDEBAR_CONFIG !== 'undefined' && SIDEBAR_CONFIG.user?.name)
      || '王小明';
  },

  getItems() {
    return typeof ApprovalBridge !== 'undefined'
      ? ApprovalBridge.loadKnowledge()
      : KNOWLEDGE_MOCK.items;
  },

  getTabItems(tab) {
    const currentUser = this.getCurrentUser();
    return this.getItems().filter(item => tab !== 'mine' || item.owner === currentUser);
  },

  getTabCount(tab) {
    return this.getTabItems(tab).length;
  },

  getFilteredItems() {
    const q = this.search.trim().toLowerCase();
    const currentUser = this.getCurrentUser();
    return this.getItems().filter(item => {
      if (this.tab === 'mine' && item.owner !== currentUser) return false;
      if (this.statusFilter && (item.status || 'draft') !== this.statusFilter) return false;
      if (this.workspace && item.workspace !== this.workspace) return false;
      if (this.visibility && this.normalizeTag(item.tag) !== this.visibility) return false;
      if (q) {
        const ws = (item.workspace || '').toLowerCase();
        const wsLabel = this.wsLabel(item.workspace || '').toLowerCase();
        const match = item.name.toLowerCase().includes(q)
          || item.owner.toLowerCase().includes(q)
          || ws.includes(q)
          || wsLabel.includes(q);
        if (!match) return false;
      }
      return true;
    });
  },

  getPagedItems() {
    const all = this.getFilteredItems();
    const start = (this.page - 1) * this.pageSize;
    return { all, pageItems: all.slice(start, start + this.pageSize), totalPages: Math.max(1, Math.ceil(all.length / this.pageSize)) };
  },

  init() {
    this.root = document.getElementById('kbContent');
    if (typeof XSparkI18n !== 'undefined') {
      XSparkI18n.applyDom(document);
      XSparkI18n.onChange(() => {
        XSparkI18n.applyDom(document);
        this.render();
      });
    }
    this.render();
  },

  render() {
    const { all, pageItems, totalPages } = this.getPagedItems();
    if (this.page > totalPages) this.page = totalPages;

    this.root.innerHTML = `
      <div class="kb-panel">
        ${this.renderTabs()}
        ${this.renderToolbar()}
        <div class="kb-grid-wrap">
          <div class="kb-grid" id="kbGrid">
            ${pageItems.length
              ? pageItems.map(item => this.renderCard(item)).join('')
              : `<div class="kb-empty">${this.tab === 'mine' && !this.statusFilter && !this.visibility && !this.search && !this.workspace
                ? kbT('emptyMine') : kbT('empty')}</div>`}
          </div>
        </div>
        ${this.renderFooter(all.length, totalPages)}
      </div>`;
    this.bindEvents();
  },

  renderTabs() {
    const tabs = [
      { id: 'all', label: `${kbT('tabs.all')} (${this.getTabCount('all')})` },
      { id: 'mine', label: `${kbT('tabs.mine')} (${this.getTabCount('mine')})` }
    ];
    return `
      <nav class="kb-tabs" aria-label="${kbT('tabsAria')}">
        ${tabs.map(t => `<button type="button" class="kb-tab${this.tab === t.id ? ' active' : ''}" data-kb-tab="${t.id}">${t.label}</button>`).join('')}
      </nav>`;
  },

  renderToolbar() {
    const statuses = ['', ...this.STATUSES];
    const scopeFilterOptions = [
      { value: '', label: kbT('allScope'), desc: '' },
      ...this.SCOPES.map(s => ({
        value: s,
        label: this.tagLabel(s),
        desc: this.scopeDesc(s),
        badge: s
      }))
    ];
    return `
      <div class="kb-filters">
        <div class="kb-status-bar">
          <span class="kb-status-bar-label">${kbT('filterStatus')}</span>
          <div class="kb-status-tabs" role="group" aria-label="${kbT('filterStatus')}">
            ${statuses.map(s => `<button type="button" class="kb-status-tab kb-status-tab--${s || 'all'}${this.statusFilter === s ? ' active' : ''}" data-kb-status="${s}" title="${s ? this.statusDesc(s) : ''}">${s ? this.statusLabel(s) : kbT('allStatus')}</button>`).join('')}
          </div>
        </div>
        <details class="kb-legend">
          <summary>${kbT('legendTitle')}</summary>
          <div class="kb-legend-grid">
            <div class="kb-legend-block">
              <h4>${kbT('filterScope')}</h4>
              ${this.SCOPES.map(s => `<p><span class="kb-tag kb-tag--${s}">${this.tagLabel(s)}</span> ${this.scopeDesc(s)}</p>`).join('')}
            </div>
            <div class="kb-legend-block">
              <h4>${kbT('filterStatus')}</h4>
              ${this.STATUSES.map(s => `<p><span class="kb-status kb-status--${s === 'pending_approval' ? 'pending' : s}">${this.statusLabel(s)}</span> ${this.statusDesc(s)}</p>`).join('')}
            </div>
          </div>
        </details>
        <div class="kb-toolbar">
          <div class="kb-toolbar-left">
            <label class="kb-search">
              ${this.searchSvg()}
              <input type="search" id="kbSearch" placeholder="${kbT('searchPlaceholder')}" value="${this.escapeAttr(this.search)}">
            </label>
            <select class="kb-select kb-select--ws" id="kbWorkspace" aria-label="Workspace">
              <option value="">${kbT('allWorkspaces')}</option>
              ${this.getWorkspaceOptions().map(ws => `<option value="${ws}"${this.workspace === ws ? ' selected' : ''}>${this.wsLabel(ws)}</option>`).join('')}
            </select>
            ${KbSearchSelect.render('kbFilterScope', {
              placeholder: kbT('scopeSearchPlaceholder'),
              value: this.visibility,
              options: scopeFilterOptions,
              hint: false,
              compact: true
            })}
          </div>
          <div class="kb-toolbar-right">
            <button type="button" class="kb-btn-ghost" id="kbSort">${kbT('sortUpdated')}</button>
            <button type="button" class="kb-btn-primary" id="kbCreate">${kbT('create')}</button>
          </div>
        </div>
      </div>`;
  },

  renderStatusBadge(status) {
    const s = status || 'draft';
    const cls = s === 'pending_approval' ? 'pending' : s;
    return `<span class="kb-status kb-status--${cls}" title="${this.statusDesc(s)}">${this.statusLabel(s)}</span>`;
  },

  renderScopeBadge(tag) {
    return `<span class="kb-tag kb-tag--${tag}" title="${this.scopeDesc(tag)}">${this.tagLabel(tag)}</span>`;
  },

  renderCardHint(item) {
    const status = item.status || 'draft';
    if (status === 'rejected' && item.rejectComment) {
      return `<p class="kb-card-hint kb-card-hint--reject">${kbT('rejectHint', { reason: item.rejectComment })}</p>`;
    }
    if (status === 'pending_approval') {
      return `<p class="kb-card-hint kb-card-hint--pending">${kbT('pendingHint')}</p>`;
    }
    return '';
  },

  renderCardMenu(item) {
    const status = item.status || 'draft';
    const items = [];

    if (status === 'pending_approval') {
      items.push(`<button type="button" class="kb-card-menu-item" role="menuitem" data-kb-action="view-approval" data-kb-id="${item.id}">${kbT('actions.viewApproval')}</button>`);
      return items.join('');
    }

    if (status === 'published') {
      items.push(`<button type="button" class="kb-card-menu-item" role="menuitem" data-kb-action="edit" data-kb-id="${item.id}">${kbT('actions.edit')}</button>`);
      items.push(`<button type="button" class="kb-card-menu-item kb-card-menu-item--danger" role="menuitem" data-kb-action="delete" data-kb-id="${item.id}">${kbT('actions.delete')}</button>`);
      return items.join('');
    }

    const publishLabel = status === 'rejected' ? kbT('actions.republish') : kbT('actions.publish');
    items.push(`<button type="button" class="kb-card-menu-item" role="menuitem" data-kb-action="edit" data-kb-id="${item.id}">${kbT('actions.edit')}</button>`);
    items.push(`<button type="button" class="kb-card-menu-item" role="menuitem" data-kb-action="publish" data-kb-id="${item.id}">${publishLabel}</button>`);
    items.push(`<button type="button" class="kb-card-menu-item kb-card-menu-item--danger" role="menuitem" data-kb-action="delete" data-kb-id="${item.id}">${kbT('actions.delete')}</button>`);
    return items.join('');
  },

  renderCard(item) {
    const url = item.url || KNOWLEDGE_MOCK.consoleUrl;
    const refCount = item.refCount ?? '—';
    const status = item.status || 'draft';
    const menuOpen = this.openMenuId === item.id;

    return `
      <a class="kb-card kb-card--${status} kb-card--scope-${this.normalizeTag(item.tag)}" href="${this.escapeAttr(url)}" target="_blank" rel="noopener noreferrer" data-kb-id="${item.id}">
        <div class="kb-card-inner">
          <div class="kb-card-head">
            <div class="kb-card-title-block">
              <div class="kb-card-title-row">
                <span class="kb-card-icon">${this.iconSvg()}</span>
                <span class="kb-card-name">${this.escapeHtml(item.name)}</span>
              </div>
              <span class="kb-card-ws" title="Workspace">${this.escapeHtml(this.wsLabel(item.workspace || '—'))}</span>
            </div>
            <div class="kb-card-badges">
              ${this.renderScopeBadge(this.normalizeTag(item.tag))}
              ${this.renderStatusBadge(status)}
            </div>
          </div>
          ${this.renderCardHint(item)}
          <div class="kb-card-stats">
            <div class="kb-stat">
              <span class="kb-stat-value">${item.docCount}</span>
              <span class="kb-stat-label">${kbT('docCount')}</span>
            </div>
            <div class="kb-stat-divider" aria-hidden="true"></div>
            <div class="kb-stat">
              <span class="kb-stat-value">${item.sliceCount}</span>
              <span class="kb-stat-label">${kbT('sliceCount')}</span>
            </div>
            <div class="kb-stat-divider" aria-hidden="true"></div>
            <div class="kb-stat">
              <span class="kb-stat-value">${refCount}</span>
              <span class="kb-stat-label">${kbT('refCount')}</span>
            </div>
          </div>
          <div class="kb-card-foot">
            <div class="kb-card-meta">
              <span class="kb-card-owner">${this.escapeHtml(item.owner)}</span>
              <span class="kb-card-dot" aria-hidden="true">·</span>
              <span class="kb-card-time">${this.escapeHtml(item.updatedAt)} ${kbT('updated')}</span>
            </div>
            <div class="kb-card-more-wrap">
              <button type="button" class="kb-card-more${menuOpen ? ' active' : ''}" aria-label="${kbT('more')}" aria-expanded="${menuOpen}" data-kb-more="${item.id}">${this.moreSvg()}</button>
              ${menuOpen ? `<div class="kb-card-menu" role="menu">${this.renderCardMenu(item)}</div>` : ''}
            </div>
          </div>
        </div>
      </a>`;
  },

  renderFooter(total, totalPages) {
    return `
      <div class="kb-footer">
        <span>${kbT('total', { count: total })}</span>
        <button type="button" class="kb-page-btn" id="kbPrev" ${this.page <= 1 ? 'disabled' : ''} aria-label="${kbT('prev')}">‹</button>
        <button type="button" class="kb-page-btn active" aria-current="page">${this.page}</button>
        <button type="button" class="kb-page-btn" id="kbNext" ${this.page >= totalPages ? 'disabled' : ''} aria-label="${kbT('next')}">›</button>
        <select id="kbPageSize" aria-label="${kbT('pageSize')}">
          ${[12, 24, 48].map(n => `<option value="${n}"${this.pageSize === n ? ' selected' : ''}>${n}</option>`).join('')}
        </select>
        <span>${kbT('pageOf', { page: this.page, total: totalPages })}</span>
      </div>`;
  },

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  escapeAttr(str) {
    return this.escapeHtml(str);
  },

  bindEvents() {
    document.querySelectorAll('[data-kb-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.tab = btn.dataset.kbTab;
        this.page = 1;
        this.render();
      });
    });

    document.querySelectorAll('[data-kb-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.statusFilter = btn.dataset.kbStatus;
        this.page = 1;
        this.render();
      });
    });

    KbSearchSelect.bind('kbFilterScope', {
      options: [
        { value: '', label: kbT('allScope'), desc: '' },
        ...this.SCOPES.map(s => ({
          value: s,
          label: this.tagLabel(s),
          desc: this.scopeDesc(s),
          badge: s
        }))
      ],
      onChange: (val) => {
        this.visibility = val;
        this.page = 1;
        this.render();
      }
    });

    document.getElementById('kbSearch')?.addEventListener('input', e => {
      this.search = e.target.value;
      this.page = 1;
      this.render();
    });

    document.getElementById('kbWorkspace')?.addEventListener('change', e => {
      this.workspace = e.target.value;
      this.page = 1;
      this.render();
    });

    document.getElementById('kbPageSize')?.addEventListener('change', e => {
      this.pageSize = Number(e.target.value) || 12;
      this.page = 1;
      this.render();
    });

    document.getElementById('kbPrev')?.addEventListener('click', () => {
      if (this.page > 1) {
        this.page -= 1;
        this.render();
      }
    });

    document.getElementById('kbNext')?.addEventListener('click', () => {
      const { totalPages } = this.getPagedItems();
      if (this.page < totalPages) {
        this.page += 1;
        this.render();
      }
    });

    document.getElementById('kbCreate')?.addEventListener('click', () => {
      if (typeof KnowledgeCreate !== 'undefined') KnowledgeCreate.openModal();
    });

    document.getElementById('kbSort')?.addEventListener('click', () => {
      alert(kbT('sortAlert'));
    });

    document.querySelectorAll('[data-kb-more]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.kbMore;
        this.openMenuId = this.openMenuId === id ? null : id;
        this.render();
      });
    });

    document.querySelectorAll('[data-kb-action]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.handleCardAction(btn.dataset.kbAction, btn.dataset.kbId);
      });
    });

    if (!this._menuDocBound) {
      this._menuDocBound = true;
      document.addEventListener('click', e => {
        if (!e.target.closest('.kb-card-more-wrap') && this.openMenuId) {
          this.openMenuId = null;
          this.render();
        }
      });
    }
  },

  handleCardAction(action, id) {
    const item = this.getItems().find(k => k.id === id);
    if (!item) return;
    this.openMenuId = null;

    if (action === 'edit') {
      if (item.status === 'published') {
        alert(kbT('actions.publishedEditAlert'));
        return;
      }
      alert(kbT('editAlert', { name: item.name }));
      return;
    }

    if (action === 'delete') {
      if (!confirm(kbT('deleteConfirm', { name: item.name }))) return;
      if (typeof ApprovalBridge !== 'undefined') ApprovalBridge.deleteKnowledge(id);
      this.render();
      return;
    }

    if (action === 'view-approval') {
      window.location.href = this.approvalCenterUrl(item.approvalId);
      return;
    }

    if (action === 'publish') {
      if (typeof ApprovalBridge === 'undefined') {
        alert(kbT('publishAlert'));
        return;
      }
      if (item.status === 'pending_approval') {
        window.location.href = this.approvalCenterUrl(item.approvalId);
        return;
      }
      const { approvalId } = ApprovalBridge.submitKnowledgeForApproval(item);
      this.showToast(kbT('publishedApproval', { id: approvalId }), this.approvalCenterUrl(approvalId));
      this.render();
    }
  }
};
