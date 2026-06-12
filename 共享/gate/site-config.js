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
   * GitHub Pages 仓库名（URL 形如 https://user.github.io/仓库名/）
   * 例：仓库名为 xsparkops → 填 'xsparkops'
   * 用户/组织主页仓库（user.github.io）或独立域名 → 留空 ''
   */
  repoSegment: 'wangmx7',
  /** 是否启用密码门 */
  gateEnabled: true
};
