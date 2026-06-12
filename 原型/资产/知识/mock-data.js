/** 知识库列表 mock — 公开范围：workspace（不公开）/ public（公开） */
const KNOWLEDGE_CONSOLE_URL =
  'https://xcloud.lenovo.com/xspark/console/projects/1/knowledge-base/833/directory/2675';

const KNOWLEDGE_MOCK = {
  consoleUrl: KNOWLEDGE_CONSOLE_URL,
  items: [
    {
      id: 'kb-1',
      name: '测试用例知识库',
      tag: 'workspace',
      workspace: '人工智能实验室',
      status: 'draft',
      docCount: 17,
      sliceCount: 9,
      refCount: 12,
      owner: '王小明',
      updatedAt: '2025-03-12 18:25',
      url: KNOWLEDGE_CONSOLE_URL
    },
    {
      id: 'kb-2',
      name: '研发 Wiki 摘录',
      tag: 'public',
      workspace: 'Default Workspace',
      status: 'published',
      docCount: 210,
      sliceCount: 680,
      refCount: 45,
      owner: '王小明',
      updatedAt: '2025-03-12 18:25',
      url: KNOWLEDGE_CONSOLE_URL
    },
    {
      id: 'kb-3',
      name: 'IT 运维手册',
      tag: 'workspace',
      workspace: 'IT 运维 Workspace',
      status: 'published',
      docCount: 42,
      sliceCount: 128,
      refCount: 28,
      owner: '李运维',
      updatedAt: '2025-06-08 14:30',
      url: KNOWLEDGE_CONSOLE_URL
    },
    {
      id: 'kb-4',
      name: '产品 FAQ 知识库',
      tag: 'public',
      workspace: '人工智能实验室',
      status: 'published',
      docCount: 86,
      sliceCount: 240,
      refCount: 63,
      owner: '张产品',
      updatedAt: '2025-06-05 09:12',
      url: KNOWLEDGE_CONSOLE_URL
    },
    {
      id: 'kb-5',
      name: '安全策略与合规',
      tag: 'workspace',
      workspace: 'Default Workspace',
      status: 'rejected',
      rejectComment: '含未脱敏内部制度文档，请完成敏感级标注后重新提交',
      docCount: 31,
      sliceCount: 95,
      refCount: 8,
      owner: '赵安全',
      updatedAt: '2025-06-01 16:48',
      url: KNOWLEDGE_CONSOLE_URL
    },
    {
      id: 'kb-6',
      name: 'Agent 开发指南',
      tag: 'workspace',
      workspace: '人工智能实验室',
      status: 'draft',
      docCount: 24,
      sliceCount: 67,
      refCount: 19,
      owner: '陈研发',
      updatedAt: '2025-05-28 11:20',
      url: KNOWLEDGE_CONSOLE_URL
    },
    {
      id: 'kb-7',
      name: '客服话术库',
      tag: 'workspace',
      workspace: '人工智能实验室',
      status: 'pending_approval',
      approvalId: 'apv_kb_01',
      docCount: 56,
      sliceCount: 142,
      refCount: 7,
      owner: '王小明',
      updatedAt: '2025-06-10 11:00',
      url: KNOWLEDGE_CONSOLE_URL
    },
    {
      id: 'kb-8',
      name: '平台通用术语表',
      tag: 'public',
      workspace: 'Default Workspace',
      status: 'published',
      docCount: 8,
      sliceCount: 22,
      refCount: 2,
      owner: '王小明',
      updatedAt: '2025-06-09 09:30',
      url: KNOWLEDGE_CONSOLE_URL
    }
  ]
};
