function opsT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('ops.' + k, p) : k;
}
function opsCommonT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('common.' + k, p) : k;
}

const OpsAnalysis = {
  tab: 'overview',
  workspace: '',
  timeRange: '7d',
  compareMode: 'wow',
  overviewAiQuery: '',
  overviewAiResult: null,
  tabAiOpen: false,
  tabAiQuery: '',
  tabAiResult: null,
  expandedAlertId: null,

  aiSparkleSvg() {
    return '<svg class="ops-ai-sparkle" viewBox="0 0 20 20" fill="none"><path d="M10 2l1.2 4.2L15.5 7.5 11.2 8.7 10 13l-1.2-4.3L4.5 7.5l4.3-1.3L10 2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M15 12l.6 2.1 2.1.6-2.1.6L15 17.4l-.6-2.1-2.1-.6 2.1-.6.6-2.1z" fill="currentColor" opacity=".6"/></svg>';
  },

  getWorkspaceOptions() {
    return typeof SIDEBAR_CONFIG !== 'undefined' ? SIDEBAR_CONFIG.workspace.options : OPS_MOCK.workspaces;
  },

  wsLabel(name) {
    return typeof XSparkI18n !== 'undefined' ? XSparkI18n.workspaceLabel(name) : name;
  },

  getSnapshot() {
    return OPS_MOCK.getSnapshot(this.workspace, this.timeRange);
  },

  init() {
    this.content = document.getElementById('opsContent');
    this.tabs = document.querySelectorAll('.ops-tab');
    this.tabs.forEach(t => t.addEventListener('click', () => this.setTab(t.dataset.tab)));
    if (typeof XSparkI18n !== 'undefined') {
      XSparkI18n.applyDom(document);
      XSparkI18n.onChange(() => {
        XSparkI18n.applyDom(document);
        this.overviewAiResult = OpsAnalysisAiEngine.analyze(this.overviewAiQuery, this.getSnapshot(), 'overview');
        this.render();
      });
    }
    this.overviewAiResult = OpsAnalysisAiEngine.analyze('', this.getSnapshot(), 'overview');
    this.render();
  },

  setTab(tab) {
    this.tab = tab;
    this.tabAiOpen = false;
    this.tabAiResult = null;
    this.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    this.render();
  },

  render() {
    const views = {
      overview: () => this.renderOverview(),
      usage: () => this.renderUsage(),
      assets: () => this.renderAssets(),
      cost: () => this.renderCost(),
      approval: () => this.renderApproval(),
      hub: () => this.renderHub(),
      quality: () => this.renderQuality()
    };
    const html = (views[this.tab] || views.overview)();
    this.content.innerHTML = `<div class="ops-content-inner">${this.renderToolbar()}${html}${this.renderTabAiFab()}</div>`;
    this.bindEvents();
  },

  renderToolbar() {
    const ws = this.workspace;
    return `
      <div class="ops-toolbar">
        <select class="ops-tb-btn ops-tb-workspace" id="opsWorkspace">
          <option value=""${!ws ? ' selected' : ''}>${opsCommonT('allWorkspaces')}</option>
          ${this.getWorkspaceOptions().map(w => `<option value="${w}"${ws === w ? ' selected' : ''}>${this.wsLabel(w)}</option>`).join('')}
        </select>
        <select class="ops-tb-btn" id="opsTimeRange">
          <option value="7d"${this.timeRange === '7d' ? ' selected' : ''}>${opsCommonT('days7')}</option>
          <option value="30d"${this.timeRange === '30d' ? ' selected' : ''}>${opsCommonT('days30')}</option>
          <option value="90d"${this.timeRange === '90d' ? ' selected' : ''}>${opsCommonT('days90')}</option>
        </select>
        <select class="ops-tb-btn" id="opsCompare">
          <option value="wow"${this.compareMode === 'wow' ? ' selected' : ''}>${opsCommonT('wow')}</option>
          <option value="yoy"${this.compareMode === 'yoy' ? ' selected' : ''}>${opsCommonT('yoy')}</option>
        </select>
        ${this.tab === 'overview' ? `<button type="button" class="ops-tb-btn" id="opsWeeklyReport">${opsCommonT('exportWeekly')}</button>` : ''}
        <span class="ops-tb-spacer"></span>
        <button type="button" class="ops-tb-btn" id="opsExportReport">${opsCommonT('exportReport')}</button>
      </div>`;
  },

  kpi(label, value, trend, upIsGood, downIsGood) {
    const trendClass = trend.startsWith('+') || trend.includes('pp') && !trend.startsWith('-')
      ? (upIsGood ? 'up' : 'down')
      : (downIsGood ? 'up' : 'down');
    return `<div class="ops-kpi"><div class="ops-kpi-label">${label}</div><div class="ops-kpi-value">${value}</div><div class="ops-kpi-trend ${trendClass}">${trend} ${opsCommonT('vsLastWeek')}</div></div>`;
  },

  renderAiResultBlock(result) {
    if (!result) return '';
    const tags = result.tags?.map(t => `<span class="ops-tag">${t}</span>`).join('') || '';
    return `
      <div class="ops-ai-result">
        <div class="ops-ai-result-head">
          <div class="ops-ai-result-title">${result.title}</div>
          ${tags ? `<div class="ops-ai-tags">${tags}</div>` : ''}
        </div>
        <div class="ops-ai-result-body">${OpsAnalysisAiEngine.formatMarkdown(result.content)}</div>
      </div>`;
  },

  renderAiInsightBox() {
    return `
      <div class="ops-ai-insight">
        <div class="ops-ai-insight-head">
          ${this.aiSparkleSvg()}
          <div>
            <div class="ops-ai-insight-title">${opsT('ai.title')}</div>
            <div class="ops-ai-insight-desc">${opsT('ai.desc')}</div>
          </div>
        </div>
        <div class="ops-ai-insight-input-row">
          <textarea class="ops-ai-insight-input" id="opsOverviewAiInput" placeholder="${opsT('ai.placeholder')}">${this.overviewAiQuery}</textarea>
          <div class="ops-ai-insight-actions">
            <button type="button" class="ops-ai-btn primary" id="opsOverviewAiAnalyze">${opsCommonT('analyze')}</button>
            <button type="button" class="ops-ai-btn" id="opsOverviewAiClear">${opsCommonT('clear')}</button>
          </div>
        </div>
        ${this.renderAiResultBlock(this.overviewAiResult)}
      </div>`;
  },

  renderTabAiFab() {
    if (this.tab === 'overview') return '';
    const panel = this.tabAiOpen ? `
      <div class="ops-tab-ai-panel" id="opsTabAiPanel">
        <div class="ops-tab-ai-head">
          ${this.aiSparkleSvg()} <span>${opsT('ai.tabFab')}</span>
          <button type="button" class="ops-tab-ai-close" id="opsTabAiClose">✕</button>
        </div>
        <textarea class="ops-ai-insight-input" id="opsTabAiInput" placeholder="${opsT('ai.placeholder')}">${this.tabAiQuery}</textarea>
        <div class="ops-ai-insight-actions">
          <button type="button" class="ops-ai-btn primary" id="opsTabAiAnalyze">${opsT('ai.tabAnalyze')}</button>
        </div>
        ${this.renderAiResultBlock(this.tabAiResult)}
      </div>` : '';
    return `${panel}<button type="button" class="ops-tab-ai-fab${this.tabAiOpen ? ' open' : ''}" id="opsTabAiFab" title="${opsT('ai.tabFab')}">${this.aiSparkleSvg()}</button>`;
  },

  barChart(dates, values, cls) {
    const max = Math.max(...values, 1);
    return `<div class="ops-bar-chart">${dates.map((d, i) => `
      <div class="ops-bar-col">
        <div class="ops-bar ${cls}" style="height:${(values[i] / max) * 100}%"></div>
        <span class="ops-bar-label">${d}</span>
      </div>`).join('')}</div>`;
  },

  dualChart(dates, a, b) {
    const max = Math.max(...a, ...b, 1);
    return `<div class="ops-dual-chart">${dates.map((d, i) => `
      <div class="ops-bar-col">
        <div class="ops-bar-stack">
          <div class="ops-bar ops-bar-a" style="height:${(a[i] / max) * 100}%"></div>
          <div class="ops-bar ops-bar-b" style="height:${(b[i] / max) * 100}%"></div>
        </div>
        <span class="ops-bar-label">${d}</span>
      </div>`).join('')}</div>`;
  },

  renderHealthRadar(items) {
    const n = items.length;
    const cx = 100;
    const cy = 100;
    const maxR = 72;
    const angles = items.map((_, i) => (Math.PI * 2 * i / n) - Math.PI / 2);
    const areaPts = angles.map((a, i) => {
      const r = maxR * (items[i].score / 100);
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');
    const rings = [0.25, 0.5, 0.75, 1].map(s => {
      const pts = angles.map(a => `${cx + maxR * s * Math.cos(a)},${cy + maxR * s * Math.sin(a)}`).join(' ');
      return `<polygon class="ops-radar-grid" points="${pts}"/>`;
    }).join('');
    const axes = angles.map(a => `<line class="ops-radar-axis" x1="${cx}" y1="${cy}" x2="${cx + maxR * Math.cos(a)}" y2="${cy + maxR * Math.sin(a)}"/>`).join('');
    const labels = items.map((h, i) => {
      const lx = cx + (maxR + 16) * Math.cos(angles[i]);
      const ly = cy + (maxR + 16) * Math.sin(angles[i]);
      const anchor = Math.abs(Math.cos(angles[i])) < 0.2 ? 'middle' : Math.cos(angles[i]) > 0 ? 'start' : 'end';
      return `<text class="ops-radar-label" x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="middle">${h.dim}</text>`;
    }).join('');
    return `
      <div class="ops-radar-wrap">
        <div class="ops-radar-chart">
          <svg class="ops-radar-svg" viewBox="0 0 200 200" width="200" height="200" aria-label="健康度雷达">
            ${rings}${axes}
            <polygon class="ops-radar-area" points="${areaPts}"/>
            ${labels}
          </svg>
        </div>
        <div class="ops-radar-legend">
          ${items.map(h => `
            <div class="ops-radar-row">
              <span class="ops-radar-label-text">${h.dim}</span>
              <div class="ops-dist-bar-wrap" style="flex:1"><div class="ops-dist-bar ops-dist-bar-health" style="width:${h.score}%"></div></div>
              <span class="ops-dist-val">${h.score}</span>
            </div>`).join('')}
        </div>
      </div>`;
  },

  distRows(items, labelKey, countKey, pctKey) {
    return items.map(r => `
      <div class="ops-dist-row">
        <span class="ops-dist-label">${r[labelKey]}</span>
        <div class="ops-dist-bar-wrap"><div class="ops-dist-bar" style="width:${r[pctKey]}%"></div></div>
        <span class="ops-dist-val">${r[countKey]} (${r[pctKey]}%)</span>
      </div>`).join('');
  },

  renderAssetTypeCards(types) {
    return `<div class="ops-asset-type-grid">${types.map(t => `
      <div class="ops-asset-type-card ops-asset-type-${t.key}">
        <div class="ops-asset-type-card-head">
          <span class="ops-asset-type-icon">${t.type.slice(0, 1)}</span>
          <span class="ops-asset-type-name">${t.type}</span>
          <span class="ops-asset-type-count">${t.count}${opsCommonT('count') ? ' ' + opsCommonT('count') : ''}</span>
        </div>
        <div class="ops-asset-type-metrics">
          <div><em>${opsT('asset.calls7d')}</em><strong>${t.calls7d.toLocaleString()}</strong></div>
          <div><em>${opsT('asset.successRate')}</em><strong>${t.successRate}%</strong></div>
          <div><em>${opsT('asset.avgLatency')}</em><strong>${t.avgLatency}</strong></div>
          <div><em>${opsT('asset.costShare')}</em><strong>${t.costShare}%</strong></div>
        </div>
        <div class="ops-asset-type-foot">
          <span>${opsCommonT('active')} ${t.activeCount} · ${opsCommonT('idle')} ${t.idleCount}</span>
          <span class="mono">Top: ${t.top.name}</span>
        </div>
      </div>`).join('')}</div>`;
  },

  renderAssetTypeCompare(types) {
    const maxCalls = Math.max(...types.map(t => t.calls7d), 1);
    return `
      <div class="ops-type-compare-head"><span>${opsCommonT('type')}</span><span>${opsT('asset.calls7dCol')}</span><span>${opsT('asset.successRate')}</span></div>
      ${types.map(t => `
        <div class="ops-type-compare-row">
          <span class="ops-type-compare-label"><i class="ops-legend-dot ops-dot-${t.key}"></i>${t.type}</span>
          <div class="ops-type-compare-bar-wrap">
            <div class="ops-type-bar calls ops-asset-bar-${t.key}" style="width:${(t.calls7d / maxCalls) * 100}%"></div>
            <span class="ops-type-bar-val">${t.calls7d.toLocaleString()}</span>
          </div>
          <div class="ops-type-compare-bar-wrap">
            <div class="ops-type-bar success ops-asset-bar-${t.key}" style="width:${t.successRate}%"></div>
            <span class="ops-type-bar-val">${t.successRate}%</span>
          </div>
        </div>`).join('')}`;
  },

  renderAssetTypeTrends(types) {
    const dates = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
    return `<div class="ops-type-trend-grid">${types.map(t => `
      <div class="ops-type-trend-cell ops-asset-type-${t.key}">
        <div class="ops-type-trend-title"><i class="ops-legend-dot ops-dot-${t.key}"></i>${t.type}</div>
        ${this.barChart(dates, t.trend, `ops-bar-type-${t.key}`)}
      </div>`).join('')}</div>`;
  },

  renderAssetTypeCostShare(types) {
    const total = types.reduce((s, t) => s + t.costShare, 0) || 1;
    const colors = { agent: '#1059E9', skill: '#12B76A', mcp: '#7C3AED', tool: '#F79009' };
    let gradient = types.map((t, i) => {
      const start = types.slice(0, i).reduce((s, x) => s + x.costShare, 0);
      const end = start + t.costShare;
      return `${colors[t.key]} ${start / total * 100}% ${end / total * 100}%`;
    }).join(', ');
    return `
      <div class="ops-donut-wrap">
        <div class="ops-donut" style="background: conic-gradient(${gradient})"></div>
        <div class="ops-donut-legend">${types.map(t => `
          <span class="ops-donut-legend-item"><i class="ops-legend-dot ops-dot-${t.key}"></i>${t.type} · ${opsCommonT('cost')} ${t.costShare}%</span>`).join('')}
        </div>
      </div>`;
  },

  renderOverview() {
    const snap = this.getSnapshot();
    const o = snap.overview;
    const c = snap.chart;
    const maxWs = Math.max(...snap.workspaceCompare.map(w => w.sessions), 1);

    return `
      ${this.renderAiInsightBox()}
      <div class="ops-kpi-grid ops-kpi-grid-4">
        ${this.kpi(opsT('kpi.activeUsers'), o.activeUsers, o.activeUsersTrend, true)}
        ${this.kpi(opsT('kpi.sessions'), o.sessions.toLocaleString(), o.sessionsTrend, true)}
        ${this.kpi(opsT('kpi.agentCalls'), o.agentCalls.toLocaleString(), o.agentCallsTrend, true)}
        ${this.kpi(opsT('kpi.skillCalls'), o.skillCalls.toLocaleString(), o.skillCallsTrend, true)}
        ${this.kpi(opsT('kpi.totalCost'), '$' + o.totalCost, o.totalCostTrend, false)}
        ${this.kpi(opsT('kpi.sessionCost'), '$' + o.sessionCost, o.sessionCostTrend, false, true)}
        ${this.kpi(opsT('kpi.approvalPassRate'), o.approvalPassRate + '%', o.approvalPassRateTrend, true)}
        ${this.kpi(opsT('kpi.satisfaction'), o.satisfaction + '/5', o.satisfactionTrend, true)}
      </div>
      <div class="ops-charts-row">
        <div class="ops-card">
          <div class="ops-card-head"><span>${opsT('card.usageCostTrend')}</span><span class="ops-card-sub">${opsT('card.sessionsVsCost')}</span></div>
          <div class="ops-card-body">${this.dualChart(c.dates, c.sessions, c.cost.map(v => v * 10))}
            <div class="ops-legend"><span><i class="ops-legend-dot a"></i>${opsT('legend.sessions')}</span><span><i class="ops-legend-dot b"></i>${opsT('legend.costX10')}</span></div>
          </div>
        </div>
        <div class="ops-card">
          <div class="ops-card-head">${opsT('card.workspaceCompare')}</div>
          <div class="ops-card-body">${snap.workspaceCompare.map(w => `
            <div class="ops-dist-row">
              <span class="ops-dist-label">${this.wsLabel(w.name)}</span>
              <div class="ops-dist-bar-wrap"><div class="ops-dist-bar" style="width:${(w.sessions / maxWs) * 100}%"></div></div>
              <span class="ops-dist-val">${w.sessions} ${opsT('legend.sessions')} · $${w.cost}</span>
            </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="ops-charts-row">
        <div class="ops-card">
          <div class="ops-card-head">${opsT('card.healthRadar')}</div>
          <div class="ops-card-body">${this.renderHealthRadar(snap.healthRadar)}</div>
        </div>
        <div class="ops-card">
          <div class="ops-card-head">${opsT('card.alerts')} <span class="ops-card-sub">${opsT('card.clickAlertAi')}</span></div>
          <div class="ops-card-body ops-table-wrap">
            <table class="ops-table" id="opsAlertsTable">
              <thead><tr><th>${opsT('table.level')}</th><th>${opsT('table.category')}</th><th>${opsT('table.item')}</th><th>Workspace</th><th>${opsT('table.trend')}</th></tr></thead>
              <tbody>${snap.alerts.map(a => `
                <tr class="ops-alert-row${this.expandedAlertId === a.id ? ' expanded' : ''}" data-alert="${a.id}">
                  <td><span class="ops-sev ops-sev-${a.severity}">${a.severity === 'high' ? opsCommonT('high') : opsCommonT('medium')}</span></td>
                  <td>${a.category}</td><td>${a.title}</td><td>${this.wsLabel(a.workspace)}</td><td>${a.trend}</td>
                </tr>
                ${this.expandedAlertId === a.id ? `<tr class="ops-alert-ai-row"><td colspan="5"><div class="ops-alert-ai">${OpsAnalysisAiEngine.explainAlert(a)}</div></td></tr>` : ''}`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
  },

  renderUsage() {
    const u = this.getSnapshot().usage;
    return `
      <div class="ops-kpi-grid">${this.kpi(opsT('kpi.dau'), u.dau, u.dauTrend, true)}${this.kpi(opsT('kpi.wau'), u.wau, u.wauTrend, true)}${this.kpi(opsT('kpi.mau'), u.mau, u.mauTrend, true)}${this.kpi(opsT('kpi.sessionsPerUser'), u.sessionsPerUser, u.sessionsPerUserTrend + '', true)}${this.kpi(opsT('kpi.newUserPct'), u.newUserPct, u.newUserPctTrend, true)}${this.kpi(opsT('kpi.completionRate'), u.completionRate, u.completionRateTrend, true)}</div>
      <div class="ops-charts-row">
        <div class="ops-card"><div class="ops-card-head">${opsT('card.activeTrend')}</div><div class="ops-card-body">${this.barChart(['D1','D2','D3','D4','D5','D6','D7'], u.activeTrend, 'ops-bar-primary')}</div></div>
        <div class="ops-card"><div class="ops-card-head">${opsT('card.adoptionFunnel')}</div><div class="ops-card-body">${u.funnel.map(f => `
          <div class="ops-dist-row"><span class="ops-dist-label">${f.step}</span><div class="ops-dist-bar-wrap"><div class="ops-dist-bar" style="width:${f.pct}%"></div></div><span class="ops-dist-val">${f.count.toLocaleString()} (${f.pct}%)</span></div>`).join('')}</div></div>
      </div>
      <div class="ops-charts-row">
        <div class="ops-card"><div class="ops-card-head">${opsT('card.topUsers')}</div><div class="ops-card-body ops-table-wrap"><table class="ops-table"><thead><tr><th>User</th><th>Sessions</th><th>Calls</th><th>Last Active</th><th>Workspace</th></tr></thead><tbody>${u.topUsers.map(r => `<tr><td class="mono">${r.user}</td><td>${r.sessions}</td><td>${r.calls}</td><td>${r.lastActive}</td><td>${this.wsLabel(r.workspace)}</td></tr>`).join('')}</tbody></table></div></div>
        <div class="ops-card"><div class="ops-card-head">${opsT('card.topTags')}</div><div class="ops-card-body ops-table-wrap"><table class="ops-table"><thead><tr><th>Tag</th><th>Sessions</th><th>Share</th></tr></thead><tbody>${u.topTags.map(r => `<tr><td class="mono">${r.tag}</td><td>${r.sessions}</td><td>${r.share}</td></tr>`).join('')}</tbody></table></div></div>
      </div>`;
  },

  renderAssets() {
    const a = this.getSnapshot().assets;
    const types = a.typeAnalytics;
    const maxCalls = Math.max(...a.topAssets.map(t => t.calls), 1);
    return `
      <div class="ops-kpi-grid">${this.kpi(opsT('kpi.onlineAgents'), a.agentCount, '+2', true)}${this.kpi(opsT('kpi.onlineSkills'), a.skillCount, '+5', true)}${this.kpi(opsT('kpi.mcpConnections'), a.mcpCount, '0', true)}${this.kpi(opsT('kpi.avgSuccessRate'), a.successRate, a.successRateTrend, true)}</div>
      <div class="ops-card">
        <div class="ops-card-head">${opsT('card.assetTypeOverview')} <span class="ops-card-sub">${opsT('card.assetTypeSub')}</span></div>
        <div class="ops-card-body">${this.renderAssetTypeCards(types)}</div>
      </div>
      <div class="ops-charts-row">
        <div class="ops-card">
          <div class="ops-card-head">${opsT('card.typeCompare')} <span class="ops-card-sub">${opsT('card.typeCompareSub')}</span></div>
          <div class="ops-card-body">${this.renderAssetTypeCompare(types)}</div>
        </div>
        <div class="ops-card">
          <div class="ops-card-head">${opsT('card.typeCostShare')}</div>
          <div class="ops-card-body">${this.renderAssetTypeCostShare(types)}</div>
        </div>
      </div>
      <div class="ops-card">
        <div class="ops-card-head">${opsT('card.typeTrend7d')}</div>
        <div class="ops-card-body">${this.renderAssetTypeTrends(types)}</div>
      </div>
      <div class="ops-charts-row">
        <div class="ops-card"><div class="ops-card-head">${opsT('card.assetDist')}</div><div class="ops-card-body">${this.distRows(a.typeDist, 'type', 'count', 'pct')}</div></div>
        <div class="ops-card"><div class="ops-card-head">${opsT('card.topAssets')}</div><div class="ops-card-body">${a.topAssets.map(t => `
          <div class="ops-dist-row"><span class="ops-dist-label">${t.name}</span><div class="ops-dist-bar-wrap"><div class="ops-dist-bar" style="width:${(t.calls / maxCalls) * 100}%"></div></div><span class="ops-dist-val">${t.calls} · ${t.success}%</span></div>`).join('')}</div></div>
      </div>
      <div class="ops-card"><div class="ops-card-head">${opsT('card.idleAlert')}</div><div class="ops-card-body">${this.barChart(['D1','D2','D3','D4','D5','D6','D7'], a.idleTrend, 'ops-bar-warn')}</div></div>
      <div class="ops-card"><div class="ops-card-head">${opsT('card.assetDetail')}</div><div class="ops-card-body ops-table-wrap"><table class="ops-table"><thead><tr><th>Name</th><th>Type</th><th>Workspace</th><th>7d Calls</th><th>Success Rate</th><th>Avg Latency</th><th>Cost Share</th><th>Status</th></tr></thead><tbody>${a.assetRows.map(r => `<tr><td class="mono">${r.name}</td><td><span class="ops-type-pill ops-type-pill-${(r.type || '').toLowerCase()}">${r.type}</span></td><td>${this.wsLabel(r.workspace)}</td><td>${r.calls7d}</td><td>${r.successRate}</td><td>${r.avgLatency}</td><td>${r.costShare}</td><td><span class="ops-status-tag">${r.status}</span></td></tr>`).join('')}</tbody></table></div></div>`;
  },

  renderCost() {
    const c = this.getSnapshot().cost;
    const maxWs = Math.max(...c.byWorkspace.map(w => w.cost), 1);
    return `
      <div class="ops-kpi-grid">${this.kpi(opsT('kpi.totalCostShort'), '$' + c.total, c.totalTrend, false)}${this.kpi(opsT('kpi.tokenTotal'), c.tokens, c.tokensTrend, false)}${this.kpi(opsT('kpi.sessionCost'), '$' + c.sessionCost, c.sessionCostTrend, false, true)}${this.kpi(opsT('kpi.unitCost'), '$' + c.unitCost, c.unitCostTrend, false, true)}${this.kpi(opsT('kpi.budgetUsage'), c.budgetUsage, c.budgetUsageTrend, false)}</div>
      <div class="ops-charts-row">
        <div class="ops-card"><div class="ops-card-head">${opsT('card.costTrend7d')}</div><div class="ops-card-body">${this.barChart(['06-04','06-05','06-06','06-07','06-08','06-09','06-10'], c.costTrend, 'ops-bar-cost')}</div></div>
        <div class="ops-card"><div class="ops-card-head">${opsT('card.costTopWs')}</div><div class="ops-card-body">${c.byWorkspace.map(w => `
          <div class="ops-dist-row"><span class="ops-dist-label">${this.wsLabel(w.name)}</span><div class="ops-dist-bar-wrap"><div class="ops-dist-bar ops-dist-bar-cost" style="width:${(w.cost / maxWs) * 100}%"></div></div><span class="ops-dist-val">$${w.cost} (${w.pct}%)</span></div>`).join('')}</div></div>
      </div>
      <div class="ops-card">
        <div class="ops-card-head">${opsT('card.costTopAgent')}</div>
        <div class="ops-card-body">${(() => {
          const maxAgent = Math.max(...c.byAgent.map(a => a.cost), 1);
          return c.byAgent.map(a => `
            <div class="ops-dist-row">
              <span class="ops-dist-label mono">${a.name}</span>
              <div class="ops-dist-bar-wrap"><div class="ops-dist-bar ops-dist-bar-cost" style="width:${(a.cost / maxAgent) * 100}%"></div></div>
              <span class="ops-dist-val">$${a.cost} · ${a.calls.toLocaleString()} ${opsT('legend.calls')}</span>
            </div>`).join('');
        })()}</div>
      </div>
      <div class="ops-card"><div class="ops-card-head">${opsT('card.modelUsage')} <a class="ops-link inline" href="../ai观测/index.html">${opsT('link.traceDetail')}</a></div><div class="ops-card-body ops-table-wrap"><table class="ops-table"><thead><tr><th>Model</th><th>Traces</th><th>Tokens</th><th>Cost ($)</th><th>Share</th><th>Trend</th></tr></thead><tbody>${c.models.map(m => `<tr><td class="mono">${m.model}</td><td>${m.traces.toLocaleString()}</td><td>${m.tokens}</td><td>${m.cost}</td><td>${m.share}</td><td>${m.trend}</td></tr>`).join('')}</tbody></table></div></div>`;
  },

  renderApproval() {
    const ap = this.getSnapshot().approval;
    const maxType = Math.max(...ap.byType.map(t => t.count), 1);
    return `
      <div class="ops-kpi-grid">${this.kpi(opsT('kpi.pending'), ap.pending, ap.pendingTrend, false)}${this.kpi(opsT('kpi.avgWait'), ap.avgWait, ap.avgWaitTrend, false)}${this.kpi(opsT('kpi.approvedWeek'), ap.approvedWeek, ap.approvedWeekTrend, true)}${this.kpi(opsT('kpi.rejectedWeek'), ap.rejectedWeek, ap.rejectedWeekTrend, false, true)}${this.kpi(opsT('kpi.l3Ratio'), ap.l3Ratio, ap.l3RatioTrend, false)}</div>
      <div class="ops-charts-row">
        <div class="ops-card"><div class="ops-card-head">${opsT('card.approvalByType')}</div><div class="ops-card-body">${ap.byType.map(t => `
          <div class="ops-dist-row"><span class="ops-dist-label">${typeof XSparkI18n !== 'undefined' ? XSparkI18n.approvalType(t.type || t.label) : t.label}</span><div class="ops-dist-bar-wrap"><div class="ops-dist-bar" style="width:${(t.count / maxType) * 100}%"></div></div><span class="ops-dist-val">${t.count}</span></div>`).join('')}</div></div>
        <div class="ops-card"><div class="ops-card-head">${opsT('card.approvalSla')}</div><div class="ops-card-body">${this.distRows(ap.slaDist, 'bucket', 'count', 'pct')}</div></div>
      </div>
      <div class="ops-charts-row">
        <div class="ops-card"><div class="ops-card-head">${opsT('card.approvalBacklog')} <a class="ops-link inline" href="../审批中心/index.html">${opsT('link.approvalCenter')}</a></div><div class="ops-card-body ops-table-wrap"><table class="ops-table"><thead><tr><th>Resource</th><th>Type</th><th>Waiting</th><th>Workspace</th><th>Submitter</th></tr></thead><tbody>${ap.backlog.map(r => `<tr><td class="mono">${r.resource}</td><td>${r.type}</td><td>${r.waiting}</td><td>${r.workspace}</td><td>${r.submitter}</td></tr>`).join('')}</tbody></table></div></div>
        <div class="ops-card"><div class="ops-card-head">${opsT('card.recentPublish')}</div><div class="ops-card-body ops-table-wrap"><table class="ops-table"><thead><tr><th>Resource</th><th>Version</th><th>Result</th><th>Approver</th><th>Time</th></tr></thead><tbody>${ap.recent.map(r => `<tr><td class="mono">${r.resource}</td><td>${r.version}</td><td>${r.result}</td><td>${r.approver}</td><td>${r.time}</td></tr>`).join('')}</tbody></table></div></div>
      </div>`;
  },

  renderHub() {
    const h = this.getSnapshot().hub;
    const lt = h.listingTrend;
    return `
      <div class="ops-kpi-grid">${this.kpi(opsT('kpi.skillListings'), h.skillListings, h.skillListingsTrend, true)}${this.kpi(opsT('kpi.agentViews'), h.agentViews.toLocaleString(), h.agentViewsTrend, true)}${this.kpi(opsT('kpi.downloads'), h.downloads, h.downloadsTrend, true)}${this.kpi(opsT('kpi.contributors'), h.contributors, h.contributorsTrend, true)}</div>
      <div class="ops-charts-row">
        <div class="ops-card"><div class="ops-card-head">${opsT('card.listingTrend')}</div><div class="ops-card-body">${this.dualChart(lt.dates, lt.skill, lt.agent)}<div class="ops-legend"><span><i class="ops-legend-dot a"></i>${opsT('legend.skill')}</span><span><i class="ops-legend-dot b"></i>${opsT('legend.agent')}</span></div></div></div>
        <div class="ops-card"><div class="ops-card-head">${opsT('card.categoryDist')}</div><div class="ops-card-body">${this.distRows(h.categories, 'name', 'count', 'pct')}</div></div>
      </div>
      <div class="ops-card"><div class="ops-card-head">${opsT('card.hubAssets')}</div><div class="ops-card-body ops-table-wrap"><table class="ops-table"><thead><tr><th>Name</th><th>Category</th><th>Version</th><th>Downloads</th><th>Rating</th><th>Listed At</th></tr></thead><tbody>${h.topSkills.map(r => `<tr><td class="mono">${r.name}</td><td>${r.category}</td><td>${r.version}</td><td>${r.downloads}</td><td>${r.rating}</td><td>${r.listedAt}</td></tr>`).join('')}</tbody></table></div></div>`;
  },

  renderQuality() {
    const q = this.getSnapshot().quality;
    return `
      <div class="ops-kpi-grid">${this.kpi(opsT('kpi.errorRate'), q.errorRate, q.errorRateTrend, false, true)}${this.kpi(opsT('kpi.traceFailRate'), q.traceFailRate, q.traceFailRateTrend, false, true)}${this.kpi(opsT('kpi.feedbackCount'), q.feedbackCount, q.feedbackCountTrend, false)}${this.kpi(opsT('kpi.avgSatisfaction'), q.satisfaction + '/5', q.satisfactionTrend, true)}${this.kpi(opsT('kpi.guardrailHits'), q.guardrailHits, q.guardrailHitsTrend, false)}</div>
      <div class="ops-charts-row">
        <div class="ops-card"><div class="ops-card-head">${opsT('card.errorTrend')}</div><div class="ops-card-body">${this.barChart(['D1','D2','D3','D4','D5','D6','D7'], q.errorTrend, 'ops-bar-warn')}</div></div>
        <div class="ops-card"><div class="ops-card-head">${opsT('card.feedbackCategory')}</div><div class="ops-card-body">${this.distRows(q.feedbackCategories, 'name', 'count', 'pct')}</div></div>
      </div>
      <div class="ops-charts-row">
        <div class="ops-card"><div class="ops-card-head">${opsT('card.topErrors')}</div><div class="ops-card-body ops-table-wrap"><table class="ops-table"><thead><tr><th>Asset</th><th>Type</th><th>Count</th><th>Workspace</th></tr></thead><tbody>${q.topErrors.map(r => `<tr><td class="mono">${r.asset}</td><td>${r.type}</td><td>${r.count}</td><td>${r.workspace}</td></tr>`).join('')}</tbody></table></div></div>
        <div class="ops-card"><div class="ops-card-head">${opsT('card.recentFeedback')} <a class="ops-link inline" href="../../治理/ai治理/index.html">${opsT('link.governanceLink')}</a></div><div class="ops-card-body ops-table-wrap"><table class="ops-table"><thead><tr><th>User</th><th>Category</th><th>Summary</th><th>Time</th></tr></thead><tbody>${q.feedbacks.map(r => `<tr><td class="mono">${r.user}</td><td>${r.category}</td><td>${r.summary}</td><td>${r.time}</td></tr>`).join('')}</tbody></table></div></div>
      </div>
      <div class="ops-links-row"><a class="ops-link" href="../ai观测/index.html">${opsT('link.errorTrace')}</a></div>`;
  },

  bindEvents() {
    document.getElementById('opsWorkspace')?.addEventListener('change', e => {
      this.workspace = e.target.value;
      this.overviewAiResult = OpsAnalysisAiEngine.analyze(this.overviewAiQuery, this.getSnapshot(), this.tab);
      this.render();
    });
    document.getElementById('opsTimeRange')?.addEventListener('change', e => {
      this.timeRange = e.target.value;
      this.render();
    });
    document.getElementById('opsCompare')?.addEventListener('change', e => {
      this.compareMode = e.target.value;
      this.render();
    });
    document.getElementById('opsExportReport')?.addEventListener('click', () => alert(opsT('ai.exportAlert')));
    document.getElementById('opsWeeklyReport')?.addEventListener('click', () => {
      const md = OpsAnalysisAiEngine.generateWeeklyReport(this.getSnapshot());
      alert(opsT('ai.weeklyAlert') + md);
    });

    document.getElementById('opsOverviewAiAnalyze')?.addEventListener('click', () => {
      this.overviewAiQuery = document.getElementById('opsOverviewAiInput')?.value || '';
      this.overviewAiResult = OpsAnalysisAiEngine.analyze(this.overviewAiQuery, this.getSnapshot(), 'overview');
      this.render();
    });
    document.getElementById('opsOverviewAiClear')?.addEventListener('click', () => {
      this.overviewAiQuery = '';
      this.overviewAiResult = OpsAnalysisAiEngine.analyze('', this.getSnapshot(), 'overview');
      this.render();
    });

    document.querySelectorAll('.ops-alert-row').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.dataset.alert;
        this.expandedAlertId = this.expandedAlertId === id ? null : id;
        this.render();
      });
    });

    document.getElementById('opsTabAiFab')?.addEventListener('click', () => {
      this.tabAiOpen = !this.tabAiOpen;
      this.render();
    });
    document.getElementById('opsTabAiClose')?.addEventListener('click', () => {
      this.tabAiOpen = false;
      this.render();
    });
    document.getElementById('opsTabAiAnalyze')?.addEventListener('click', () => {
      this.tabAiQuery = document.getElementById('opsTabAiInput')?.value || '';
      this.tabAiResult = OpsAnalysisAiEngine.analyzeTab(this.tabAiQuery, this.getSnapshot(), this.tab);
      this.render();
    });
  }
};
