/**
 * 轻量访问密码门 — 参考 GitHub Pages 原型分享场景
 * 验证态存 localStorage，默认 24h 有效
 */
(function () {
  const cfg = window.XSPARK_SITE || {};
  if (cfg.gateEnabled === false) return;

  const STORAGE_KEY = 'xs-gate-verified';
  const EXPIRY_KEY = 'xs-gate-expiry';
  const hours = cfg.sessionHours || 24;

  function isVerified() {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') return true;
    if (localStorage.getItem(STORAGE_KEY) !== '1') return false;
    const exp = Number(localStorage.getItem(EXPIRY_KEY) || 0);
    if (exp && Date.now() > exp) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EXPIRY_KEY);
      return false;
    }
    return true;
  }

  function markVerified() {
    sessionStorage.setItem(STORAGE_KEY, '1');
    localStorage.setItem(STORAGE_KEY, '1');
    localStorage.setItem(EXPIRY_KEY, String(Date.now() + hours * 3600000));
  }

  function expectedPassword() {
    return String(cfg.accessPassword || 'xsparkops2026');
  }

  function removeOverlay() {
    document.getElementById('xsGateOverlay')?.remove();
  }

  function showGate() {
    if (document.getElementById('xsGateOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'xsGateOverlay';
    overlay.className = 'xs-gate-overlay';
    overlay.innerHTML = `
      <div class="xs-gate-card" role="dialog" aria-labelledby="xsGateTitle">
        <h2 id="xsGateTitle">xSparkOps 原型与 PRD</h2>
        <p>请输入团队访问密码</p>
        <form class="xs-gate-form" id="xsGateForm">
          <div class="xs-gate-field">
            <label for="xsGatePassword">密码</label>
            <input type="password" id="xsGatePassword" placeholder="请输入密码" autocomplete="current-password" autofocus>
            <div class="xs-gate-error" id="xsGateError" aria-live="polite"></div>
          </div>
          <button type="submit" class="xs-gate-submit" id="xsGateSubmit">确定</button>
        </form>
        <div class="xs-gate-brand">内部评审 · 请勿外传链接与密码</div>
      </div>`;

    document.body.appendChild(overlay);

    const form = document.getElementById('xsGateForm');
    const input = document.getElementById('xsGatePassword');
    const err = document.getElementById('xsGateError');
    const btn = document.getElementById('xsGateSubmit');

    form.addEventListener('submit', e => {
      e.preventDefault();
      err.textContent = '';
      const val = (input.value || '').trim();
      if (!val) {
        err.textContent = '请输入密码';
        return;
      }
      btn.disabled = true;
      btn.textContent = '验证中…';
      setTimeout(() => {
        if (val === expectedPassword()) {
          markVerified();
          removeOverlay();
        } else {
          err.textContent = '密码错误，请重新输入';
          input.value = '';
          input.focus();
          btn.disabled = false;
          btn.textContent = '确定';
        }
      }, 280);
    });
  }

  if (isVerified()) return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showGate);
  } else {
    showGate();
  }
})();
