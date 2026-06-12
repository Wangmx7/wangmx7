/**
 * 审批 AI 总结 — 按审批类型 / 资源类型生成差异化风险分析（原型）
 */
function apvAiT(k, p) {
  return typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('approval.ai.' + k, p) : null;
}

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
    const i18n = apvAiT('riskLevels.' + level);
    if (i18n && !i18n.startsWith('approval.ai.')) return i18n;
    return { high: '高风险', medium: '中风险', low: '低风险' }[level] || '待评估';
  },

  getSummaryKey(item) {
    if (item.type === 'platform_publish') {
      if (item.resourceType === 'KnowledgeBase') return 'platform_publish_knowledge';
      if (item.resourceType === 'Skill') return 'platform_publish_skill';
      return 'platform_publish_agent';
    }
    return item.type || 'generic';
  },

  summaryTitle(item) {
    const key = this.getSummaryKey(item);
    const i18n = apvAiT('titles.' + key);
    if (i18n && !i18n.startsWith('approval.ai.')) return i18n;
    const fallbacks = {
      l3_exec: 'L3 执行风险分析',
      platform_publish_agent: 'Agent 平台发布分析',
      platform_publish_skill: 'Skill 平台发布分析',
      platform_publish_knowledge: '知识库发布分析',
      skillhub_publish: 'Skillhub 上架分析'
    };
    return fallbacks[key] || 'AI 风险总结';
  },

  roleHint(item, role) {
    const key = this.getSummaryKey(item);
    const i18n = apvAiT('hints.' + key + '.' + role);
    if (i18n && !i18n.startsWith('approval.ai.')) return i18n;
    const typeLabel = APPROVAL_TYPE_LABELS[item.type] || item.type;
    if (role === 'approver') return `审批前 · ${typeLabel}：识别关键风险后再做通过/拒绝决定`;
    if (role === 'submitter') return `提交前 · ${typeLabel}：自查材料完整性，降低驳回概率`;
    return `${typeLabel} 风险回顾`;
  },

  summarize(item, role) {
    const d = item.detail || {};
    const typeLabel = APPROVAL_TYPE_LABELS[item.type] || item.type;
    const key = this.getSummaryKey(item);
    const analyzers = {
      l3_exec: () => this.analyzeL3(item, d, role, typeLabel),
      platform_publish_agent: () => this.analyzeAgentPublish(item, d, role, typeLabel),
      platform_publish_skill: () => this.analyzeSkillPlatformPublish(item, d, role, typeLabel),
      platform_publish_knowledge: () => this.analyzeKnowledgePublish(item, d, role, typeLabel),
      skillhub_publish: () => this.analyzeSkillhub(item, d, role, typeLabel)
    };
    return (analyzers[key] || (() => this.analyzeGeneric(item, role, typeLabel)))();
  },

  analyzeL3(item, d, role, typeLabel) {
    const input = (d.runInput || '').toLowerCase();
    const config = (d.configSummary || '').toLowerCase();
    const auth = (d.authScope || '').toLowerCase();
    const risks = [];
    const recs = [];
    const focus = [];

    focus.push('**分析维度**：Run 输入范围 · Tool/MCP 权限 · 执行可逆性 · 数据读写边界');

    if (/修复|脚本|写|delete|exec|kubectl apply|apply/.test(input + config)) {
      risks.push('Run 输入或配置涉及**自动修复/写操作**，执行后果可能不可逆');
    }
    if (/mcp|tool|外部/.test(config) && !/只读|禁止写/.test(auth)) {
      risks.push('绑定了外部 MCP/Tool，授权说明未明确禁止写操作');
    }
    if (/知识库|读写|导出|export/.test(config + auth)) {
      risks.push('涉及知识库或数据读写，存在数据外泄面');
    }
    if (d.workflow && /incident|prod|生产/.test((d.workflow || '') + input)) {
      risks.push('Workflow 指向生产/故障场景，误操作影响面较大');
    }
    if (item.resource === 'ops-assistant') {
      risks.push('历史同类 Agent 曾出现 MCP 权限过大被驳回记录');
    }
    if (item.resourceType === 'Skill' && /kubectl|k8s/.test(config) && !/只读/.test(auth)) {
      risks.push('Skill 含 K8s 相关能力，需确认非写操作');
    }

    const level = risks.length >= 3 ? 'high' : risks.length >= 1 ? 'medium' : 'low';
    const score = level === 'high' ? 78 : level === 'medium' ? 52 : 28;

    if (role === 'submitter') {
      recs.push('缩小 MCP/Tool 授权至最小必要集合，授权说明中写明禁止项');
      recs.push('若含写操作，补充回滚方案、影响范围与审批触发条件');
      recs.push('Run 输入尽量结构化，避免开放式「自动修复」类描述');
    } else {
      recs.push('逐项核对 Run 输入是否超出工单/任务既定范围');
      recs.push('确认授权能力与 Workspace L3 策略一致');
      if (level === 'high') recs.push('建议暂缓通过，要求发起人缩小权限或改为只读模式');
    }

    return {
      title: `${typeLabel} · ${item.resource}`,
      riskLevel: level,
      score,
      risks: risks.length ? risks : ['当前 L3 配置未发现显著高风险信号，仍建议人工复核执行边界'],
      recommendations: recs,
      summary: [
        focus.join('\n'),
        `**对象**：${item.resourceType} \`${item.resource}\`${d.workflow ? ` · Workflow \`${d.workflow}\`` : ''} · **${item.workspace}**`,
        `**风险评级**：${this.riskLevelLabel(level)}（综合分 ${score}/100）`,
        risks.length ? `**主要风险**：\n${risks.map(r => `- ${r}`).join('\n')}` : '',
        `**建议**：\n${recs.map(r => `- ${r}`).join('\n')}`
      ].filter(Boolean).join('\n\n')
    };
  },

  analyzeAgentPublish(item, d, role, typeLabel) {
    const risks = [];
    const recs = [];
    const review = (d.aiReview || '').toLowerCase();
    const change = (d.changeLog || '').toLowerCase();
    const boundary = (d.riskBoundary || '').toLowerCase();
    const focus = [];

    focus.push('**分析维度**：Prompt/模型变更 · Tool/MCP 权限 · RAG 链路 · 版本影响面');

    if (/mcp|tool|git|写|export|导出/.test(change + review + item.resource)) {
      risks.push('版本变更或预审提示涉及 **Tool/MCP/导出** 能力扩张');
    }
    if (/rag|知识库|检索/.test(change)) {
      risks.push('新增或调整 RAG/知识库检索，需核对数据源敏感级与可见范围');
    }
    if (/gpt|模型|model/.test(change)) {
      risks.push('默认模型升级可能改变输出风格与成本，需评估业务兼容性');
    }
    if (/权限|过大|复核|待审核/.test(review)) {
      risks.push('AI 预审已提示需人工复核项，不可直接采信自动结论');
    }
    if (!boundary || boundary === '—') {
      risks.push('风险边界未填写或过于模糊');
    }
    if (item.status === 'rejected' || /驳回|拒绝/.test(item.comment || '')) {
      risks.push('同类 Agent 曾有驳回记录，可能重复踩坑');
    }

    const level = risks.length >= 2 ? 'high' : risks.length >= 1 ? 'medium' : 'low';
    const score = level === 'high' ? 72 : level === 'medium' ? 48 : 22;

    if (role === 'submitter') {
      recs.push('在变更说明中逐条列出新增 Tool/MCP、模型与 RAG 变更');
      recs.push('填写明确的风险边界（只读/限额/禁止自动执行等）');
      recs.push('对照 AI 预审报告逐条整改后再提交');
    } else {
      recs.push('对照 AI 预审报告与版本变更，确认无隐式权限扩张');
      recs.push('验证用途说明与 Workspace 业务场景匹配');
      if (level === 'high') recs.push('可要求提交缩小权限后的修订版再审批');
    }

    return {
      title: `${typeLabel} · Agent ${item.resource} ${item.version || ''}`.trim(),
      riskLevel: level,
      score,
      risks: risks.length ? risks : ['Agent 发布材料整体风险可控，建议关注版本变更细节'],
      recommendations: recs,
      summary: [
        focus.join('\n'),
        `**对象**：Agent \`${item.resource}\` v${item.version || '—'} → **${d.publishScope || item.workspace}**`,
        `**风险评级**：${this.riskLevelLabel(level)}（${score}/100）`,
        risks.length ? `**主要风险**：\n${risks.map(r => `- ${r}`).join('\n')}` : '',
        d.aiReview ? `**AI 预审参考**：${d.aiReview}` : '',
        `**建议**：\n${recs.map(r => `- ${r}`).join('\n')}`
      ].filter(Boolean).join('\n\n')
    };
  },

  analyzeSkillPlatformPublish(item, d, role, typeLabel) {
    const risks = [];
    const recs = [];
    const review = (d.aiReview || '').toLowerCase();
    const change = (d.changeLog || '').toLowerCase();
    const purpose = (d.purpose || '').toLowerCase();
    const focus = [];

    focus.push('**分析维度**：数据导出范围 · 依赖 Tool · 调用配额 · 业务场景匹配');

    if (/export|导出|csv|json|备份|batch/.test(change + review + item.resource + purpose)) {
      risks.push('Skill 含**数据导出/批量处理**能力，需复核行数上限与数据分级');
    }
    if (/写|delete|exec|kubectl/.test(change + review)) {
      risks.push('变更说明涉及写操作或执行类能力');
    }
    if (/权限|复核|export/.test(review)) {
      risks.push('AI 预审对导出或权限范围提出复核要求');
    }
    if (!d.riskBoundary || d.riskBoundary === '—') {
      risks.push('未声明导出上限或禁止场景，审批难以量化风险');
    }

    const level = risks.length >= 2 ? 'high' : risks.length >= 1 ? 'medium' : 'low';
    const score = level === 'high' ? 70 : level === 'medium' ? 46 : 24;

    if (role === 'submitter') {
      recs.push('明确单次导出上限、支持格式与禁止导出的数据类型');
      recs.push('说明 Skill 依赖的外部系统与只读/读写属性');
    } else {
      recs.push('核对导出能力与 Workspace 数据分级策略是否一致');
      recs.push('确认用途说明覆盖典型误用场景（如全量导出）');
      if (level === 'high') recs.push('建议要求补充限额配置或改为审批后导出');
    }

    return {
      title: `${typeLabel} · Skill ${item.resource} ${item.version || ''}`.trim(),
      riskLevel: level,
      score,
      risks: risks.length ? risks : ['Skill 发布风险相对可控，建议确认导出与依赖说明'],
      recommendations: recs,
      summary: [
        focus.join('\n'),
        `**对象**：Skill \`${item.resource}\` v${item.version || '—'} → **${d.publishScope || item.workspace}**`,
        `**风险评级**：${this.riskLevelLabel(level)}（${score}/100）`,
        risks.length ? `**主要风险**：\n${risks.map(r => `- ${r}`).join('\n')}` : '',
        d.aiReview ? `**AI 预审参考**：${d.aiReview}` : '',
        `**建议**：\n${recs.map(r => `- ${r}`).join('\n')}`
      ].filter(Boolean).join('\n\n')
    };
  },

  analyzeKnowledgePublish(item, d, role, typeLabel) {
    const risks = [];
    const recs = [];
    const review = (d.aiReview || '').toLowerCase();
    const change = (d.changeLog || '').toLowerCase();
    const boundary = (d.riskBoundary || '').toLowerCase();
    const scope = (d.publishScope || item.workspace || '').toLowerCase();
    const config = (d.configSummary || '').toLowerCase();
    const focus = [];

    focus.push('**分析维度**：文档敏感级 · 可见范围 · 检索授权 · Agent 引用面');

    if (/公开|全平台|public|开放/.test(scope + change + boundary)) {
      risks.push('发布范围为**公开/全平台**，检索暴露面大于 Workspace 内');
    }
    if (/敏感|机密|pii|个人|密码|密钥/.test(review + change + config)) {
      risks.push('AI 预审或变更说明涉及**敏感文档/PII**，需人工抽检');
    }
    if (/读写|写|导出/.test(config + boundary)) {
      risks.push('知识库配置含读写或导出相关描述，需确认仅检索不含写权限');
    }
    if (/权限|复核|待审核|检查/.test(review)) {
      risks.push('AI 预审提示文档分级或 Agent 检索权限需复核');
    }
    if (!d.purpose || d.purpose === '—') {
      risks.push('用途说明缺失，难以判断允许被哪些 Agent/场景引用');
    }
    if (!boundary || boundary === '—') {
      risks.push('风险边界未说明禁止检索的数据类型或场景');
    }

    const level = risks.length >= 3 ? 'high' : risks.length >= 1 ? 'medium' : 'low';
    const score = level === 'high' ? 74 : level === 'medium' ? 50 : 26;

    if (role === 'submitter') {
      recs.push('完成文档敏感级标注，移除或隔离含 PII/密钥的切片');
      recs.push('明确公开范围（不公开 / 公开）及允许引用的 Agent 列表');
      recs.push('在风险边界中写明禁止对外问答的场景与数据类型');
    } else {
      recs.push('抽检高敏感文档切片与可见范围配置是否一致');
      recs.push('确认发布范围与 Workspace 数据合规要求匹配');
      if (/公开|全平台/.test(scope)) recs.push('全平台公开建议增加管理员二次确认或限流策略');
      if (level === 'high') recs.push('建议驳回并要求完成敏感文档整改后重新提交');
    }

    return {
      title: `${typeLabel} · 知识库 ${item.resource} ${item.version || ''}`.trim(),
      riskLevel: level,
      score,
      risks: risks.length ? risks : ['知识库发布材料较完整，建议抽检文档敏感级'],
      recommendations: recs,
      summary: [
        focus.join('\n'),
        `**对象**：知识库 \`${item.resource}\` v${item.version || '—'} → **${d.publishScope || item.workspace}**`,
        d.configSummary ? `**库内概况**：${d.configSummary}` : '',
        `**风险评级**：${this.riskLevelLabel(level)}（${score}/100）`,
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
    const focus = [];

    focus.push('**分析维度**：安全扫描 · 集市曝光面 · 分类标签 · 用户告知义务');

    if (/需补充|未通过|高危|cve|密钥/.test(scan + review)) {
      risks.push('安全扫描或 AI 审核存在**待补充/未通过**项');
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
    if (!d.hubPreview?.desc || d.hubPreview.desc.length < 10) {
      risks.push('集市展示简介过短，用户难以预判 Skill 能力边界');
    }

    const level = risks.length >= 2 ? 'high' : risks.length >= 1 ? 'medium' : 'low';
    const score = level === 'high' ? 68 : level === 'medium' ? 45 : 20;

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
      score,
      risks: risks.length ? risks : ['集市上架材料较完整，风险相对可控'],
      recommendations: recs,
      summary: [
        focus.join('\n'),
        `**对象**：Skill \`${item.resource}\` v${item.version || '—'} · ${d.category || '未分类'}`,
        `**风险评级**：${this.riskLevelLabel(level)}（${score}/100）`,
        risks.length ? `**主要风险**：\n${risks.map(r => `- ${r}`).join('\n')}` : '',
        d.securityScan ? `**安全扫描**：${d.securityScan}` : '',
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
