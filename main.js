// Minimal, resilient enhancements for navigation and header behavior
// Author: Chef Abby UI — implemented with attention to a11y and performance

(function () {
  const header = document.getElementById('siteHeader');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const themeToggle = document.getElementById('themeToggle');
  const motionToggle = document.getElementById('motionToggle');
  const tabs = document.querySelectorAll('.tab');
  const searchInput = document.getElementById('recipeSearch');
  const sortSelect = document.getElementById('recipeSort');
  const grid = document.getElementById('recipeGrid');
  const emptyState = document.getElementById('emptyState');

  // Preference keys
  const THEME_KEY = 'chefAbby.theme'; // 'dark' | 'light'
  const MOTION_KEY = 'chefAbby.motion'; // 'reduced' | 'full'

  // Determine system preferences as sensible defaults
  const systemPrefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const systemPrefersReduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Apply theme and motion attributes to <html> for CSS to consume
  const applyTheme = (theme) => document.documentElement.setAttribute('data-theme', theme);
  const applyMotion = (motion) => document.documentElement.setAttribute('data-motion', motion);

  // Load saved preferences or fallback to system
  const savedTheme = localStorage.getItem(THEME_KEY);
  const savedMotion = localStorage.getItem(MOTION_KEY);
  applyTheme(savedTheme || (systemPrefersDark() ? 'dark' : 'light'));
  applyMotion(savedMotion || (systemPrefersReduced() ? 'reduced' : 'full'));

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

  // 3) Theme toggle handler
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
      themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
      themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
    });
    // Initialize icon state
    const initial = document.documentElement.getAttribute('data-theme');
    themeToggle.textContent = initial === 'dark' ? '🌙' : '☀️';
  }

  // 4) Motion toggle handler
  if (motionToggle) {
    motionToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-motion') || 'full';
      const next = current === 'reduced' ? 'full' : 'reduced';
      applyMotion(next);
      localStorage.setItem(MOTION_KEY, next);
      motionToggle.textContent = next === 'reduced' ? '🚫🌀' : '🌀';
      motionToggle.setAttribute('aria-pressed', String(next === 'reduced'));
    });
    // Initialize icon state
    const initial = document.documentElement.getAttribute('data-motion');
    motionToggle.textContent = initial === 'reduced' ? '🚫🌀' : '🌀';
  }

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


