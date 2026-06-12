function kbCreateT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('knowledge.createWizard.' + k, p) : k;
}

const KnowledgeCreate = {
  open: false,
  form: null,
  publicTargetsOpen: false,
  SCOPES: ['workspace', 'public'],

  defaultForm() {
    const ws = (typeof SIDEBAR_CONFIG !== 'undefined' && SIDEBAR_CONFIG.workspace?.label)
      || this.getWorkspaceOptions()[0]
      || '人工智能实验室';
    return {
      name: '',
      description: '',
      workspace: ws,
      tag: 'workspace',
      publicTargets: ['all']
    };
  },

  getWorkspaceOptions() {
    return typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG.workspace.options : ['人工智能实验室', 'IT 运维 Workspace', 'Global WorkSpace'];
  },

  wsLabel(name) {
    return typeof XSparkI18n !== 'undefined' ? XSparkI18n.workspaceLabel(name) : name;
  },

  scopeLabel(tag) {
    return kbCreateT('scopeLabels.' + tag) || tag;
  },

  scopeDesc(tag) {
    return kbCreateT('scopeDesc.' + tag) || '';
  },

  getPublicTargetOptions() {
    return [
      { value: 'all', label: kbCreateT('publicTargetsAll') },
      ...this.getWorkspaceOptions().map(ws => ({ value: ws, label: this.wsLabel(ws) }))
    ];
  },

  isAllPublicTargets() {
    return this.form.publicTargets.includes('all');
  },

  publicTargetLabel(value) {
    if (value === 'all') return kbCreateT('publicTargetsAll');
    return this.wsLabel(value);
  },

  renderPublicTargetTags() {
    const targets = this.isAllPublicTargets() ? ['all'] : this.form.publicTargets;
    return targets.map(val => `
      <span class="kb-create-target-tag" data-target="${Knowledge.escapeAttr(val)}">
        ${Knowledge.escapeHtml(this.publicTargetLabel(val))}
        <button type="button" class="kb-create-target-remove" data-remove-target="${Knowledge.escapeAttr(val)}" aria-label="移除">×</button>
      </span>`).join('');
  },

  renderScopeSection() {
    const f = this.form;
    const cards = this.SCOPES.map(tag => `
      <label class="kb-create-scope kb-create-scope--${tag}${f.tag === tag ? ' selected' : ''}">
        <input type="radio" name="kbCreateScope" value="${tag}"${f.tag === tag ? ' checked' : ''}>
        <span class="kb-create-scope-radio" aria-hidden="true"></span>
        <span class="kb-create-scope-body">
          <span class="kb-create-scope-head">${Knowledge.escapeHtml(this.scopeLabel(tag))}</span>
          <span class="kb-create-scope-desc">${Knowledge.escapeHtml(this.scopeDesc(tag))}</span>
        </span>
      </label>`).join('');

    const publicTargets = f.tag === 'public' ? `
      <div class="kb-create-public-targets" id="kbCreatePublicTargets">
        <div class="kb-create-targets-field${this.publicTargetsOpen ? ' open' : ''}" id="kbCreateTargetsField">
          <div class="kb-create-target-tags" id="kbCreateTargetTags">${this.renderPublicTargetTags()}</div>
          <button type="button" class="kb-create-targets-trigger" id="kbCreateTargetsTrigger" aria-expanded="${this.publicTargetsOpen}">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>
          <div class="kb-create-targets-panel" id="kbCreateTargetsPanel"${this.publicTargetsOpen ? '' : ' hidden'}>
            ${this.getPublicTargetOptions().map(opt => {
              const checked = opt.value === 'all'
                ? this.isAllPublicTargets()
                : !this.isAllPublicTargets() && this.form.publicTargets.includes(opt.value);
              return `
              <label class="kb-create-target-option">
                <input type="checkbox" value="${Knowledge.escapeAttr(opt.value)}"${checked ? ' checked' : ''}>
                <span>${Knowledge.escapeHtml(opt.label)}</span>
              </label>`;
            }).join('')}
          </div>
        </div>
        <p class="kb-create-scope-note">${kbCreateT('publicNote')}</p>
      </div>` : '';

    return `
      <div class="kb-create-scope-field">
        <div class="kb-create-scope-label-row">
          <span class="kb-create-label">${kbCreateT('publishScope')} <span class="kb-create-required">*</span></span>
          <button type="button" class="kb-create-help" title="${Knowledge.escapeAttr(kbCreateT('scopeHelp'))}" aria-label="${Knowledge.escapeAttr(kbCreateT('scopeHelp'))}">?</button>
        </div>
        <div class="kb-create-scopes kb-create-scopes--inline" role="radiogroup" aria-label="${Knowledge.escapeAttr(kbCreateT('publishScope'))}">
          ${cards}
        </div>
        ${publicTargets}
      </div>`;
  },

  slugFromName(name) {
    const raw = String(name || '').trim().toLowerCase();
    if (!raw) return '';
    const ascii = raw
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (/^[a-z0-9-]+$/.test(ascii)) return ascii.slice(0, 48);
    return 'kb-' + Date.now().toString(36);
  },

  openModal() {
    this.open = true;
    this.publicTargetsOpen = false;
    this.form = this.defaultForm();
    this.mount();
  },

  close() {
    this.open = false;
    this.publicTargetsOpen = false;
    document.getElementById('kbCreateRoot')?.remove();
  },

  mount() {
    let root = document.getElementById('kbCreateRoot');
    if (!root) {
      root = document.createElement('div');
      root.id = 'kbCreateRoot';
      document.body.appendChild(root);
    }
    root.innerHTML = this.render();
    this.bindEvents();
    document.getElementById('kbCreateName')?.focus();
  },

  syncForm() {
    const g = id => document.getElementById(id);
    if (g('kbCreateName')) this.form.name = g('kbCreateName').value;
    if (g('kbCreateDesc')) this.form.description = g('kbCreateDesc').value;
    if (g('kbCreateWorkspace')) this.form.workspace = g('kbCreateWorkspace').value;
    const scopeRadio = document.querySelector('input[name="kbCreateScope"]:checked');
    if (scopeRadio) this.form.tag = scopeRadio.value;
  },

  validate() {
    this.syncForm();
    const name = this.form.name.trim();
    if (!name) {
      alert(kbCreateT('validationName'));
      return false;
    }
    if (name.length < 2) {
      alert(kbCreateT('validationNameMin'));
      return false;
    }
    if (!this.form.workspace) {
      alert(kbCreateT('validationWorkspace'));
      return false;
    }
    if (Knowledge.getItems().some(k => k.name.trim() === name)) {
      alert(kbCreateT('validationDuplicate'));
      return false;
    }
    return true;
  },

  submit() {
    if (!this.validate()) return;

    const slug = this.slugFromName(this.form.name);
    const item = {
      id: 'kb-' + Date.now(),
      slug,
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      purpose: this.form.description.trim(),
      tag: this.form.tag,
      publicTargets: this.form.tag === 'public' ? [...this.form.publicTargets] : undefined,
      workspace: this.form.workspace,
      status: 'draft',
      docCount: 0,
      sliceCount: 0,
      refCount: 0,
      url: KNOWLEDGE_MOCK.consoleUrl
    };

    if (typeof ApprovalBridge !== 'undefined') {
      ApprovalBridge.saveKnowledge(item);
    } else {
      KNOWLEDGE_MOCK.items.unshift({
        ...item,
        owner: Knowledge.getCurrentUser(),
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      });
    }

    this.close();
    Knowledge.tab = 'mine';
    Knowledge.statusFilter = 'draft';
    Knowledge.visibility = '';
    Knowledge.page = 1;
    Knowledge.render();
    Knowledge.showToast(kbCreateT('success', { name: item.name }));
  },

  renderForm() {
    const f = this.form;
    const slug = this.slugFromName(f.name);
    return `
      <div class="kb-create-section">
        <label class="kb-create-label" for="kbCreateName">${kbCreateT('name')} <span class="kb-create-required">*</span></label>
        <input type="text" id="kbCreateName" class="kb-create-input" value="${Knowledge.escapeAttr(f.name)}" placeholder="${kbCreateT('namePlaceholder')}" maxlength="64">
        ${slug ? `<p class="kb-create-hint">${kbCreateT('slugPreview', { slug })}</p>` : ''}
      </div>
      <div class="kb-create-section">
        <label class="kb-create-label" for="kbCreateDesc">${kbCreateT('description')}</label>
        <textarea id="kbCreateDesc" class="kb-create-textarea" rows="2" placeholder="${kbCreateT('descPlaceholder')}">${Knowledge.escapeHtml(f.description)}</textarea>
      </div>
      <div class="kb-create-section">
        <label class="kb-create-label" for="kbCreateWorkspace">Workspace <span class="kb-create-required">*</span></label>
        <select id="kbCreateWorkspace" class="kb-create-select">
          ${this.getWorkspaceOptions().map(ws => `<option value="${Knowledge.escapeAttr(ws)}"${f.workspace === ws ? ' selected' : ''}>${Knowledge.escapeHtml(this.wsLabel(ws))}</option>`).join('')}
        </select>
      </div>
      <div class="kb-create-section">
        ${this.renderScopeSection()}
      </div>`;
  },

  render() {
    if (!this.open) return '';
    return `
      <div class="kb-modal-backdrop" id="kbCreateBackdrop"></div>
      <div class="kb-create-modal kb-create-modal--single" role="dialog" aria-modal="true" aria-labelledby="kbCreateTitle">
        <header class="kb-create-head">
          <div>
            <h2 id="kbCreateTitle">${kbCreateT('title')}</h2>
            <p>${kbCreateT('subtitle')}</p>
          </div>
          <button type="button" class="kb-create-close" id="kbCreateClose" aria-label="${kbCreateT('cancel')}">✕</button>
        </header>
        <div class="kb-create-body">${this.renderForm()}</div>
        <footer class="kb-create-foot">
          <button type="button" class="kb-btn-ghost" id="kbCreateCancel">${kbCreateT('cancel')}</button>
          <button type="button" class="kb-btn-primary" id="kbCreateSubmit">${kbCreateT('submit')}</button>
        </footer>
      </div>`;
  },

  setScope(tag) {
    this.form.tag = tag;
    if (tag === 'workspace') {
      this.publicTargetsOpen = false;
    } else if (!this.form.publicTargets.length) {
      this.form.publicTargets = ['all'];
    }
    this.refreshScopeSection();
  },

  refreshScopeSection() {
    const section = document.querySelector('.kb-create-scope-field')?.closest('.kb-create-section');
    if (!section) return;
    section.innerHTML = this.renderScopeSection();
    this.bindScopeEvents();
  },

  togglePublicTarget(value, checked) {
    if (value === 'all') {
      this.form.publicTargets = checked ? ['all'] : [];
      if (!this.form.publicTargets.length) this.form.publicTargets = [this.getWorkspaceOptions()[0]];
    } else if (checked) {
      const next = this.form.publicTargets.filter(v => v !== 'all');
      if (!next.includes(value)) next.push(value);
      this.form.publicTargets = next.length ? next : ['all'];
    } else {
      const next = this.form.publicTargets.filter(v => v !== 'all' && v !== value);
      this.form.publicTargets = next.length ? next : ['all'];
    }
    this.refreshScopeSection();
  },

  removePublicTarget(value) {
    if (value === 'all') {
      this.form.publicTargets = [this.getWorkspaceOptions()[0]];
    } else {
      const next = this.form.publicTargets.filter(v => v !== value);
      this.form.publicTargets = next.length ? next : ['all'];
    }
    this.refreshScopeSection();
  },

  bindScopeEvents() {
    document.querySelectorAll('input[name="kbCreateScope"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) this.setScope(radio.value);
      });
    });

    document.getElementById('kbCreateTargetsTrigger')?.addEventListener('click', e => {
      e.stopPropagation();
      this.publicTargetsOpen = !this.publicTargetsOpen;
      this.refreshScopeSection();
    });

    document.querySelectorAll('#kbCreateTargetsPanel input[type="checkbox"]').forEach(box => {
      box.addEventListener('change', () => {
        this.togglePublicTarget(box.value, box.checked);
      });
    });

    document.querySelectorAll('[data-remove-target]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        this.removePublicTarget(btn.dataset.removeTarget);
      });
    });
  },

  bindEvents() {
    document.getElementById('kbCreateBackdrop')?.addEventListener('click', () => this.close());
    document.getElementById('kbCreateClose')?.addEventListener('click', () => this.close());
    document.getElementById('kbCreateCancel')?.addEventListener('click', () => this.close());
    document.getElementById('kbCreateSubmit')?.addEventListener('click', () => this.submit());

    const nameInput = document.getElementById('kbCreateName');
    nameInput?.addEventListener('input', e => {
      const slug = this.slugFromName(e.target.value);
      let hint = nameInput.parentElement?.querySelector('.kb-create-hint');
      if (!hint && slug) {
        hint = document.createElement('p');
        hint.className = 'kb-create-hint';
        nameInput.insertAdjacentElement('afterend', hint);
      }
      if (hint) {
        hint.textContent = slug ? kbCreateT('slugPreview', { slug }) : '';
        hint.style.display = slug ? '' : 'none';
      }
    });

    this.bindScopeEvents();

    if (!this._escBound) {
      this._escBound = true;
      document.addEventListener('keydown', e => {
        if (e.key !== 'Escape' || !this.open) return;
        if (this.publicTargetsOpen) {
          this.publicTargetsOpen = false;
          this.refreshScopeSection();
          e.stopPropagation();
          return;
        }
        this.close();
      });
    }

    if (!this._targetsDocBound) {
      this._targetsDocBound = true;
      document.addEventListener('click', e => {
        if (!this.open || !this.publicTargetsOpen) return;
        if (!e.target.closest('#kbCreateTargetsField')) {
          this.publicTargetsOpen = false;
          this.refreshScopeSection();
        }
      });
    }
  }
};
