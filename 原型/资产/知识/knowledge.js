function kbT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('knowledge.' + k, p) : k;
}

const Knowledge = {
  search: '',
  workspace: '',
  visibility: '',
  pageSize: 12,
  page: 1,

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

  tagLabel(tag) {
    return kbT('tags.' + tag) || tag;
  },

  getFilteredItems() {
    const q = this.search.trim().toLowerCase();
    return KNOWLEDGE_MOCK.items.filter(item => {
      if (this.workspace && item.workspace !== this.workspace) return false;
      if (this.visibility && item.tag !== this.visibility) return false;
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
        ${this.renderToolbar()}
        <div class="kb-grid-wrap">
          <div class="kb-grid" id="kbGrid">
            ${pageItems.length
              ? pageItems.map(item => this.renderCard(item)).join('')
              : `<div class="kb-empty">${kbT('empty')}</div>`}
          </div>
        </div>
        ${this.renderFooter(all.length, totalPages)}
      </div>`;
    this.bindEvents();
  },

  renderToolbar() {
    return `
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
          <select class="kb-select" id="kbVisibility" aria-label="${kbT('visibility')}">
            <option value="">${kbT('allVisibility')}</option>
            <option value="private"${this.visibility === 'private' ? ' selected' : ''}>${kbT('tags.private')}</option>
            <option value="public"${this.visibility === 'public' ? ' selected' : ''}>${kbT('tags.public')}</option>
            <option value="team"${this.visibility === 'team' ? ' selected' : ''}>${kbT('tags.team')}</option>
          </select>
        </div>
        <div class="kb-toolbar-right">
          <button type="button" class="kb-btn-ghost" id="kbSort">${kbT('sortUpdated')}</button>
          <button type="button" class="kb-btn-primary" id="kbCreate">${kbT('create')}</button>
        </div>
      </div>`;
  },

  renderCard(item) {
    const url = item.url || KNOWLEDGE_MOCK.consoleUrl;
    const refCount = item.refCount ?? '—';
    return `
      <a class="kb-card" href="${this.escapeAttr(url)}" target="_blank" rel="noopener noreferrer" data-kb-id="${item.id}">
        <div class="kb-card-inner">
          <div class="kb-card-head">
            <div class="kb-card-title-block">
              <div class="kb-card-title-row">
                <span class="kb-card-icon">${this.iconSvg()}</span>
                <span class="kb-card-name">${this.escapeHtml(item.name)}</span>
              </div>
              <span class="kb-card-ws" title="Workspace">${this.escapeHtml(this.wsLabel(item.workspace || '—'))}</span>
            </div>
            <span class="kb-tag kb-tag--${item.tag}">${this.tagLabel(item.tag)}</span>
          </div>
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
            <button type="button" class="kb-card-more" aria-label="${kbT('more')}" data-kb-more="${item.id}">${this.moreSvg()}</button>
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

    document.getElementById('kbVisibility')?.addEventListener('change', e => {
      this.visibility = e.target.value;
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
      alert(kbT('createAlert'));
    });

    document.getElementById('kbSort')?.addEventListener('click', () => {
      alert(kbT('sortAlert'));
    });

    document.querySelectorAll('[data-kb-more]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        alert(kbT('moreAlert'));
      });
    });
  }
};
