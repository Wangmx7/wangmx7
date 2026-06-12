function agtT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('agent.' + k, p) : k;
}

/** 完整名称 → slug 语义映射 */
const AGT_NAME_PHRASE_SLUG = {
  '运维助手': 'ops-assistant',
  '财务助手': 'finance-helper',
  '客服agent': 'chat-support',
  '客服 agent': 'chat-support',
  '客服助手': 'chat-support',
  '数据分析师': 'data-analyst',
  '数据分析助手': 'data-analyst',
  '测试bot': 'test-bot',
  '测试 bot': 'test-bot',
  '测试助手': 'test-bot',
  '代码审查助手': 'code-review-assistant',
  '知识库助手': 'knowledge-assistant',
  '智能客服': 'smart-support',
  '运维专家': 'ops-expert',
  'pm助手': 'pm-assistant',
  'pm 助手': 'pm-assistant'
};

/** 分类 → slug 前缀 */
const AGT_CATEGORY_SLUG_PREFIX = {
  '运维': 'ops', '财务': 'finance', '研发': 'dev', '客服': 'support', '数据分析': 'data'
};

/** 汉字 → 拼音 */
const AGT_SLUG_PINYIN = {
  '运': 'yun', '维': 'wei', '助': 'zhu', '手': 'shou', '财': 'cai', '务': 'wu', '客': 'ke', '服': 'fu',
  '数': 'shu', '据': 'ju', '分': 'fen', '析': 'xi', '师': 'shi', '测': 'ce', '试': 'shi', '研': 'yan',
  '发': 'fa', '知': 'zhi', '识': 'shi', '库': 'ku', '智': 'zhi', '能': 'neng', '体': 'ti', '问': 'wen',
  '答': 'da', '工': 'gong', '单': 'dan', '故': 'gu', '障': 'zhang', '诊': 'zhen', '断': 'duan', '报': 'bao',
  '表': 'biao', '查': 'cha', '询': 'xun', '管': 'guan', '理': 'li', '系': 'xi', '统': 'tong', '平': 'ping',
  '台': 'tai', '自': 'zi', '动': 'dong', '化': 'hua', '营': 'ying', '产': 'chan', '品': 'pin', '人': 'ren',
  '机': 'ji', '器': 'qi', '聊': 'liao', '天': 'tian', '金': 'jin', '融': 'rong', '监': 'jian', '控': 'kong',
  '网': 'wang', '络': 'luo', '安': 'an', '全': 'quan', '售': 'shou', '后': 'hou', '技': 'ji', '术': 'shu',
  '支': 'zhi', '持': 'chi', '专': 'zhuan', '家': 'jia', '审': 'shen', '查': 'cha', '码': 'ma', '代': 'dai',
  '开': 'kai', '发': 'fa', '项': 'xiang', '目': 'mu', '经': 'jing', '营': 'ying', '销': 'xiao', '售': 'shou'
};

const CAP_POOL_KEYS = {
  skills: { pool: 'skills', label: 'Skill' },
  tools: { pool: 'tools', label: 'Tool' },
  mcp: { pool: 'mcp', label: 'MCP' },
  knowledgeBases: { pool: 'knowledgeBases', labelKey: 'fields.knowledgeBase' }
};

