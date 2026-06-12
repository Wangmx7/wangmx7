const XSparkSidebar = {
  activeId: SIDEBAR_CONFIG.defaultActive,
  workspaceOpen: false,
  userMenuOpen: false,
  aiConsoleOpen: false,
  topbarEl: null,

  init(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.onNavigate = options.onNavigate || (() => {});
    this.onUserMenu = options.onUserMenu || (() => {});
    this.onAiConsole = options.onAiConsole || (() => {});
    this.activeAiConsole = options.activeAiConsole || '';
    this.activeId = options.activeId || SIDEBAR_CONFIG.defaultActive;
    this.restoreTheme();
    this.ensureTopbar();
    this.render();
    this.bindEvents();
    if (typeof XSparkI18n !== 'undefined') {
      XSparkI18n.applyDom(document);
      this._localeOff = XSparkI18n.onChange(() => {
        this.render();
        this.renderTopbar();
        XSparkI18n.applyDom(document);
      });
    }
  },

  ensureTopbar() {
    const app = this.container?.closest('.xs-app');
    if (!app) return;
    let topbar = app.querySelector('#xsTopbar');
    if (!topbar) {
      topbar = document.createElement('header');
      topbar.id = 'xsTopbar';
      topbar.className = 'xs-topbar';
      app.insertBefore(topbar, app.firstChild);
    }
    this.topbarEl = topbar;
    this.renderTopbar();
  },

  t(key, params) {
    return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t(key, params) : key;
  },

  renderTopbar() {
    if (!this.topbarEl) return;
    const cfg = SIDEBAR_CONFIG;
    const user = cfg.user || { name: '用户', avatar: '用', menu: [] };
    const themeDark = document.querySelector('.xs-app')?.dataset.theme === 'dark';
    const themeLabel = themeDark ? this.t('common.lightMode') : this.t('common.themeSwitch');
    this.topbarEl.innerHTML = `
      <div class="xs-topbar__brand">
        <div class="xs-topbar__logo">${this.logoSvg()}</div>
        <span class="xs-topbar__brand-text">${cfg.brand.name}</span>
      </div>
      <div class="xs-topbar__actions">
        <button type="button" class="xs-topbar__icon-btn" id="xsNotifyBtn" title="${this.t('common.notify')}" aria-label="${this.t('common.notify')}">
          ${SIDEBAR_ICONS.bell}
          <span class="xs-topbar__badge">3</span>
        </button>
        <button type="button" class="xs-topbar__icon-btn" id="xsHelpBtn" title="${this.t('common.help')}" aria-label="${this.t('common.help')}">
          ${SIDEBAR_ICONS.help}
        </button>
        <button type="button" class="xs-topbar__lang" id="xsLangBtn" aria-label="${this.t('common.language')}">
          ${SIDEBAR_ICONS.globe}
          <span id="xsLangLabel">${typeof XSparkI18n !== 'undefined' ? XSparkI18n.getLocaleLabel() : '中文'}</span>
          <span class="xs-topbar__lang-chevron">${SIDEBAR_ICONS.chevron}</span>
        </button>
        <div class="xs-topbar__user">
          <button type="button" class="xs-topbar__user-btn" id="xsTopbarUserBtn" aria-expanded="false">
            <span class="xs-sidebar__avatar">${user.avatar}</span>
            <span class="xs-topbar__user-name">${user.name}</span>
            <span class="xs-topbar__lang-chevron">${SIDEBAR_ICONS.chevron}</span>
          </button>
          <div class="xs-topbar__user-menu" id="xsTopbarUserMenu">
            ${user.menu.map(item => `
              <button type="button" class="xs-topbar__user-menu-item" data-user-action="${item.id}">${item.id === 'theme-switch' ? themeLabel : item.id === 'profile' ? this.t('common.profile') : item.label}</button>
            `).join('')}
          </div>
        </div>
      </div>`;
    this.bindTopbarEvents();
  },

  bindTopbarEvents() {
    const notifyBtn = this.topbarEl?.querySelector('#xsNotifyBtn');
    const helpBtn = this.topbarEl?.querySelector('#xsHelpBtn');
    const langBtn = this.topbarEl?.querySelector('#xsLangBtn');
    const langLabel = this.topbarEl?.querySelector('#xsLangLabel');
    const userBtn = this.topbarEl?.querySelector('#xsTopbarUserBtn');
    const userMenu = this.topbarEl?.querySelector('#xsTopbarUserMenu');

    notifyBtn?.addEventListener('click', () => {
      alert(this.t('common.prototypeNotify'));
    });

    helpBtn?.addEventListener('click', () => {
      alert(this.t('common.prototypeHelp'));
    });

    langBtn?.addEventListener('click', () => {
      if (typeof XSparkI18n !== 'undefined') {
        XSparkI18n.toggleLocale();
        if (langLabel) langLabel.textContent = XSparkI18n.getLocaleLabel();
      } else if (langLabel) {
        const next = langLabel.textContent === '中文' ? 'English' : '中文';
        langLabel.textContent = next;
      }
    });

    const toggleUserMenu = () => {
      this.userMenuOpen = !this.userMenuOpen;
      userBtn?.classList.toggle('open', this.userMenuOpen);
      userMenu?.classList.toggle('show', this.userMenuOpen);
      userBtn?.setAttribute('aria-expanded', String(this.userMenuOpen));
    };

    userBtn?.addEventListener('click', e => {
      e.stopPropagation();
      toggleUserMenu();
    });

    userMenu?.querySelectorAll('.xs-topbar__user-menu-item').forEach(el => {
      el.addEventListener('click', () => {
        const action = el.dataset.userAction;
        const label = el.textContent;
        this.closeUserMenu();
        if (action === 'theme-switch') {
          this.toggleTheme();
          return;
        }
        this.onUserMenu({ id: action, label });
      });
    });
  },

  restoreTheme() {
    const app = this.container?.closest('.xs-app') || document.querySelector('.xs-app');
    if (!app) return;
    const saved = localStorage.getItem('xs-theme');
    if (saved === 'dark' || saved === 'light') {
      app.dataset.theme = saved;
    }
  },

  toggleTheme() {
    const app = document.querySelector('.xs-app');
    if (!app) return;
    const next = app.dataset.theme === 'dark' ? 'light' : 'dark';
    app.dataset.theme = next;
    localStorage.setItem('xs-theme', next);
    const themeItem = this.topbarEl?.querySelector('[data-user-action="theme-switch"]');
    if (themeItem) {
      themeItem.textContent = next === 'dark' ? this.t('common.lightMode') : this.t('common.themeSwitch');
    }
  },

  getWorkspaceDisplayLabel(canonical) {
    return typeof XSparkI18n !== 'undefined' ? XSparkI18n.workspaceLabel(canonical) : canonical;
  },

  render() {
    const cfg = SIDEBAR_CONFIG;
    const wsLabel = this.getWorkspaceDisplayLabel(cfg.workspace.label);
    this.container.className = 'xs-sidebar';
    this.container.innerHTML = `
      <div class="xs-sidebar__workspace" id="xsWorkspaceToggle">
        <span class="xs-sidebar__workspace-label" id="xsWorkspaceLabel">${wsLabel}</span>
        <span class="xs-sidebar__workspace-chevron">${SIDEBAR_ICONS.chevron}</span>
      </div>
      <div class="xs-sidebar__workspace-menu" id="xsWorkspaceMenu">
        ${cfg.workspace.options.map(opt => `
          <div class="xs-sidebar__workspace-option${opt === cfg.workspace.label ? ' active' : ''}" data-ws="${opt}">${this.getWorkspaceDisplayLabel(opt)}</div>
        `).join('')}
      </div>

      <nav class="xs-sidebar__nav" id="xsNav">
        ${cfg.items.map(item => this.renderItem(item)).join('')}
      </nav>

      <footer class="xs-sidebar__footer">
        <div class="xs-sidebar__ai-console-menu${this.aiConsoleOpen ? ' show' : ''}" id="xsAiConsoleMenu">
          ${(cfg.aiConsole?.options || []).map(opt => `
            <button type="button" class="xs-sidebar__ai-console-option${opt.id === this.activeAiConsole ? ' active' : ''}"
              data-ai-console="${opt.id}">${typeof XSparkI18n !== 'undefined' ? XSparkI18n.t(`sidebar.aiConsoleOptions.${opt.id}`) : opt.label}</button>
          `).join('')}
        </div>
        <button type="button" class="xs-sidebar__ai-console${this.aiConsoleOpen ? ' open' : ''}" id="xsAiConsoleBtn" aria-expanded="${this.aiConsoleOpen}">
          <span class="xs-sidebar__icon">${SIDEBAR_ICONS['ai-console']}</span>
          <span class="xs-sidebar__label">${typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('sidebar.aiConsole') : (cfg.aiConsole?.label || 'AI 控制台')}</span>
        </button>
      </footer>
    `;
  },

  logoSvg() {
    return `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 35.4C17.06 35.78 16.04 35.78 15.1 35.4L1.23 28.93C0.17 28.44 -0.5 27.38 -0.5 26.21V9.79C-0.5 8.62 0.17 7.56 1.23 7.07L15.1 0.6C16.04 0.22 17.06 0.22 18 0.6L31.87 7.07C32.93 7.56 33.6 8.62 33.6 9.79V26.21C33.6 27.38 32.93 28.44 31.87 28.93L18 35.4Z" fill="url(#logoGrad)" transform="translate(1.2 0.6)"/>
      <path d="M11.5 22.9C10.85 22.9 10.21 22.78 9.62 22.54C9.02 22.29 8.48 21.93 8.02 21.47C6.12 19.56 6.12 16.45 8.02 14.53C8.48 14.08 9.02 13.71 9.62 13.46C10.21 13.22 10.85 13.09 11.5 13.09C12.81 13.09 14.04 13.6 14.97 14.53L17.58 17.14C17.69 17.25 17.79 17.39 17.85 17.54C17.91 17.68 17.95 17.84 17.95 18C17.95 18.17 17.92 18.33 17.86 18.48C17.79 18.62 17.7 18.76 17.59 18.88C17.48 18.99 17.34 19.08 17.19 19.14C17.04 19.2 16.88 19.23 16.72 19.23C16.55 19.23 16.39 19.2 16.25 19.14C16.1 19.08 15.96 18.99 15.85 18.88L13.24 16.25C12.31 15.31 10.67 15.31 9.74 16.25C9.28 16.72 9.02 17.35 9.02 18C9.02 18.66 9.28 19.29 9.74 19.75C10.67 20.68 12.31 20.69 13.24 19.75L13.56 19.43C13.67 19.32 13.8 19.23 13.95 19.17C14.1 19.11 14.26 19.08 14.42 19.08C14.58 19.08 14.73 19.11 14.88 19.17C15.03 19.23 15.17 19.32 15.28 19.43C15.39 19.54 15.48 19.68 15.54 19.83C15.6 19.98 15.63 20.13 15.63 20.29C15.63 20.45 15.6 20.61 15.54 20.76C15.48 20.91 15.39 21.04 15.28 21.15L14.97 21.47C14.51 21.93 13.97 22.29 13.37 22.54C12.77 22.78 12.13 22.9 11.5 22.9Z" fill="white"/>
      <path d="M22.22 22.9C21.58 22.91 20.94 22.78 20.34 22.54C19.75 22.29 19.21 21.93 18.75 21.47L16.14 18.86C16.03 18.75 15.93 18.61 15.87 18.47C15.81 18.32 15.77 18.16 15.77 18C15.77 17.84 15.8 17.67 15.86 17.53C15.92 17.38 16.01 17.24 16.13 17.13C16.24 17.01 16.38 16.92 16.53 16.86C16.67 16.8 16.83 16.77 16.99 16.77C17.16 16.77 17.32 16.8 17.47 16.87C17.61 16.93 17.75 17.02 17.86 17.14L20.47 19.75C21.41 20.69 23.04 20.69 23.98 19.75C24.44 19.28 24.7 18.66 24.7 18C24.7 17.35 24.44 16.72 23.98 16.25C23.04 15.31 21.41 15.31 20.47 16.25L20.15 16.57C19.93 16.8 19.62 16.92 19.29 16.92C18.97 16.92 18.66 16.8 18.44 16.57C18.21 16.35 18.08 16.03 18.08 15.71C18.08 15.38 18.21 15.08 18.44 14.85L18.75 14.53C19.21 14.08 19.75 13.71 20.34 13.46C20.94 13.22 21.58 13.09 22.22 13.09C23.54 13.09 24.77 13.6 25.7 14.53C27.6 16.45 27.6 19.56 25.7 21.47C25.24 21.93 24.7 22.29 24.1 22.54C23.5 22.78 22.86 22.91 22.22 22.9Z" fill="white"/>
      <defs><linearGradient id="logoGrad" x1="0" y1="18" x2="34" y2="18" gradientUnits="userSpaceOnUse"><stop stop-color="#266AEE"/><stop offset="1" stop-color="#6A57C8"/></linearGradient></defs>
    </svg>`;
  },

  renderItem(item) {
    if (item.type === 'section') {
      const label = typeof XSparkI18n !== 'undefined' ? XSparkI18n.sidebarItemLabel(item) : item.label;
      return `<div class="xs-sidebar__section">${label}</div>`;
    }
    if (item.type === 'divider') {
      return `<div class="xs-sidebar__divider"></div>`;
    }
    const active = item.id === this.activeId ? ' is-active' : '';
    const disabled = item.disabled ? ' is-disabled' : '';
    const icon = SIDEBAR_ICONS[item.icon] || '';
    const label = typeof XSparkI18n !== 'undefined' ? XSparkI18n.sidebarItemLabel(item) : item.label;
    return `
      <button type="button" class="xs-sidebar__item${active}${disabled}"
        data-id="${item.id}" data-route="${item.route || ''}" data-status="${item.status || 'placeholder'}" ${item.disabled ? 'disabled' : ''}>
        <span class="xs-sidebar__icon">${icon}</span>
        <span class="xs-sidebar__label">${label}</span>
      </button>`;
  },

  bindEvents() {
    const toggle = this.container.querySelector('#xsWorkspaceToggle');
    const menu = this.container.querySelector('#xsWorkspaceMenu');
    toggle?.addEventListener('click', () => {
      this.closeAiConsoleMenu();
      this.workspaceOpen = !this.workspaceOpen;
      toggle.classList.toggle('open', this.workspaceOpen);
      menu?.classList.toggle('show', this.workspaceOpen);
    });

    menu?.querySelectorAll('.xs-sidebar__workspace-option').forEach(el => {
      el.addEventListener('click', () => {
        const label = el.dataset.ws;
        this.container.querySelector('#xsWorkspaceLabel').textContent = this.getWorkspaceDisplayLabel(label);
        menu.querySelectorAll('.xs-sidebar__workspace-option').forEach(o => o.classList.toggle('active', o === el));
        this.workspaceOpen = false;
        toggle.classList.remove('open');
        menu.classList.remove('show');
      });
    });

    this.container.querySelectorAll('.xs-sidebar__item:not(.is-disabled)').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        if (this.navigateToPage(id)) return;
        this.setActive(id);
        this.onNavigate({ id, route: el.dataset.route, label: el.querySelector('.xs-sidebar__label')?.textContent });
      });
    });

    const aiConsoleBtn = this.container.querySelector('#xsAiConsoleBtn');
    const aiConsoleMenu = this.container.querySelector('#xsAiConsoleMenu');

    aiConsoleBtn?.addEventListener('click', e => {
      e.stopPropagation();
      this.workspaceOpen = false;
      toggle?.classList.remove('open');
      menu?.classList.remove('show');
      this.aiConsoleOpen = !this.aiConsoleOpen;
      aiConsoleBtn.classList.toggle('open', this.aiConsoleOpen);
      aiConsoleMenu?.classList.toggle('show', this.aiConsoleOpen);
      aiConsoleBtn.setAttribute('aria-expanded', String(this.aiConsoleOpen));
    });

    aiConsoleMenu?.querySelectorAll('.xs-sidebar__ai-console-option').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const id = el.dataset.aiConsole;
        const label = el.textContent;
        this.closeAiConsoleMenu();
        if (this.navigateToAiConsole(id)) return;
        this.onAiConsole({ id, label });
      });
    });

    document.addEventListener('click', e => {
      if (!this.container.contains(e.target)) {
        this.workspaceOpen = false;
        toggle?.classList.remove('open');
        menu?.classList.remove('show');
        this.closeAiConsoleMenu();
      } else if (!e.target.closest('#xsAiConsoleBtn') && !e.target.closest('#xsAiConsoleMenu')) {
        this.closeAiConsoleMenu();
      }
      if (this.topbarEl && !this.topbarEl.contains(e.target)) {
        this.closeUserMenu();
      }
    });
  },

  closeAiConsoleMenu() {
    this.aiConsoleOpen = false;
    this.container?.querySelector('#xsAiConsoleBtn')?.classList.remove('open');
    this.container?.querySelector('#xsAiConsoleMenu')?.classList.remove('show');
    this.container?.querySelector('#xsAiConsoleBtn')?.setAttribute('aria-expanded', 'false');
  },

  closeUserMenu() {
    this.userMenuOpen = false;
    this.topbarEl?.querySelector('#xsTopbarUserBtn')?.classList.remove('open');
    this.topbarEl?.querySelector('#xsTopbarUserMenu')?.classList.remove('show');
    this.topbarEl?.querySelector('#xsTopbarUserBtn')?.setAttribute('aria-expanded', 'false');
  },

  getMenuItem(id) {
    return SIDEBAR_CONFIG.items.find(item => item.id === id);
  },

  getRootRelativePrefix() {
    const href = decodeURI(window.location.href.replace(/\\/g, '/'));
    const marker = '/xSparkOps/';
    const idx = href.indexOf(marker);
    if (idx !== -1) {
      const afterRoot = href.slice(idx + marker.length).split('?')[0];
      const depth = (afterRoot.match(/\//g) || []).length;
      return depth ? '../'.repeat(depth) : '';
    }
    // GitHub Pages / 静态托管：按 pathname 深度回退
    let path = window.location.pathname.split('?')[0];
    if (/\.html$/i.test(path)) path = path.replace(/\/[^/]+$/, '');
    const parts = path.split('/').filter(Boolean);
    let rootDepth = 0;
    const cfg = typeof XSPARK_SITE !== 'undefined' ? XSPARK_SITE : {};
    if (cfg.repoSegment) {
      rootDepth = String(cfg.repoSegment).split('/').filter(Boolean).length;
    } else if (parts[0] && parts[0] !== '原型' && parts[0] !== '共享' && parts[0] !== '文档' && parts[0] !== 'prd') {
      rootDepth = 1;
    }
    const depth = Math.max(0, parts.length - rootDepth);
    return depth ? '../'.repeat(depth) : '';
  },

  resolvePageHref(page) {
    return this.getRootRelativePrefix() + page.replace(/\\/g, '/');
  },

  isAtRootShell() {
    const path = decodeURI(window.location.pathname.replace(/\\/g, '/')).split('?')[0];
    if (/\/xSparkOps\/?$/.test(path) || /\/xSparkOps\/index\.html$/.test(path)) return true;
    const cfg = typeof XSPARK_SITE !== 'undefined' ? XSPARK_SITE : {};
    if (cfg.repoSegment) {
      const seg = cfg.repoSegment.replace(/^\//, '').replace(/\/$/, '');
      return new RegExp(`/${seg}/?$`).test(path) || new RegExp(`/${seg}/index\\.html$`).test(path);
    }
    return /\/index\.html$/.test(path) && !path.includes('/原型/') && !path.includes('/prd/');
  },

  isCurrentPage(page) {
    const href = decodeURI(window.location.href.replace(/\\/g, '/'));
    const normalized = page.replace(/\\/g, '/');
    return href.includes(normalized) || href.includes(encodeURI(normalized));
  },

  navigateToAiConsole(id) {
    const opt = SIDEBAR_CONFIG.aiConsole?.options?.find(item => item.id === id);
    if (!opt?.page) return false;
    if (this.isCurrentPage(opt.page)) return true;
    window.location.href = this.resolvePageHref(opt.page);
    return true;
  },

  navigateToPage(id) {
    const item = this.getMenuItem(id);
    if (!item) return false;

    if (item.page && item.status !== 'placeholder') {
      if (this.isCurrentPage(item.page)) {
        this.setActive(id);
        return true;
      }
      window.location.href = this.resolvePageHref(item.page);
      return true;
    }

    const rootQuery = `index.html?id=${encodeURIComponent(id)}`;
    if (this.isAtRootShell()) {
      this.setActive(id);
      return false;
    }
    window.location.href = this.resolvePageHref(rootQuery);
    return true;
  },

  setActive(id) {
    this.activeId = id;
    this.container.querySelectorAll('.xs-sidebar__item').forEach(el => {
      el.classList.toggle('is-active', el.dataset.id === id);
    });
  }
};
