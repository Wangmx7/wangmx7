function obsT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('obs.' + k, p) : k;
}
function obsCommonT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('common.' + k, p) : k;
}

const Observability = {
  tab: 'dashboard',
  selectedObs: null,
  selectedTraceId: null,
  traceDrawerOpen: false,
  traceDrawerTab: 'preview',
  traceTreeSearch: '',
  traceFilters: TraceFilterEngine.emptyFilters(),
  filtersOpen: true,
  expandedSections: new Set(['type', 'name', 'tags']),
  aiFilterText: '',
  aiFilterNote: '',
  traceSearch: '',
  traceSearchMode: 'ids',
  dashboardAiQuery: '',
  dashboardAiResult: null,
  tracingAiOpen: false,
  tracingAiQuery: '',
  tracingAiResult: null,

  aiSparkleSvg() {
    return '<svg class="obs-ai-sparkle" viewBox="0 0 20 20" fill="none"><path d="M10 2l1.2 4.2L15.5 7.5 11.2 8.7 10 13l-1.2-4.3L4.5 7.5l4.3-1.3L10 2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M15 12l.6 2.1 2.1.6-2.1.6L15 17.4l-.6-2.1-2.1-.6 2.1-.6.6-2.1z" fill="currentColor" opacity=".6"/></svg>';
  },

  renderAiResultBlock(result) {
    if (!result) return '';
    return `
      <div class="obs-ai-insight-result">
        <div class="obs-ai-insight-result-title">${result.title}</div>
        <div class="obs-ai-insight-result-body"><p>${AiObservabilityEngine.formatMarkdown(result.content)}</p></div>
      </div>`;
  },

  renderDashboardAiBox() {
    const ctx = AiObservabilityEngine.getContext();
    return `
      <div class="obs-ai-insight">
        <div class="obs-ai-insight-head">
          ${this.aiSparkleSvg()}
          <div>
            <div class="obs-ai-insight-title">${obsT('ai.title')}</div>
            <div class="obs-ai-insight-desc">${obsT('ai.desc', { workspace: typeof XSparkI18n !== 'undefined' ? XSparkI18n.workspaceLabel(ctx.workspace) : ctx.workspace })}</div>
          </div>
        </div>
        <div class="obs-ai-insight-input-row">
          <textarea class="obs-ai-insight-input" id="obsDashboardAiInput" placeholder="${obsT('ai.placeholder')}">${this.dashboardAiQuery}</textarea>
          <div class="obs-ai-insight-actions">
            <button type="button" class="obs-ai-btn primary" id="obsDashboardAiAnalyze">${obsCommonT('analyze')}</button>
            <button type="button" class="obs-ai-btn" id="obsDashboardAiClear">${obsCommonT('clear')}</button>
          </div>
        </div>
        ${this.renderAiResultBlock(this.dashboardAiResult)}
      </div>`;
  },

  renderTracingAiPanel() {
    if (!this.tracingAiOpen) return '';
    return `
      <div class="obs-tracing-ai-panel" id="obsTracingAiPanel">
        <div class="obs-tracing-ai-head">
          ${this.aiSparkleSvg()}
          <span class="obs-tracing-ai-title">${obsT('ai.tracingTitle')}</span>
          <span class="obs-tracing-ai-desc">${obsT('ai.tracingDesc')}</span>
          <button type="button" class="obs-tracing-ai-close" id="obsTracingAiClose" aria-label="${obsCommonT('close')}">✕</button>
        </div>
        <div class="obs-tracing-ai-body">
          <textarea class="obs-ai-insight-input" id="obsTracingAiInput" placeholder="${obsT('ai.tracingPlaceholder')}">${this.tracingAiQuery}</textarea>
          <div class="obs-ai-insight-actions">
            <button type="button" class="obs-ai-btn primary" id="obsTracingAiAnalyze">${obsT('ai.overview')}</button>
            <button type="button" class="obs-ai-btn" id="obsTracingAiAsk">${obsT('ai.followUp')}</button>
          </div>
          ${this.renderAiResultBlock(this.tracingAiResult)}
        </div>
      </div>`;
  },

  getWorkspaceOptions() {
    return typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG.workspace.options : ['人工智能实验室', 'IT 运维 Workspace', 'Global WorkSpace'];
  },

  init() {
    this.content = document.getElementById('obsContent');
    this.tabs = document.querySelectorAll('.obs-tab');
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
    document.getElementById('obsBackTraces')?.addEventListener('click', () => this.closeTraceDrawer());
    this.traceFilters.workspace = xsparkDefaultWorkspaceFilter();
    this.setTab('dashboard');
  },

  setTab(tab) {
    this.tab = tab;
    this.closeTraceDrawer(false);
    this.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    this.render();
  },

  openTrace(id) {
    const detail = this.getTraceDetail(id);
    this.selectedTraceId = id;
    this.traceDrawerOpen = true;
    this.traceDrawerTab = 'preview';
    this.traceTreeSearch = '';
    const root = detail.observations.find(o => !o.parent);
    this.selectedObs = root?.id || detail.observations[0]?.id;
    this.render();
  },

  closeTraceDrawer(rerender = true) {
    this.traceDrawerOpen = false;
    this.selectedTraceId = null;
    this.selectedObs = null;
    if (this._onDrawerEsc) {
      document.removeEventListener('keydown', this._onDrawerEsc);
      this._onDrawerEsc = null;
    }
    if (rerender) this.render();
  },

  render() {
    const views = {
      dashboard: () => this.renderDashboard(),
      traces: () => this.renderTraces()
    };
    const html = (views[this.tab] || views.dashboard)();
    const isTracing = this.tab === 'traces';
    this.content.classList.toggle('obs-content--tracing', isTracing);
    const drawerHtml = isTracing && this.traceDrawerOpen ? this.renderTraceDrawer() : '';
    this.content.innerHTML = isTracing ? html + drawerHtml : `<div class="obs-content-inner">${html}</div>`;
    if (isTracing) {
      this.bindTraceFilterEvents();
      if (this.traceDrawerOpen) this.bindDrawerEvents();
    } else if (this.tab === 'dashboard') {
      this.bindDashboardEvents();
    } else {
      this.bindListEvents();
    }
  },

  renderDashboard() {
    const s = OBS_MOCK.stats;
    const c = OBS_MOCK.chart;
    const maxT = Math.max(...c.traces);
    return `
      ${this.renderDashboardAiBox()}
      <div class="obs-kpi-grid">
        ${this.kpi('Traces', s.traces.toLocaleString(), s.tracesTrend, true)}
        ${this.kpi('Sessions', s.sessions.toLocaleString(), s.sessionsTrend, true)}
        ${this.kpi('Total Cost', '$' + s.totalCost.toFixed(2), s.costTrend, false)}
        ${this.kpi('Avg Latency', s.avgLatency + 'ms', s.latencyTrend, true, true)}
        ${this.kpi('Error Rate', s.errorRate + '%', '-0.3%', true, true)}
      </div>
      <div class="obs-charts-row">
        <div class="obs-card">
          <div class="obs-card-head"><span>Trace 量趋势（7 天）</span><span class="obs-card-head-sub">按天聚合</span></div>
          <div class="obs-card-body">
            <div class="obs-bar-chart">
              ${c.dates.map((d, i) => `
                <div class="obs-bar-col">
                  <div class="obs-bar" style="height:${(c.traces[i] / maxT) * 100}%"></div>
                  <span class="obs-bar-label">${d}</span>
                </div>`).join('')}
            </div>
          </div>
        </div>
        <div class="obs-card">
          <div class="obs-card-head">成本 & 延迟</div>
          <div class="obs-card-body">
            <div class="obs-kv-grid" style="margin-bottom:12px">
              <div class="obs-kv"><dt>今日成本</dt><dd>$41.20</dd></div>
              <div class="obs-kv"><dt>P95 延迟</dt><dd>2.8s</dd></div>
              <div class="obs-kv"><dt>总 Tokens</dt><dd>${(s.totalTokens / 1e6).toFixed(1)}M</dd></div>
              <div class="obs-kv"><dt>TTFT P50</dt><dd>380ms</dd></div>
            </div>
            <p class="obs-footnote" style="margin:0">支持按 Workspace、Model、Tag 维度自定义看板。</p>
          </div>
        </div>
      </div>
      <div class="obs-card">
        <div class="obs-card-head">模型用量排行</div>
        <div class="obs-card-body obs-table-wrap">
          <table class="obs-table">
            <thead><tr><th>Model</th><th>Traces</th><th>Tokens</th><th>Cost ($)</th><th>Avg Latency</th></tr></thead>
            <tbody>${OBS_MOCK.models.map(m => `
              <tr><td class="mono">${m.name}</td><td>${m.traces.toLocaleString()}</td><td>${m.tokens}</td><td>${m.cost}</td><td>${m.avgLatency}ms</td></tr>
            `).join('')}</tbody>
          </table>
        </div>
      </div>`;
  },

  kpi(label, value, trend, upIsGood, downIsGood) {
    const trendClass = trend.startsWith('+') ? (upIsGood ? 'up' : 'down') : (downIsGood ? 'up' : 'down');
    return `<div class="obs-kpi"><div class="obs-kpi-label">${label}</div><div class="obs-kpi-value">${value}</div><div class="obs-kpi-trend ${trendClass}">${trend} vs 上周</div></div>`;
  },

  getFilteredTracingRows() {
    const f = { ...this.traceFilters, search: this.traceSearch };
    return TraceFilterEngine.apply(OBS_MOCK.tracingRows, f);
  },

  formatLatencyS(ms) {
    return ms != null ? (ms / 1000).toFixed(2) : '—';
  },

  formatTtftS(ms, type) {
    return type === 'GENERATION' && ms != null ? (ms / 1000).toFixed(2) : '—';
  },

  renderTracingRow(r) {
    const active = this.selectedTraceId === r.traceId ? ' obs-row-active' : '';
    return `
      <tr class="obs-trace-row${active}" data-trace="${r.traceId}">
        <td><input type="checkbox" onclick="event.stopPropagation()"></td>
        <td style="color:var(--obs-text-2);font-size:12px;white-space:nowrap">${r.startTime}</td>
        <td><span class="obs-type-dot obs-type ${r.type}" title="${r.type}">${r.type.slice(0, 2)}</span></td>
        <td class="mono" style="font-size:12px">${r.name}</td>
        <td style="font-size:12px">${r.traceName}</td>
        <td style="font-size:12px">${r.workspace || '—'}</td>
        <td class="obs-cell-num">${this.formatLatencyS(r.latencyMs)}</td>
        <td class="obs-cell-num">${this.formatTtftS(r.ttftMs, r.type)}</td>
        <td class="mono" style="font-size:12px">${r.model || '—'}</td>
        <td class="cell-clip">${r.input || '—'}</td>
        <td class="cell-clip">${r.output || '—'}</td>
        <td class="cell-clip cell-mono">${r.metadata}</td>
      </tr>`;
  },

  renderTracingTableHead() {
    return `<tr>
      <th style="width:36px"><input type="checkbox" aria-label="全选"></th>
      <th>Start Time ↓</th>
      <th style="width:40px">Type</th>
      <th>Name</th>
      <th>Trace Name</th>
      <th>Workspace</th>
      <th>Latency (s)</th>
      <th>Time To First Token (s)</th>
      <th>Provided Model Name</th>
      <th>Input</th>
      <th>Output</th>
      <th>Metadata</th>
    </tr>`;
  },

  renderAiFilterPanel() {
    return `
      <div class="obs-ai-filter" id="obsAiFilter">
        <div class="obs-ai-filter-label">
          ${this.aiSparkleSvg()}
          AI 筛选
        </div>
        <p class="obs-ai-hint">用自然语言描述筛选条件，系统会自动转换为可编辑的确定性筛选规则，您可在此基础上继续调整。</p>
        <textarea class="obs-ai-input" id="obsAiFilterInput" placeholder="例如：显示错误的 trace，用户 2847 的对话">${this.aiFilterText}</textarea>
        <div class="obs-ai-actions">
          <button type="button" class="obs-ai-btn primary" id="obsAiApply">应用筛选</button>
          <button type="button" class="obs-ai-btn" id="obsAiClear">清除</button>
        </div>
        ${this.aiFilterNote ? `<div class="obs-ai-result">${this.aiFilterNote}</div>` : ''}
      </div>`;
  },

  renderFilterGroups() {
    return TRACE_FILTER_DEFS.map(def => {
      const open = this.expandedSections.has(def.key);
      const activeTags = this.renderActiveTagsForKey(def.key);
      const body = def.type === 'checkbox'
        ? def.options.map(opt => {
            const checked = (this.traceFilters[def.key] || []).includes(opt);
            const label = def.key === 'isRoot' ? (opt === 'true' ? 'True' : 'False') : opt;
            return `<label class="obs-filter-check"><input type="checkbox" data-fkey="${def.key}" data-fval="${opt}" ${checked ? 'checked' : ''}>${label}</label>`;
          }).join('')
        : `<input type="text" class="obs-filter-text" data-fkey="${def.key}" placeholder="${def.placeholder || ''}" value="${this.traceFilters[def.key] || ''}">`;
      return `
        <div class="obs-filter-group${open ? ' open' : ''}" data-filter-key="${def.key}">
          <button type="button" class="obs-filter-group-head">
            <span>${def.label}${activeTags ? ` (${activeTags.count})` : ''}</span>
            <span class="obs-filter-group-chevron">▼</span>
          </button>
          <div class="obs-filter-group-body">
            ${activeTags ? `<div class="obs-filter-active-tags">${activeTags.html}</div>` : ''}
            ${body}
          </div>
        </div>`;
    }).join('');
  },

  renderActiveTagsForKey(key) {
    const def = TRACE_FILTER_DEFS.find(d => d.key === key);
    if (!def) return null;
    const v = this.traceFilters[key];
    if (def.type === 'checkbox') {
      const vals = v || [];
      if (!vals.length) return null;
      return {
        count: vals.length,
        html: vals.map(val => {
          const label = key === 'isRoot' ? (val === 'true' ? 'True' : 'False') : val;
          return `<span class="obs-filter-active-tag">${label}<button type="button" data-remove-fkey="${key}" data-remove-fval="${val}">×</button></span>`;
        }).join('')
      };
    }
    if (v?.trim()) {
      return { count: 1, html: `<span class="obs-filter-active-tag">${v}<button type="button" data-remove-text="${key}">×</button></span>` };
    }
    return null;
  },

  renderWorkspaceSelect() {
    const options = this.getWorkspaceOptions();
    const current = this.traceFilters.workspace || '';
    return `
      <select class="obs-tb-btn obs-tb-workspace" id="obsWorkspaceFilter" aria-label="Workspace">
        <option value=""${current === '' ? ' selected' : ''}>All Workspaces</option>
        ${options.map(ws => `<option value="${ws}"${current === ws ? ' selected' : ''}>${ws}</option>`).join('')}
      </select>`;
  },

  renderTraces() {
    const rows = this.getFilteredTracingRows();
    const activeCount = TraceFilterEngine.activeCount(this.traceFilters);
    const filterPanelCls = this.filtersOpen ? '' : ' collapsed';

    return `
      <div class="obs-tracing">
        <div class="obs-tracing-toolbar">
          <h2>Tracing</h2>
          <button type="button" class="obs-tb-btn${this.filtersOpen ? ' active' : ''}" id="obsToggleFilters">
            <span id="obsToggleFiltersLabel">${this.filtersOpen ? '☰ Hide filters' : '☰ Show filters'}</span>
            <span class="obs-tb-badge" id="obsToggleFiltersBadge" ${activeCount ? '' : 'hidden'}>${activeCount || ''}</span>
          </button>
          ${this.renderWorkspaceSelect()}
          <div class="obs-tb-search">
            <svg viewBox="0 0 16 16" width="13" height="13" style="color:var(--obs-text-3);flex-shrink:0"><circle cx="7" cy="7" r="4.5" stroke="currentColor" fill="none" stroke-width="1.4"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <input type="search" id="obsTraceSearch" placeholder="Search…" value="${this.traceSearch}">
            <select id="obsTraceSearchMode">
              <option value="ids" ${this.traceSearchMode === 'ids' ? 'selected' : ''}>IDs / Names</option>
              <option value="all" ${this.traceSearchMode === 'all' ? 'selected' : ''}>All fields</option>
            </select>
          </div>
          <select class="obs-tb-btn" style="cursor:pointer"><option>1d Past 1 day</option><option>7d Past 7 days</option></select>
          <button type="button" class="obs-tb-btn">↻ Off</button>
          <button type="button" class="obs-tb-btn obs-tb-ai${this.tracingAiOpen ? ' active' : ''}" id="obsTracingAiToggle">
            ${this.aiSparkleSvg()} AI 观测
          </button>
          <span class="obs-tb-spacer"></span>
          <button type="button" class="obs-tb-btn">Columns 12/16</button>
        </div>

        ${this.renderTracingAiPanel()}

        <div class="obs-tracing-body">
          <aside class="obs-filter-panel${filterPanelCls}" id="obsFilterPanel">
            <div class="obs-filter-panel-head">
              <span>Filters</span>
              <button type="button" class="obs-filter-clear" id="obsClearFilters">Clear all</button>
            </div>
            ${this.renderAiFilterPanel()}
            <div class="obs-filter-scroll">
              ${this.renderFilterGroups()}
            </div>
          </aside>

          <div class="obs-tracing-main">
            <div class="obs-tracing-table-wrap">
              <table class="obs-table" id="obsTraceTable">
                <thead>${this.renderTracingTableHead()}</thead>
                <tbody>${rows.length ? rows.map(r => this.renderTracingRow(r)).join('') : `<tr><td colspan="12"><div class="obs-empty">No results match current filters</div></td></tr>`}
                </tbody>
              </table>
            </div>
            <div class="obs-tracing-footer">
              <span>Rows per page</span>
              <select><option>50</option><option>100</option></select>
              <span>Page 1 of 1 · ${rows.length} rows</span>
              <div class="obs-page-btns">
                <button disabled>«</button><button disabled>‹</button><button disabled>›</button><button disabled>»</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  },

  refreshTracesTable() {
    if (this.tab !== 'traces') return;
    const rows = this.getFilteredTracingRows();
    const tbody = document.querySelector('#obsTraceTable tbody');
    const footer = document.querySelector('.obs-tracing-footer span:nth-of-type(2)');
    if (!tbody) return;
    tbody.innerHTML = rows.length ? rows.map(r => this.renderTracingRow(r)).join('') : `<tr><td colspan="12"><div class="obs-empty">No results match current filters</div></td></tr>`;
    if (footer) footer.textContent = `Page 1 of 1 · ${rows.length} rows`;
    const count = TraceFilterEngine.activeCount(this.traceFilters);
    const badge = document.getElementById('obsToggleFiltersBadge');
    if (badge) {
      badge.textContent = count || '';
      badge.hidden = !count;
    }
    this.updateFilterGroupLabels();
    this.bindTraceRowClicks();
  },

  bindTraceFilterEvents() {
    document.getElementById('obsToggleFilters')?.addEventListener('click', () => {
      this.filtersOpen = !this.filtersOpen;
      document.getElementById('obsFilterPanel')?.classList.toggle('collapsed', !this.filtersOpen);
      document.getElementById('obsToggleFilters')?.classList.toggle('active', this.filtersOpen);
      const label = document.getElementById('obsToggleFiltersLabel');
      if (label) label.textContent = this.filtersOpen ? '☰ Hide filters' : '☰ Show filters';
    });

    document.getElementById('obsClearFilters')?.addEventListener('click', () => {
      const workspace = this.traceFilters.workspace;
      this.traceFilters = TraceFilterEngine.emptyFilters();
      this.traceFilters.workspace = workspace;
      this.aiFilterText = '';
      this.aiFilterNote = '';
      this.render();
    });

    document.getElementById('obsAiApply')?.addEventListener('click', () => {
      const text = document.getElementById('obsAiFilterInput')?.value?.trim();
      if (!text) return;
      this.aiFilterText = text;
      const workspace = this.traceFilters.workspace;
      const { filters, summary } = TraceFilterEngine.parseNaturalLanguage(text);
      this.traceFilters = filters;
      this.traceFilters.workspace = workspace || filters.workspace;
      if (filters.search) this.traceSearch = filters.search;
      this.aiFilterNote = `已应用：${summary}`;
      this.render();
    });

    document.getElementById('obsAiClear')?.addEventListener('click', () => {
      this.aiFilterText = '';
      this.aiFilterNote = '';
      const input = document.getElementById('obsAiFilterInput');
      if (input) input.value = '';
      const note = document.querySelector('.obs-ai-result');
      if (note) note.remove();
    });

    document.getElementById('obsTraceSearch')?.addEventListener('input', e => {
      this.traceSearch = e.target.value;
      this.refreshTracesTable();
    });

    document.getElementById('obsWorkspaceFilter')?.addEventListener('change', e => {
      this.traceFilters.workspace = e.target.value;
      this.refreshTracesTable();
    });

    document.querySelectorAll('.obs-filter-group-head').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.closest('.obs-filter-group')?.dataset.filterKey;
        if (!key) return;
        if (this.expandedSections.has(key)) this.expandedSections.delete(key);
        else this.expandedSections.add(key);
        btn.closest('.obs-filter-group')?.classList.toggle('open');
      });
    });

    document.querySelectorAll('.obs-filter-check input').forEach(inp => {
      inp.addEventListener('change', () => {
        const key = inp.dataset.fkey;
        const val = inp.dataset.fval;
        const arr = [...(this.traceFilters[key] || [])];
        if (inp.checked) {
          if (!arr.includes(val)) arr.push(val);
        } else {
          const idx = arr.indexOf(val);
          if (idx >= 0) arr.splice(idx, 1);
        }
        this.traceFilters[key] = arr;
        this.refreshTracesTable();
      });
    });

    document.querySelectorAll('.obs-filter-text').forEach(inp => {
      inp.addEventListener('input', () => {
        this.traceFilters[inp.dataset.fkey] = inp.value;
        this.refreshTracesTable();
      });
    });

    document.querySelectorAll('[data-remove-fkey]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.removeFkey;
        const val = btn.dataset.removeFval;
        this.traceFilters[key] = (this.traceFilters[key] || []).filter(v => v !== val);
        this.render();
      });
    });

    document.querySelectorAll('[data-remove-text]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.traceFilters[btn.dataset.removeText] = '';
        this.render();
      });
    });

    this.bindTraceRowClicks();
    this.bindTracingAiEvents();
  },

  runTracingAiAnalysis(useQuery) {
    const rows = this.getFilteredTracingRows();
    const input = document.getElementById('obsTracingAiInput');
    const query = useQuery ? (input?.value?.trim() || this.tracingAiQuery) : '';
    if (input) this.tracingAiQuery = input.value;
    this.tracingAiResult = AiObservabilityEngine.analyzeTracing(rows, query, this.traceFilters);
    const panel = document.getElementById('obsTracingAiPanel');
    if (panel) {
      const existing = panel.querySelector('.obs-ai-insight-result');
      if (existing) existing.remove();
      panel.querySelector('.obs-tracing-ai-body')?.insertAdjacentHTML('beforeend', this.renderAiResultBlock(this.tracingAiResult));
    } else {
      this.render();
    }
  },

  bindTracingAiEvents() {
    document.getElementById('obsTracingAiToggle')?.addEventListener('click', () => {
      this.tracingAiOpen = !this.tracingAiOpen;
      if (this.tracingAiOpen && !this.tracingAiResult) {
        this.render();
        this.runTracingAiAnalysis(false);
        return;
      }
      this.render();
    });

    document.getElementById('obsTracingAiClose')?.addEventListener('click', () => {
      this.tracingAiOpen = false;
      this.render();
    });

    document.getElementById('obsTracingAiAnalyze')?.addEventListener('click', () => {
      this.runTracingAiAnalysis(false);
    });

    document.getElementById('obsTracingAiAsk')?.addEventListener('click', () => {
      this.runTracingAiAnalysis(true);
    });
  },

  bindDashboardEvents() {
    document.getElementById('obsDashboardAiAnalyze')?.addEventListener('click', () => {
      const input = document.getElementById('obsDashboardAiInput');
      this.dashboardAiQuery = input?.value?.trim() || '';
      this.dashboardAiResult = AiObservabilityEngine.analyzeDashboard(this.dashboardAiQuery);
      this.render();
    });

    document.getElementById('obsDashboardAiClear')?.addEventListener('click', () => {
      this.dashboardAiQuery = '';
      this.dashboardAiResult = null;
      this.render();
    });
  },

  bindTraceRowClicks() {
    document.querySelectorAll('#obsTraceTable tr[data-trace]').forEach(row => {
      row.onclick = () => this.openTrace(row.dataset.trace);
    });
  },

  updateFilterGroupLabels() {
    document.querySelectorAll('.obs-filter-group').forEach(group => {
      const key = group.dataset.filterKey;
      const active = this.renderActiveTagsForKey(key);
      const label = group.querySelector('.obs-filter-group-head span');
      const def = TRACE_FILTER_DEFS.find(d => d.key === key);
      if (label && def) label.textContent = `${def.label}${active ? ` (${active.count})` : ''}`;
      const tagsWrap = group.querySelector('.obs-filter-active-tags');
      if (tagsWrap) {
        tagsWrap.innerHTML = active ? active.html : '';
        tagsWrap.style.display = active ? '' : 'none';
      }
    });
    document.querySelectorAll('[data-remove-fkey], [data-remove-text]').forEach(btn => {
      btn.onclick = () => {
        if (btn.dataset.removeFkey) {
          const key = btn.dataset.removeFkey;
          const val = btn.dataset.removeFval;
          this.traceFilters[key] = (this.traceFilters[key] || []).filter(v => v !== val);
        } else {
          this.traceFilters[btn.dataset.removeText] = '';
        }
        this.render();
      };
    });
  },

  getTraceDetail(traceId) {
    if (traceId === OBS_MOCK.traceDetail.id) return OBS_MOCK.traceDetail;
    if (OBS_MOCK.traceDetails?.[traceId]) return OBS_MOCK.traceDetails[traceId];
    const trace = OBS_MOCK.traces.find(t => t.id === traceId);
    const row = OBS_MOCK.tracingRows.find(r => r.traceId === traceId && r.isRoot) ||
      OBS_MOCK.tracingRows.find(r => r.traceId === traceId);
    if (!trace && !row) return OBS_MOCK.traceDetail;
    const obsId = `obs_${traceId.slice(3, 7)}`;
    return {
      id: traceId,
      name: row?.name || trace?.name || traceId,
      traceName: row?.traceName || trace?.name || '—',
      user: row?.userId || trace?.user || '—',
      session: row?.sessionId || trace?.session || '—',
      workspace: row?.workspace || '—',
      time: row?.startTime || trace?.time || '—',
      latency: row?.latencyMs || trace?.latency || 0,
      tokens: { prompt: 0, completion: 0, total: trace?.tokens || 0 },
      cost: trace?.cost || 0,
      tags: row?.tags || trace?.tags || [],
      metadata: {},
      input: row?.input ? (typeof row.input === 'string' ? row.input : row.input) : {},
      output: row?.output ? (typeof row.output === 'string' ? row.output : row.output) : null,
      observations: [{
        id: obsId, type: row?.type || 'SPAN', name: row?.name || traceId,
        start: 0, duration: row?.latencyMs || trace?.latency || 0, parent: null, children: [],
        input: row?.input, output: row?.output, tokens: null,
        model: row?.model, ttft: row?.ttftMs, cost: trace?.cost
      }]
    };
  },

  getCurrentTrace() {
    return this.getTraceDetail(this.selectedTraceId);
  },

  getObs(id) {
    const t = this.getCurrentTrace();
    return t?.observations.find(o => o.id === id);
  },

  formatDurationMs(ms) {
    if (ms == null) return '—';
    return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
  },

  renderTraceDrawer() {
    const t = this.getCurrentTrace();
    const obs = this.getObs(this.selectedObs) || t.observations[0];
    return `
      <div class="obs-drawer-backdrop" id="obsDrawerBackdrop"></div>
      <aside class="obs-trace-drawer open" id="obsTraceDrawer" role="dialog" aria-label="Trace 详情">
        <header class="obs-drawer-header">
          <div class="obs-drawer-title">
            <span class="obs-drawer-title-label">Trace</span>
            <span class="obs-drawer-title-name">${t.name}</span>
            <span class="obs-drawer-title-id mono">${t.id}</span>
          </div>
          <div class="obs-drawer-header-actions">
            <button type="button" class="obs-drawer-icon-btn" title="上一条" disabled>↑</button>
            <button type="button" class="obs-drawer-icon-btn" title="下一条" disabled>↓</button>
            <button type="button" class="obs-drawer-icon-btn" title="全屏">⛶</button>
            <button type="button" class="obs-drawer-icon-btn" id="obsDrawerClose" title="关闭">✕</button>
          </div>
        </header>
        <div class="obs-drawer-body">
          <div class="obs-drawer-left">
            <div class="obs-drawer-tree-search">
              <svg viewBox="0 0 16 16" width="13" height="13"><circle cx="7" cy="7" r="4.5" stroke="currentColor" fill="none" stroke-width="1.4"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
              <input type="search" id="obsTreeSearch" placeholder="Search observations…" value="${this.traceTreeSearch}">
            </div>
            <div class="obs-drawer-tree" id="obsDrawerTree">${this.renderTree()}</div>
            <div class="obs-drawer-topology">
              <div class="obs-panel-head">Topology</div>
              <div class="obs-topology-wrap">${this.renderTopology(t)}</div>
            </div>
          </div>
          <div class="obs-drawer-main" id="obsDrawerMain">
            ${this.renderDrawerDetail(t, obs)}
          </div>
        </div>
      </aside>`;
  },

  renderDrawerDetail(t, obs) {
    const tokens = t.tokens || { prompt: 0, completion: 0, total: 0 };
    const tokenStr = `${tokens.prompt?.toLocaleString() || 0} prompt → ${tokens.completion?.toLocaleString() || 0} completion (Σ ${tokens.total?.toLocaleString() || 0})`;
    const tabs = [
      { id: 'preview', label: 'Preview' },
      { id: 'scores', label: 'Scores' },
      { id: 'log', label: 'Log View' }
    ];
    const inputText = typeof (obs?.input ?? t.input) === 'string'
      ? (obs?.input ?? t.input)
      : JSON.stringify(obs?.input ?? t.input, null, 2);
    const outputVal = obs?.output ?? t.output;
    const outputText = outputVal == null ? 'null'
      : (typeof outputVal === 'string' ? outputVal : JSON.stringify(outputVal, null, 2));

    return `
      <div class="obs-drawer-main-head">
        <div class="obs-drawer-obs-title">
          <span class="obs-type ${obs?.type || 'SPAN'}">${obs?.type || 'TRACE'}</span>
          <h3>${obs?.name || t.name}</h3>
        </div>
      </div>
      <div class="obs-drawer-badges">
        <span class="obs-drawer-badge"><em>Timestamp</em>${t.time}</span>
        <span class="obs-drawer-badge"><em>Latency</em>${this.formatDurationMs(t.latency)}</span>
        <span class="obs-drawer-badge"><em>Session</em><a href="#">${t.session}</a></span>
        <span class="obs-drawer-badge"><em>User</em><a href="#">${t.user}</a></span>
        <span class="obs-drawer-badge"><em>Workspace</em>${t.workspace || '—'}</span>
        <span class="obs-drawer-badge"><em>Total Cost</em>$${Number(t.cost).toFixed(6)}</span>
        <span class="obs-drawer-badge obs-drawer-badge-wide"><em>Tokens</em>${tokenStr}</span>
      </div>
      <div class="obs-drawer-tabs">
        ${tabs.map(tab => `<button type="button" class="obs-drawer-tab${this.traceDrawerTab === tab.id ? ' active' : ''}" data-drawer-tab="${tab.id}">${tab.label}</button>`).join('')}
      </div>
      ${t.tags?.length ? `<div class="obs-drawer-tags">${t.tags.map(tag => `<span class="obs-tag">${tag}</span>`).join('')}</div>` : ''}
      <div class="obs-drawer-io" id="obsDrawerIo">
        ${this.traceDrawerTab === 'preview' ? `
          <div class="obs-io-block">
            <div class="obs-io-head"><span>Input</span><button type="button" class="obs-io-copy" title="复制">⎘</button></div>
            <pre class="obs-io-content">${this.escapeHtml(inputText)}</pre>
          </div>
          <div class="obs-io-block">
            <div class="obs-io-head"><span>Output</span><button type="button" class="obs-io-copy" title="复制">⎘</button></div>
            <pre class="obs-io-content obs-io-output">${this.escapeHtml(outputText)}</pre>
          </div>
          ${obs?.tokens ? `<div class="obs-io-block"><div class="obs-io-head"><span>Token Usage</span></div><pre class="obs-io-content">${this.escapeHtml(JSON.stringify(obs.tokens, null, 2))}</pre></div>` : ''}
        ` : `<div class="obs-drawer-tab-placeholder">${this.traceDrawerTab === 'scores' ? '暂无 Scores 数据' : 'Log View 原型占位'}</div>`}
      </div>`;
  },

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  renderTree() {
    const t = this.getCurrentTrace();
    if (!t) return '';
    const obs = t.observations;
    const q = (this.traceTreeSearch || '').toLowerCase();
    const root = obs.find(o => !o.parent);
    const renderNode = (node, depth) => {
      if (q && !node.name.toLowerCase().includes(q) && !node.type.toLowerCase().includes(q)) {
        const childMatch = node.children?.some(cid => {
          const c = obs.find(o => o.id === cid);
          return c && (c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q));
        });
        if (!childMatch) return '';
      }
      const cls = depth === 0 ? '' : depth === 1 ? 'child' : depth === 2 ? 'child2' : 'child3';
      const active = node.id === this.selectedObs ? ' active' : '';
      const cost = node.cost != null ? `<span class="obs-tree-cost">$${node.cost.toFixed(4)}</span>` : '';
      let html = `<div class="obs-tree-node ${cls}${active}" data-obs="${node.id}">
        <span class="obs-type ${node.type}">${node.type.slice(0, 2)}</span>
        <span class="obs-tree-name">${node.name}</span>
        <span class="obs-tree-dur">${this.formatDurationMs(node.duration)}</span>
        ${cost}
      </div>`;
      node.children?.forEach(cid => {
        const child = obs.find(o => o.id === cid);
        if (child) html += renderNode(child, depth + 1);
      });
      return html;
    };
    return root ? renderNode(root, 0) : '';
  },

  renderTopology(t) {
    const obs = t.observations;
    const root = obs.find(o => !o.parent);
    if (!root) return '<div class="obs-empty">无拓扑数据</div>';

    const renderNode = (node) => {
      const active = node.id === this.selectedObs ? ' active' : '';
      const children = (node.children || []).map(cid => obs.find(o => o.id === cid)).filter(Boolean);
      if (!children.length) {
        return `<div class="obs-topo-node leaf${active}" data-obs="${node.id}">
          <span class="obs-type ${node.type}">${node.type.slice(0, 2)}</span>
          <span>${node.name}</span>
        </div>`;
      }
      return `<div class="obs-topo-group">
        <div class="obs-topo-node${active}" data-obs="${node.id}">
          <span class="obs-type ${node.type}">${node.type.slice(0, 2)}</span>
          <span>${node.name}</span>
        </div>
        <div class="obs-topo-children">
          ${children.map(c => `<div class="obs-topo-edge">${renderNode(c)}</div>`).join('')}
        </div>
      </div>`;
    };

    return `<div class="obs-topology">
      <div class="obs-topo-node start">__start__</div>
      <div class="obs-topo-arrow">→</div>
      ${renderNode(root)}
    </div>`;
  },

  renderObsPanel(obs) {
    if (!obs) return '<div class="obs-empty">选择 Observation 查看详情</div>';
    const tokens = obs.tokens ? JSON.stringify(obs.tokens, null, 2) : '—';
    const ttft = obs.ttft ? `<div class="obs-kv"><dt>TTFT</dt><dd>${obs.ttft}ms</dd></div>` : '';
    return `
      <div class="obs-panel-head">${obs.name} · ${obs.type}</div>
      <div class="obs-detail-section">
        <div class="obs-kv-grid">
          <div class="obs-kv"><dt>Duration</dt><dd>${this.formatDurationMs(obs.duration)}</dd></div>
          <div class="obs-kv"><dt>Model</dt><dd>${obs.model || '—'}</dd></div>
          ${ttft}
          ${obs.cost ? `<div class="obs-kv"><dt>Cost</dt><dd>$${obs.cost}</dd></div>` : ''}
        </div>
      </div>
      <div class="obs-detail-section">
        <h4>Input</h4>
        <pre class="obs-code">${JSON.stringify(obs.input, null, 2)}</pre>
      </div>
      <div class="obs-detail-section">
        <h4>Output</h4>
        <pre class="obs-code">${obs.output ? JSON.stringify(obs.output, null, 2) : 'null'}</pre>
      </div>
      ${obs.tokens ? `<div class="obs-detail-section"><h4>Token Usage</h4><pre class="obs-code">${tokens}</pre></div>` : ''}`;
  },

  renderTraceDetailPanels() {
    const t = this.getCurrentTrace();
    const obs = this.getObs(this.selectedObs);
    const main = document.getElementById('obsDrawerMain');
    const tree = document.getElementById('obsDrawerTree');
    const topo = document.querySelector('.obs-topology-wrap');
    if (main && t) main.innerHTML = this.renderDrawerDetail(t, obs);
    if (tree) tree.innerHTML = this.renderTree();
    if (topo && t) topo.innerHTML = this.renderTopology(t);
    document.querySelectorAll('.obs-tree-node, .obs-topo-node[data-obs]').forEach(el => {
      el.classList.toggle('active', el.dataset.obs === this.selectedObs);
    });
  },

  selectObs(id) {
    this.selectedObs = id;
    this.renderTraceDetailPanels();
    this.bindDrawerObsClicks();
  },

  bindDrawerObsClicks() {
    document.querySelectorAll('.obs-tree-node[data-obs], .obs-topo-node[data-obs]').forEach(el => {
      el.onclick = () => this.selectObs(el.dataset.obs);
    });
  },

  bindDrawerEvents() {
    document.getElementById('obsDrawerClose')?.addEventListener('click', () => this.closeTraceDrawer());
    document.getElementById('obsDrawerBackdrop')?.addEventListener('click', () => this.closeTraceDrawer());
    document.getElementById('obsTreeSearch')?.addEventListener('input', e => {
      this.traceTreeSearch = e.target.value;
      const tree = document.getElementById('obsDrawerTree');
      if (tree) tree.innerHTML = this.renderTree();
      this.bindDrawerObsClicks();
    });
    document.querySelectorAll('.obs-drawer-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.traceDrawerTab = btn.dataset.drawerTab;
        document.querySelectorAll('.obs-drawer-tab').forEach(b => {
          b.classList.toggle('active', b.dataset.drawerTab === this.traceDrawerTab);
        });
        this.renderTraceDetailPanels();
        this.bindDrawerObsClicks();
      });
    });
    this.bindDrawerObsClicks();
    this._onDrawerEsc = (e) => {
      if (e.key === 'Escape' && this.traceDrawerOpen) this.closeTraceDrawer();
    };
    document.addEventListener('keydown', this._onDrawerEsc);
  },

  bindListEvents() {}
};
