/**
 * 审批 AI 总结 — 基于审批项内容的规则化风险分析（原型）
 */
const ApprovalAiSummaryEngine = {
  formatMarkdown(text) {
    return String(text)
      .split('\n\n')
      .map(p => {
        const line = p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        return `<p>${line}</p>`;
      })
      .join('');
  },

  riskLevelClass(level) {
    return { high: 'apv-ai-risk-high', medium: 'apv-ai-risk-medium', low: 'apv-ai-risk-low' }[level] || 'apv-ai-risk-medium';
  },

  riskLevelLabel(level) {
    return { high: '高风险', medium: '中风险', low: '低风险' }[level] || '待评估';
  },

  summarize(item, role) {
    const d = item.detail || {};
    const typeLabel = APPROVAL_TYPE_LABELS[item.type] || item.type;
    const analyzers = {
      l3_exec: () => this.analyzeL3(item, d, role, typeLabel),
      platform_publish: () => this.analyzePlatform(item, d, role, typeLabel),
      skillhub_publish: () => this.analyzeSkillhub(item, d, role, typeLabel)
    };
    return (analyzers[item.type] || (() => this.analyzeGeneric(item, role, typeLabel)))();
  },

  roleHint(role) {
    if (role === 'approver') return '审批前 AI 总结：帮助您在通过/拒绝前识别潜在风险与关注点';
    if (role === 'submitter') return '提交前 AI 总结：帮助您在提交前自查风险，减少驳回概率';
    return 'AI 总结：基于审批项内容的潜在风险分析';
  },

  analyzeL3(item, d, role, typeLabel) {
    const input = (d.runInput || '').toLowerCase();
    const config = (d.configSummary || '').toLowerCase();
    const auth = (d.authScope || '').toLowerCase();
    const risks = [];
    const recs = [];

    if (/修复|脚本|写|delete|exec|kubectl apply/.test(input + config)) {
      risks.push('Run 输入或配置涉及**自动修复/写操作**，执行后果不可逆');
    }
    if (/mcp|tool|外部/.test(config) && !/只读|禁止写/.test(auth)) {
      risks.push('绑定了外部 MCP/Tool，且授权说明未明确禁止写操作');
    }
    if (/知识库|读写|导出/.test(config + auth)) {
      risks.push('涉及知识库或数据读写，存在数据外泄面');
    }
    if (item.resource === 'ops-assistant') {
      risks.push('历史同类 Agent 曾出现 MCP 权限过大被驳回记录');
    }

    const level = risks.length >= 3 ? 'high' : risks.length >= 1 ? 'medium' : 'low';

    if (role === 'submitter') {
      recs.push('缩小 MCP/Tool 授权至最小必要集合，并在授权说明中写明禁止项');
      recs.push('若含写操作，补充回滚方案与影响范围说明');
    } else {
      recs.push('核对 Run 输入是否超出工单/任务既定范围');
      recs.push('确认授权能力与 Workspace 策略一致，必要时要求发起人补充说明');
      if (level === 'high') recs.push('建议暂缓通过，要求发起人缩小权限或改为只读模式');
    }

    return {
      title: `${typeLabel} · ${item.resource}`,
      riskLevel: level,
      score: level === 'high' ? 78 : level === 'medium' ? 52 : 28,
      risks: risks.length ? risks : ['当前配置未发现显著高风险信号，仍建议人工复核执行边界'],
      recommendations: recs,
      summary: [
        `**对象**：${item.resourceType} \`${item.resource}\` · Workspace **${item.workspace}**`,
        `**风险评级**：${this.riskLevelLabel(level)}（综合分 ${level === 'high' ? 78 : level === 'medium' ? 52 : 28}/100）`,
        risks.length ? `**主要风险**：\n${risks.map(r => `- ${r}`).join('\n')}` : '',
        `**建议**：\n${recs.map(r => `- ${r}`).join('\n')}`
      ].filter(Boolean).join('\n\n')
    };
  },

  analyzePlatform(item, d, role, typeLabel) {
    const risks = [];
    const recs = [];
    const review = (d.aiReview || '').toLowerCase();
    const change = (d.changeLog || '').toLowerCase();
    const boundary = (d.riskBoundary || '').toLowerCase();

    if (/export|导出|写|mcp|git/.test(change + review + item.resource)) {
      risks.push('变更或资源名暗示**数据导出/写权限**能力，需重点复核范围');
    }
    if (/权限|过大|复核|待审核/.test(review)) {
      risks.push('AI 预审已提示需人工复核项，不可直接采信自动结论');
    }
    if (!boundary || boundary === '—') {
      risks.push('风险边界未填写或过于模糊');
    }
    if (item.status === 'rejected' || /驳回|拒绝/.test(item.comment || '')) {
      risks.push('同类资源曾有驳回记录，可能重复踩坑');
    }

    const level = risks.length >= 2 ? 'high' : risks.length >= 1 ? 'medium' : 'low';

    if (role === 'submitter') {
      recs.push('在变更说明中逐条列出新增 Tool/MCP 及权限级别');
      recs.push('填写明确的风险边界（只读/限额/禁止自动执行等）');
      if (/export|导出/.test(item.resource + change)) recs.push('导出类能力建议预设行数上限并声明数据分级');
    } else {
      recs.push('对照 AI 预审报告与版本变更，确认无隐式权限扩张');
      recs.push('验证用途说明与 Workspace 业务场景匹配');
      if (level === 'high') recs.push('可要求发起人提交缩小权限后的修订版再审批');
    }

    return {
      title: `${typeLabel} · ${item.resource} ${item.version || ''}`.trim(),
      riskLevel: level,
      score: level === 'high' ? 72 : level === 'medium' ? 48 : 22,
      risks: risks.length ? risks : ['发布内容整体风险可控，建议关注版本变更细节'],
      recommendations: recs,
      summary: [
        `**对象**：${item.resourceType} \`${item.resource}\` v${item.version || '—'} → **${d.publishScope || item.workspace}**`,
        `**风险评级**：${this.riskLevelLabel(level)}`,
        risks.length ? `**主要风险**：\n${risks.map(r => `- ${r}`).join('\n')}` : '',
        d.aiReview ? `**AI 预审参考**：${d.aiReview}` : '',
        `**建议**：\n${recs.map(r => `- ${r}`).join('\n')}`
      ].filter(Boolean).join('\n\n')
    };
  },

  analyzeSkillhub(item, d, role, typeLabel) {
    const risks = [];
    const recs = [];
    const scan = (d.securityScan || '').toLowerCase();
    const review = (d.aiReview || '').toLowerCase();

    if (/需补充|未通过|高危|cve/.test(scan + review)) {
      risks.push('安全扫描或 AI 审核存在待补充/未通过项');
    }
    if (/全平台|公开|开放/.test((d.publishNote || '') + item.workspace)) {
      risks.push('上架范围为全平台/公开，影响面大于 Workspace 内发布');
    }
    if (!d.publishNote || d.publishNote === '—') {
      risks.push('发布说明不完整，审批人难以判断目标受众与使用约束');
    }
    if ((d.tags || []).length === 0) {
      risks.push('标签缺失，集市检索与分类治理较弱');
    }

    const level = risks.length >= 2 ? 'high' : risks.length >= 1 ? 'medium' : 'low';

    if (role === 'submitter') {
      recs.push('补充数据处理、权限依赖与禁止场景说明');
      recs.push('完善 Skillhub 展示文案与安全扫描所需材料');
      if (level !== 'low') recs.push('先完成安全扫描整改后再提交，可显著缩短审批周期');
    } else {
      recs.push('核对安全扫描报告与 Skill 实际能力是否一致');
      recs.push('确认集市分类、标签与目标用户群匹配');
      if (level === 'high') recs.push('建议驳回并列出需补充的安全与说明项');
    }

    return {
      title: `${typeLabel} · ${item.resource}`,
      riskLevel: level,
      score: level === 'high' ? 68 : level === 'medium' ? 45 : 20,
      risks: risks.length ? risks : ['集市上架材料较完整，风险相对可控'],
      recommendations: recs,
      summary: [
        `**对象**：Skill \`${item.resource}\` v${item.version || '—'} · ${d.category || '未分类'}`,
        `**风险评级**：${this.riskLevelLabel(level)}`,
        risks.length ? `**主要风险**：\n${risks.map(r => `- ${r}`).join('\n')}` : '',
        `**建议**：\n${recs.map(r => `- ${r}`).join('\n')}`
      ].filter(Boolean).join('\n\n')
    };
  },

  analyzeGeneric(item, role, typeLabel) {
    return {
      title: `${typeLabel} · ${item.resource}`,
      riskLevel: 'medium',
      score: 40,
      risks: ['审批项信息有限，建议结合详情字段人工判断'],
      recommendations: role === 'submitter'
        ? ['补充完整的用途说明与风险边界后再提交']
        : ['逐项核对详情字段后再做审批决定'],
      summary: '**风险评级**：中风险\n\n建议查看完整审批详情后决策。'
    };
  }
};
