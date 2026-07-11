import React, { useState } from 'react';
import { Toilet } from '../../types';

interface Props {
  toilet: Toilet;
  onClose: () => void;
}

export default function QRCodeModal({ toilet, onClose }: Props) {
  // Use free QR code API (no npm package needed)
  const url = encodeURIComponent(`https://nearloo.app/toilet/${toilet.id}`);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${url}&bgcolor=ffffff&color=080d1a&margin=10`;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrSrc;
    a.download = `nearloo-${toilet.id}.png`;
    a.target = '_blank';
    a.click();
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`QR Code for ${toilet.name}`}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 380 }}
      >
        <div className="modal-drag-handle" />

        <div className="modal-header">
          <div>
            <h2 className="modal-title">QR Code</h2>
            <p className="modal-subtitle">{toilet.name}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close QR modal">✕</button>
        </div>

        <div className="qr-modal-body">
          <div className="qr-frame">
            <img
              src={qrSrc}
              alt={`QR code for ${toilet.name}`}
              width={200}
              height={200}
              loading="lazy"
            />
          </div>

          <p className="qr-label">
            Scan this QR code to open <strong>{toilet.name}</strong> directly in NearLoo.
            Perfect for printed stickers at the entrance.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="qr-download-btn" onClick={handleDownload} id={`qr-download-${toilet.id}`}>
              ⬇️ Download PNG
            </button>
            <button
              className="qr-download-btn"
              onClick={() => navigator.clipboard?.writeText(`https://nearloo.app/toilet/${toilet.id}`)}
              id={`qr-copy-${toilet.id}`}
            >
              📋 Copy Link
            </button>
          </div>

          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Future: Print and stick at toilet entrance for easy scanning
          </p>
        </div>
      </div>
    </div>
  );
}
