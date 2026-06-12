/**
 * 审批 AI 追问 — 对话交互、历史审批检索、平台公开 MCP 调用（原型）
 */
function apvChatT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('approval.aiChat.' + k, p) : k;
}

const ApprovalAiChat = {
  sessions: {},

  /** 平台已公开 MCP 服务（原型 mock） */
  PUBLIC_MCP: [
    { id: 'prod-mcp-git', name: 'prod-mcp-git', desc: 'Git 仓库 MCP', public: true, health: 'healthy', latencyMs: 42 },
    { id: 'prod-mcp-slack', name: 'prod-mcp-slack', desc: 'Slack 通知 MCP', public: true, health: 'healthy', latencyMs: 38 },
    { id: 'finance-mcp-read', name: 'finance-mcp-read', desc: '财务只读 MCP', public: true, health: 'healthy', latencyMs: 55 },
    { id: 'k8s-mcp-readonly', name: 'k8s-mcp-readonly', desc: 'K8s 只读 MCP', public: true, health: 'degraded', latencyMs: 120 },
    { id: 'audit-log-mcp', name: 'audit-log-mcp', desc: '审计日志 MCP', public: true, health: 'healthy', latencyMs: 31 }
  ],

  sessionKey(item) {
    return item?.id || 'draft';
  },

  getSession(item) {
    const key = this.sessionKey(item);
    if (!this.sessions[key]) {
      this.sessions[key] = { messages: [], pending: false };
    }
    return this.sessions[key];
  },

  resetSession(item) {
    delete this.sessions[this.sessionKey(item)];
  },

  getAllApprovals() {
    return typeof APPROVAL_MOCK !== 'undefined' ? APPROVAL_MOCK.items : [];
  },

  typeLabel(type) {
    return typeof APPROVAL_TYPE_LABELS !== 'undefined'
      ? (APPROVAL_TYPE_LABELS[type] || type)
      : type;
  },

  statusLabel(status) {
    return typeof XSparkI18n !== 'undefined' ? XSparkI18n.approvalStatus(status) : status;
  },

  /** 检索历史审批单 */
  queryHistoryApprovals(item, query) {
    const q = String(query || '').toLowerCase();
    const all = this.getAllApprovals().filter(a => a.id !== item.id);
    const related = all.filter(a => {
      const sameResource = a.resource === item.resource;
      const sameType = a.type === item.type;
      const sameResourceType = a.resourceType === item.resourceType;
      const sameWorkspace = a.workspace === item.workspace;
      const sameSubmitter = a.submitter === item.submitter;
      return sameResource || (sameType && sameResourceType) || sameWorkspace || sameSubmitter;
    });

    let hits = related;
    if (/驳回|拒绝|reject/.test(q)) hits = related.filter(a => a.status === 'rejected');
    else if (/通过|approve/.test(q)) hits = related.filter(a => a.status === 'approved');
    else if (/同类|相同|历史|记录/.test(q)) hits = related;
    else if (/提交人|发起人|submitter/.test(q)) {
      hits = all.filter(a => a.submitter === item.submitter);
    }

    return hits
      .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)))
      .slice(0, 5)
      .map(a => ({
        id: a.id,
        resource: a.resource,
        type: this.typeLabel(a.type),
        status: a.status,
        statusLabel: this.statusLabel(a.status),
        submitter: a.submitter,
        submittedAt: a.submittedAt,
        comment: a.comment || '',
        approver: a.approver || '',
        workspace: a.workspace
      }));
  },

  extractMcpIds(text) {
    const ids = new Set();
    const lower = String(text || '').toLowerCase();
    this.PUBLIC_MCP.forEach(m => {
      if (lower.includes(m.id.toLowerCase()) || lower.includes(m.name.toLowerCase())) ids.add(m.id);
    });
    if (/mcp|工具|tool/.test(lower) && ids.size === 0) {
      const d = text;
      this.PUBLIC_MCP.forEach(m => {
        if (String(d).includes(m.id)) ids.add(m.id);
      });
    }
    return [...ids];
  },

  relatedMcpIds(item) {
    const blob = JSON.stringify(item.detail || {}) + item.resource + (item.detail?.changeLog || '') + (item.detail?.configSummary || '');
    return this.extractMcpIds(blob);
  },

  /** 调用平台公开 MCP（原型 mock） */
  callPublicMcp(serviceId, context) {
    const svc = this.PUBLIC_MCP.find(m => m.id === serviceId);
    if (!svc) return null;
    const results = {
      'prod-mcp-git': {
        summary: 'Git MCP 当前为只读模式；最近 7 日调用 1,284 次，无写权限变更记录',
        permissions: ['repo:read', 'branch:list'],
        writeEnabled: false
      },
      'prod-mcp-slack': {
        summary: 'Slack MCP 仅允许 postMessage 至 #ops-alerts；无文件上传权限',
        permissions: ['chat:write:ops-alerts'],
        writeEnabled: false
      },
      'finance-mcp-read': {
        summary: '财务 MCP 只读；支持报表查询，禁止 export 批量接口',
        permissions: ['report:read'],
        writeEnabled: false
      },
      'k8s-mcp-readonly': {
        summary: 'K8s MCP 只读；当前集群 prod-eu 延迟偏高（P95 820ms）',
        permissions: ['pods:read', 'logs:read'],
        writeEnabled: false,
        healthNote: 'degraded'
      },
      'audit-log-mcp': {
        summary: `审计日志：资源「${context?.resource || '—'}」近 30 日审批相关操作 6 条，无异常导出`,
        recentEvents: 6
      }
    };
    return {
      id: svc.id,
      name: svc.name,
      desc: svc.desc,
      health: svc.health,
      latencyMs: svc.latencyMs,
      result: results[serviceId] || { summary: apvChatT('mcpDefaultResult', { name: svc.name }) }
    };
  },

  suggestedQuestions(item, role) {
    const base = [
      apvChatT('suggest.history'),
      apvChatT('suggest.reject'),
      apvChatT('suggest.mcpHealth')
    ];
    if (role === 'approver') base.push(apvChatT('suggest.approveAdvice'));
    if (role === 'submitter') base.push(apvChatT('suggest.improve'));
    if (item.resourceType === 'KnowledgeBase') base.push(apvChatT('suggest.knowledgeScope'));
    if (item.type === 'l3_exec') base.push(apvChatT('suggest.l3Boundary'));
    return base.slice(0, 4);
  },

  buildReply(item, role, userText) {
    const q = userText.toLowerCase();
    const history = this.queryHistoryApprovals(item, userText);
    const mcpIds = [
      ...new Set([
        ...this.relatedMcpIds(item),
        ...this.extractMcpIds(userText)
      ])
    ].slice(0, 3);
    const mcpCalls = mcpIds.map(id => this.callPublicMcp(id, item)).filter(Boolean);

    const rejected = history.filter(h => h.status === 'rejected');
    const sameResource = history.filter(h => h.resource === item.resource);
    const summary = ApprovalAiSummaryEngine.summarize(item, role);

    let text = '';
    const parts = [];

    if (/驳回|拒绝|reject|踩坑/.test(q)) {
      if (rejected.length) {
        parts.push(apvChatT('reply.rejectFound', { count: rejected.length }));
        rejected.slice(0, 2).forEach(h => {
          parts.push(`· **${h.resource}**（${h.submittedAt}）— ${h.comment || apvChatT('noComment')}`);
        });
      } else {
        parts.push(apvChatT('reply.noReject'));
      }
    } else if (/历史|同类|相同|记录|曾经/.test(q)) {
      if (history.length) {
        parts.push(apvChatT('reply.historyFound', { count: history.length }));
        history.slice(0, 3).forEach(h => {
          parts.push(`· \`${h.id}\` **${h.resource}** · ${h.statusLabel} · ${h.submittedAt}${h.comment ? ` — ${h.comment}` : ''}`);
        });
      } else {
        parts.push(apvChatT('reply.noHistory'));
      }
    } else if (/mcp|健康|health|工具|tool|权限/.test(q)) {
      if (mcpCalls.length) {
        parts.push(apvChatT('reply.mcpQueried', { count: mcpCalls.length }));
        mcpCalls.forEach(m => {
          parts.push(`· **${m.name}**（${m.health} · ${m.latencyMs}ms）：${m.result.summary}`);
        });
      } else {
        parts.push(apvChatT('reply.mcpNone'));
        parts.push(apvChatT('reply.mcpListHint'));
      }
    } else if (/通过|approve|建议|怎么办|能否/.test(q)) {
      parts.push(apvChatT('reply.decisionIntro', { level: ApprovalAiSummaryEngine.riskLevelLabel(summary.riskLevel), score: summary.score }));
      summary.recommendations.slice(0, 3).forEach(r => parts.push(`· ${r}`));
      if (summary.riskLevel === 'high' && role === 'approver') {
        parts.push(apvChatT('reply.highRiskCaution'));
      }
    } else if (/提交人|发起人|submitter/.test(q)) {
      const bySubmitter = this.getAllApprovals().filter(a => a.submitter === item.submitter && a.id !== item.id);
      const approved = bySubmitter.filter(a => a.status === 'approved').length;
      const rejectedCount = bySubmitter.filter(a => a.status === 'rejected').length;
      parts.push(apvChatT('reply.submitterStats', {
        name: item.submitter,
        total: bySubmitter.length,
        approved,
        rejected: rejectedCount
      }));
    } else if (/风险|risk|分数|score/.test(q)) {
      parts.push(apvChatT('reply.riskSummary', {
        score: summary.score,
        level: ApprovalAiSummaryEngine.riskLevelLabel(summary.riskLevel)
      }));
      summary.risks.slice(0, 3).forEach(r => parts.push(`· ${r.replace(/\*\*/g, '')}`));
    } else {
      parts.push(apvChatT('reply.generic'));
      if (sameResource.length) {
        parts.push(apvChatT('reply.sameResourceHint', { resource: item.resource, count: sameResource.length }));
      }
      parts.push(apvChatT('reply.trySuggest'));
    }

    text = parts.join('\n\n');

    const autoHistory = (/历史|驳回|同类|提交人|记录/.test(q) && history.length)
      ? history.slice(0, 3)
      : (sameResource.length && !mcpCalls.length ? sameResource.slice(0, 2) : []);
    const autoMcp = (/mcp|健康|tool|权限/.test(q) || mcpCalls.length) ? mcpCalls : [];

    return {
      text,
      sources: {
        history: autoHistory.length ? autoHistory : (rejected.length && /驳回/.test(q) ? rejected.slice(0, 2) : []),
        mcp: autoMcp
      }
    };
  },

  sendMessage(item, role, userText, { skipUserBubble = false } = {}) {
    const text = String(userText || '').trim();
    if (!text) return null;
    const session = this.getSession(item);
    if (!skipUserBubble) {
      session.messages.push({ role: 'user', text, sources: null });
    }
    const reply = this.buildReply(item, role, text);
    session.messages.push({
      role: 'assistant',
      text: reply.text,
      sources: reply.sources
    });
    session.pending = false;
    return session;
  },

  formatAssistantHtml(text) {
    return String(text)
      .split('\n\n')
      .map(p => `<p>${p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>')}</p>`)
      .join('');
  },

  renderSources(sources) {
    if (!sources) return '';
    const hist = sources.history || [];
    const mcp = sources.mcp || [];
    if (!hist.length && !mcp.length) return '';

    const histHtml = hist.length ? `
      <div class="apv-ai-chat-source-group">
        <span class="apv-ai-chat-source-label">${apvChatT('sourceHistory')}</span>
        ${hist.map(h => `<button type="button" class="apv-ai-chat-source-chip apv-ai-chat-source-chip--history" data-history-id="${h.id}" title="${Approval.escapeHtml ? Approval.escapeHtml(h.comment || '') : h.comment}">${h.resource} · ${h.statusLabel}</button>`).join('')}
      </div>` : '';

    const mcpHtml = mcp.length ? `
      <div class="apv-ai-chat-source-group">
        <span class="apv-ai-chat-source-label">${apvChatT('sourceMcp')}</span>
        ${mcp.map(m => `<span class="apv-ai-chat-source-chip apv-ai-chat-source-chip--mcp">${m.name} · ${m.health}</span>`).join('')}
      </div>` : '';

    return `<div class="apv-ai-chat-sources">${histHtml}${mcpHtml}</div>`;
  },

  renderPanel(item, role) {
    const session = this.getSession(item);
    const key = this.sessionKey(item);
    const suggestions = this.suggestedQuestions(item, role);

    const messagesHtml = session.messages.length
      ? session.messages.map((m, i) => {
        if (m.role === 'user') {
          return `<div class="apv-ai-chat-msg apv-ai-chat-msg--user"><div class="apv-ai-chat-bubble">${Approval.escapeHtml(m.text)}</div></div>`;
        }
        return `<div class="apv-ai-chat-msg apv-ai-chat-msg--assistant">
          <div class="apv-ai-chat-avatar">${Approval.aiSparkleSvg ? Approval.aiSparkleSvg() : '✦'}</div>
          <div class="apv-ai-chat-bubble">
            ${this.formatAssistantHtml(m.text)}
            ${this.renderSources(m.sources)}
          </div>
        </div>`;
      }).join('')
      : `<div class="apv-ai-chat-empty">${apvChatT('emptyHint')}</div>`;

    return `
      <div class="apv-ai-chat" id="apvAiChat-${key}" data-chat-key="${key}">
        <div class="apv-ai-chat-head">
          <span class="apv-ai-chat-title">${apvChatT('title')}</span>
          <span class="apv-ai-chat-desc">${apvChatT('desc')}</span>
        </div>
        <div class="apv-ai-chat-suggest">
          ${suggestions.map(s => `<button type="button" class="apv-ai-chat-suggest-btn" data-chat-suggest="${Approval.escapeHtml(s)}">${Approval.escapeHtml(s)}</button>`).join('')}
        </div>
        <div class="apv-ai-chat-messages" id="apvAiChatMessages-${key}">${messagesHtml}${session.pending ? `<div class="apv-ai-chat-typing">${apvChatT('typing')}</div>` : ''}</div>
        <div class="apv-ai-chat-input-row">
          <textarea class="apv-ai-chat-input" id="apvAiChatInput-${key}" rows="2" placeholder="${apvChatT('placeholder')}"></textarea>
          <button type="button" class="apv-ai-chat-send" id="apvAiChatSend-${key}" aria-label="${apvChatT('send')}">
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 10l14-7-4 7 4 7-14-7z" fill="currentColor"/></svg>
          </button>
        </div>
      </div>`;
  },

  bindPanel(item, role, rerender) {
    const key = this.sessionKey(item);
    const input = document.getElementById(`apvAiChatInput-${key}`);
    const sendBtn = document.getElementById(`apvAiChatSend-${key}`);
    if (!input || !sendBtn) return;

    const submit = () => {
      const val = input.value.trim();
      if (!val || this.getSession(item).pending) return;
      input.value = '';
      const session = this.getSession(item);
      session.messages.push({ role: 'user', text: val, sources: null });
      session.pending = true;
      rerender?.();
      window.setTimeout(() => {
        this.sendMessage(item, role, val, { skipUserBubble: true });
        rerender?.();
      }, 680);
    };

    sendBtn.addEventListener('click', submit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    });

    document.querySelectorAll(`#apvAiChat-${key} [data-chat-suggest]`).forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.chatSuggest;
        submit();
      });
    });

    document.querySelectorAll(`#apvAiChat-${key} [data-history-id]`).forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.historyId;
        const hist = this.getAllApprovals().find(a => a.id === id);
        if (!hist || this.getSession(item).pending) return;
        const msg = apvChatT('followHistory', {
          id: hist.id,
          resource: hist.resource,
          status: this.statusLabel(hist.status),
          comment: hist.comment || apvChatT('noComment')
        });
        const session = this.getSession(item);
        session.messages.push({ role: 'user', text: msg, sources: null });
        session.pending = true;
        rerender?.();
        window.setTimeout(() => {
          this.sendMessage(item, role, msg, { skipUserBubble: true });
          rerender?.();
        }, 680);
      });
    });

    const msgBox = document.getElementById(`apvAiChatMessages-${key}`);
    if (msgBox) msgBox.scrollTop = msgBox.scrollHeight;
  }
};
