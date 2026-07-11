import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export default function EmergencyFAB() {
  const { findNearest, userLocation, isDetailOpen } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    findNearest();
    setLoading(false);
  };

  if (isDetailOpen) return null;

  return (
    <div className="emergency-fab">
      <button
        className={`emergency-btn ${loading ? 'loading' : ''}`}
        onClick={handleClick}
        disabled={loading}
        id="emergency-fab"
        title="Find the nearest open toilet instantly"
      >
        <span className="emergency-btn-icon">{loading ? '⏳' : '🚻'}</span>
        {loading ? 'Finding nearest...' : 'Find Nearest Toilet'}
      </button>
    </div>
  );
}
