(() => {
  'use strict';

  const EVENTS = Array.isArray(window.EVENTS) ? window.EVENTS : [];
  const META = window.EVENT_META || {};
  const RANGE_START = new Date(Date.UTC(2026, 6, 1));
  const RANGE_END = new Date(Date.UTC(2027, 6, 31));
  const DEFAULT_MONTH = new Date(Date.UTC(2026, 6, 1));

  const CATEGORY_COLORS = {
    'AI & Emerging Tech': '#8b5cf6',
    'Conferences & Summits': '#3b82f6',
    'Developer Events': '#10b981',
    'Cybersecurity Events': '#ef4444',
    'Tech Fests & Expos': '#f59e0b',
    'Startup & Innovation': '#ec4899',
    'Data & Cloud Events': '#06b6d4',
    'Networking & Community': '#6b7280',
    'Gaming & Esports': '#eab308',
    'Awards & Recognition': '#d97706'
  };

  const TIER_INFO = {
    A: { label: 'Fully Verified', icon: '●', color: '#34d399', border: 'rgba(52,211,153,.34)', bg: 'rgba(16,185,129,.10)' },
    B: { label: 'Officially Confirmed', icon: '●', color: '#facc15', border: 'rgba(250,204,21,.32)', bg: 'rgba(234,179,8,.09)' },
    C: { label: 'Directory Listing – Verify', icon: '●', color: '#fb923c', border: 'rgba(251,146,60,.34)', bg: 'rgba(249,115,22,.09)' },
    D: { label: 'Watchlist – Date TBA', icon: '●', color: '#f87171', border: 'rgba(248,113,113,.34)', bg: 'rgba(239,68,68,.09)' }
  };

  const COUNTRY_FLAGS = {
    'United States': '🇺🇸', 'Canada': '🇨🇦', 'Bangladesh': '🇧🇩', 'India': '🇮🇳', 'Pakistan': '🇵🇰',
    'Sri Lanka': '🇱🇰', 'Nepal': '🇳🇵', 'Bhutan': '🇧🇹', 'Maldives': '🇲🇻', 'Afghanistan': '🇦🇫',
    'Germany': '🇩🇪', 'France': '🇫🇷', 'Spain': '🇪🇸', 'Portugal': '🇵🇹', 'United Kingdom': '🇬🇧',
    'Netherlands': '🇳🇱', 'Belgium': '🇧🇪', 'Poland': '🇵🇱', 'Romania': '🇷🇴', 'Sweden': '🇸🇪',
    'Finland': '🇫🇮', 'Norway': '🇳🇴', 'Denmark': '🇩🇰', 'Switzerland': '🇨🇭', 'Austria': '🇦🇹',
    'Italy': '🇮🇹', 'Greece': '🇬🇷', 'Ireland': '🇮🇪', 'Czech Republic': '🇨🇿', 'Hungary': '🇭🇺',
    'South Korea': '🇰🇷', 'Japan': '🇯🇵', 'China': '🇨🇳', 'Singapore': '🇸🇬', 'Malaysia': '🇲🇾',
    'Indonesia': '🇮🇩', 'Thailand': '🇹🇭', 'Vietnam': '🇻🇳', 'Philippines': '🇵🇭', 'Taiwan': '🇹🇼',
    'Hong Kong': '🇭🇰', 'Australia': '🇦🇺', 'New Zealand': '🇳🇿', 'Saudi Arabia': '🇸🇦',
    'United Arab Emirates': '🇦🇪', 'Qatar': '🇶🇦', 'Bahrain': '🇧🇭', 'Oman': '🇴🇲', 'Israel': '🇮🇱',
    'South Africa': '🇿🇦', 'Kenya': '🇰🇪', 'Nigeria': '🇳🇬', 'Egypt': '🇪🇬', 'Morocco': '🇲🇦',
    'Brazil': '🇧🇷', 'Mexico': '🇲🇽', 'Argentina': '🇦🇷', 'Chile': '🇨🇱', 'Colombia': '🇨🇴',
    'Global': '🌐', 'Multiple Countries': '🌐', 'Online': '🌐', 'TBA': '📍'
  };

  const state = {
    currentMonth: new Date(DEFAULT_MONTH),
    search: '',
    region: 'all',
    category: 'all',
    mode: 'all',
    tier: 'all',
    filtered: EVENTS.slice(),
    lastDateEvents: [],
    lastDateLabel: '',
    activeModal: null,
    previousFocus: null
  };

  const els = {
    searchInput: document.getElementById('searchInput'),
    regionFilter: document.getElementById('regionFilter'),
    categoryFilter: document.getElementById('categoryFilter'),
    modeFilter: document.getElementById('modeFilter'),
    tierFilter: document.getElementById('tierFilter'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    activeFilterChips: document.getElementById('activeFilterChips'),
    resultSummary: document.getElementById('resultSummary'),
    monthTitle: document.getElementById('monthTitle'),
    monthJump: document.getElementById('monthJump'),
    prevMonthBtn: document.getElementById('prevMonthBtn'),
    nextMonthBtn: document.getElementById('nextMonthBtn'),
    categoryLegend: document.getElementById('categoryLegend'),
    calendarGrid: document.getElementById('calendarGrid'),
    monthEventCount: document.getElementById('monthEventCount'),
    monthInsight: document.getElementById('monthInsight'),
    monthEventList: document.getElementById('monthEventList'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    eventListModal: document.getElementById('eventListModal'),
    eventDetailModal: document.getElementById('eventDetailModal'),
    watchlistModal: document.getElementById('watchlistModal'),
    eventListModalTitle: document.getElementById('eventListModalTitle'),
    eventListModalSubtitle: document.getElementById('eventListModalSubtitle'),
    dateEventList: document.getElementById('dateEventList'),
    eventDetailContent: document.getElementById('eventDetailContent'),
    backToListBtn: document.getElementById('backToListBtn'),
    openWatchlistBtn: document.getElementById('openWatchlistBtn'),
    watchlistCount: document.getElementById('watchlistCount'),
    watchlistSearch: document.getElementById('watchlistSearch'),
    watchlistContent: document.getElementById('watchlistContent'),
    exportBtn: document.getElementById('exportBtn'),
    toast: document.getElementById('toast')
  };

  function parseDate(value) {
    if (!value || typeof value !== 'string') return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) return null;
    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  }

  function dateKey(date) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function safeValue(value, fallback = 'TBA') {
    const text = String(value ?? '').trim();
    return text && text.toLowerCase() !== 'null' ? text : fallback;
  }

  function isUsableUrl(value) {
    if (!value || value === 'TBA') return false;
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  function formatDate(date, options = {}) {
    if (!date) return 'Date TBA';
    return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(date);
  }

  function formatDateRange(event) {
    const start = event._start;
    const end = event._end;
    if (!start || !end) return 'Date TBA';
    if (dateKey(start) === dateKey(end)) {
      return formatDate(start, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth()) {
      return `${start.getUTCDate()}–${end.getUTCDate()} ${formatDate(start, { month: 'long', year: 'numeric' })}`;
    }
    return `${formatDate(start, { day: 'numeric', month: 'short', year: 'numeric' })} – ${formatDate(end, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  function monthLabel(date) {
    return formatDate(date, { month: 'long', year: 'numeric' });
  }

  function categoryColor(category) {
    return CATEGORY_COLORS[category] || '#64748b';
  }

  function countryFlag(country) {
    return COUNTRY_FLAGS[country] || '📍';
  }

  function normalizeMode(mode) {
    const value = safeValue(mode, 'TBA').toLowerCase();
    if (value.includes('hybrid')) return 'Hybrid';
    if (value.includes('online')) return 'Online';
    if (value.includes('in-person')) return 'In-person';
    return 'TBA';
  }

  function matchesTier(event, filter) {
    if (filter === 'all') return true;
    if (filter === 'confirmed') return event['Verification Tier'] === 'A' || event['Verification Tier'] === 'B';
    if (filter === 'research') return event['Verification Tier'] === 'C' || event['Verification Tier'] === 'D';
    return event['Verification Tier'] === filter;
  }

  function preprocessEvents() {
    EVENTS.forEach((event, index) => {
      event._index = index;
      event._start = parseDate(event['Start Date']);
      event._end = parseDate(event['End Date']) || event._start;
      event._mode = normalizeMode(event.Mode);
      event._search = [
        event.Event, event.Topics, event.Organizer, event.Country, event.Region, event['City / Venue'],
        event['Primary Category'], event['Secondary Categories'], event['Event Type'], event.ID
      ].map(v => safeValue(v, '')).join(' ').toLowerCase();
    });
  }

  function populateFilters() {
    const regions = [...new Set(EVENTS.map(e => e.Region).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const categories = [...new Set(EVENTS.map(e => e['Primary Category']).filter(Boolean))]
      .sort((a, b) => (Object.keys(CATEGORY_COLORS).indexOf(a) - Object.keys(CATEGORY_COLORS).indexOf(b)) || a.localeCompare(b));

    regions.forEach(region => els.regionFilter.add(new Option(region, region)));
    categories.forEach(category => els.categoryFilter.add(new Option(category, category)));

    const monthCursor = new Date(RANGE_START);
    while (monthCursor <= RANGE_END) {
      els.monthJump.add(new Option(monthLabel(monthCursor), dateKey(monthCursor).slice(0, 7)));
      monthCursor.setUTCMonth(monthCursor.getUTCMonth() + 1);
    }
  }

  function renderLegend() {
    els.categoryLegend.innerHTML = Object.entries(CATEGORY_COLORS).map(([name, color]) => `
      <span class="legend-item"><span class="legend-swatch" style="background:${color};color:${color}"></span>${escapeHtml(name)}</span>
    `).join('');
  }

  function applyFilters() {
    const query = state.search.trim().toLowerCase();
    state.filtered = EVENTS.filter(event => {
      if (query && !event._search.includes(query)) return false;
      if (state.region !== 'all' && event.Region !== state.region) return false;
      if (state.category !== 'all' && event['Primary Category'] !== state.category) return false;
      if (state.mode !== 'all' && event._mode !== state.mode) return false;
      if (!matchesTier(event, state.tier)) return false;
      return true;
    });
    renderAll();
  }

  function renderAll() {
    renderFilterStatus();
    renderMetricSelection();
    renderCalendar();
    renderMonthEvents();
    renderWatchlistCount();
  }

  function renderMetricSelection() {
    document.querySelectorAll('[data-tier-quick]').forEach(button => {
      button.classList.toggle('active', button.dataset.tierQuick === state.tier);
    });
  }

  function renderFilterStatus() {
    const chips = [];
    if (state.search) chips.push({ key: 'search', label: `Search: ${state.search}` });
    if (state.region !== 'all') chips.push({ key: 'region', label: state.region });
    if (state.category !== 'all') chips.push({ key: 'category', label: state.category });
    if (state.mode !== 'all') chips.push({ key: 'mode', label: state.mode });
    if (state.tier !== 'all') chips.push({ key: 'tier', label: els.tierFilter.options[els.tierFilter.selectedIndex].text });

    els.activeFilterChips.innerHTML = chips.map(chip => `
      <span class="filter-chip">${escapeHtml(chip.label)}<button type="button" data-clear-filter="${chip.key}" aria-label="Clear ${escapeHtml(chip.label)}">×</button></span>
    `).join('');

    const dated = state.filtered.filter(e => e._start).length;
    const undated = state.filtered.length - dated;
    els.resultSummary.textContent = `${state.filtered.length} matching record${state.filtered.length === 1 ? '' : 's'} · ${dated} dated${undated ? ` · ${undated} undated` : ''}`;
  }

  function getEventsOnDate(date) {
    const time = date.getTime();
    return state.filtered.filter(event => event._start && event._end && event._start.getTime() <= time && event._end.getTime() >= time)
      .sort(sortEvents);
  }

  function sortEvents(a, b) {
    const aStart = a._start ? a._start.getTime() : Number.MAX_SAFE_INTEGER;
    const bStart = b._start ? b._start.getTime() : Number.MAX_SAFE_INTEGER;
    return aStart - bStart || safeValue(a.Event, '').localeCompare(safeValue(b.Event, ''));
  }

  function renderCalendar() {
    const year = state.currentMonth.getUTCFullYear();
    const month = state.currentMonth.getUTCMonth();
    const monthStart = new Date(Date.UTC(year, month, 1));
    const firstGridDate = new Date(monthStart);
    firstGridDate.setUTCDate(firstGridDate.getUTCDate() - firstGridDate.getUTCDay());

    els.monthTitle.textContent = monthLabel(state.currentMonth);
    els.monthJump.value = dateKey(state.currentMonth).slice(0, 7);
    els.prevMonthBtn.disabled = year === 2026 && month === 6;
    els.nextMonthBtn.disabled = year === 2027 && month === 6;

    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const cells = [];

    for (let i = 0; i < 42; i += 1) {
      const date = new Date(firstGridDate);
      date.setUTCDate(firstGridDate.getUTCDate() + i);
      const events = getEventsOnDate(date);
      const isOutside = date.getUTCMonth() !== month;
      const isToday = dateKey(date) === dateKey(todayUTC);
      const uniqueColors = [...new Set(events.map(e => categoryColor(e['Primary Category'])))].slice(0, 8);
      const preview = events.slice(0, 2).map(event => `
        <span class="preview-line" style="--event-color:${categoryColor(event['Primary Category'])}" title="${escapeHtml(event.Event)}">${escapeHtml(event.Event)}</span>
      `).join('');
      const more = events.length > 2 ? `<span class="more-line">+${events.length - 2} more</span>` : '';
      const dots = uniqueColors.map(color => `<span class="event-dot" style="background:${color};color:${color}"></span>`).join('');
      const aria = `${formatDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}${events.length ? `, ${events.length} event${events.length === 1 ? '' : 's'}` : ', no events'}`;

      cells.push(`
        <button class="calendar-day${isOutside ? ' outside' : ''}${isToday ? ' today' : ''}" type="button" role="gridcell" data-date="${dateKey(date)}" aria-label="${escapeHtml(aria)}" ${events.length ? '' : 'data-empty="true"'}>
          <span class="day-head"><span class="day-number">${date.getUTCDate()}</span>${events.length ? `<span class="day-count">${events.length}</span>` : ''}</span>
          ${events.length ? `<span class="event-preview">${preview}${more}</span><span class="event-dots">${dots}</span>` : ''}
        </button>
      `);
    }

    els.calendarGrid.innerHTML = cells.join('');
  }

  function getMonthEvents() {
    const start = new Date(Date.UTC(state.currentMonth.getUTCFullYear(), state.currentMonth.getUTCMonth(), 1));
    const end = new Date(Date.UTC(state.currentMonth.getUTCFullYear(), state.currentMonth.getUTCMonth() + 1, 0));
    return state.filtered.filter(event => event._start && event._end && event._start <= end && event._end >= start).sort(sortEvents);
  }

  function renderMonthEvents() {
    const monthEvents = getMonthEvents();
    els.monthEventCount.textContent = monthEvents.length;

    const tierCounts = monthEvents.reduce((acc, event) => {
      const tier = event['Verification Tier'];
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});
    const countries = new Set(monthEvents.map(e => e.Country).filter(Boolean)).size;
    els.monthInsight.innerHTML = monthEvents.length
      ? `<strong>${(tierCounts.A || 0) + (tierCounts.B || 0)}</strong> confirmed across <strong>${countries}</strong> countr${countries === 1 ? 'y' : 'ies'} · ${tierCounts.C || 0} directory candidate${(tierCounts.C || 0) === 1 ? '' : 's'}`
      : `No dated events match the current filters in <strong>${monthLabel(state.currentMonth)}</strong>.`;

    if (!monthEvents.length) {
      els.monthEventList.innerHTML = emptyState('No monthly events', 'Try another month or clear one of the active filters.');
      return;
    }

    els.monthEventList.innerHTML = monthEvents.map(event => {
      const displayDate = event._start < new Date(Date.UTC(state.currentMonth.getUTCFullYear(), state.currentMonth.getUTCMonth(), 1))
        ? new Date(Date.UTC(state.currentMonth.getUTCFullYear(), state.currentMonth.getUTCMonth(), 1))
        : event._start;
      return `
        <button class="month-event-item" type="button" data-event-index="${event._index}">
          <span class="date-tile"><span>${formatDate(displayDate, { month: 'short' })}</span><strong>${displayDate.getUTCDate()}</strong></span>
          <span>
            <span class="event-item-title">${escapeHtml(event.Event)}</span>
            <span class="event-item-meta">
              <span>${countryFlag(event.Country)} ${escapeHtml(event.Country)}</span>
              <span class="category-badge" style="--badge-color:${categoryColor(event['Primary Category'])}">${escapeHtml(event['Primary Category'])}</span>
            </span>
          </span>
        </button>
      `;
    }).join('');
  }

  function emptyState(title, message) {
    return `<div class="empty-state">
      <div><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p></div>
    </div>`;
  }

  function renderTierBadge(tier) {
    const info = TIER_INFO[tier] || TIER_INFO.D;
    return `<span class="tier-badge" style="--tier-color:${info.color};--tier-border:${info.border};--tier-bg:${info.bg}">${info.icon} ${escapeHtml(info.label)}</span>`;
  }

  function renderDateEventCard(event) {
    return `
      <button class="date-event-card" type="button" data-event-index="${event._index}" style="--event-color:${categoryColor(event['Primary Category'])}">
        <span class="event-color-bar" aria-hidden="true"></span>
        <span>
          <span class="modal-event-title">${escapeHtml(event.Event)}</span>
          <span class="modal-event-meta">
            <span>${countryFlag(event.Country)} ${escapeHtml(event.Country)}</span>
            <span>${escapeHtml(safeValue(event['City / Venue']))}</span>
            <span>${escapeHtml(formatDateRange(event))}</span>
          </span>
        </span>
        <span class="modal-event-badges">
          <span class="category-badge" style="--badge-color:${categoryColor(event['Primary Category'])}">${escapeHtml(event['Primary Category'])}</span>
          <span class="mode-badge">${escapeHtml(event._mode)}</span>
          ${renderTierBadge(event['Verification Tier'])}
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </span>
      </button>
    `;
  }

  function openDateModal(date) {
    const events = getEventsOnDate(date);
    if (!events.length) return;
    state.lastDateEvents = events;
    state.lastDateLabel = formatDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    els.eventListModalTitle.textContent = state.lastDateLabel;
    els.eventListModalSubtitle.textContent = `${events.length} matching event${events.length === 1 ? '' : 's'} on this date`;
    els.dateEventList.innerHTML = events.map(renderDateEventCard).join('');
    showModal(els.eventListModal);
  }

  function detailField(label, value, wide = false) {
    return `<div class="detail-field${wide ? ' wide' : ''}"><span class="detail-label">${escapeHtml(label)}</span><div class="detail-value">${value}</div></div>`;
  }

  function openEventDetail(event, fromList = true) {
    if (!event) return;
    const tier = event['Verification Tier'];
    const official = isUsableUrl(event['Official Event URL'])
      ? `<a class="primary-link" href="${escapeHtml(event['Official Event URL'])}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24"><path d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>Official Website</a>`
      : '';
    const discovery = isUsableUrl(event['Discovery / Listing URL'])
      ? `<a class="secondary-link" href="${escapeHtml(event['Discovery / Listing URL'])}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24"><path d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>Discovery Source</a>`
      : '';

    const secondary = safeValue(event['Secondary Categories'], 'None listed');
    const detailHtml = `
      <section class="detail-hero">
        <div class="detail-kicker">
          <span class="category-badge" style="--badge-color:${categoryColor(event['Primary Category'])}">${escapeHtml(event['Primary Category'])}</span>
          <span class="mode-badge">${escapeHtml(event._mode)}</span>
          ${renderTierBadge(tier)}
        </div>
        <h2 id="detailEventTitle">${escapeHtml(event.Event)}</h2>
        <p class="detail-summary">${countryFlag(event.Country)} ${escapeHtml(formatDateRange(event))} · ${escapeHtml(safeValue(event['City / Venue']))}, ${escapeHtml(safeValue(event.Country))}</p>
        ${(official || discovery) ? `<div class="detail-actions">${official}${discovery}</div>` : ''}
      </section>
      <section class="detail-grid">
        ${detailField('Event ID', escapeHtml(event.ID))}
        ${detailField('Verification Level', renderTierBadge(tier))}
        ${detailField('Date', escapeHtml(formatDateRange(event)))}
        ${detailField('Location', escapeHtml(safeValue(event['City / Venue'])))}
        ${detailField('Country / Region', `${escapeHtml(safeValue(event.Country))} · ${escapeHtml(safeValue(event.Region))}`)}
        ${detailField('Category', escapeHtml(safeValue(event['Primary Category'])))}
        ${detailField('Also related to', escapeHtml(secondary), true)}
        ${detailField('Type', escapeHtml(safeValue(event['Event Type'])))}
        ${detailField('Format', escapeHtml(safeValue(event.Mode)))}
        ${detailField('Topics / Keywords', escapeHtml(safeValue(event.Topics)), true)}
        ${detailField('Registration Fee', escapeHtml(safeValue(event['Published Fee'])))}
        ${detailField('Registration Status', escapeHtml(safeValue(event['Registration Status'])))}
        ${detailField('Deadline', escapeHtml(safeValue(event['CFP / Registration Deadline'])))}
        ${detailField('Organizer', escapeHtml(safeValue(event.Organizer)))}
        ${detailField('Announcement Group', escapeHtml(safeValue(event['Announcement Group'])), true)}
        ${detailField('Source', escapeHtml(safeValue(event['Source Quality'])))}
        ${detailField('Discovery Platform', escapeHtml(safeValue(event['Discovery Platform'])))}
        ${detailField('Last Verified', escapeHtml(event['Last Verified'] ? formatDate(parseDate(event['Last Verified']), { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBA'))}
        ${detailField('Official Event URL', isUsableUrl(event['Official Event URL']) ? `<a href="${escapeHtml(event['Official Event URL'])}" target="_blank" rel="noopener noreferrer">${escapeHtml(event['Official Event URL'])}</a>` : 'Not published', true)}
      </section>
      <p class="detail-note"><strong>⚠ Notes:</strong> ${escapeHtml(safeValue(event['Event Details / Verification Note'], 'No additional note provided.'))}</p>
    `;

    els.eventDetailContent.innerHTML = detailHtml;
    els.backToListBtn.hidden = !fromList || !state.lastDateEvents.length;
    showModal(els.eventDetailModal, !els.modalBackdrop.hidden);
  }

  function renderWatchlistCount() {
    const count = state.filtered.filter(event => !event._start).length;
    els.watchlistCount.textContent = count;
  }

  function renderWatchlist(query = '') {
    const term = query.trim().toLowerCase();
    const items = state.filtered.filter(event => !event._start && (!term || event._search.includes(term))).sort(sortEvents);
    if (!items.length) {
      els.watchlistContent.innerHTML = emptyState('No watchlist matches', 'Clear the watchlist search or change the main filters.');
      return;
    }
    els.watchlistContent.innerHTML = items.map(event => `
      <button class="watchlist-card" type="button" data-event-index="${event._index}" style="--event-color:${categoryColor(event['Primary Category'])}">
        <span class="event-color-bar" aria-hidden="true"></span>
        <span>
          <span class="modal-event-title">${escapeHtml(event.Event)}</span>
          <span class="modal-event-meta"><span>${countryFlag(event.Country)} ${escapeHtml(safeValue(event.Country))}</span><span>${escapeHtml(safeValue(event.Region))}</span><span>${escapeHtml(safeValue(event['Event Type']))}</span></span>
        </span>
        <span class="modal-event-badges">
          <span class="category-badge" style="--badge-color:${categoryColor(event['Primary Category'])}">${escapeHtml(event['Primary Category'])}</span>
          ${renderTierBadge(event['Verification Tier'])}
        </span>
      </button>
    `).join('');
  }

  function showModal(modal, preserveFocus = false) {
    if (!preserveFocus) state.previousFocus = document.activeElement;
    [els.eventListModal, els.eventDetailModal, els.watchlistModal].forEach(item => item.hidden = item !== modal);
    els.modalBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    state.activeModal = modal;
    requestAnimationFrame(() => {
      const focusTarget = modal.querySelector('button, input, select, a[href]');
      focusTarget?.focus();
    });
  }

  function closeModal() {
    els.modalBackdrop.hidden = true;
    [els.eventListModal, els.eventDetailModal, els.watchlistModal].forEach(item => item.hidden = true);
    document.body.style.overflow = '';
    state.activeModal = null;
    if (state.previousFocus && typeof state.previousFocus.focus === 'function') state.previousFocus.focus();
  }

  function goToMonth(delta) {
    const next = new Date(state.currentMonth);
    next.setUTCMonth(next.getUTCMonth() + delta);
    const min = new Date(Date.UTC(2026, 6, 1));
    const max = new Date(Date.UTC(2027, 6, 1));
    if (next < min || next > max) return;
    state.currentMonth = next;
    renderCalendar();
    renderMonthEvents();
  }

  function resetFilters() {
    state.search = '';
    state.region = 'all';
    state.category = 'all';
    state.mode = 'all';
    state.tier = 'all';
    els.searchInput.value = '';
    els.regionFilter.value = 'all';
    els.categoryFilter.value = 'all';
    els.modeFilter.value = 'all';
    els.tierFilter.value = 'all';
    applyFilters();
  }

  function clearSingleFilter(key) {
    if (key === 'search') { state.search = ''; els.searchInput.value = ''; }
    if (key === 'region') { state.region = 'all'; els.regionFilter.value = 'all'; }
    if (key === 'category') { state.category = 'all'; els.categoryFilter.value = 'all'; }
    if (key === 'mode') { state.mode = 'all'; els.modeFilter.value = 'all'; }
    if (key === 'tier') { state.tier = 'all'; els.tierFilter.value = 'all'; }
    applyFilters();
  }

  function csvCell(value) {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  }

  function exportFilteredCsv() {
    const columns = [
      'ID', 'Verification Tier', 'Primary Category', 'Secondary Categories', 'Region', 'Country', 'City / Venue',
      'Event', 'Start Date', 'End Date', 'Event Type', 'Topics', 'Mode', 'Published Fee', 'Registration Status',
      'CFP / Registration Deadline', 'Organizer', 'Official Event URL', 'Source Quality', 'Last Verified', 'Event Details / Verification Note'
    ];
    const rows = [columns.map(csvCell).join(',')];
    state.filtered.forEach(event => rows.push(columns.map(column => csvCell(event[column])).join(',')));
    const blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `technology-events-filtered-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(`Exported ${state.filtered.length} records`);
  }

  let toastTimer;
  function showToast(message) {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add('show');
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2600);
  }

  function bindEvents() {
    let searchTimer;
    els.searchInput.addEventListener('input', event => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { state.search = event.target.value; applyFilters(); }, 80);
    });
    els.regionFilter.addEventListener('change', event => { state.region = event.target.value; applyFilters(); });
    els.categoryFilter.addEventListener('change', event => { state.category = event.target.value; applyFilters(); });
    els.modeFilter.addEventListener('change', event => { state.mode = event.target.value; applyFilters(); });
    els.tierFilter.addEventListener('change', event => { state.tier = event.target.value; applyFilters(); });
    els.resetFiltersBtn.addEventListener('click', resetFilters);
    els.prevMonthBtn.addEventListener('click', () => goToMonth(-1));
    els.nextMonthBtn.addEventListener('click', () => goToMonth(1));
    els.monthJump.addEventListener('change', event => {
      const [year, month] = event.target.value.split('-').map(Number);
      state.currentMonth = new Date(Date.UTC(year, month - 1, 1));
      renderCalendar();
      renderMonthEvents();
    });

    document.querySelectorAll('[data-tier-quick]').forEach(button => {
      button.addEventListener('click', () => {
        state.tier = button.dataset.tierQuick;
        els.tierFilter.value = state.tier;
        applyFilters();
      });
    });

    els.activeFilterChips.addEventListener('click', event => {
      const button = event.target.closest('[data-clear-filter]');
      if (button) clearSingleFilter(button.dataset.clearFilter);
    });

    els.calendarGrid.addEventListener('click', event => {
      const day = event.target.closest('[data-date]');
      if (!day || day.dataset.empty === 'true') return;
      openDateModal(parseDate(day.dataset.date));
    });

    els.monthEventList.addEventListener('click', event => {
      const item = event.target.closest('[data-event-index]');
      if (item) {
        state.lastDateEvents = [];
        openEventDetail(EVENTS[Number(item.dataset.eventIndex)], false);
      }
    });

    els.dateEventList.addEventListener('click', event => {
      const card = event.target.closest('[data-event-index]');
      if (card) openEventDetail(EVENTS[Number(card.dataset.eventIndex)], true);
    });

    els.watchlistContent.addEventListener('click', event => {
      const card = event.target.closest('[data-event-index]');
      if (card) {
        state.lastDateEvents = [];
        openEventDetail(EVENTS[Number(card.dataset.eventIndex)], false);
      }
    });

    els.backToListBtn.addEventListener('click', () => {
      if (state.lastDateEvents.length) showModal(els.eventListModal, true);
    });

    els.openWatchlistBtn.addEventListener('click', () => {
      els.watchlistSearch.value = '';
      renderWatchlist();
      showModal(els.watchlistModal);
    });
    els.watchlistSearch.addEventListener('input', event => renderWatchlist(event.target.value));
    els.exportBtn.addEventListener('click', exportFilteredCsv);

    document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeModal));
    els.modalBackdrop.addEventListener('click', event => { if (event.target === els.modalBackdrop) closeModal(); });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !els.modalBackdrop.hidden) closeModal();
      if (event.key === '/' && els.modalBackdrop.hidden && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault();
        els.searchInput.focus();
      }
      if (event.altKey && event.key === 'ArrowLeft') goToMonth(-1);
      if (event.altKey && event.key === 'ArrowRight') goToMonth(1);
      if (event.key === 'Tab' && state.activeModal) trapFocus(event, state.activeModal);
    });
  }

  function trapFocus(event, modal) {
    const focusable = [...modal.querySelectorAll('button:not([hidden]):not(:disabled), input:not(:disabled), select:not(:disabled), a[href]')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function validateDataset() {
    const duplicateIds = EVENTS.length - new Set(EVENTS.map(e => e.ID)).size;
    if (duplicateIds) console.warn(`Dataset contains ${duplicateIds} duplicate IDs.`);
    if (EVENTS.length !== Number(META.totalRecords || EVENTS.length)) console.warn('Dataset count differs from metadata.', EVENTS.length, META.totalRecords);
  }

  function init() {
    preprocessEvents();
    validateDataset();
    populateFilters();
    renderLegend();
    bindEvents();
    applyFilters();
  }

  init();
})();
