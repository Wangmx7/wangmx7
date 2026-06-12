/** 知识库列表 mock — 样式与字段参考设计稿（临时.ccs） */
const KNOWLEDGE_CONSOLE_URL =
  'https://xcloud.lenovo.com/xspark/console/projects/1/knowledge-base/833/directory/2675';

const KNOWLEDGE_MOCK = {
  consoleUrl: KNOWLEDGE_CONSOLE_URL,
  items: [
    {
      id: 'kb-1',
      name: '测试用例知识库',
      tag: 'private',
      workspace: '人工智能实验室',
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
      tag: 'team',
      workspace: 'IT 运维 Workspace',
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
      tag: 'private',
      workspace: 'Default Workspace',
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
      tag: 'team',
      workspace: '人工智能实验室',
      docCount: 24,
      sliceCount: 67,
      refCount: 19,
      owner: '陈研发',
      updatedAt: '2025-05-28 11:20',
      url: KNOWLEDGE_CONSOLE_URL
    }
  ]
};
