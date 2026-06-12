/**
 * xSparkOps 原型国际化（zh / en）
 * 依赖：locales.js 中的 XSPARK_LOCALES
 */
const XSparkI18n = {
  STORAGE_KEY: 'xsparkops-locale',
  locale: 'zh',
  _listeners: [],

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    this.locale = saved === 'en' ? 'en' : 'zh';
    this._applyDocumentLang();
  },

  _applyDocumentLang() {
    document.documentElement.lang = this.locale === 'zh' ? 'zh-CN' : 'en';
  },

  isEn() {
    return this.locale === 'en';
  },

  t(key, params) {
    if (!key) return '';
    const parts = String(key).split('.');
    let val = XSPARK_LOCALES?.[this.locale];
    for (const p of parts) {
      val = val?.[p];
      if (val === undefined) break;
    }
    if (typeof val !== 'string') {
      let fb = XSPARK_LOCALES?.zh;
      for (const p of parts) {
        fb = fb?.[p];
        if (fb === undefined) break;
      }
      val = typeof fb === 'string' ? fb : key;
    }
    if (params && typeof val === 'string') {
      return val.replace(/\{(\w+)\}/g, (_, k) => (params[k] != null ? String(params[k]) : ''));
    }
    return val;
  },

  getLocaleLabel() {
    return this.locale === 'zh' ? this.t('common.lang.zh') : this.t('common.lang.en');
  },

  toggleLocale() {
    this.setLocale(this.locale === 'zh' ? 'en' : 'zh');
  },

  setLocale(loc) {
    if (loc !== 'zh' && loc !== 'en') return;
    if (this.locale === loc) return;
    this.locale = loc;
    localStorage.setItem(this.STORAGE_KEY, loc);
    this._applyDocumentLang();
    this.applyDom(document);
    window.dispatchEvent(new CustomEvent('xsparkops:localechange', { detail: { locale: loc } }));
  },

  onChange(fn) {
    window.addEventListener('xsparkops:localechange', fn);
    return () => window.removeEventListener('xsparkops:localechange', fn);
  },

  applyDom(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (key) el.textContent = this.t(key);
    });
    scope.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (key) el.placeholder = this.t(key);
    });
    scope.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle;
      if (key) el.title = this.t(key);
    });
    scope.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.dataset.i18nAria;
      if (key) el.setAttribute('aria-label', this.t(key));
    });
    const titleKey = document.body?.dataset?.i18nTitle;
    if (titleKey) document.title = this.t(titleKey);
  },

  /** 已知 Workspace 显示名 → 当前语言 */
  workspaceLabel(name) {
    const map = {
      '人工智能实验室': 'workspace.aiLab',
      'IT 运维 Workspace': 'workspace.itOps',
      'Default Workspace': 'workspace.default',
      '全平台': 'workspace.global',
      '全部可见 Workspace': 'workspace.allVisible'
    };
    const key = map[name];
    return key ? this.t(key) : name;
  },

  sidebarItemLabel(item) {
    if (item.type === 'section' && item.sectionId) {
      return this.t(`sidebar.sections.${item.sectionId}`);
    }
    if (item.id) {
      const translated = this.t(`sidebar.items.${item.id}`);
      if (translated !== `sidebar.items.${item.id}`) return translated;
    }
    return item.label || '';
  },

  approvalType(type) {
    return this.t(`approval.types.${type}`) || type;
  },

  approvalStatus(status) {
    return this.t(`approval.status.${status}`) || status;
  }
};

XSparkI18n.init();
