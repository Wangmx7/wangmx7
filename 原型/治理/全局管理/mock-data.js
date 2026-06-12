/** 全平台 Global 管理 mock（超级管理员 · Global WorkSpace） */
const GLOBAL_ADMIN_MOCK = {
  configTabs: [
    { id: 'users', labelKey: 'configTabs.users' },
    { id: 'admission', labelKey: 'configTabs.admission' },
    { id: 'cluster', labelKey: 'configTabs.cluster' },
    { id: 'assets', labelKey: 'configTabs.assets' },
    { id: 'mount', labelKey: 'configTabs.mount' },
    { id: 'sandbox', labelKey: 'configTabs.sandbox' },
    { id: 'roles', labelKey: 'configTabs.roles' },
    { id: 'model-visibility', labelKey: 'configTabs.modelVisibility' }
  ],
  totalUsers: 132,
  users: [
    { id: 'u1', initial: 'M', avatarColor: '#7C3AED', nameEn: 'Mengxiao MX7 Wang', nameZh: '王梦晓', email: 'wangmx7@lenovo.com', role: 'admin', enabled: true },
    { id: 'u2', initial: 'B', avatarColor: '#2563EB', nameEn: 'Bin', nameZh: '王军', email: 'bin.wang1@lenovo.com', role: 'admin', enabled: true },
    { id: 'u3', initial: 'F', avatarColor: '#0891B2', nameEn: 'FANG W.', nameZh: '王军', email: 'fwang7@lenovo.com', role: 'user', enabled: true },
    { id: 'u4', initial: 'J', avatarColor: '#059669', nameEn: 'Jin Xiao', nameZh: '肖晋', email: 'xiao.jin@lenovo.com', role: 'user', enabled: true },
    { id: 'u5', initial: 'L', avatarColor: '#DB2777', nameEn: 'Li Wei', nameZh: '李伟', email: 'li.wei@lenovo.com', role: 'user', enabled: false },
    { id: 'u6', initial: 'Z', avatarColor: '#EA580C', nameEn: 'Zhang Min', nameZh: '张敏', email: 'zhang.min@lenovo.com', role: 'admin', enabled: true }
  ]
};
