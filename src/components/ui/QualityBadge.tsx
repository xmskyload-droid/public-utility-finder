import React, { memo } from 'react';
import { QualityBadgeType } from '../../types';

interface Props {
  overall: number;
  cleanliness: number;
  trustScore: number;
  ratingCount: number;
}

function computeQualityBadge(overall: number, cleanliness: number, trustScore: number): QualityBadgeType {
  const composite = overall * 0.5 + cleanliness * 0.3 + (trustScore / 100) * 5 * 0.2;
  if (composite >= 4.3) return 'excellent';
  if (composite >= 3.5) return 'good';
  if (composite >= 2.7) return 'average';
  if (composite >= 1.8) return 'needs_cleaning';
  return 'avoid';
}

const BADGE_META: Record<QualityBadgeType, { label: string; icon: string }> = {
  excellent:      { label: 'Excellent',       icon: '✨' },
  good:           { label: 'Good',            icon: '👍' },
  average:        { label: 'Average',         icon: '🙂' },
  needs_cleaning: { label: 'Needs Cleaning',  icon: '⚠️' },
  avoid:          { label: 'Avoid',           icon: '🚫' },
};

function QualityBadge({ overall, cleanliness, trustScore, ratingCount }: Props) {
  if (ratingCount === 0) return null;
  const type = computeQualityBadge(overall, cleanliness, trustScore);
  const { label, icon } = BADGE_META[type];

  return (
    <div
      className={`quality-badge ${type}`}
      role="status"
      aria-label={`Quality: ${label}`}
      title={`Based on ratings, cleanliness, and trust score`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </div>
  );
}

export default memo(QualityBadge);
export { computeQualityBadge, BADGE_META };
