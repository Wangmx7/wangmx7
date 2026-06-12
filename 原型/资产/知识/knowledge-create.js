function kbCreateT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('knowledge.createWizard.' + k, p) : k;
}

const KnowledgeCreate = {
  open: false,
  form: null,
  scopeSelectId: 'kbCreateScope',
  SCOPES: ['workspace', 'public'],

  defaultForm() {
    const ws = (typeof SIDEBAR_CONFIG !== 'undefined' && SIDEBAR_CONFIG.workspace?.label)
      || this.getWorkspaceOptions()[0]
      || '人工智能实验室';
    return {
      name: '',
      description: '',
      workspace: ws,
      tag: 'workspace'
    };
  },

  getWorkspaceOptions() {
    return typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG.workspace.options : ['人工智能实验室', 'IT 运维 Workspace', 'Default Workspace'];
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

  scopeOptions() {
    return this.SCOPES.map(tag => ({
      value: tag,
      label: this.scopeLabel(tag),
      desc: this.scopeDesc(tag),
      badge: tag
    }));
  },

  selectedScopeHint(tag) {
    const hint = this.scopeDesc(tag);
    if (tag === 'public' && hint) return `${hint} · ${kbCreateT('publicNote')}`;
    return hint;
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
    this.form = this.defaultForm();
    this.mount();
  },

  close() {
    this.open = false;
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
    const scopeVal = document.getElementById(`${this.scopeSelectId}Value`);
    if (scopeVal) this.form.tag = scopeVal.value || 'workspace';
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
    const scopeOpts = this.scopeOptions();
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
        ${KbSearchSelect.render(this.scopeSelectId, {
          label: kbCreateT('publishScope'),
          required: true,
          placeholder: kbCreateT('scopeSearchPlaceholder'),
          value: f.tag,
          options: scopeOpts,
          hint: this.selectedScopeHint(f.tag)
        })}
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

    KbSearchSelect.bind(this.scopeSelectId, {
      options: this.scopeOptions(),
      onChange: (val) => {
        this.form.tag = val;
        const hint = document.getElementById(`${this.scopeSelectId}Hint`);
        if (hint) hint.textContent = this.selectedScopeHint(val);
      }
    });

    if (!this._escBound) {
      this._escBound = true;
      document.addEventListener('keydown', e => {
        if (e.key !== 'Escape' || !this.open) return;
        const openPanel = document.querySelector('#kbCreateRoot .kb-search-select.open');
        if (openPanel) {
          KbSearchSelect.instances[this.scopeSelectId]?.close?.();
          e.stopPropagation();
          return;
        }
        this.close();
      });
    }
  }
};