const AgentWizard = {
  open: false,
  step: 1,
  readonly: false,
  agentId: null,
  draft: null,
  capPicker: null,
  debugPanelWidth: 380,
  debugPanelMin: 280,
  debugPanelMax: 560,
  playgroundInput: '',
  lastRun: null,
  _resizing: false,

  stepMeta() {
    return [
      { n: 1, title: agtT('wizard.step1'), desc: agtT('wizard.step1Desc') },
      { n: 2, title: agtT('wizard.step2'), desc: agtT('wizard.step2Desc') },
      { n: 3, title: agtT('wizard.step3'), desc: agtT('wizard.step3Desc') },
      { n: 4, title: agtT('wizard.step4'), desc: agtT('wizard.step4Desc') },
      { n: 5, title: agtT('wizard.step5'), desc: agtT('wizard.step5Desc') }
    ];
  },

  loadDebugWidth() {
    try {
      const w = parseInt(localStorage.getItem('xs-agt-debug-width'), 10);
      if (w >= this.debugPanelMin && w <= this.debugPanelMax) this.debugPanelWidth = w;
    } catch { /* ignore */ }
  },

  saveDebugWidth() {
    localStorage.setItem('xs-agt-debug-width', String(this.debugPanelWidth));
  },

  showDebugPanel() {
    return this.agentId && !this.readonly;
  },

  isEditMode() {
    return !!this.agentId && !this.readonly;
  },

  defaultDraft() {
    const ws = typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG.workspace?.label : '人工智能实验室';
    const defaultSandbox = AGENT_CAPABILITY_POOL.sandboxPolicies[0]?.label || '只读沙箱';
    return {
      id: 'agt_new_' + Date.now(),
      slug: '',
      name: '',
      slugManual: false,
      summary: '',
      category: AGENT_CAPABILITY_POOL.categories[0],
      icon: '🤖',
      workspace: ws,
      status: 'draft',
      version: '0.1.0',
      config: {
        model: AGENT_CAPABILITY_POOL.models[0],
        temperature: 0.5,
        systemPrompt: '',
        startupInstruction: '',
        outputFormat: '',
        skills: [],
        tools: [],
        mcp: [],
        knowledgeBases: [],
        autonomyLevel: 'L2',
        sandboxPolicy: defaultSandbox
      },
      publishScope: ws,
      changeLog: '',
      purpose: '',
      riskBoundary: ''
    };
  },

  normalizeNameKey(name) {
    return (name || '').trim().replace(/\s+/g, ' ');
  },

  slugifyFromName(name, category) {
    const key = this.normalizeNameKey(name);
    if (!key) return '';

    const lowerKey = key.toLowerCase();
    if (AGT_NAME_PHRASE_SLUG[key]) return AGT_NAME_PHRASE_SLUG[key];
    if (AGT_NAME_PHRASE_SLUG[lowerKey]) return AGT_NAME_PHRASE_SLUG[lowerKey];

    const suffixes = [/助手$/u, /机器人$/u, /\s*agent$/i, /\s*bot$/i];
    let stem = key;
    for (const re of suffixes) stem = stem.replace(re, '').trim();
    if (stem && stem !== key) {
      const stemSlug = this.slugifyFromName(stem, category);
      if (stemSlug) {
        if (/助手$/u.test(key)) return stemSlug + (stemSlug.endsWith('-assistant') ? '' : '-assistant');
        if (/机器人$/u.test(key) || /bot$/i.test(key)) return stemSlug + (stemSlug.endsWith('-bot') ? '' : '-bot');
        if (/agent$/i.test(key)) return stemSlug + (stemSlug.endsWith('-agent') ? '' : '-agent');
      }
    }

    const latin = lowerKey
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (latin.length >= 2) return latin;

    const parts = [];
    for (const ch of key) {
      if (/[a-zA-Z0-9]/.test(ch)) parts.push(ch.toLowerCase());
      else if (AGT_SLUG_PINYIN[ch]) parts.push(AGT_SLUG_PINYIN[ch]);
    }
    let pinyin = parts.join('-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (pinyin.length >= 4) return pinyin;

    const catPrefix = category && AGT_CATEGORY_SLUG_PREFIX[category];
    if (catPrefix && pinyin) return catPrefix + '-' + pinyin;
    if (catPrefix && key.length <= 6) return catPrefix + '-assistant';
    if (pinyin.length >= 2) return pinyin;
    return 'agent-' + Date.now().toString(36).slice(-6);
  },

  onNameInput(name) {
    if (this.readonly) return;
    this.draft.name = name;
    if (!this.draft.slugManual) {
      this.draft.slug = this.slugifyFromName(name, this.draft.category);
      const slugEl = document.getElementById('agtSlug');
      if (slugEl) slugEl.value = this.draft.slug;
    }
  },

  onSlugInput(slug) {
    if (this.readonly) return;
    this.draft.slug = slug.trim();
    this.draft.slugManual = true;
  },

  openCapPicker(type, path) {
    if (this.readonly) return;
    this.capPicker = { type, path };
    Agent.render();
  },

  closeCapPicker() {
    this.capPicker = null;
    Agent.render();
  },

  getPoolByPath(path) {
    const key = path.split('.').pop();
    return AGENT_CAPABILITY_POOL[CAP_POOL_KEYS[key]?.pool || key] || [];
  },

  getSelectedByPath(path) {
    const parts = path.split('.');
    let obj = this.draft;
    for (const p of parts) obj = obj[p];
    return obj || [];
  },

  addCapItems(path, ids) {
    if (this.readonly) return;
    const parts = path.split('.');
    let obj = this.draft;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    const arr = obj[parts[parts.length - 1]] || [];
    ids.forEach(id => { if (!arr.includes(id)) arr.push(id); });
    obj[parts[parts.length - 1]] = arr;
    this.closeCapPicker();
  },

  removeCapItem(path, id) {
    if (this.readonly) return;
    const parts = path.split('.');
    let obj = this.draft;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    const arr = obj[parts[parts.length - 1]] || [];
    obj[parts[parts.length - 1]] = arr.filter(x => x !== id);
    Agent.render();
  },

  getCapItem(path, id) {
    return this.getPoolByPath(path).find(x => x.id === id);
  },

  openCreate() {
    this.loadDebugWidth();
    this.open = true;
    this.step = 1;
    this.readonly = false;
    this.agentId = null;
    this.draft = this.defaultDraft();
    this.lastRun = null;
    this.playgroundInput = '';
    Agent.render();
  },

  openEdit(agent, readonly) {
    this.loadDebugWidth();
    this.open = true;
    this.step = 1;
    this.readonly = !!readonly;
    this.agentId = agent.id;
    this.draft = JSON.parse(JSON.stringify(agent));
    this.draft.slugManual = true;
    if (!this.draft.config.knowledgeBases) this.draft.config.knowledgeBases = [];
    this.lastRun = null;
    this.playgroundInput = '';
    Agent.render();
  },

  close(opts = {}) {
    const returnId = this.agentId;
    this.open = false;
    this.draft = null;
    this.capPicker = null;
    if (opts.toDetail !== false && returnId && ApprovalBridge.getAgent(returnId)) {
      Agent.openDetail(returnId, 'config');
    } else {
      Agent.render();
    }
  },

  setStep(n) {
    if (n < 1 || n > 5 || n === this.step) return;
    if (this.readonly) {
      this.step = n;
      Agent.render();
      return;
    }
    if (this.isEditMode()) {
      this.syncForm();
      this.step = n;
      Agent.render();
      return;
    }
    if (n < this.step) {
      this.syncForm();
      this.step = n;
      Agent.render();
      return;
    }
    if (this.validateStep(this.step)) {
      this.syncForm();
      this.step = n;
      Agent.render();
    }
  },

  validateStep(step) {
    const d = this.draft;
    if (step === 1) {
      if (!d.name?.trim()) { alert(agtT('wizard.validationName')); return false; }
      if (!d.slug?.trim()) { alert(agtT('wizard.validationBasic')); return false; }
      if (!/^[a-z0-9-]+$/.test(d.slug.trim())) { alert(agtT('wizard.validationSlug')); return false; }
    }
    if (step === 2 && !d.config?.systemPrompt?.trim()) {
      alert(agtT('wizard.validationPrompt'));
      return false;
    }
    return true;
  },

  next() {
    this.syncForm();
    if (!this.validateStep(this.step)) return;
    if (this.step < 5) { this.step++; Agent.render(); }
  },

  prev() {
    if (this.step > 1) {
      this.syncForm();
      this.step--;
      Agent.render();
    }
  },

  updateField(path, value) {
    if (this.readonly) return;
    const parts = path.split('.');
    let obj = this.draft;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    if (path === 'category' && !this.draft.slugManual && this.draft.name) {
      this.draft.slug = this.slugifyFromName(this.draft.name, value);
    }
  },

  saveDraft() {
    if (this.readonly) return;
    const saved = ApprovalBridge.saveAgent({ ...this.draft, status: 'draft' });
    this.draft = saved;
    this.agentId = saved.id;
    Agent.showToast(agtT('wizard.savedDraft'));
    Agent.refreshList();
  },

  submitApproval() {
    if (this.readonly) return;
    if (!this.validateStep(5)) return;
    const agent = ApprovalBridge.saveAgent({
      ...this.draft,
      configSummary: ApprovalBridge.buildConfigSummary(this.draft)
    });
    const { approvalId } = ApprovalBridge.submitForApproval(agent);
    Agent.showToast(agtT('wizard.submittedApproval', { id: approvalId }), Agent.approvalCenterUrl(approvalId));
    this.close({ toDetail: false });
  },

  buildTraceDetail(run, agent) {
    const c = agent.config || {};
    const skills = (c.skills || []).join(', ') || '—';
    return {
      traceId: run.traceId,
      model: c.model,
      tokens: run.tokens,
      durationMs: run.durationMs,
      spans: [
        { name: 'agent.invoke', type: 'agent', duration: 120, status: 'ok' },
        { name: 'llm.chat.completions', type: 'llm', duration: Math.round(run.durationMs * 0.55), tokens: Math.round(run.tokens * 0.7), model: c.model, status: 'ok' },
        { name: skills !== '—' ? `skill.${(c.skills || [])[0]}` : 'retrieval.knowledge', type: 'skill', duration: Math.round(run.durationMs * 0.25), status: 'ok' },
        { name: (c.tools || []).length ? `tool.${c.tools[0]}` : 'guardrail.check', type: 'tool', duration: Math.round(run.durationMs * 0.15), status: 'ok' }
      ]
    };
  },

  runPlayground() {
    const input = this.playgroundInput || document.getElementById('agtDebugInput')?.value || '';
    this.playgroundInput = input;
    if (!this.agentId) return;
    this.syncForm();
    ApprovalBridge.saveAgent({ ...this.draft, status: this.draft.status || 'draft' });
    const run = ApprovalBridge.appendRunRecord(this.agentId, {
      trigger: 'playground',
      inputSummary: input.slice(0, 80) || agtT('playground.defaultInput'),
      status: 'succeeded'
    });
    this.lastRun = { run, detail: this.buildTraceDetail(run, this.draft) };
    Agent.render();
  },

  renderStepNav() {
    const sequentialCreate = !this.readonly && !this.isEditMode();
    return this.stepMeta().map(s => {
      let cls = 'agt-create-step';
      if (s.n === this.step) cls += ' is-active';
      else if (s.n < this.step) cls += ' is-done';
      const disabled = sequentialCreate && s.n > this.step;
      return `
        <button type="button" class="${cls}" data-step="${s.n}"${disabled ? ' disabled' : ''}>
          <span class="agt-create-step-num">${s.n < this.step ? '✓' : s.n}</span>
          <span class="agt-create-step-text"><strong>${s.title}</strong><em>${s.desc}</em></span>
        </button>`;
    }).join('');
  },

  renderStep1() {
    const d = this.draft;
    const ro = this.readonly ? ' disabled' : '';
    const slugHint = d.slugManual ? agtT('wizard.slugManual') : agtT('wizard.slugAuto');
    return `
      <div class="agt-create-section"><h3 class="agt-create-section-title">${agtT('wizard.step1')}</h3><p class="agt-create-section-desc">${agtT('wizard.step1Desc')}</p></div>
      <div class="agt-form-row agt-form-row--hero">
        <label>${agtT('fields.name')} <span class="agt-required">*</span></label>
        <input type="text" id="agtName" class="agt-input-lg" value="${Agent.escapeAttr(d.name)}" placeholder="${agtT('wizard.namePlaceholder')}"${ro}>
      </div>
      <div class="agt-form-row">
        <label>${agtT('fields.slug')} <span class="agt-required">*</span></label>
        <div class="agt-slug-field">
          <span class="agt-slug-prefix">agent/</span>
          <input type="text" id="agtSlug" class="mono" value="${Agent.escapeAttr(d.slug)}" placeholder="ops-assistant"${ro}>
        </div>
        <p class="agt-field-hint">${slugHint}${d.slug && !d.slugManual ? ` · ${agtT('wizard.slugPreview', { slug: d.slug })}` : ''}</p>
      </div>
      <div class="agt-form-row"><label>${agtT('fields.summary')}</label><textarea id="agtSummary" rows="3"${ro}>${Agent.escapeHtml(d.summary)}</textarea></div>
      <div class="agt-form-grid">
        <div class="agt-form-row"><label>${agtT('fields.category')}</label><select id="agtCategory"${ro}>${AGENT_CAPABILITY_POOL.categories.map(c => `<option value="${c}"${d.category === c ? ' selected' : ''}>${c}</option>`).join('')}</select></div>
        <div class="agt-form-row"><label>${agtT('fields.icon')}</label><input type="text" id="agtIcon" value="${Agent.escapeAttr(d.icon)}" maxlength="4"${ro}></div>
      </div>`;
  },

  renderStep2() {
    const c = this.draft.config;
    const ro = this.readonly ? ' disabled' : '';
    return `
      <div class="agt-create-section"><h3 class="agt-create-section-title">${agtT('wizard.step2')}</h3><p class="agt-create-section-desc">${agtT('wizard.step2Desc')}</p></div>
      <div class="agt-form-grid">
        <div class="agt-form-row"><label>${agtT('fields.model')}</label><select id="agtModel"${ro}>${AGENT_CAPABILITY_POOL.models.map(m => `<option value="${m}"${c.model === m ? ' selected' : ''}>${m}</option>`).join('')}</select></div>
        <div class="agt-form-row"><label>${agtT('fields.temperature')} <span class="agt-field-hint-inline">${c.temperature}</span></label><input type="range" id="agtTemp" min="0" max="2" step="0.1" value="${c.temperature}"${ro}></div>
      </div>
      <div class="agt-form-row"><label>${agtT('fields.systemPrompt')} <span class="agt-required">*</span></label><textarea id="agtSystemPrompt" rows="5"${ro}>${Agent.escapeHtml(c.systemPrompt)}</textarea></div>
      <div class="agt-form-row"><label>${agtT('fields.startupInstruction')}</label><textarea id="agtStartup" rows="2"${ro}>${Agent.escapeHtml(c.startupInstruction || '')}</textarea></div>
      <div class="agt-form-row"><label>${agtT('fields.outputFormat')}</label><textarea id="agtOutput" rows="2"${ro}>${Agent.escapeHtml(c.outputFormat || '')}</textarea></div>`;
  },

  renderCapSection(title, path, selected, capType) {
    const ro = this.readonly;
    const chips = selected.map(id => {
      const item = this.getCapItem(path, id);
      if (!item) return '';
      return `
        <div class="agt-cap-chip">
          <div class="agt-cap-chip-body"><strong>${item.name}</strong><span>${item.desc}</span></div>
          ${!ro ? `<button type="button" class="agt-cap-chip-remove" data-cap-remove="${path}" data-cap-id="${id}" aria-label="remove">×</button>` : ''}
        </div>`;
    }).join('');
    return `
      <div class="agt-cap-section">
        <div class="agt-cap-section-head">
          <h4 class="agt-cap-title">${title}</h4>
          ${!ro ? `<button type="button" class="agt-btn-ghost agt-cap-add" data-cap-add="${capType}" data-cap-path="${path}">+ ${agtT('wizard.addCapability')}</button>` : ''}
        </div>
        <div class="agt-cap-chips">${chips || `<span class="agt-cap-empty">${agtT('wizard.capEmpty')}</span>`}</div>
      </div>`;
  },

  renderStep3() {
    const c = this.draft.config;
    return `
      <div class="agt-create-section"><h3 class="agt-create-section-title">${agtT('wizard.step3')}</h3><p class="agt-create-section-desc">${agtT('wizard.step3Desc')}</p></div>
      ${this.renderCapSection('Skill', 'config.skills', c.skills || [], 'skills')}
      ${this.renderCapSection('Tool', 'config.tools', c.tools || [], 'tools')}
      ${this.renderCapSection('MCP', 'config.mcp', c.mcp || [], 'mcp')}
      ${this.renderCapSection(agtT('fields.knowledgeBase'), 'config.knowledgeBases', c.knowledgeBases || [], 'knowledgeBases')}`;
  },

  renderCapPickerModal() {
    if (!this.capPicker) return '';
    const { type, path } = this.capPicker;
    const pool = this.getPoolByPath(path);
    const selected = this.getSelectedByPath(path);
    const meta = CAP_POOL_KEYS[type] || {};
    const title = meta.labelKey ? agtT(meta.labelKey) : meta.label || type;
    return `
      <div class="agt-cap-modal-backdrop" id="agtCapModalBackdrop"></div>
      <div class="agt-cap-modal" role="dialog">
        <header class="agt-cap-modal-head">
          <h3>${agtT('wizard.pickCapability', { type: title })}</h3>
          <button type="button" class="agt-cap-modal-close" id="agtCapModalClose">✕</button>
        </header>
        <div class="agt-cap-modal-body">
          ${pool.map(item => `
            <label class="agt-cap-pick-item">
              <input type="checkbox" class="agt-cap-pick-cb" value="${item.id}"${selected.includes(item.id) ? ' checked' : ''}>
              <div><strong>${item.name}</strong><span>${item.desc}${item.docs != null ? ` · ${item.docs} ${agtT('wizard.docs')}` : ''}</span></div>
            </label>`).join('')}
        </div>
        <footer class="agt-cap-modal-foot">
          <button type="button" class="agt-btn-ghost" id="agtCapModalCancel">${agtT('wizard.cancel')}</button>
          <button type="button" class="agt-btn-primary" id="agtCapModalConfirm">${agtT('wizard.addSelected')}</button>
        </footer>
      </div>`;
  },

  renderStep4() {
    const c = this.draft.config;
    const ro = this.readonly ? ' disabled' : '';
    const selectedSandbox = AGENT_CAPABILITY_POOL.sandboxPolicies.find(p => p.label === c.sandboxPolicy) || AGENT_CAPABILITY_POOL.sandboxPolicies[0];
    return `
      <div class="agt-create-section"><h3 class="agt-create-section-title">${agtT('wizard.step4')}</h3><p class="agt-create-section-desc">${agtT('wizard.step4Desc')}</p></div>
      <div class="agt-form-row"><label>${agtT('fields.autonomyLevel')}</label>
        <div class="agt-radio-cards">${AGENT_CAPABILITY_POOL.autonomyLevels.map(l => `
          <label class="agt-radio-card${c.autonomyLevel === l.id ? ' is-selected' : ''}">
            <input type="radio" name="agtAutonomy" value="${l.id}"${c.autonomyLevel === l.id ? ' checked' : ''}${ro}>
            <div class="agt-radio-card-body"><strong>${l.label}</strong><span>${l.desc}</span></div>
          </label>`).join('')}</div>
      </div>
      <div class="agt-form-row"><label>${agtT('fields.sandboxPolicy')}</label><p class="agt-field-hint" style="margin-top:0">${agtT('wizard.sandboxIntro')}</p>
        <div class="agt-sandbox-cards">${AGENT_CAPABILITY_POOL.sandboxPolicies.map(p => `
          <label class="agt-sandbox-card${c.sandboxPolicy === p.label ? ' is-selected' : ''}">
            <input type="radio" name="agtSandbox" value="${Agent.escapeAttr(p.label)}"${c.sandboxPolicy === p.label ? ' checked' : ''}${ro}>
            <div class="agt-sandbox-card-head"><strong>${p.label}</strong><span class="agt-sandbox-tag">${p.tag}</span></div>
            <p class="agt-sandbox-short">${p.desc}</p><p class="agt-sandbox-detail">${p.detail}</p>
          </label>`).join('')}</div>
        ${selectedSandbox ? `<div class="agt-sandbox-selected-hint">${agtT('wizard.sandboxSelected', { name: selectedSandbox.label })}</div>` : ''}
      </div>`;
  },

  renderStep5() {
    const d = this.draft;
    const ro = this.readonly ? ' disabled' : '';
    return `
      <div class="agt-create-section"><h3 class="agt-create-section-title">${agtT('wizard.step5')}</h3><p class="agt-create-section-desc">${agtT('wizard.step5Desc')}</p></div>
      <div class="agt-form-grid">
        <div class="agt-form-row"><label>${agtT('fields.publishScope')}</label><select id="agtPublishScope"${ro}>${(typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG.workspace.options : []).map(ws => `<option value="${ws}"${d.publishScope === ws ? ' selected' : ''}>${ws}</option>`).join('')}</select></div>
        <div class="agt-form-row"><label>${agtT('fields.version')}</label><input type="text" id="agtVersion" value="${Agent.escapeAttr(d.version || '1.0.0')}"${ro}></div>
      </div>
      <div class="agt-form-row"><label>${agtT('fields.changeLog')}</label><textarea id="agtChangeLog" rows="2"${ro}>${Agent.escapeHtml(d.changeLog || '')}</textarea></div>
      <div class="agt-form-row"><label>${agtT('fields.purpose')}</label><textarea id="agtPurpose" rows="2"${ro}>${Agent.escapeHtml(d.purpose || '')}</textarea></div>
      <div class="agt-form-row"><label>${agtT('fields.riskBoundary')}</label><textarea id="agtRisk" rows="2"${ro}>${Agent.escapeHtml(d.riskBoundary || '')}</textarea></div>
      <div class="agt-preview-box agt-preview-box--final">
        <div class="agt-preview-head"><span class="agt-preview-icon">${d.icon || '🤖'}</span><div><strong>${Agent.escapeHtml(d.name || '—')}</strong><span class="mono">agent/${Agent.escapeHtml(d.slug || '—')}</span></div></div>
        <dl>
          <dt>${agtT('fields.model')}</dt><dd>${d.config?.model || '—'}</dd>
          <dt>${agtT('wizard.capabilities')}</dt><dd>${ApprovalBridge.buildConfigSummary(d)}</dd>
        </dl>
      </div>`;
  },

  renderStepBody() {
    return [null, this.renderStep1, this.renderStep2, this.renderStep3, this.renderStep4, this.renderStep5][this.step]?.call(this) || '';
  },

  renderDebugPanel() {
    const d = this.lastRun?.detail;
    const obsBase = '../../运营/ai观测/index.html';
    return `
      <aside class="agt-debug-panel" id="agtDebugPanel" style="width:${this.debugPanelWidth}px">
        <div class="agt-debug-resizer" id="agtDebugResizer" title="${agtT('debug.resize')}"></div>
        <header class="agt-debug-head"><h3>${agtT('debug.title')}</h3><span class="agt-debug-hint">${agtT('debug.hint')}</span></header>
        <div class="agt-debug-chat">
          <textarea id="agtDebugInput" placeholder="${agtT('playground.placeholder')}">${Agent.escapeHtml(this.playgroundInput)}</textarea>
          <button type="button" class="agt-btn-primary" id="agtDebugRun">${agtT('playground.run')}</button>
        </div>
        <div class="agt-debug-output">
          ${this.lastRun
            ? `<p class="agt-debug-reply">${agtT('playground.result', { traceId: this.lastRun.run.traceId })}</p>`
            : `<p class="agt-debug-placeholder">${agtT('debug.noRun')}</p>`}
        </div>
        <section class="agt-debug-trace">
          <div class="agt-debug-trace-head">
            <h4>${agtT('debug.traceTitle')}</h4>
            ${d ? `<a class="agt-trace-link" href="${obsBase}?traceId=${encodeURIComponent(d.traceId)}" target="_blank" rel="noopener">${agtT('debug.openObs')}</a>` : ''}
          </div>
          ${d ? `
            <div class="agt-trace-summary">
              <span><em>Trace</em><code>${d.traceId}</code></span>
              <span><em>${agtT('fields.model')}</em>${d.model}</span>
              <span><em>Token</em>${d.tokens}</span>
              <span><em>${agtT('runs.duration')}</em>${d.durationMs}ms</span>
            </div>
            <ul class="agt-trace-spans">${d.spans.map(s => `
              <li class="agt-trace-span agt-trace-span--${s.type}">
                <span class="agt-trace-span-name">${s.name}</span>
                <span class="agt-trace-span-meta">${s.duration}ms${s.tokens ? ` · ${s.tokens} tok` : ''}${s.model ? ` · ${s.model}` : ''}</span>
              </li>`).join('')}</ul>` : `<p class="agt-debug-placeholder">${agtT('debug.traceEmpty')}</p>`}
        </section>
      </aside>`;
  },

  render() {
    if (!this.open || !this.draft) return '';
    const title = this.agentId ? agtT('wizard.editTitle') : agtT('wizard.createTitle');
    const split = this.showDebugPanel();
    const roBanner = this.readonly ? `<div class="agt-readonly-banner">${agtT('wizard.readonlyHint')}</div>` : '';

    return `
      <div class="agt-create-page">
        <header class="agt-create-topbar">
          <button type="button" class="agt-create-back" id="agtWizardCancel">← ${agtT('wizard.backToList')}</button>
          <div class="agt-create-topbar-title"><h2>${title}</h2>${this.draft.name ? `<span class="mono">agent/${Agent.escapeHtml(this.draft.slug)}</span>` : ''}</div>
          <div class="agt-create-topbar-actions">${!this.readonly ? `<button type="button" class="agt-btn-ghost" id="agtWizardSave">${agtT('wizard.saveDraft')}</button>` : ''}</div>
        </header>
        <div class="agt-create-layout${split ? ' agt-create-layout--split' : ''}">
          <aside class="agt-create-sidebar"><nav class="agt-create-steps">${this.renderStepNav()}</nav></aside>
          <main class="agt-create-main">
            <div class="agt-create-form">${roBanner}${this.renderStepBody()}</div>
            <footer class="agt-create-foot">
              <span class="agt-create-progress">${agtT('wizard.progress', { step: this.step, total: 5 })}</span>
              <div class="agt-create-foot-right">
                ${this.step > 1 ? `<button type="button" class="agt-btn-ghost" id="agtWizardPrev">${agtT('wizard.prev')}</button>` : ''}
                ${this.step < 5 ? `<button type="button" class="agt-btn-primary" id="agtWizardNext">${agtT('wizard.next')}</button>` : ''}
                ${this.step === 5 && !this.readonly ? `<button type="button" class="agt-btn-primary" id="agtWizardSubmit">${agtT('wizard.submitApproval')}</button>` : ''}
              </div>
            </footer>
          </main>
          ${split ? this.renderDebugPanel() : ''}
        </div>
        ${this.renderCapPickerModal()}
      </div>`;
  },

  bindEvents() {
    document.getElementById('agtWizardCancel')?.addEventListener('click', () => this.close());
    document.getElementById('agtWizardPrev')?.addEventListener('click', () => this.prev());
    document.getElementById('agtWizardNext')?.addEventListener('click', () => this.next());
    document.getElementById('agtWizardSave')?.addEventListener('click', () => { this.syncForm(); this.saveDraft(); });
    document.getElementById('agtWizardSubmit')?.addEventListener('click', () => { this.syncForm(); this.submitApproval(); });
    document.getElementById('agtDebugRun')?.addEventListener('click', () => this.runPlayground());

    document.querySelectorAll('.agt-create-step').forEach(btn => {
      btn.addEventListener('click', () => { if (!btn.disabled) this.setStep(Number(btn.dataset.step)); });
    });

    document.querySelectorAll('[data-cap-add]').forEach(btn => {
      btn.addEventListener('click', () => this.openCapPicker(btn.dataset.capAdd, btn.dataset.capPath));
    });
    document.querySelectorAll('[data-cap-remove]').forEach(btn => {
      btn.addEventListener('click', () => this.removeCapItem(btn.dataset.capRemove, btn.dataset.capId));
    });

    document.getElementById('agtCapModalBackdrop')?.addEventListener('click', () => this.closeCapPicker());
    document.getElementById('agtCapModalClose')?.addEventListener('click', () => this.closeCapPicker());
    document.getElementById('agtCapModalCancel')?.addEventListener('click', () => this.closeCapPicker());
    document.getElementById('agtCapModalConfirm')?.addEventListener('click', () => {
      if (!this.capPicker || this.readonly) return;
      const ids = [...document.querySelectorAll('.agt-cap-pick-cb:checked')].map(cb => cb.value);
      const parts = this.capPicker.path.split('.');
      let obj = this.draft;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = ids;
      this.closeCapPicker();
    });

    document.querySelectorAll('input[name=agtSandbox]').forEach(r => {
      r.addEventListener('change', () => { if (r.checked) { this.updateField('config.sandboxPolicy', r.value); Agent.render(); } });
    });

    const resizer = document.getElementById('agtDebugResizer');
    if (resizer) {
      resizer.addEventListener('mousedown', e => {
        e.preventDefault();
        this._resizing = true;
        const onMove = ev => {
          if (!this._resizing) return;
          const panel = document.getElementById('agtDebugPanel');
          if (!panel) return;
          const rect = panel.getBoundingClientRect();
          const newW = Math.min(this.debugPanelMax, Math.max(this.debugPanelMin, rect.right - ev.clientX));
          this.debugPanelWidth = newW;
          panel.style.width = newW + 'px';
        };
        const onUp = () => {
          this._resizing = false;
          this.saveDebugWidth();
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    }

    const debugInput = document.getElementById('agtDebugInput');
    if (debugInput) debugInput.addEventListener('input', () => { this.playgroundInput = debugInput.value; });

    this.syncFormListeners();
  },

  syncFormListeners() {
    const nameEl = document.getElementById('agtName');
    if (nameEl && !this.readonly) nameEl.addEventListener('input', () => this.onNameInput(nameEl.value));
    const slugEl = document.getElementById('agtSlug');
    if (slugEl && !this.readonly) slugEl.addEventListener('input', () => this.onSlugInput(slugEl.value));

    const bind = (id, path) => {
      const el = document.getElementById(id);
      if (!el || this.readonly) return;
      const handler = () => {
        const val = el.type === 'number' || el.type === 'range' ? parseFloat(el.value) : el.value;
        this.updateField(path, val);
        if (id === 'agtTemp') {
          const hint = el.closest('.agt-form-row')?.querySelector('.agt-field-hint-inline');
          if (hint) hint.textContent = val;
        }
        if (id === 'agtCategory' && !this.draft.slugManual) this.onNameInput(this.draft.name);
      };
      el.addEventListener('change', handler);
      el.addEventListener('input', handler);
    };
    bind('agtSummary', 'summary');
    bind('agtCategory', 'category');
    bind('agtIcon', 'icon');
    bind('agtModel', 'config.model');
    bind('agtTemp', 'config.temperature');
    bind('agtSystemPrompt', 'config.systemPrompt');
    bind('agtStartup', 'config.startupInstruction');
    bind('agtOutput', 'config.outputFormat');
    bind('agtPublishScope', 'publishScope');
    bind('agtVersion', 'version');
    bind('agtChangeLog', 'changeLog');
    bind('agtPurpose', 'purpose');
    bind('agtRisk', 'riskBoundary');

    document.querySelectorAll('input[name=agtAutonomy]').forEach(r => {
      r.addEventListener('change', () => { if (r.checked) { this.updateField('config.autonomyLevel', r.value); Agent.render(); } });
    });
  },

  syncForm() {
    const g = id => document.getElementById(id);
    if (g('agtName')) this.draft.name = g('agtName').value.trim();
    if (g('agtSlug')) this.draft.slug = g('agtSlug').value.trim();
    if (g('agtSummary')) this.draft.summary = g('agtSummary').value;
    if (g('agtCategory')) this.draft.category = g('agtCategory').value;
    if (g('agtIcon')) this.draft.icon = g('agtIcon').value;
    if (g('agtModel')) this.draft.config.model = g('agtModel').value;
    if (g('agtTemp')) this.draft.config.temperature = parseFloat(g('agtTemp').value);
    if (g('agtSystemPrompt')) this.draft.config.systemPrompt = g('agtSystemPrompt').value;
    if (g('agtStartup')) this.draft.config.startupInstruction = g('agtStartup').value;
    if (g('agtOutput')) this.draft.config.outputFormat = g('agtOutput').value;
    if (g('agtPublishScope')) this.draft.publishScope = g('agtPublishScope').value;
    if (g('agtVersion')) this.draft.version = g('agtVersion').value;
    if (g('agtChangeLog')) this.draft.changeLog = g('agtChangeLog').value;
    if (g('agtPurpose')) this.draft.purpose = g('agtPurpose').value;
    if (g('agtRisk')) this.draft.riskBoundary = g('agtRisk').value;
    const autonomy = document.querySelector('input[name=agtAutonomy]:checked');
    if (autonomy) this.draft.config.autonomyLevel = autonomy.value;
    const sandbox = document.querySelector('input[name=agtSandbox]:checked');
    if (sandbox) this.draft.config.sandboxPolicy = sandbox.value;
  }
};
