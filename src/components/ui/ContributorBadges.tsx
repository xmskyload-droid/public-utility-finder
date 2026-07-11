import React, { memo } from 'react';
import { ContributorBadge, ContributorBadgeType } from '../../types';

const BADGE_META: Record<ContributorBadgeType, { name: string; icon: string; description: string }> = {
  first_contribution:    { name: 'First Contribution', icon: '🏅', description: 'Added their first toilet' },
  explorer:              { name: 'Explorer',            icon: '🧭', description: 'Reported 10+ locations' },
  cleanliness_inspector: { name: 'Cleanliness Inspector', icon: '🧼', description: 'Rated cleanliness 50+ times' },
  district_champion:     { name: 'District Champion',  icon: '🏆', description: 'Most active in their district' },
  top_verifier:          { name: 'Top Verifier',       icon: '✅', description: 'Verified 100+ toilets' },
  trusted_verifier:      { name: 'Trusted Verifier',   icon: '🔒', description: 'High-accuracy verification record' },
  local_guide:           { name: 'Local Guide',        icon: '🗺️', description: 'Contributed to 5+ areas' },
  guardian:              { name: 'Guardian',           icon: '🛡️', description: 'Reported 20+ issues resolved' },
  expert_reviewer:       { name: 'Expert Reviewer',   icon: '✍️', description: 'Written 25+ detailed reviews' },
};

interface Props {
  badges: ContributorBadgeType[];
  maxVisible?: number;
  size?: 'sm' | 'md';
}

function ContributorBadges({ badges, maxVisible = 4, size = 'sm' }: Props) {
  if (!badges || badges.length === 0) return null;

  const visible = badges.slice(0, maxVisible);
  const extra = badges.length - maxVisible;

  return (
    <div className="contributor-badges-row" role="list" aria-label="Contributor badges">
      {visible.map((type) => {
        const meta = BADGE_META[type];
        return (
          <span
            key={type}
            className={`contrib-badge ${type}`}
            title={meta.description}
            role="listitem"
            aria-label={`${meta.name}: ${meta.description}`}
          >
            {meta.icon} {size === 'md' ? meta.name : meta.icon}
          </span>
        );
      })}
      {extra > 0 && (
        <span
          className="contrib-badge first_contribution"
          aria-label={`${extra} more badges`}
        >
          +{extra} more
        </span>
      )}
    </div>
  );
}

export default memo(ContributorBadges);
export { BADGE_META };
