const ApprovalFilterEngine = {
  emptyFilters() {
    return {
      typeDropdown: '',
      resourceType: '',
      historyStatus: '',
      workspace: '',
      search: ''
    };
  },

  apply(items, filters, tab, currentUser) {
    return items.filter(item => {
      if (tab === 'pending') {
        if (item.status !== 'pending' || item.assignedTo !== currentUser) return false;
      } else if (tab === 'history') {
        if (item.status === 'pending') return false;
      } else if (tab === 'mine') {
        if (item.submitter !== currentUser) return false;
      }

      if (filters.typeDropdown && item.type !== filters.typeDropdown) return false;
      if (filters.workspace && item.workspace !== filters.workspace) return false;
      if (filters.resourceType && item.resourceType !== filters.resourceType) return false;

      if (tab === 'history' && filters.historyStatus && item.status !== filters.historyStatus) {
        return false;
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        const blob = [item.resource, item.submitter, item.workspace, APPROVAL_TYPE_LABELS[item.type]].join(' ').toLowerCase();
        if (!blob.includes(q)) return false;
      }

      return true;
    });
  },

  getPendingStats(items, currentUser) {
    const pending = items.filter(i => i.status === 'pending' && i.assignedTo === currentUser);
    return {
      l3_exec: pending.filter(i => i.type === 'l3_exec').length,
      platform_publish: pending.filter(i => i.type === 'platform_publish').length,
      skillhub_publish: pending.filter(i => i.type === 'skillhub_publish').length,
      total: pending.length
    };
  }
};
