import React, { memo } from 'react';

type VerificationTier = 'today' | 'yesterday' | 'this_week' | 'recently' | 'outdated' | 'never';

interface Props {
  lastVerified: string;   // ISO date or empty
  verifiedCount: number;
  showExactDate?: boolean;
}

function getVerificationTier(lastVerified: string): { tier: VerificationTier; label: string } {
  if (!lastVerified) return { tier: 'never', label: '❓ Never verified' };

  const days = Math.floor((Date.now() - new Date(lastVerified).getTime()) / 86400000);

  if (days === 0) return { tier: 'today',     label: '🟢 Verified Today' };
  if (days === 1) return { tier: 'yesterday', label: '🟢 Verified Yesterday' };
  if (days <= 7)  return { tier: 'this_week', label: '🟡 Verified This Week' };
  if (days <= 30) return { tier: 'recently',  label: '🟠 Verified Recently' };
  if (days <= 180) return { tier: 'outdated',  label: '🔴 Verification Outdated' };
  return { tier: 'outdated', label: '🔴 Not Verified in Months' };
}

function VerificationLabel({ lastVerified, verifiedCount, showExactDate = true }: Props) {
  const { tier, label } = getVerificationTier(lastVerified);

  const exactDate = lastVerified
    ? new Date(lastVerified).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div>
      <div className={`verification-label ${tier}`} aria-label={label}>
        <span className="vl-dot" aria-hidden="true" />
        <span className="vl-text">{label}</span>
        {verifiedCount > 0 && (
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: 12 }}>
            · {verifiedCount} {verifiedCount === 1 ? 'user' : 'users'}
          </span>
        )}
      </div>
      {showExactDate && exactDate && (
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>
          {exactDate}
        </div>
      )}
    </div>
  );
}

export default memo(VerificationLabel);
export { getVerificationTier };
