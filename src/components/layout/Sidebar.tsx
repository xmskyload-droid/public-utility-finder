import React, { memo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Toilet } from '../../types';
import { formatDistance } from '../../lib/utils';
import t from '../../lib/i18n';
import ConfidenceRing from '../ui/ConfidenceRing';
import { SkeletonList } from '../ui/SkeletonCard';
import UtilityNav from '../ui/UtilityNav';

const filters_config = [
  { key: 'free',           label: 'Free',        icon: '💰' },
  { key: 'openNow',        label: 'Open Now',    icon: '🟢' },
  { key: 'wheelchair',     label: 'Wheelchair',  icon: '♿' },
  { key: 'babyChange',     label: 'Baby Change', icon: '🚼' },
  { key: 'shower',         label: 'Shower',      icon: '🚿' },
  { key: 'clean4plus',     label: 'Clean 4★+',   icon: '⭐' },
  { key: 'is24h',          label: '24 Hours',    icon: '🕒' },
  { key: 'verifiedRecently', label: 'Verified',  icon: '✅' },
  { key: 'femaleFriendly', label: 'Female-Safe', icon: '🚺' },
] as const;

// Memoized toilet card — only re-renders when toilet or selection changes
const ToiletCard = memo(function ToiletCard({
  toilet, selected, onClick,
}: { toilet: Toilet; selected: boolean; onClick: () => void }) {
  const statusClass = toilet.status === 'open' ? 'open'
    : toilet.status === 'probably_open' ? 'probably-open'
    : toilet.status === 'closed' ? 'closed' : 'unknown';

  const statusLabel = toilet.status === 'open' ? '🟢 Open'
    : toilet.status === 'probably_open' ? '🟡 Probably Open'
    : toilet.status === 'closed' ? '🔴 Closed' : '⚪ Unknown';

  const stars = Math.round(toilet.ratings.overall);

  return (
    <article
      className={`toilet-card ${selected ? 'selected' : ''}`}
      onClick={(e) => {
        console.log('ToiletCard rendering:', toilet);
        onClick();
      }}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      id={`toilet-card-${toilet.id}`}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      aria-label={`${toilet.name}, ${toilet.area}, ${statusLabel}, ${toilet.free ? 'Free' : `₹${toilet.entryFee}`}`}
    >
      <div className="toilet-card-score" aria-hidden="true">
        <ConfidenceRing score={toilet.confidenceScore} label={toilet.trustLabel} size={56} />
      </div>

      <div className="toilet-card-info">
        <div className="toilet-card-name" title={toilet.name}>{toilet.name}</div>
        <div className="toilet-card-address">{toilet.area}, {toilet.city}</div>

        <div className="toilet-card-meta">
          <span className="toilet-card-rating" aria-label={`${toilet.ratings.overall.toFixed(1)} stars`}>
            {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
            <span style={{ marginLeft: 3, color: 'var(--color-text-secondary)', fontWeight: 400 }}>
              {toilet.ratings.overall.toFixed(1)}
            </span>
          </span>
          {toilet.distance !== undefined && (
            <span className="toilet-card-distance" aria-label={`${formatDistance(toilet.distance)}, ${toilet.walkMinutes} minute walk`}>
              {formatDistance(toilet.distance)} · {toilet.walkMinutes}min
            </span>
          )}
        </div>

        <div className="toilet-card-badges" aria-label="Toilet features">
          <span className={`mini-badge ${statusClass}`}>{statusLabel}</span>
          <span className={`mini-badge ${toilet.free ? 'free' : 'paid'}`}>
            {toilet.free ? '✓ Free' : `₹${toilet.entryFee}`}
          </span>
          {toilet.wheelchair && <span className="mini-badge" style={{ borderColor: '#3B82F6', color: '#3B82F6', background: 'rgba(59,130,246,0.08)' }}>♿</span>}
          {toilet.babyChange && <span className="mini-badge">🚼</span>}
          {toilet.womensSafety && toilet.womensSafety.score >= 7 && <span className="mini-badge" style={{ borderColor: '#8B5CF6', color: '#8B5CF6', background: 'rgba(139,92,246,0.08)' }}>🚺 Safe</span>}
        </div>

        <div className="toilet-card-extra">
          <div className="toilet-card-extra-grid">
            <div className="extra-item">
              <span className="extra-label">Hours:</span>
              <span className="extra-val">{toilet.hours === '24 hours' ? '24h' : toilet.hours}</span>
            </div>
            <div className="extra-item">
              <span className="extra-label">Verified:</span>
              <span className="extra-val">{toilet.lastVerified || 'Never'}</span>
            </div>
            <div className="extra-item">
              <span className="extra-label">Cleanliness:</span>
              <span className="extra-val">⭐ {toilet.ratings.cleanliness ? toilet.ratings.cleanliness.toFixed(1) : 'N/A'}</span>
            </div>
            <div className="extra-item">
              <span className="extra-label">Reviews:</span>
              <span className="extra-val">{toilet.ratingCount || 0}</span>
            </div>
          </div>
          <div className="toilet-card-actions">
            <button
              className="action-btn primary"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              📍 Go
            </button>
            <button
              className="action-btn"
              onClick={(e) => {
                e.stopPropagation();
                alert('Saved to favorites!');
              }}
            >
              ♥ Save
            </button>
            <button
              className="action-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(`${window.location.origin}/toilet/${toilet.id}`);
                alert('Share link copied to clipboard!');
              }}
            >
              🔗 Share
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

export default function Sidebar() {
  const {
    isSidebarOpen, filteredToilets, selectedToilet, selectToilet,
    filters, setFilter, clearFilters, isLoadingToilets,
  } = useAppStore();

  const activeCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'searchQuery' && k !== 'activeCategory' && v === true
  ).length;

  return (
    <aside
      className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}
      aria-label="Nearby toilets"
      aria-hidden={!isSidebarOpen}
    >
      {/* Utility Category Nav */}
      <UtilityNav />

      {/* Header */}
      <div className="sidebar-header">
        <span className="sidebar-title">Nearby Toilets</span>
        <span className="sidebar-count" aria-live="polite" aria-atomic="true">
          {filteredToilets.length} found
        </span>
      </div>

      {/* Filters */}
      <div className="filter-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="filter-label">Smart Filters</span>
          {activeCount > 0 && (
            <button
              className="filter-clear"
              onClick={clearFilters}
              aria-label={`Clear all ${activeCount} filters`}
            >
              Clear all ({activeCount})
            </button>
          )}
        </div>
        <div className="filter-chips" role="group" aria-label="Filter options">
          {filters_config.map((f) => (
            <button
              key={f.key}
              className={`filter-chip ${(filters as any)[f.key] ? 'active' : ''}`}
              onClick={() => setFilter(f.key as any, !(filters as any)[f.key])}
              id={`filter-${f.key}`}
              aria-pressed={(filters as any)[f.key]}
              aria-label={`Filter by ${f.label}`}
            >
              <span className="filter-chip-icon" aria-hidden="true">{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toilet List */}
      <div className="toilet-list" role="list" aria-label="Toilet results">
        {isLoadingToilets ? (
          <SkeletonList count={5} />
        ) : filteredToilets.length === 0 ? (
          <div className="empty-state" role="status" aria-live="polite">
            <div className="empty-state-icon" aria-hidden="true">🚻</div>
            <div className="empty-state-title">No toilets found</div>
            <div className="empty-state-subtitle">Try adjusting your filters</div>
          </div>
        ) : (
          filteredToilets.map((toilet) => (
            <ToiletCard
              key={toilet.id}
              toilet={toilet}
              selected={selectedToilet?.id === toilet.id}
              onClick={() => selectToilet(toilet)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
