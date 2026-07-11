import React, { memo } from 'react';
import { UtilityCategoryMeta } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const UTILITY_CATEGORIES: UtilityCategoryMeta[] = [
  { id: 'toilet',              label: 'Toilets',     icon: '🚻', active: true,  comingSoon: false },
  { id: 'drinking_water',      label: 'Water',       icon: '🚰', active: false, comingSoon: true },
  { id: 'ev_charging',         label: 'EV Charging', icon: '⚡', active: false, comingSoon: true },
  { id: 'parking',             label: 'Parking',     icon: '🅿️', active: false, comingSoon: true },
  { id: 'accessible_facility', label: 'Accessible',  icon: '♿', active: false, comingSoon: true },
  { id: 'atm',                 label: 'ATM',         icon: '🏧', active: false, comingSoon: true },
  { id: 'first_aid',           label: 'First Aid',   icon: '🩺', active: false, comingSoon: true },
  { id: 'police',              label: 'Police',      icon: '🚔', active: false, comingSoon: true },
];

function UtilityNav() {
  const { filters, setFilter } = useAppStore();
  const activeCategory = filters.activeCategory ?? 'toilet';

  return (
    <nav
      className="utility-nav"
      aria-label="Utility categories"
      role="tablist"
    >
      {UTILITY_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          className={`utility-tab ${activeCategory === cat.id ? 'active' : ''} ${cat.comingSoon ? 'coming-soon' : ''}`}
          onClick={() => {
            if (!cat.comingSoon) {
              setFilter('activeCategory' as any, cat.id);
            }
          }}
          disabled={cat.comingSoon}
          role="tab"
          aria-selected={activeCategory === cat.id}
          aria-label={`${cat.label}${cat.comingSoon ? ' (coming soon)' : ''}`}
          id={`utility-tab-${cat.id}`}
          title={cat.comingSoon ? `${cat.label} — Coming Soon` : cat.label}
          style={cat.comingSoon ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          {cat.comingSoon && <span className="utility-tab-soon">Soon</span>}
          <span className="utility-tab-icon" aria-hidden="true">{cat.icon}</span>
          <span className="utility-tab-label">{cat.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default memo(UtilityNav);
