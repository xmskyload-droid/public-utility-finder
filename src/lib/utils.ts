import { Toilet, TrustLabel } from '../types';

// ─── Trust Score Algorithm ────────────────────────────────────────────────────

export function computeTrustScore(toilet: Partial<Toilet>): number {
  let score = 0;

  // 1. Recency of verification (0–30 pts)
  if (toilet.lastVerified) {
    const lastVerifiedDate = new Date(toilet.lastVerified);
    const daysSince = Math.floor(
      (Date.now() - lastVerifiedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince < 1) score += 30;
    else if (daysSince < 7) score += 25;
    else if (daysSince < 30) score += 15;
    else if (daysSince < 90) score += 5;
    // else 0
  }

  // 2. Multiple users verified (0–25 pts)
  const verifiedCount = toilet.verifiedCount ?? 0;
  score += Math.min(verifiedCount * 5, 25);

  // 3. Has photos (0–15 pts)
  if (toilet.photos && toilet.photos.length > 0) {
    score += Math.min(toilet.photos.length * 5, 15);
  }

  // 4. Report penalty (0–10 pts)
  const reportCount = toilet.reports?.length ?? 0;
  if (reportCount === 0) score += 10;
  else if (reportCount < 3) score += 5;
  // else 0

  // 5. Rating quality (0–10 pts)
  const overall = toilet.ratings?.overall ?? 0;
  const ratingCount = toilet.ratingCount ?? 0;
  if (overall >= 4 && ratingCount >= 5) score += 10;
  else if (overall >= 3 && ratingCount >= 2) score += 5;
  else if (ratingCount >= 1) score += 2;

  // 6. OSM / government source (0–10 pts)
  if (toilet.source === 'osm' || toilet.source === 'government') score += 10;

  return Math.min(100, score);
}

export function getTrustLabel(score: number): TrustLabel {
  if (score >= 80) return 'highly_reliable';
  if (score >= 50) return 'moderately_reliable';
  return 'unverified';
}

export function getTrustColor(label: TrustLabel): string {
  switch (label) {
    case 'highly_reliable': return '#10B981';
    case 'moderately_reliable': return '#F59E0B';
    case 'unverified': return '#EF4444';
  }
}

// ─── Distance & Sorting ───────────────────────────────────────────────────────

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateWalkMinutes(meters: number): number {
  const walkingSpeedMps = 1.4; // avg 5 km/h
  return Math.ceil(meters / walkingSpeedMps / 60);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

// ─── Toilet Status ────────────────────────────────────────────────────────────

export function computeToiletStatus(toilet: Partial<Toilet>): Toilet['status'] {
  if (toilet.is24h) return 'open';
  if (!toilet.hours || toilet.hours === 'Unknown') return 'unknown';

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  // Parse "HH:MM–HH:MM"
  const match = toilet.hours?.match(/(\d{1,2}):(\d{2})[–\-](\d{1,2}):(\d{2})/);
  if (!match) return 'unknown';

  const openMinutes = parseInt(match[1]) * 60 + parseInt(match[2]);
  const closeMinutes = parseInt(match[3]) * 60 + parseInt(match[4]);

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    // Within 30 minutes of closing → probably open
    if (closeMinutes - currentMinutes <= 30) return 'probably_open';
    return 'open';
  }
  return 'closed';
}

// ─── Marker Colors ────────────────────────────────────────────────────────────

export function getMarkerColor(toilet: Toilet): string {
  const overall = toilet.ratings?.overall ?? 0;
  const trust = toilet.trustLabel;

  if (trust === 'unverified') return '#6B7280'; // gray
  if (overall >= 4) return '#10B981'; // green
  if (overall >= 2.5) return '#F59E0B'; // yellow
  return '#EF4444'; // red
}

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  return `${hours}h ${remaining}m`;
}
