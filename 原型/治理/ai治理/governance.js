function govT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('gov.' + k, p) : k;
}
function govCommonT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('common.' + k, p) : k;
}

const Governance = {
  tab: 'overview',
  timeRange: '7d',
  workspace: '',
  overviewAiQuery: '',
  overviewAiResult: null,
  auditFilters: GovFilterEngine.emptyAuditFilters(),
  toolFilters: GovFilterEngine.emptyToolFilters(),
  auditSearch: '',
  toolSearch: '',
  drawerOpen: false,
  drawerType: null,
  drawerId: null,

  aiSparkleSvg() {
    return '<svg class="gov-ai-sparkle" viewBox="0 0 20 20" fill="none"><path d="M10 2l1.2 4.2L15.5 7.5 11.2 8.7 10 13l-1.2-4.3L4.5 7.5l4.3-1.3L10 2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M15 12l.6 2.1 2.1.6-2.1.6L15 17.4l-.6-2.1-2.1-.6 2.1-.6.6-2.1z" fill="currentColor" opacity=".6"/></svg>';
  },

  getWorkspaceOptions() {
    return typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG.workspace.options : ['人工智能实验室', 'IT 运维 Workspace', 'Global WorkSpace'];
  },

  getWorkspaceLabel() {
    const raw = this.workspace || '全部可见 Workspace';
    return typeof XSparkI18n !== 'undefined' ? XSparkI18n.workspaceLabel(raw) : raw;
  },

  wsLabel(name) {
    return typeof XSparkI18n !== 'undefined' ? XSparkI18n.workspaceLabel(name) : name;
  },

  init() {
    this.content = document.getElementById('govContent');
    this.tabs = document.querySelectorAll('.gov-tab');
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
    const ws = xsparkDefaultWorkspaceFilter();
    this.workspace = ws;
    this.auditFilters.workspace = ws;
    this.toolFilters.workspace = ws;
    this.setTab('overview');
  },

  setTab(tab) {
    this.tab = tab;
    this.closeDrawer(false);
    this.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    this.render();
  },

  closeDrawer(rerender = true) {
    this.drawerOpen = false;
    this.drawerType = null;
    this.drawerId = null;
    if (rerender) this.render();
  },

  openAuditDrawer(id) {
    this.drawerOpen = true;
    this.drawerType = 'audit';
    this.drawerId = id;
    this.render();
  },

  openToolDrawer(id) {
    this.drawerOpen = true;
    this.drawerType = 'tool';
    this.drawerId = id;
    this.render();
  },

  render() {
    const views = {
      overview: () => this.renderOverview(),
      audit: () => this.renderAudit(),
      tools: () => this.renderTools()
    };
    const html = (views[this.tab] || views.overview)();
    const isList = this.tab === 'audit' || this.tab === 'tools';
    this.content.classList.toggle('gov-content--list', isList);
    const drawerHtml = isList && this.drawerOpen ? this.renderDrawer() : '';
    this.content.innerHTML = isList ? html + drawerHtml : `<div class="gov-content-inner">${html}</div>`;
    this.bindEvents();
  },

  renderAiResultBlock(result) {
    if (!result) return '';
    const tags = result.tags?.map(t => `<span class="gov-tag gov-tag-insight">${t}</span>`).join('') || '';
    return `
      <div class="gov-ai-insight-result">
        <div class="gov-ai-insight-result-head">
          <div class="gov-ai-insight-result-title">${result.title}</div>
          ${tags ? `<div class="gov-ai-tags">${tags}</div>` : ''}
        </div>
        <div class="gov-ai-insight-result-body">${AiGovernanceEngine.formatMarkdown(result.content)}</div>
      </div>`;
  },

  renderAiInsightBox() {
    const ws = this.getWorkspaceLabel();
    return `
      <div class="gov-ai-insight">
        <div class="gov-ai-insight-head">
          ${this.aiSparkleSvg()}
          <div>
            <div class="gov-ai-insight-title">${govT('ai.title')}</div>
            <div class="gov-ai-insight-desc">${govT('ai.desc')}</div>
          </div>
          <div class="gov-ai-insight-extra">
            <button type="button" class="gov-tb-btn" id="govWeeklyReport">${govT('ai.weekly')}</button>
            <button type="button" class="gov-tb-btn" id="govSubscribeAlert">${govT('ai.subscribe')}</button>
          </div>
        </div>
        <div class="gov-ai-insight-input-row">
          <textarea class="gov-ai-insight-input" id="govOverviewAiInput" placeholder="${govT('ai.placeholder')}">${this.overviewAiQuery}</textarea>
          <div class="gov-ai-insight-actions">
            <button type="button" class="gov-ai-btn primary" id="govOverviewAiAnalyze">${govCommonT('analyze')}</button>
            <button type="button" class="gov-ai-btn" id="govOverviewAiClear">${govCommonT('clear')}</button>
          </div>
        </div>
        ${this.renderAiResultBlock(this.overviewAiResult)}
      </div>`;
  },

  kpi(label, value, trend, upIsGood) {
    const trendClass = trend.startsWith('+') ? (upIsGood ? 'up' : 'down') : 'up';
    return `<div class="gov-kpi"><div class="gov-kpi-label">${label}</div><div class="gov-kpi-value">${value}</div><div class="gov-kpi-trend ${trendClass}">${trend} ${govCommonT('vsLastWeek')}</div></div>`;
  },

  riskBadge(level) {
    const cls = level === 'high' ? 'gov-risk-high' : level === 'medium' ? 'gov-risk-medium' : 'gov-risk-low';
    return `<span class="gov-risk ${cls}">${level}</span>`;
  },

  renderOverview() {
    const s = GOV_MOCK.stats;
    const c = GOV_MOCK.chart;
    const maxOps = Math.max(...c.userOps, ...c.toolExec);
    return `
      ${this.renderAiInsightBox()}
      <div class="gov-toolbar-inline">
        <select class="gov-tb-btn gov-tb-workspace" id="govOverviewWorkspace">
          <option value=""${this.workspace === '' ? ' selected' : ''}>${govCommonT('allWorkspaces')}</option>
          ${this.getWorkspaceOptions().map(ws => `<option value="${ws}"${this.workspace === ws ? ' selected' : ''}>${this.wsLabel(ws)}</option>`).join('')}
        </select>
        <select class="gov-tb-btn" id="govOverviewTimeRange">
          <option value="1d"${this.timeRange === '1d' ? ' selected' : ''}>${govCommonT('day1')}</option>
          <option value="7d"${this.timeRange === '7d' ? ' selected' : ''}>${govCommonT('days7')}</option>
        </select>
      </div>
      <div class="gov-kpi-grid">
        ${this.kpi(govT('kpi.todayOps'), s.todayOps.toLocaleString(), s.todayOpsTrend, true)}
        ${this.kpi(govT('kpi.highRisk'), s.highRisk.toString(), s.highRiskTrend, false)}
        ${this.kpi(govT('kpi.activeUsers'), s.activeUsers.toString(), s.activeUsersTrend, true)}
        ${this.kpi(govT('kpi.toolCalls'), s.toolCalls.toLocaleString(), s.toolCallsTrend, true)}
      </div>
      <div class="gov-charts-row">
        <div class="gov-card">
          <div class="gov-card-head"><span>活动趋势（7 天）</span><span class="gov-card-head-sub">用户操作 vs 工具执行</span></div>
          <div class="gov-card-body">
            <div class="gov-dual-chart">
              ${c.dates.map((d, i) => `
                <div class="gov-bar-col">
                  <div class="gov-bar-stack">
                    <div class="gov-bar gov-bar-ops" style="height:${(c.userOps[i] / maxOps) * 100}%"></div>
                    <div class="gov-bar gov-bar-tools" style="height:${(c.toolExec[i] / maxOps) * 100}%"></div>
                  </div>
                  <span class="gov-bar-label">${d}</span>
                </div>`).join('')}
            </div>
            <div class="gov-chart-legend">
              <span><i class="gov-legend-dot ops"></i>用户操作</span>
              <span><i class="gov-legend-dot tools"></i>工具执行</span>
            </div>
          </div>
        </div>
        <div class="gov-card">
          <div class="gov-card-head">资源类型分布</div>
          <div class="gov-card-body">
            ${GOV_MOCK.resourceDist.map(r => `
              <div class="gov-dist-row">
                <span class="gov-dist-label">${r.type}</span>
                <div class="gov-dist-bar-wrap"><div class="gov-dist-bar" style="width:${r.pct}%"></div></div>
                <span class="gov-dist-val">${r.count.toLocaleString()} (${r.pct}%)</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="gov-charts-row">
        <div class="gov-card">
          <div class="gov-card-head">风险告警</div>
          <div class="gov-card-body gov-table-wrap">
            <table class="gov-table">
              <thead><tr><th>级别</th><th>标题</th><th>描述</th><th>Workspace</th><th>时间</th></tr></thead>
              <tbody>${GOV_MOCK.riskAlerts.map(a => `
                <tr>
                  <td>${this.riskBadge(a.level)}</td>
                  <td>${a.title}</td>
                  <td class="cell-clip">${a.desc}</td>
                  <td>${a.workspace}</td>
                  <td style="font-size:12px;color:var(--gov-text-2)">${a.time}</td>
                </tr>`).join('')}</tbody>
            </table>
          </div>
        </div>
        <div class="gov-card">
          <div class="gov-card-head">Top 活跃用户</div>
          <div class="gov-card-body gov-table-wrap">
            <table class="gov-table">
              <thead><tr><th>User</th><th>操作次数</th><th>风险</th><th>Workspace</th></tr></thead>
              <tbody>${GOV_MOCK.topUsers.map(u => `
                <tr>
                  <td class="mono">${u.id}</td>
                  <td>${u.ops}</td>
                  <td>${this.riskBadge(u.risk)}</td>
                  <td>${u.workspace}</td>
                </tr>`).join('')}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  },

  renderWorkspaceSelect(id) {
    const current = this.tab === 'audit' ? this.auditFilters.workspace : this.toolFilters.workspace;
    return `
      <select class="gov-tb-btn gov-tb-workspace" id="${id}" aria-label="Workspace">
        <option value=""${current === '' ? ' selected' : ''}>All Workspaces</option>
        ${this.getWorkspaceOptions().map(ws => `<option value="${ws}"${current === ws ? ' selected' : ''}>${ws}</option>`).join('')}
      </select>`;
  },

  renderFilterSelects(defs, filters, prefix) {
    return defs.map(def => {
      const id = `${prefix}${def.key.charAt(0).toUpperCase()}${def.key.slice(1)}`;
      const current = filters[def.key] || '';
      return `
        <select class="gov-tb-btn gov-tb-select" id="${id}" data-gov-filter="${def.key}" aria-label="${def.label}">
          <option value=""${!current ? ' selected' : ''}>${def.label}</option>
          ${def.options.map(opt => `<option value="${opt}"${current === opt ? ' selected' : ''}>${opt}</option>`).join('')}
        </select>`;
    }).join('');
  },

  getFilteredAudits() {
    const f = { ...this.auditFilters, search: this.auditSearch };
    return GovFilterEngine.applyAudit(GOV_MOCK.auditLogs, f);
  },

  getFilteredTools() {
    const f = { ...this.toolFilters, search: this.toolSearch };
    return GovFilterEngine.applyTool(GOV_MOCK.toolExecutions, f);
  },

  renderListLayout(title, filterDefs, filters, rowsHtml, rowCount, tableHead, exportId) {
    const searchVal = this.tab === 'audit' ? this.auditSearch : this.toolSearch;
    const wsId = this.tab === 'audit' ? 'govAuditWorkspace' : 'govToolWorkspace';
    const searchId = this.tab === 'audit' ? 'govAuditSearch' : 'govToolSearch';
    const prefix = this.tab === 'audit' ? 'govAudit' : 'govTool';

    return `
      <div class="gov-list">
        <div class="gov-list-toolbar">
          <h2>${title}</h2>
          ${this.renderWorkspaceSelect(wsId)}
          ${this.renderFilterSelects(filterDefs, filters, prefix)}
          <div class="gov-tb-search">
            <svg viewBox="0 0 16 16" width="13" height="13" style="color:var(--gov-text-3);flex-shrink:0"><circle cx="7" cy="7" r="4.5" stroke="currentColor" fill="none" stroke-width="1.4"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <input type="search" id="${searchId}" placeholder="Search User / Action / Resource…" value="${searchVal}">
          </div>
          <select class="gov-tb-btn"><option>1d Past 1 day</option><option selected>7d Past 7 days</option></select>
          <span class="gov-tb-spacer"></span>
          <button type="button" class="gov-tb-btn" id="${exportId}">导出 CSV</button>
        </div>
        <div class="gov-list-main">
          <div class="gov-list-table-wrap">
            <table class="gov-table" id="govListTable">
              <thead>${tableHead}</thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
          <div class="gov-list-footer">
            <span>Rows per page</span>
            <select><option>50</option></select>
            <span>Page 1 of 1 · ${rowCount} rows</span>
            <div class="gov-page-btns">
              <button disabled>«</button><button disabled>‹</button><button disabled>›</button><button disabled>»</button>
            </div>
          </div>
        </div>
      </div>`;
  },

  renderAudit() {
    const rows = this.getFilteredAudits();
    const rowsHtml = rows.length
      ? rows.map(r => this.renderAuditRow(r)).join('')
      : `<tr><td colspan="8"><div class="gov-empty">No results match current filters</div></td></tr>`;
    const tableHead = `<tr>
      <th>Time ↓</th><th>User</th><th>Action</th><th>Resource Type</th><th>Resource</th><th>Workspace</th><th>Risk</th><th>IP</th>
    </tr>`;
    return this.renderListLayout('用户操作', AUDIT_FILTER_DEFS, this.auditFilters, rowsHtml, rows.length, tableHead, 'govExportAudit');
  },

  renderAuditRow(r) {
    const active = this.drawerId === r.id && this.drawerType === 'audit' ? ' gov-row-active' : '';
    return `
      <tr class="gov-data-row${active}" data-audit="${r.id}">
        <td style="font-size:12px;color:var(--gov-text-2);white-space:nowrap">${r.createdAt}</td>
        <td class="mono" style="font-size:12px">${r.user}</td>
        <td><span class="gov-action-tag">${r.action}</span></td>
        <td>${r.resourceType}</td>
        <td class="mono" style="font-size:12px">${r.resource}</td>
        <td>${r.workspace}</td>
        <td>${this.riskBadge(r.risk)}</td>
        <td class="mono" style="font-size:12px">${r.ip}</td>
      </tr>`;
  },

  renderTools() {
    const rows = this.getFilteredTools();
    const rowsHtml = rows.length
      ? rows.map(r => this.renderToolRow(r)).join('')
      : `<tr><td colspan="9"><div class="gov-empty">No results match current filters</div></td></tr>`;
    const tableHead = `<tr>
      <th>Time ↓</th><th>User</th><th>Type</th><th>Resource</th><th>Operation</th><th>Duration</th><th>Status</th><th>Workspace</th><th>Trace</th>
    </tr>`;
    return this.renderListLayout('工具执行', TOOL_FILTER_DEFS, this.toolFilters, rowsHtml, rows.length, tableHead, 'govExportTools');
  },

  renderToolRow(r) {
    const active = this.drawerId === r.id && this.drawerType === 'tool' ? ' gov-row-active' : '';
    const statusCls = r.status === 'success' ? 'gov-status-ok' : 'gov-status-err';
    return `
      <tr class="gov-data-row${active}" data-tool="${r.id}">
        <td style="font-size:12px;color:var(--gov-text-2);white-space:nowrap">${r.time}</td>
        <td class="mono" style="font-size:12px">${r.user}</td>
        <td><span class="gov-type-tag">${r.type}</span></td>
        <td class="mono" style="font-size:12px">${r.resource}</td>
        <td>${r.operation}</td>
        <td class="gov-cell-num">${r.durationMs}ms</td>
        <td><span class="gov-status ${statusCls}">${r.status}</span></td>
        <td>${r.workspace}</td>
        <td><button type="button" class="gov-link-btn" data-trace-link="${r.traceId}">${r.traceId}</button></td>
      </tr>`;
  },

  renderDrawer() {
    let title, body;
    if (this.drawerType === 'audit') {
      const r = GOV_MOCK.auditLogs.find(a => a.id === this.drawerId);
      if (!r) return '';
      title = `操作详情 · ${r.action}`;
      body = `
        <div class="gov-drawer-badges">
          <span class="gov-drawer-badge"><em>Time</em>${r.createdAt}</span>
          <span class="gov-drawer-badge"><em>User</em>${r.user}</span>
          <span class="gov-drawer-badge"><em>Workspace</em>${r.workspace}</span>
          <span class="gov-drawer-badge"><em>Risk</em>${this.riskBadge(r.risk)}</span>
          <span class="gov-drawer-badge"><em>IP</em>${r.ip}</span>
        </div>
        <div class="gov-drawer-section">
          <div class="gov-drawer-section-title">Resource</div>
          <p>${r.resourceType} · <span class="mono">${r.resource}</span></p>
        </div>
        <div class="gov-drawer-section">
          <div class="gov-drawer-section-title">Detail (detail_json)</div>
          <pre class="gov-io-content">${this.escapeHtml(JSON.stringify(r.detail, null, 2))}</pre>
        </div>
        ${r.traceId ? `<div class="gov-drawer-section"><button type="button" class="gov-link-btn" data-trace-link="${r.traceId}">在 AI 观测中查看 Trace ${r.traceId}</button></div>` : ''}`;
    } else {
      const r = GOV_MOCK.toolExecutions.find(t => t.id === this.drawerId);
      if (!r) return '';
      title = `工具执行 · ${r.resource}`;
      body = `
        <div class="gov-drawer-badges">
          <span class="gov-drawer-badge"><em>Time</em>${r.time}</span>
          <span class="gov-drawer-badge"><em>User</em>${r.user}</span>
          <span class="gov-drawer-badge"><em>Type</em>${r.type}</span>
          <span class="gov-drawer-badge"><em>Status</em>${r.status}</span>
          <span class="gov-drawer-badge"><em>Duration</em>${r.durationMs}ms</span>
        </div>
        ${r.agent ? `<div class="gov-drawer-section"><div class="gov-drawer-section-title">Agent</div><p class="mono">${r.agent}</p></div>` : ''}
        ${r.workflow ? `<div class="gov-drawer-section"><div class="gov-drawer-section-title">Workflow</div><p class="mono">${r.workflow}</p></div>` : ''}
        <div class="gov-drawer-section">
          <div class="gov-drawer-section-title">Input</div>
          <pre class="gov-io-content">${this.escapeHtml(r.input || '—')}</pre>
        </div>
        <div class="gov-drawer-section">
          <div class="gov-drawer-section-title">Output</div>
          <pre class="gov-io-content">${this.escapeHtml(r.output || '—')}</pre>
        </div>
        ${r.error ? `<div class="gov-drawer-section"><div class="gov-drawer-section-title">Error</div><pre class="gov-io-content gov-io-error">${this.escapeHtml(r.error)}</pre></div>` : ''}
        <div class="gov-drawer-section"><button type="button" class="gov-link-btn" data-trace-link="${r.traceId}">在 AI 观测中查看 Trace ${r.traceId}</button></div>`;
    }
    return `
      <div class="gov-drawer-backdrop" id="govDrawerBackdrop"></div>
      <aside class="gov-drawer open" id="govDrawer" role="dialog">
        <header class="gov-drawer-header">
          <div class="gov-drawer-title">${title}</div>
          <button type="button" class="gov-drawer-close" id="govDrawerClose">✕</button>
        </header>
        <div class="gov-drawer-body">${body}</div>
      </aside>`;
  },

  escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  refreshListTable() {
    if (this.tab !== 'audit' && this.tab !== 'tools') return;
    const tbody = document.querySelector('#govListTable tbody');
    const footer = document.querySelector('.gov-list-footer span:nth-of-type(2)');
    if (!tbody) return;
    const rows = this.tab === 'audit' ? this.getFilteredAudits() : this.getFilteredTools();
    tbody.innerHTML = rows.length
      ? rows.map(r => this.tab === 'audit' ? this.renderAuditRow(r) : this.renderToolRow(r)).join('')
      : `<tr><td colspan="${this.tab === 'audit' ? 8 : 9}"><div class="gov-empty">No results match current filters</div></td></tr>`;
    if (footer) footer.textContent = `Page 1 of 1 · ${rows.length} rows`;
    this.bindRowClicks();
    this.bindTraceLinks();
  },

  bindEvents() {
    if (this.tab === 'overview') this.bindOverviewEvents();
    if (this.tab === 'audit' || this.tab === 'tools') {
      this.bindListEvents();
      this.bindRowClicks();
      this.bindTraceLinks();
      if (this.drawerOpen) this.bindDrawerEvents();
    }
  },

  bindOverviewEvents() {
    document.getElementById('govOverviewAiAnalyze')?.addEventListener('click', () => {
      this.overviewAiQuery = document.getElementById('govOverviewAiInput')?.value || '';
      this.overviewAiResult = AiGovernanceEngine.analyze(this.overviewAiQuery, this.getWorkspaceLabel());
      this.render();
    });
    document.getElementById('govOverviewAiClear')?.addEventListener('click', () => {
      this.overviewAiQuery = '';
      this.overviewAiResult = null;
      this.render();
    });
    document.getElementById('govOverviewWorkspace')?.addEventListener('change', e => {
      this.workspace = e.target.value;
      this.overviewAiResult = AiGovernanceEngine.analyze(this.overviewAiQuery, this.getWorkspaceLabel());
      this.render();
    });
    document.getElementById('govOverviewTimeRange')?.addEventListener('change', e => {
      this.timeRange = e.target.value;
    });
    document.getElementById('govWeeklyReport')?.addEventListener('click', () => alert('原型演示：将生成治理周报 PDF'));
    document.getElementById('govSubscribeAlert')?.addEventListener('click', () => alert('原型演示：订阅高风险告警通知'));
  },

  bindListEvents() {
    const isAudit = this.tab === 'audit';
    const wsId = isAudit ? 'govAuditWorkspace' : 'govToolWorkspace';
    const searchId = isAudit ? 'govAuditSearch' : 'govToolSearch';
    const exportId = isAudit ? 'govExportAudit' : 'govExportTools';
    const filters = isAudit ? this.auditFilters : this.toolFilters;

    document.getElementById(wsId)?.addEventListener('change', e => {
      filters.workspace = e.target.value;
      this.refreshListTable();
    });

    document.querySelectorAll('[data-gov-filter]').forEach(sel => {
      sel.addEventListener('change', () => {
        filters[sel.dataset.govFilter] = sel.value;
        this.refreshListTable();
      });
    });

    document.getElementById(searchId)?.addEventListener('input', e => {
      if (isAudit) this.auditSearch = e.target.value;
      else this.toolSearch = e.target.value;
      this.refreshListTable();
    });

    document.getElementById(exportId)?.addEventListener('click', () => {
      alert('原型演示：导出 CSV（GET /api/v1/audit-logs/export）');
    });
  },

  bindRowClicks() {
    document.querySelectorAll('[data-audit]').forEach(row => {
      row.addEventListener('click', () => this.openAuditDrawer(row.dataset.audit));
    });
    document.querySelectorAll('[data-tool]').forEach(row => {
      row.addEventListener('click', e => {
        if (e.target.closest('[data-trace-link]')) return;
        this.openToolDrawer(row.dataset.tool);
      });
    });
  },

  bindTraceLinks() {
    document.querySelectorAll('[data-trace-link]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.traceLink;
        alert(`原型演示：跳转 AI 观测查看 Trace ${id}\n路径：原型/运营/ai观测/index.html`);
      });
    });
  },

  bindDrawerEvents() {
    document.getElementById('govDrawerClose')?.addEventListener('click', () => this.closeDrawer());
    document.getElementById('govDrawerBackdrop')?.addEventListener('click', () => this.closeDrawer());
  }
};
