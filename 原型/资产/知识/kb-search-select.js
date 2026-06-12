/**
 * 可搜索下拉选择 — 知识库公开范围等
 */
const KbSearchSelect = {
  instances: {},

  render(id, { label, required, placeholder, value, options, hint, compact }) {
    const selected = options.find(o => o.value === value) ?? options[0];
    const labelHtml = label
      ? `<label class="kb-search-select-label${compact ? ' kb-search-select-label--compact' : ''}" for="${id}Trigger">${label}${required ? ' <span class="kb-create-required">*</span>' : ''}</label>`
      : '';
    return `
      <div class="kb-search-select${compact ? ' kb-search-select--compact' : ''}" id="${id}Wrap" data-kb-search-select="${id}">
        ${labelHtml}
        <div class="kb-search-select-control">
          <button type="button" class="kb-search-select-trigger" id="${id}Trigger" aria-haspopup="listbox" aria-expanded="false">
            ${selected?.badge ? `<span class="kb-tag kb-tag--${selected.badge}">${Knowledge.escapeHtml(selected.label)}</span>` : `<span>${Knowledge.escapeHtml(selected?.label || '')}</span>`}
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>
          <div class="kb-search-select-panel" id="${id}Panel" hidden>
            <div class="kb-search-select-search">
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="4.5" stroke="currentColor" fill="none" stroke-width="1.3"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
              <input type="search" class="kb-search-select-input" id="${id}Search" placeholder="${Knowledge.escapeAttr(placeholder)}" autocomplete="off">
            </div>
            <ul class="kb-search-select-list" id="${id}List" role="listbox">
              ${this.renderOptions(id, options, value, '')}
            </ul>
          </div>
        </div>
        ${hint !== false ? `<p class="kb-search-select-hint" id="${id}Hint">${Knowledge.escapeHtml(hint ?? selected?.desc ?? '')}</p>` : ''}
        <input type="hidden" id="${id}Value" value="${Knowledge.escapeAttr(value ?? '')}">
      </div>`;
  },

  renderOptions(id, options, value, query) {
    const q = query.trim().toLowerCase();
    const filtered = options.filter(o => {
      if (!q) return true;
      return (o.label + ' ' + (o.desc || '')).toLowerCase().includes(q);
    });
    if (!filtered.length) {
      return `<li class="kb-search-select-empty">${typeof XSparkI18n !== 'undefined' ? XSparkI18n.t('knowledge.scopeSearchEmpty') : '无匹配项'}</li>`;
    }
    return filtered.map(o => `
      <li>
        <button type="button" class="kb-search-select-option${o.value === value ? ' selected' : ''}" data-value="${Knowledge.escapeAttr(o.value)}" role="option" aria-selected="${o.value === value}">
          <span class="kb-search-select-option-main">
            ${o.badge ? `<span class="kb-tag kb-tag--${o.badge}">${Knowledge.escapeHtml(o.label)}</span>` : `<strong>${Knowledge.escapeHtml(o.label)}</strong>`}
          </span>
          ${o.desc ? `<span class="kb-search-select-option-desc">${Knowledge.escapeHtml(o.desc)}</span>` : ''}
        </button>
      </li>`).join('');
  },

  bind(id, { options, onChange }) {
    const wrap = document.getElementById(`${id}Wrap`);
    const trigger = document.getElementById(`${id}Trigger`);
    const panel = document.getElementById(`${id}Panel`);
    const search = document.getElementById(`${id}Search`);
    const list = document.getElementById(`${id}List`);
    const hint = document.getElementById(`${id}Hint`);
    const hidden = document.getElementById(`${id}Value`);
    if (!wrap || !trigger || !panel) return;

    const getValue = () => hidden?.value ?? '';

    const setValue = (val) => {
      const opt = options.find(o => o.value === val) ?? options[0];
      if (hidden) hidden.value = opt.value;
      trigger.innerHTML = opt.badge
        ? `<span class="kb-tag kb-tag--${opt.badge}">${Knowledge.escapeHtml(opt.label)}</span><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.4" stroke-linecap="round"/></svg>`
        : `<span>${Knowledge.escapeHtml(opt.label)}</span><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.4" stroke-linecap="round"/></svg>`;
      if (hint) hint.textContent = opt.desc || '';
      list.innerHTML = this.renderOptions(id, options, opt.value, search?.value || '');
      onChange?.(opt.value, opt);
    };

    const close = () => {
      panel.setAttribute('hidden', '');
      trigger.setAttribute('aria-expanded', 'false');
      wrap.classList.remove('open');
    };

    const open = () => {
      document.querySelectorAll('.kb-search-select.open').forEach(el => {
        if (el.id !== `${id}Wrap`) {
          el.classList.remove('open');
          el.querySelector('.kb-search-select-panel')?.setAttribute('hidden', '');
          el.querySelector('.kb-search-select-trigger')?.setAttribute('aria-expanded', 'false');
        }
      });
      panel.removeAttribute('hidden');
      trigger.setAttribute('aria-expanded', 'true');
      wrap.classList.add('open');
      if (search) {
        search.value = '';
        list.innerHTML = this.renderOptions(id, options, getValue(), '');
        search.focus();
      }
    };

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      panel.hasAttribute('hidden') ? open() : close();
    });

    search?.addEventListener('input', () => {
      list.innerHTML = this.renderOptions(id, options, getValue(), search.value);
    });

    search?.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    });

    list?.addEventListener('click', e => {
      const btn = e.target.closest('.kb-search-select-option');
      if (!btn || btn.classList.contains('kb-search-select-empty')) return;
      setValue(btn.dataset.value);
      close();
    });

    this.instances[id] = { close, getValue, setValue, open };
  },

  closeAll() {
    Object.values(this.instances).forEach(i => i.close?.());
  }
};

document.addEventListener('click', e => {
  if (!e.target.closest('.kb-search-select')) KbSearchSelect.closeAll();
});
