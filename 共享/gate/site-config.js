/**
 * 站点共享配置 — GitHub Pages 部署前请修改 accessPassword
 * 本地开发可将 gateEnabled 设为 false
 */
window.XSPARK_SITE = {
  /** 团队访问密码（明文，仅用于轻量门禁；勿用于敏感数据） */
  accessPassword: 'xsparkops',
  /** 登录态有效时长（小时） */
  sessionHours: 24,
  /**
   * 静态托管路径前缀
   * - Vercel / 独立域名：留空 ''
   * - GitHub Pages 子路径（user.github.io/仓库名/）：填仓库名
   */
  repoSegment: '',
  /** 是否启用密码门 */
  gateEnabled: true
};
