import React from 'react';
import { TrustLabel } from '../../types';
import { getTrustColor } from '../../lib/utils';

interface Props {
  score: number;
  label: TrustLabel;
  size?: number;
}

export default function ConfidenceRing({ score, label, size = 52 }: Props) {
  const color = getTrustColor(label);
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="confidence-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: 'stroke-dasharray 800ms cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="confidence-ring-text" style={{ color }}>
        {score}
      </div>
    </div>
  );
}
