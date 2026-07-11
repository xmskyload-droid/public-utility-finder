import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import t from '../../lib/i18n';

const SearchIcon = () => (
  <svg className="navbar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default function Navbar() {
  const { filters, setFilter, filteredToilets, toggleSidebar, isSidebarOpen, user } = useAppStore();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allToilets = useAppStore((s) => s.toilets);
  const q = filters.searchQuery;

  const suggestions = q.length >= 2
    ? allToilets.filter(t =>
        t.name.toLowerCase().includes(q.toLowerCase()) ||
        t.city.toLowerCase().includes(q.toLowerCase()) ||
        t.area.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 6)
    : [];

  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    k !== 'searchQuery' && v === true
  ).length;

  return (
    <nav className="navbar">
      <a className="navbar-logo" href="#">
        <div className="navbar-logo-icon">🚻</div>
        <span className="navbar-logo-text">NearLoo</span>
      </a>

      <div className="navbar-search">
        <SearchIcon />
        <input
          ref={inputRef}
          className="navbar-search-input"
          placeholder={t('nav.search_placeholder')}
          value={filters.searchQuery}
          onChange={(e) => {
            setFilter('searchQuery', e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          id="search-input"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="navbar-search-suggestions">
            {suggestions.map((t) => (
              <div
                key={t.id}
                className="navbar-search-suggestion"
                onMouseDown={() => {
                  setFilter('searchQuery', t.name);
                  useAppStore.getState().selectToilet(t);
                  setShowSuggestions(false);
                }}
              >
                <span>🚻</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t.area}, {t.city}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="navbar-actions">
        <button
          className={`btn-icon ${isSidebarOpen ? 'active' : ''}`}
          onClick={toggleSidebar}
          title="Toggle sidebar"
          id="toggle-sidebar-btn"
        >
          <MenuIcon />
        </button>
        <button
          className={`btn-icon ${activeFilterCount > 0 ? 'active' : ''}`}
          onClick={toggleSidebar}
          title="Filters"
          id="filters-btn"
          style={{ position: 'relative' }}
        >
          <FilterIcon />
          {activeFilterCount > 0 && (
            <span className="filter-count-badge">{activeFilterCount}</span>
          )}
        </button>
        <div className="user-avatar" title={user?.displayName} id="user-avatar">
          {user?.displayName?.charAt(0) ?? 'U'}
        </div>
      </div>
    </nav>
  );
}
