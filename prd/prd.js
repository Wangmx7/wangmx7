const PrdHub = {
  items: [],
  activePath: '',

  async init() {
    const nav = document.getElementById('prdNav');
    try {
      const res = await fetch('manifest.json');
      const data = await res.json();
      this.items = data.items || [];
      this.renderNav();
      const q = new URLSearchParams(location.search).get('doc');
      if (q) this.loadDoc(decodeURIComponent(q));
    } catch (e) {
      nav.innerHTML = '<p class="prd-error">无法加载 PRD 目录</p>';
    }
  },

  renderNav() {
    const groups = {};
    this.items.forEach(item => {
      if (!groups[item.module]) groups[item.module] = [];
      groups[item.module].push(item);
    });
    const nav = document.getElementById('prdNav');
    nav.innerHTML = Object.keys(groups).map(mod => `
      <div class="prd-nav-group">
        <h3>${mod}</h3>
        ${groups[mod].map(it => `
          <button type="button" class="prd-nav-item${this.activePath === it.path ? ' active' : ''}"
            data-path="${it.path}">${it.title}</button>`).join('')}
      </div>`).join('');
    nav.querySelectorAll('.prd-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.loadDoc(btn.dataset.path);
        history.replaceState(null, '', `?doc=${encodeURIComponent(btn.dataset.path)}`);
      });
    });
  },

  async loadDoc(path) {
    this.activePath = path;
    this.renderNav();
    const box = document.getElementById('prdContent');
    box.innerHTML = '<div class="prd-loading">加载中…</div>';
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const md = await res.text();
      box.innerHTML = typeof marked !== 'undefined' ? marked.parse(md) : `<pre>${md}</pre>`;
    } catch (e) {
      box.innerHTML = `<div class="prd-error">加载失败：${path}</div>`;
    }
  }
};

PrdHub.init();
