// Minimal, resilient enhancements for navigation and header behavior
// Author: Chef Abby UI — implemented with attention to a11y and performance

(function () {
  const header = document.getElementById('siteHeader');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  // Dark mode and reduced motion toggles removed per product decision
  const tabs = document.querySelectorAll('.tab');
  const searchInput = document.getElementById('recipeSearch');
  const sortSelect = document.getElementById('recipeSort');
  const grid = document.getElementById('recipeGrid');
  const emptyState = document.getElementById('emptyState');

  // Preference keys
  // Preference keys removed (we default to dark mode; motion uses system/standard CSS)

  // Determine system preferences as sensible defaults
  const systemPrefersDark = () => true; // Force dark by default
  const systemPrefersReduced = () => false;

  // Apply theme and motion attributes to <html> for CSS to consume
  const applyTheme = (theme) => document.documentElement.setAttribute('data-theme', theme);
  const applyMotion = () => {};

  // Update toggle button labels for clarity (no symbols)
  const updateToggleLabels = () => {
    if (themeToggle) {
      const t = document.documentElement.getAttribute('data-theme');
      const system = systemPrefersDark() ? 'dark' : 'light';
      let label = 'Dark: ';
      if (localStorage.getItem(THEME_KEY)) label += (t === 'dark' ? 'On' : 'Off');
      else label += `Auto (${system})`;
      themeToggle.textContent = label;
    }
    if (motionToggle) {
      const m = document.documentElement.getAttribute('data-motion');
      const systemReduced = systemPrefersReduced();
      let label = 'Motion: ';
      if (localStorage.getItem(MOTION_KEY)) label += (m === 'reduced' ? 'Reduced' : 'Full');
      else label += `Auto (${systemReduced ? 'Reduced' : 'Full'})`;
      motionToggle.textContent = label;
    }
  };

  // Load saved preferences or fallback to system
  // Always apply dark theme on load
  applyTheme('dark');

  // 1) Sticky shadow on scroll: visually separates content from header
  const toggleHeaderShadow = () => {
    if (!header) return;
    if (window.scrollY > 6) header.classList.add('has-shadow');
    else header.classList.remove('has-shadow');
  };
  window.addEventListener('scroll', toggleHeaderShadow, { passive: true });
  toggleHeaderShadow();

  // 2) Mobile menu toggle with ARIA state management
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on outside click for better UX
    document.addEventListener('click', (evt) => {
      if (!navLinks.classList.contains('is-open')) return;
      const target = evt.target;
      const withinMenu = navLinks.contains(target);
      const withinButton = hamburger.contains(target);
      if (!withinMenu && !withinButton) {
        navLinks.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 3) Removed toggle handlers; site runs in dark by default

  // 5) Recipe filtering and sorting (client-only, data-attributes driven)
  /**
   * getCards: return array of card anchors
   */
  const getCards = () => Array.from(grid ? grid.querySelectorAll('.card') : []);

  /**
   * applyFilterAndSort: filter by active tab + search, then sort
   */
  const applyFilterAndSort = () => {
    if (!grid) return;
    const activeTab = document.querySelector('.tab.is-active');
    const category = activeTab ? activeTab.getAttribute('data-category') : 'all';
    const query = (searchInput?.value || '').trim().toLowerCase();
    const sort = sortSelect?.value || 'az';

    const cards = getCards();
    let visibleCount = 0;

    cards.forEach((card) => {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const cat = card.getAttribute('data-category') || 'all';
      const matchesCat = category === 'all' || category === cat;
      const matchesText = !query || title.includes(query);
      const show = matchesCat && matchesText;
      card.style.display = show ? '' : 'none';
      if (show) visibleCount += 1;
    });

    // Sorting among visible cards only
    const visible = cards.filter((c) => c.style.display !== 'none');
    const comparator = {
      az: (a, b) => a.getAttribute('data-title').localeCompare(b.getAttribute('data-title')),
      za: (a, b) => b.getAttribute('data-title').localeCompare(a.getAttribute('data-title')),
      new: (a, b) => new Date(b.getAttribute('data-date')) - new Date(a.getAttribute('data-date')),
      old: (a, b) => new Date(a.getAttribute('data-date')) - new Date(b.getAttribute('data-date')),
      pop: (a, b) => Number(b.getAttribute('data-popularity')) - Number(a.getAttribute('data-popularity')),
    }[sort] || ((a, b) => 0);

    visible.sort(comparator).forEach((card) => grid.appendChild(card));

    if (emptyState) emptyState.hidden = visibleCount !== 0;
  };

  // Tabs behavior
  if (tabs.length) {
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
        applyFilterAndSort();
      });
    });
  }

  // Search, sort listeners
  if (searchInput) searchInput.addEventListener('input', applyFilterAndSort, { passive: true });
  if (sortSelect) sortSelect.addEventListener('change', applyFilterAndSort);

  // Initial filter/sort on load
  applyFilterAndSort();
})();


