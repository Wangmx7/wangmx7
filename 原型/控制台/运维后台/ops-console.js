const OpsConsole = {
  activeTab: 'users',
  searchQuery: '',

  init() {
    this.root = document.getElementById('opsContent');
    if (!this.root) return;
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    this.root.addEventListener('click', e => {
      const tabBtn = e.target.closest('.ops-tab');
      if (tabBtn) {
        this.activeTab = tabBtn.dataset.tab;
        this.render();
        return;
      }

      const toggle = e.target.closest('.ops-user-toggle');
      if (toggle) {
        const row = toggle.closest('.ops-user-row');
        const id = row?.dataset.userId;
        const user = OPS_CONSOLE_DATA.users.find(u => u.id === id);
        if (user) {
          user.enabled = !user.enabled;
          toggle.classList.toggle('is-on', user.enabled);
          toggle.setAttribute('aria-checked', String(user.enabled));
        }
      }
    });

    this.root.addEventListener('keydown', e => {
      if (e.target.classList.contains('ops-search-input') && e.key === 'Enter') {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.render();
      }
    });
  },

  getFilteredUsers() {
    if (!this.searchQuery) return OPS_CONSOLE_DATA.users;
    return OPS_CONSOLE_DATA.users.filter(u => {
      const hay = `${u.nameEn} ${u.nameZh} ${u.email}`.toLowerCase();
      return hay.includes(this.searchQuery);
    });
  },

  renderRole(user) {
    const isAdmin = user.role === 'admin';
    const label = isAdmin ? '管理员' : '普通用户';
    const cls = isAdmin ? 'ops-role ops-role--admin' : 'ops-role ops-role--user';
    return `
      <button type="button" class="${cls}">
        <span>${label}</span>
        <svg viewBox="0 0 12 12" width="10" height="10"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" fill="none" stroke-width="1.2" stroke-linecap="round"/></svg>
      </button>`;
  },

  renderUserRow(user) {
    return `
      <div class="ops-user-row" data-user-id="${user.id}">
        <div class="ops-user-avatar" style="--ops-avatar-bg:${user.avatarColor}">${user.initial}</div>
        <div class="ops-user-info">
          <div class="ops-user-name">${user.nameEn} | ${user.nameZh}</div>
          <div class="ops-user-email">${user.email}</div>
        </div>
        <div class="ops-user-actions">
          ${this.renderRole(user)}
          <button type="button" class="ops-user-toggle${user.enabled ? ' is-on' : ''}" role="switch" aria-checked="${user.enabled}"></button>
          <button type="button" class="ops-user-quota">配额</button>
        </div>
      </div>`;
  },

  renderUsersPanel() {
    const users = this.getFilteredUsers();
    return `
      <div class="ops-panel">
        <h2 class="ops-panel__title">用户管理</h2>
        <div class="ops-panel__toolbar">
          <div class="ops-search">
            <svg viewBox="0 0 16 16" width="14" height="14"><circle cx="7" cy="7" r="4.5" stroke="currentColor" fill="none" stroke-width="1.4"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <input type="search" class="ops-search-input" placeholder="搜索用户名、邮箱，按回车搜索..." value="${this.searchQuery.replace(/"/g, '&quot;')}">
          </div>
          <div class="ops-panel__count">共 ${OPS_CONSOLE_DATA.totalUsers} 人</div>
        </div>
        <div class="ops-user-list">
          ${users.map(u => this.renderUserRow(u)).join('')}
        </div>
      </div>`;
  },

  renderPlaceholderPanel(title) {
    return `
      <div class="ops-panel">
        <h2 class="ops-panel__title">${title}</h2>
        <div class="ops-panel__placeholder">功能开发中，敬请期待</div>
      </div>`;
  },

  renderPanel() {
    const tab = OPS_CONSOLE_DATA.tabs.find(t => t.id === this.activeTab);
    if (this.activeTab === 'users') return this.renderUsersPanel();
    return this.renderPlaceholderPanel(tab?.label || '模块');
  },

  render() {
    this.root.innerHTML = `
      <nav class="ops-tabs" aria-label="运维后台模块">
        ${OPS_CONSOLE_DATA.tabs.map(tab => `
          <button type="button" class="ops-tab${tab.id === this.activeTab ? ' active' : ''}" data-tab="${tab.id}">${tab.label}</button>
        `).join('')}
      </nav>
      ${this.renderPanel()}`;
  }
};
