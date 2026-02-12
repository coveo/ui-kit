// Client-side JavaScript inlined into the docs wrapper page.
//
// Two responsibilities:
//   1. Initialize the Atomic search box with docs.coveo.com public credentials
//   2. Sidebar navigation with hash-based routing
//
// The placeholder __DEFAULT_STORY__ is replaced at build time by template.mjs.

// ── Search box initialization ──────────────────────────────────────────────

(async () => {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = document.querySelector('#docs-search');
  await searchInterface.initialize({
    accessToken: 'xx6ac9d08f-eb9a-48d5-9240-d7c251470c93',
    organizationId: 'coveosearch',
  });
})();

// ── Sidebar navigation & hash routing ──────────────────────────────────────

(() => {
  const iframe = document.getElementById('story-frame');
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');

  function viewModeFor(id) {
    return id.endsWith('--docs') ? 'docs' : 'story';
  }

  function navigateTo(id) {
    if (!id) return;
    const viewMode = viewModeFor(id);
    iframe.src = `iframe.html?id=${encodeURIComponent(id)}&viewMode=${viewMode}`;
    updateActive(id);
    sidebar.classList.remove('open');
  }

  function updateActive(id) {
    sidebar.querySelectorAll('.docs-sidebar__item.active').forEach((el) => {
      el.classList.remove('active');
    });
    const active = sidebar.querySelector(`[data-id="${id}"]`);
    if (active) {
      active.classList.add('active');
      const parent = active.closest('.docs-sidebar__group');
      if (parent) parent.classList.add('open');
      const section = active.closest('.docs-sidebar__section');
      if (section) section.classList.add('open');
      active.scrollIntoView({block: 'nearest'});
    }
  }

  sidebar.addEventListener('click', (e) => {
    // Group title buttons: toggle expand/collapse
    const groupTitle = e.target.closest('.docs-sidebar__group-title');
    if (groupTitle) {
      const group = groupTitle.closest('.docs-sidebar__group');
      if (group) group.classList.toggle('open');
      return;
    }

    const link = e.target.closest('a[data-id]');
    if (link) {
      e.preventDefault();
      const id = link.getAttribute('data-id');
      window.location.hash = id;
      navigateTo(id);
    }
  });

  window.addEventListener('hashchange', () => {
    const id = window.location.hash.slice(1);
    if (id) navigateTo(id);
  });

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  const initialId = window.location.hash.slice(1) || '__DEFAULT_STORY__';
  navigateTo(initialId);
})();
