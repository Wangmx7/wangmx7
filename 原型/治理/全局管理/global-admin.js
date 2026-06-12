function gaT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('globalAdmin.' + k, p) : k;
}

const GLOBAL_WORKSPACE_NAME = 'Global WorkSpace';

const GlobalAdmin = {
  tab: 'users',
  userSearch: '',

  canAccess() {
    const ws = typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG.workspace.label : '';
    const role = typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG.user?.role : '';
    return ws === GLOBAL_WORKSPACE_NAME && role === 'super_admin';
  },

  init() {
    this.root = document.getElementById('gaContent');
    if (typeof XSparkI18n !== 'undefined') {
      XSparkI18n.applyDom(document);
      XSparkI18n.onChange(() => {
        XSparkI18n.applyDom(document);
        this.render();
      });
    }
    this.render();
  },

  setTab(tab) {
    this.tab = tab;
    this.render();
  },

  getFilteredUsers() {
    const q = this.userSearch.trim().toLowerCase();
    if (!q) return GLOBAL_ADMIN_MOCK.users;
    return GLOBAL_ADMIN_MOCK.users.filter(u => {
      const hay = `${u.nameEn} ${u.nameZh} ${u.email}`.toLowerCase();
      return hay.includes(q);
    });
  },

  tabLabel(tab) {
    return gaT(tab.labelKey || ('configTabs.' + tab.id));
  },

  renderAccessDenied() {
    this.root.innerHTML = `
      <div class="ga-denied">
        <h2>${gaT('deniedTitle')}</h2>
        <p>${gaT('deniedDesc')}</p>
      </div>`;
  },

  renderMainTabs() {
    return `
      <nav class="ga-tabs ga-tabs--scroll" aria-label="${gaT('tabsAria')}">
        ${GLOBAL_ADMIN_MOCK.configTabs.map(tab => `
          <button type="button" class="ga-tab${tab.id === this.tab ? ' active' : ''}" data-ga-tab="${tab.id}">${this.tabLabel(tab)}</button>
        `).join('')}
      </nav>`;
  },

  renderRole(user) {
    const isAdmin = user.role === 'admin';
    const label = isAdmin ? gaT('users.roleAdmin') : gaT('users.roleUser');
    const cls = isAdmin ? 'ga-role ga-role--admin' : 'ga-role ga-role--user';
    return `
      <button type="button" class="${cls}" data-ga-role="${user.id}">
        <span>${label}</span>
        <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" fill="none" stroke-width="1.2" stroke-linecap="round"/></svg>
      </button>`;
  },

  renderUserRow(user) {
    return `
      <div class="ga-user-row" data-user-id="${user.id}">
        <div class="ga-user-avatar" style="--ga-avatar-bg:${user.avatarColor}">${this.escapeHtml(user.initial)}</div>
        <div class="ga-user-info">
          <div class="ga-user-name">${this.escapeHtml(user.nameEn)} | ${this.escapeHtml(user.nameZh)}</div>
          <div class="ga-user-email">${this.escapeHtml(user.email)}</div>
        </div>
        <div class="ga-user-actions">
          ${this.renderRole(user)}
          <button type="button" class="ga-user-toggle${user.enabled ? ' is-on' : ''}" role="switch" aria-checked="${user.enabled}" data-ga-toggle="${user.id}"></button>
          <button type="button" class="ga-user-quota" data-ga-quota="${user.id}">${gaT('users.quota')}</button>
        </div>
      </div>`;
  },

  renderUsersPanel() {
    const users = this.getFilteredUsers();
    return `
      <div class="ga-panel">
        <h2 class="ga-panel-title">${gaT('configTabs.users')}</h2>
        <div class="ga-toolbar ga-toolbar--users">
          <div class="ga-search-wrap">
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="7" cy="7" r="4.5" stroke="currentColor" fill="none" stroke-width="1.4"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <input type="search" id="gaUserSearch" class="ga-search" placeholder="${gaT('users.searchPlaceholder')}" value="${this.escapeAttr(this.userSearch)}">
          </div>
          <span class="ga-count">${gaT('users.total', { count: GLOBAL_ADMIN_MOCK.totalUsers })}</span>
        </div>
        <div class="ga-user-list">
          ${users.length ? users.map(u => this.renderUserRow(u)).join('') : `<div class="ga-user-empty">${gaT('users.empty')}</div>`}
        </div>
      </div>`;
  },

  renderConfigPlaceholder(title) {
    return `
      <div class="ga-panel">
        <h2 class="ga-panel-title">${this.escapeHtml(title)}</h2>
        <div class="ga-placeholder">${gaT('configComingSoon')}</div>
      </div>`;
  },

  renderConfigPanel() {
    if (this.tab === 'users') return this.renderUsersPanel();
    const tab = GLOBAL_ADMIN_MOCK.configTabs.find(t => t.id === this.tab);
    return this.renderConfigPlaceholder(this.tabLabel(tab || { labelKey: 'configTabs.users' }));
  },

  render() {
    if (!this.root) return;
    if (!this.canAccess()) {
      this.renderAccessDenied();
      return;
    }

    this.root.innerHTML = `
      ${this.renderMainTabs()}
      ${this.renderConfigPanel()}`;
    this.bindEvents();
  },

  bindEvents() {
    document.querySelectorAll('[data-ga-tab]').forEach(btn => {
      btn.addEventListener('click', () => this.setTab(btn.dataset.gaTab));
    });

    document.getElementById('gaUserSearch')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        this.userSearch = e.target.value.trim().toLowerCase();
        this.render();
      }
    });

    document.querySelectorAll('[data-ga-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const user = GLOBAL_ADMIN_MOCK.users.find(u => u.id === btn.dataset.gaToggle);
        if (user) {
          user.enabled = !user.enabled;
          btn.classList.toggle('is-on', user.enabled);
          btn.setAttribute('aria-checked', String(user.enabled));
        }
      });
    });

    document.querySelectorAll('[data-ga-quota]').forEach(btn => {
      btn.addEventListener('click', () => {
        const user = GLOBAL_ADMIN_MOCK.users.find(u => u.id === btn.dataset.gaQuota);
        const name = user ? `${user.nameEn} | ${user.nameZh}` : '';
        alert(typeof XSparkI18n !== 'undefined'
          ? XSparkI18n.t('common.prototypeDemo', { label: gaT('users.quota') + ' · ' + name })
          : gaT('users.quota') + ' · ' + name);
      });
    });
  },

  escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  escapeAttr(str) {
    return this.escapeHtml(str);
  }
};
