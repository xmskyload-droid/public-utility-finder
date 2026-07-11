import React from 'react';
import t from '../../lib/i18n';

export default function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p className="loading-text">{t('misc.loading')}</p>
    </div>
  );
}
