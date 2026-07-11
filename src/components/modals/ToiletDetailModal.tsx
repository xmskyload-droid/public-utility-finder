import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Toilet, CommunityPhoto } from '../../types';
import ConfidenceRing from '../ui/ConfidenceRing';
import HeroCarousel from '../ui/HeroCarousel';
import QualityBadge from '../ui/QualityBadge';
import VerificationLabel from '../ui/VerificationLabel';
import AvailabilityIndicator from '../ui/AvailabilityIndicator';
import QRCodeModal from '../ui/QRCodeModal';
import ContributorBadges from '../ui/ContributorBadges';
import { useSuccessToast } from '../ui/SuccessToast';
import { formatDistance, formatDuration } from '../../lib/utils';
import { getWalkingRoute, getDrivingRoute, buildGoogleMapsUrl } from '../../lib/routing';
import t from '../../lib/i18n';

type Tab = 'info' | 'ratings' | 'photos' | 'reviews' | 'navigate';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const RATING_AXES = [
  { key: 'cleanliness', label: '🧼 Cleanliness' },
  { key: 'water',       label: '💧 Water'       },
  { key: 'paper',       label: '🧻 Paper'       },
  { key: 'smell',       label: '🌬️ Smell'      },
  { key: 'lighting',    label: '💡 Lighting'    },
  { key: 'privacy',     label: '🔒 Privacy'     },
  { key: 'maintenance', label: '🔧 Maintenance' },
  { key: 'mirror',      label: '🪞 Mirror'      },
] as const;

function StarDisplay({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <span aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1,2,3,4,5].map((s) => (
        <span key={s} style={{ color: s <= rounded ? '#F59E0B' : 'rgba(255,255,255,0.15)', fontSize: 14 }}>★</span>
      ))}
    </span>
  );
}

function safetyValueClass(val: string): string {
  if (['excellent','good','high','busy','yes','true'].includes(val.toLowerCase())) return 'good';
  if (['poor','low','none'].includes(val.toLowerCase())) return 'poor';
  return 'moderate';
}

