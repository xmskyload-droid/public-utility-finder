import React, { memo } from 'react';

export const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-ring" />
      <div className="skeleton-content">
        <div className="skeleton skeleton-line medium" />
        <div className="skeleton skeleton-line short thin" />
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          <div className="skeleton skeleton-line thin" style={{ width: 60 }} />
          <div className="skeleton skeleton-line thin" style={{ width: 45 }} />
          <div className="skeleton skeleton-line thin" style={{ width: 30 }} />
        </div>
      </div>
    </div>
  );
});

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}
