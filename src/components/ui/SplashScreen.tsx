import React, { useState, useEffect } from 'react';

const LOGO_ICON = '🚻';
const TAGLINE = 'Find clean toilets near you';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    // Phase: enter (logo animates in) → hold (brief pause) → exit (fade out)
    const holdTimer = setTimeout(() => setPhase('hold'), 800);
    const exitTimer = setTimeout(() => setPhase('exit'), 1800);
    const doneTimer = setTimeout(() => onComplete(), 2500);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-screen ${phase === 'exit' ? 'splash-exit' : ''}`} aria-hidden="true">
      {/* Animated background particles */}
      <div className="splash-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`splash-particle splash-particle-${i + 1}`} />
        ))}
      </div>

      {/* Logo */}
      <div className={`splash-logo ${phase !== 'enter' ? 'splash-logo-visible' : ''}`}>
        <div className="splash-logo-icon">
          <span>{LOGO_ICON}</span>
          {/* Teal ring pulse */}
          <div className="splash-ring" />
          <div className="splash-ring splash-ring-2" />
        </div>
        <h1 className="splash-title">NearLoo</h1>
        <p className="splash-tagline">{TAGLINE}</p>
      </div>

      {/* Loading dots */}
      <div className={`splash-dots ${phase === 'hold' ? 'splash-dots-visible' : ''}`}>
        <span className="splash-dot" />
        <span className="splash-dot" />
        <span className="splash-dot" />
      </div>
    </div>
  );
}