// ─── Women's Safety Section ───────────────────────────────────────────────────
const WomensSafetySection = memo(function WomensSafetySection({ toilet }: { toilet: Toilet }) {
  const ws = toilet.womensSafety;
  const score = ws?.score ?? null;
  const scoreColor = score === null ? '#6B7280'
    : score >= 7 ? '#10B981'
    : score >= 4 ? '#F59E0B'
    : '#EF4444';

  const items = [
    { icon: '💡', label: 'Lighting',         value: ws?.lighting ?? 'unknown' },
    { icon: '🔒', label: 'Door Lock',        value: ws?.doorLockQuality ?? 'unknown' },
    { icon: '🚺', label: "Women's Area",      value: ws?.separateWomensArea ? 'yes' : 'no' },
    { icon: '👁️', label: 'Visibility',       value: ws?.visibility ?? 'unknown' },
    { icon: '👥', label: 'Nearby Crowd',      value: ws?.nearbyCrowdLevel ?? 'unknown' },
    { icon: '👮', label: 'Security',          value: ws?.securityPresence ? 'yes' : 'no' },
    { icon: '📞', label: 'Emergency Contact', value: ws?.emergencyContactAvailable ? 'yes' : 'no' },
  ];

  return (
    <div className="womens-safety-card" aria-label="Women's safety information">
      <div className="womens-safety-header">
        <div className="womens-safety-icon" aria-hidden="true">🚺</div>
        <div>
          <div className="womens-safety-title">Women's Safety</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            Community-assessed safety indicators
          </div>
        </div>
        {score !== null && (
          <div className="womens-safety-score">
            <div className="womens-safety-score-number" style={{ color: scoreColor }}>
              {score}/10
            </div>
            <div className="womens-safety-score-label">Safety Score</div>
          </div>
        )}
      </div>

      <div className="safety-grid">
        {items.map(({ icon, label, value }) => (
          <div key={label} className="safety-item">
            <span className="safety-item-icon" aria-hidden="true">{icon}</span>
            <div className="safety-item-info">
              <div className="safety-item-label">{label}</div>
              <div className={`safety-item-value ${safetyValueClass(String(value))}`}>
                {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ─── Info Tab ─────────────────────────────────────────────────────────────────
const InfoTab = memo(function InfoTab({ toilet }: { toilet: Toilet }) {
  const statusClass = toilet.status === 'open' ? 'open'
    : toilet.status === 'probably_open' ? 'probably-open'
    : toilet.status === 'closed' ? 'closed' : 'unknown';
  const statusLabel = toilet.status === 'open' ? '🟢 Open'
    : toilet.status === 'probably_open' ? '🟡 Probably Open'
    : toilet.status === 'closed' ? '🔴 Closed' : '⚪ Unknown';

  return (
    <div className="detail-content">
      {/* Availability widget */}
      <AvailabilityIndicator
        toiletId={toilet.id}
        reports={toilet.availabilityReports ?? []}
        onReport={() => {}}
      />

      {/* Trust badge */}
      <div className={`trust-badge ${toilet.trustLabel}`}>
        {toilet.trustLabel === 'highly_reliable' ? '✅' : toilet.trustLabel === 'moderately_reliable' ? '⚠️' : '❓'}
        {' '}{t(`trust.${toilet.trustLabel}`)} — {toilet.confidenceScore}% confidence
      </div>

      {/* Business info */}
      {toilet.businessInfo?.claimed ? (
        <div className="business-claimed-badge" aria-label="Business claimed">
          ✅ Verified Business · {toilet.businessInfo.businessName ?? 'Claimed'}
        </div>
      ) : (
        <button
          className="business-claim-card"
          onClick={() => alert('Business claim flow — coming soon with Firebase Auth!')}
          aria-label="Claim this location as a business"
          id={`claim-${toilet.id}`}
        >
          <div className="business-claim-icon" aria-hidden="true">🏢</div>
          <div className="business-claim-info">
            <div className="business-claim-title">Claim This Location</div>
            <div className="business-claim-subtitle">
              Manage photos, update hours & respond to reviews
            </div>
          </div>
          <span style={{ color: '#F59E0B', fontSize: 18 }}>›</span>
        </button>
      )}

      {/* Info grid */}
      <div className="info-grid">
        {[
          { icon: '🕒', label: 'Hours',   value: toilet.is24h ? '24 Hours' : toilet.hours },
          { icon: '💰', label: 'Entry',   value: toilet.free ? 'Free' : `₹${toilet.entryFee}`,
            style: { color: toilet.free ? 'var(--color-emerald)' : 'var(--color-amber)' } },
          { icon: '🚻', label: 'Gender',  value: toilet.gender, style: { textTransform: 'capitalize' as const } },
          { icon: '🏛️', label: 'Status',  value: <span className={`mini-badge ${statusClass}`}>{statusLabel}</span> },
          { icon: '🚽', label: 'Type',    value: toilet.westernStyle && toilet.indianStyle ? 'Both' : toilet.westernStyle ? 'Western' : 'Indian' },
          { icon: '🏠', label: 'Stalls',  value: `${toilet.stalls} stalls, ${toilet.urinals} urinals` },
        ].map(({ icon, label, value, style }) => (
          <div className="info-item" key={label}>
            <div className="info-item-icon" aria-hidden="true">{icon}</div>
            <div className="info-item-label">{label}</div>
            <div className="info-item-value" style={style as any}>{value}</div>
          </div>
        ))}
      </div>

      {/* Amenities */}
      <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 10 }}>
        Amenities
      </p>
      <div className="amenity-row">
        {[
          { label: '♿ Wheelchair', value: toilet.wheelchair },
          { label: '🚼 Baby Change', value: toilet.babyChange },
          { label: '🚿 Shower',     value: toilet.shower },
          { label: '💧 Water',      value: toilet.water },
          { label: '💡 Lighting',   value: toilet.lighting },
          { label: '🔒 Security',   value: toilet.security },
          { label: '📷 CCTV',       value: toilet.safety.cctv },
          { label: '🌙 Night Safe', value: toilet.safety.safeAtNight },
        ].map(({ label, value }) => (
          <span key={label} className={`amenity-chip ${value ? 'yes' : 'no'}`} aria-label={`${label}: ${value ? 'yes' : 'no'}`}>
            {value ? '✓' : '✗'} {label}
          </span>
        ))}
      </div>

      {/* Women's Safety */}
      {(toilet.womensSafety || toilet.gender === 'female' || toilet.gender === 'unisex' || toilet.gender === 'family') && (
        <WomensSafetySection toilet={toilet} />
      )}

      {/* Accessibility */}
      {toilet.wheelchair && (
        <>
          <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', margin: '16px 0 10px' }}>
            Accessibility
          </p>
          <div className="amenity-row">
            {[
              { label: 'Wheelchair entrance', value: toilet.accessibility.wheelchairEntrance },
              { label: 'Grab bars',           value: toilet.accessibility.grabBars },
              { label: 'Accessible sink',     value: toilet.accessibility.accessibleSink },
              { label: 'Wide door',           value: toilet.accessibility.wideDoor },
              { label: 'Parking',             value: toilet.accessibility.accessibleParking },
            ].map(({ label, value }) => (
              <span key={label} className={`amenity-chip ${value ? 'yes' : 'no'}`}>
                {value ? '✓' : '✗'} {label}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Verification */}
      <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--color-bg-3)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <VerificationLabel
          lastVerified={toilet.lastVerified}
          verifiedCount={toilet.verifiedCount}
          showExactDate={true}
        />
      </div>
    </div>
  );
});

// ─── Ratings Tab ──────────────────────────────────────────────────────────────
const RatingsTab = memo(function RatingsTab({ toilet }: { toilet: Toilet }) {
  return (
    <div className="detail-content">
      <div className="overall-score">
        <div>
          <div className="overall-score-number">{toilet.ratings.overall.toFixed(1)}</div>
          <StarDisplay rating={toilet.ratings.overall} />
          <div className="overall-score-count">{toilet.ratingCount} ratings</div>
          <div style={{ marginTop: 10 }}>
            <QualityBadge
              overall={toilet.ratings.overall}
              cleanliness={toilet.ratings.cleanliness}
              trustScore={toilet.confidenceScore}
              ratingCount={toilet.ratingCount}
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {RATING_AXES.map(({ key, label }) => {
            const val = (toilet.ratings as any)[key] as number;
            return (
              <div key={key} className="rating-axis">
                <span className="rating-axis-label">{label}</span>
                <div className="rating-bar-track" role="progressbar" aria-valuenow={val} aria-valuemin={0} aria-valuemax={5} aria-label={label}>
                  <div className="rating-bar-fill" style={{ width: `${(val / 5) * 100}%` }} />
                </div>
                <span className="rating-axis-value">{val.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

// ─── Photos Tab ───────────────────────────────────────────────────────────────
function LazyPhoto({ src, caption, uploaderName, uploadedAt, likes, onLike, onReport, liked }: {
  src: string; caption?: string; uploaderName: string; uploadedAt: number;
  likes: number; onLike: () => void; onReport: () => void; liked: boolean;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) { setIsLoaded(true); return; }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { img.src = src; obs.disconnect(); }
    }, { rootMargin: '100px' });
    obs.observe(img);
    return () => obs.disconnect();
  }, [src]);

  return (
    <div className="photo-card" role="figure" aria-label={caption || 'Toilet photo'}>
      {!isLoaded && <div className="skeleton" style={{ width: '100%', paddingBottom: '75%', borderRadius: 0 }} />}
      <img
        ref={imgRef}
        alt={caption || 'Toilet photo'}
        className={isLoaded ? 'loaded' : ''}
        onLoad={() => setIsLoaded(true)}
        style={{ opacity: isLoaded ? 1 : 0 }}
        loading="lazy"
      />
      <div className="photo-card-overlay">
        {caption && <div className="photo-card-caption">{caption}</div>}
        <div className="photo-card-meta">
          {uploaderName} · {new Date(uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </div>
      </div>
      <div className="photo-card-actions">
        <button
          className={`photo-action-btn ${liked ? 'liked' : ''}`}
          onClick={onLike}
          aria-label={`Like photo (${likes})`}
          aria-pressed={liked}
        >
          {liked ? '❤️' : '🤍'}
        </button>
        <button
          className="photo-action-btn"
          onClick={onReport}
          aria-label="Report photo"
        >
          🚩
        </button>
      </div>
    </div>
  );
}

function PhotosTab({ toilet }: { toilet: Toilet }) {
  const allPhotos: CommunityPhoto[] = toilet.communityPhotos ?? toilet.photos.map((url, i) => ({
    id: `ph-${i}`,
    url,
    uploadedBy: 'system',
    uploaderName: 'Community',
    uploadedAt: Date.now() - i * 86400000,
    likes: Math.floor(Math.random() * 20),
    caption: undefined,
    category: 'other' as const,
  }));

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [localPhotos, setLocalPhotos] = useState(allPhotos);

  const handleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const handleUpload = () => {
    // In production: open file picker → upload to Firebase Storage
    const newPhoto: CommunityPhoto = {
      id: `ph-${Date.now()}`,
      url: `https://picsum.photos/seed/${Date.now()}/400/300`,
      uploadedBy: 'current-user',
      uploaderName: 'You',
      uploadedAt: Date.now(),
      likes: 0,
      caption: 'New photo',
      category: 'other',
    };
    setLocalPhotos((prev) => [newPhoto, ...prev]);
  };

  return (
    <div style={{ paddingBottom: 20 }}>
      <button
        className="photo-upload-btn"
        onClick={handleUpload}
        aria-label="Upload a photo"
        id={`upload-photo-${toilet.id}`}
      >
        📷 Add a Photo
      </button>

      {localPhotos.length === 0 ? (
        <div className="empty-state" style={{ margin: '32px 0' }}>
          <div className="empty-state-icon">📷</div>
          <div className="empty-state-title">No photos yet</div>
          <div className="empty-state-subtitle">Be the first to share one!</div>
        </div>
      ) : (
        <div className="photos-masonry">
          {localPhotos.map((p) => (
            <LazyPhoto
              key={p.id}
              src={p.url}
              caption={p.caption}
              uploaderName={p.uploaderName}
              uploadedAt={p.uploadedAt}
              likes={p.likes}
              liked={likedIds.has(p.id)}
              onLike={() => handleLike(p.id)}
              onReport={() => alert(`Photo reported. Our team will review it shortly.`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────
const ReviewsTab = memo(function ReviewsTab({ toilet }: { toilet: Toilet }) {
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="detail-content">
      {toilet.reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <div className="empty-state-title">No reviews yet</div>
          <div className="empty-state-subtitle">Share your experience!</div>
        </div>
      ) : (
        toilet.reviews.map((r) => (
          <div key={r.id} className="review-card">
            <div className="review-header">
              <div className="review-avatar" aria-hidden="true">{r.userName.charAt(0)}</div>
              <div className="reviewer-info">
                <div className="review-name">{r.userName}</div>
                {r.userBadge && (
                  <ContributorBadges badges={[r.userBadge]} size="sm" maxVisible={1} />
                )}
                <StarDisplay rating={r.rating} />
              </div>
              <div className="review-date">{formatTime(r.timestamp)}</div>
            </div>
            <p className="review-text">{r.text}</p>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: helpfulIds.has(r.id) ? 'var(--color-teal)' : 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit', padding: 0
                }}
                onClick={() => setHelpfulIds((prev) => {
                  const next = new Set(prev);
                  next.has(r.id) ? next.delete(r.id) : next.add(r.id);
                  return next;
                })}
                aria-label={`Mark review as helpful (${r.helpful + (helpfulIds.has(r.id) ? 1 : 0)} found it helpful)`}
                aria-pressed={helpfulIds.has(r.id)}
              >
                👍 {r.helpful + (helpfulIds.has(r.id) ? 1 : 0)} helpful
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
});

// ─── Navigate Tab ─────────────────────────────────────────────────────────────
function NavigateTab({ toilet }: { toilet: Toilet }) {
  const { userLocation, setRouteInfo } = useAppStore();
  const [loadingWalk, setLoadingWalk] = useState(false);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [routeResult, setRouteResult] = useState<{ dist: number; dur: number; mode: string } | null>(null);

  const getWalk = async () => {
    if (!userLocation) return;
    setLoadingWalk(true);
    const route = await getWalkingRoute(userLocation, [toilet.lat, toilet.lng]);
    if (route) { setRouteInfo(route); setRouteResult({ dist: route.distance, dur: route.duration, mode: 'walking' }); }
    setLoadingWalk(false);
  };

  const getDrive = async () => {
    if (!userLocation) return;
    setLoadingDrive(true);
    const route = await getDrivingRoute(userLocation, [toilet.lat, toilet.lng]);
    if (route) { setRouteInfo(route); setRouteResult({ dist: route.distance, dur: route.duration, mode: 'driving' }); }
    setLoadingDrive(false);
  };

  return (
    <div className="detail-content">
      {routeResult && (
        <div style={{ background: 'var(--color-teal-glow)', border: '1px solid var(--color-teal)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 20 }}>
          {[
            { label: 'Distance', value: `${(routeResult.dist / 1000).toFixed(1)} km` },
            { label: 'Time',     value: formatDuration(routeResult.dur) },
            { label: 'Mode',     value: routeResult.mode.charAt(0).toUpperCase() + routeResult.mode.slice(1) },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: 'var(--color-teal)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="nav-section">
        <button className="nav-btn" onClick={getWalk} disabled={!userLocation || loadingWalk} id={`walk-${toilet.id}`}>
          <div className="nav-btn-icon" aria-hidden="true">🚶</div>
          <div className="nav-btn-info">
            <div className="nav-btn-title">{loadingWalk ? 'Getting route…' : 'Walking Route'}</div>
            <div className="nav-btn-subtitle">In-app route via OpenRouteService</div>
          </div>
          <span className="nav-btn-arrow" aria-hidden="true">›</span>
        </button>
        <button className="nav-btn" onClick={getDrive} disabled={!userLocation || loadingDrive} id={`drive-${toilet.id}`}>
          <div className="nav-btn-icon" aria-hidden="true">🚗</div>
          <div className="nav-btn-info">
            <div className="nav-btn-title">{loadingDrive ? 'Getting route…' : 'Driving Route'}</div>
            <div className="nav-btn-subtitle">In-app route via OpenRouteService</div>
          </div>
          <span className="nav-btn-arrow" aria-hidden="true">›</span>
        </button>

        <a
          href={buildGoogleMapsUrl(toilet, userLocation ?? undefined)}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-btn"
          id={`gmaps-${toilet.id}`}
          style={{ textDecoration: 'none' }}
          aria-label="Open in Google Maps (opens in new tab)"
        >
          <div className="nav-btn-icon" aria-hidden="true">🗺️</div>
          <div className="nav-btn-info">
            <div className="nav-btn-title">Open in Google Maps</div>
            <div className="nav-btn-subtitle">Turn-by-turn navigation</div>
          </div>
          <span className="nav-btn-arrow" aria-hidden="true">↗</span>
        </a>
      </div>

      {!userLocation && (
        <p style={{ fontSize: 13, color: 'var(--color-amber)', marginTop: 16, textAlign: 'center' }}>
          ⚠️ Enable location for accurate routing
        </p>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function ToiletDetailModal() {
  const { isDetailOpen, setDetailOpen, selectedToilet, verifyToilet, userLocation, setRouteInfo } = useAppStore();
  const [tab, setTab] = useState<Tab>('info');
  const [isVerified, setIsVerified] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { showToast, ToastElement } = useSuccessToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset scroll container position when tab or toilet changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setIsVerified(false);
  }, [tab, selectedToilet?.id]);

  // Keyboard navigation: Escape closes
  useEffect(() => {
    if (!isDetailOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'Tab' && modalRef.current) {
        // Trap focus inside modal
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus(); e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus(); e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isDetailOpen]);

  if (!isDetailOpen || !selectedToilet) return null;

  const toilet = selectedToilet;
  const allPhotos = toilet.communityPhotos?.map((p) => p.url) ?? toilet.photos;

  const handleClose = () => {
    setDetailOpen(false);
    setRouteInfo(null);
  };

  const handleVerify = () => {
    verifyToilet(toilet.id);
    setIsVerified(true);
    showToast('✅ Verified! Thanks for helping the community.');
  };

  const handleReport = () => {
    showToast('🚩 Report submitted. Our team will review it.');
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'info',     label: 'Info',                         icon: 'ℹ️' },
    { id: 'ratings',  label: 'Ratings',                      icon: '⭐' },
    { id: 'photos',   label: `Photos (${allPhotos.length})`, icon: '📷' },
    { id: 'reviews',  label: `Reviews (${toilet.reviews.length})`, icon: '💬' },
    { id: 'navigate', label: 'Navigate',                     icon: '🧭' },
  ];

  return (
    <>
      {ToastElement}
      {showQR && <QRCodeModal toilet={toilet} onClose={() => setShowQR(false)} />}

      <div
        className="modal-overlay"
        onClick={handleClose}
        role="presentation"
        aria-hidden={!isDetailOpen}
      >
        <div
          className="modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={toilet.name}
          ref={modalRef}
        >
          <div className="modal-drag-handle" aria-hidden="true" />

          {/* Floating Close Button */}
          <button
            className="modal-close"
            onClick={handleClose}
            aria-label="Close toilet details"
          >✕</button>

          {/* Unified Scroll Container */}
          <div className="modal-scroll-container" ref={scrollContainerRef}>
            {/* ── Hero Carousel ── */}
            <HeroCarousel photos={allPhotos} alt={toilet.name} />

            {/* ── Header ── */}
            <div className="detail-header-row">
              <ConfidenceRing
                score={toilet.confidenceScore}
                label={toilet.trustLabel}
                size={48}
              />
              <div className="detail-header-main">
                <h2 className="modal-title">{toilet.name}</h2>
                <p className="modal-subtitle">
                  📍 {toilet.address}
                  {toilet.distance !== undefined && ` · ${formatDistance(toilet.distance)} · ${toilet.walkMinutes} min walk`}
                </p>
                {/* Quality badge + verification */}
                <div className="detail-badges-row">
                  <QualityBadge
                    overall={toilet.ratings.overall}
                    cleanliness={toilet.ratings.cleanliness}
                    trustScore={toilet.confidenceScore}
                    ratingCount={toilet.ratingCount}
                  />
                  <VerificationLabel
                    lastVerified={toilet.lastVerified}
                    verifiedCount={toilet.verifiedCount}
                    showExactDate={false}
                  />
                </div>
              </div>
            </div>

            {/* ── Action Bar ── */}
            <div className="action-bar">
              <button
                className={`btn btn-secondary btn-sm`}
                onClick={handleVerify}
                disabled={isVerified}
                id={`verify-btn-${toilet.id}`}
                aria-label={isVerified ? 'Already verified' : 'Verify this toilet'}
                aria-pressed={isVerified}
                style={isVerified ? { borderColor: 'var(--color-teal)', color: 'var(--color-teal)', background: 'var(--color-teal-glow)' } : {}}
              >
                {isVerified ? '✅ Verified!' : '✓ Verify'}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleReport}
                id={`report-btn-${toilet.id}`}
                aria-label="Report an issue with this toilet"
              >
                🚩 Report
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setTab('reviews')}
                id={`review-btn-${toilet.id}`}
                aria-label="Write a review"
              >
                ✏️ Review
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowQR(true)}
                id={`qr-btn-${toilet.id}`}
                aria-label="Show QR code for this toilet"
                title="QR Code"
              >
                📲 QR
              </button>
            </div>

            {/* ── Tabs (Sticky) ── */}
            <div className="detail-tabs" role="tablist" aria-label="Toilet information tabs">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  className={`detail-tab ${tab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id)}
                  id={`tab-${t.id}-${toilet.id}`}
                  role="tab"
                  aria-selected={tab === t.id}
                  aria-controls={`tabpanel-${t.id}`}
                >
                  <span aria-hidden="true">{t.icon}</span> {t.label}
                </button>
              ))}
            </div>

          {/* ── Tab Content ── */}
          <div
            className="modal-body"
            id={`tabpanel-${tab}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab}-${toilet.id}`}
          >
            {tab === 'info'     && <InfoTab toilet={toilet} />}
            {tab === 'ratings'  && <RatingsTab toilet={toilet} />}
            {tab === 'photos'   && <PhotosTab toilet={toilet} />}
            {tab === 'reviews'  && <ReviewsTab toilet={toilet} />}
            {tab === 'navigate' && <NavigateTab toilet={toilet} />}
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
