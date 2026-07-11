import React, { useState, useCallback } from 'react';
import { AvailabilityReport, LiveAvailability } from '../../types';

interface Props {
  toiletId: string;
  reports: AvailabilityReport[];
  onReport: (status: 'available' | 'busy') => void;
}

function computeLiveAvailability(reports: AvailabilityReport[]): {
  status: LiveAvailability;
  updatedAgo: string | null;
} {
  // Only consider reports from the last 30 minutes
  const cutoff = Date.now() - 30 * 60 * 1000;
  const recent = reports.filter((r) => r.timestamp > cutoff);

  if (recent.length === 0) return { status: 'unknown', updatedAgo: null };

  const latest = recent.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
  const availableCount = recent.filter((r) => r.status === 'available').length;
  const busyCount = recent.filter((r) => r.status === 'busy').length;

  const status: LiveAvailability = availableCount >= busyCount ? 'available' : 'busy';

  const minutes = Math.floor((Date.now() - latest.timestamp) / 60000);
  const updatedAgo = minutes === 0 ? 'just now' : `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

  return { status, updatedAgo };
}

export default function AvailabilityIndicator({ toiletId, reports, onReport }: Props) {
  const [selected, setSelected] = useState<'available' | 'busy' | null>(null);
  const [localReports, setLocalReports] = useState<AvailabilityReport[]>(reports);

  const { status, updatedAgo } = computeLiveAvailability(localReports);

  const handleReport = useCallback((s: 'available' | 'busy') => {
    const newReport: AvailabilityReport = {
      id: `avail-${Date.now()}`,
      userId: 'local-user',
      status: s,
      timestamp: Date.now(),
    };
    setLocalReports((prev) => [...prev, newReport]);
    setSelected(s);
    onReport(s);
  }, [onReport]);

  const statusConfig = {
    available: { icon: '🚻', text: 'Available', class: 'available' },
    busy:      { icon: '⛔', text: 'Busy',      class: 'busy' },
    unknown:   { icon: '❔', text: 'Status Unknown', class: 'unknown' },
  };

  const { icon, text, class: cls } = statusConfig[status];

  return (
    <div className="availability-widget" aria-label="Live availability">
      <div className="availability-header">
        <span className="availability-title">Live Availability</span>
        {updatedAgo && (
          <span className="availability-updated" aria-live="polite">Updated {updatedAgo}</span>
        )}
      </div>

      <div className={`availability-status ${cls}`} aria-label={`Status: ${text}`}>
        <span aria-hidden="true">{icon}</span>
        {text}
      </div>

      <div className="availability-buttons">
        <button
          className={`avail-btn available ${selected === 'available' ? 'selected' : ''}`}
          onClick={() => handleReport('available')}
          disabled={!!selected}
          aria-label="Report toilet as available"
          aria-pressed={selected === 'available'}
          id={`avail-available-${toiletId}`}
        >
          🚻 Available
        </button>
        <button
          className={`avail-btn busy ${selected === 'busy' ? 'selected' : ''}`}
          onClick={() => handleReport('busy')}
          disabled={!!selected}
          aria-label="Report toilet as busy"
          aria-pressed={selected === 'busy'}
          id={`avail-busy-${toiletId}`}
        >
          ⛔ Busy
        </button>
      </div>

      {selected && (
        <p style={{ fontSize: 12, color: 'var(--color-teal)', marginTop: 8, textAlign: 'center' }}>
          ✓ Thanks for reporting! Your update helps others.
        </p>
      )}
    </div>
  );
}
