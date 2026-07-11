import React, { useState, useEffect, useCallback } from 'react';

interface Props {
  photos: string[];
  alt?: string;
}

export default function HeroCarousel({ photos, alt = 'Toilet photo' }: Props) {
  const [current, setCurrent] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const prev = useCallback(() => setCurrent((c) => (c - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % photos.length), [photos.length]);

  // Auto-advance every 4s
  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next, photos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  if (photos.length === 0) {
    return (
      <div className="hero-carousel" aria-label="No photos available">
        <div className="hero-carousel-placeholder">
          <div className="hero-carousel-placeholder-icon">🚻</div>
          <div className="hero-carousel-placeholder-text">No photos yet — be the first to add one!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-carousel" role="region" aria-label="Photo gallery" aria-roledescription="carousel">
      {/* Slides */}
      {photos.map((src, i) => (
        <div
          key={i}
          className={`hero-carousel-slide ${i === current ? 'active' : ''}`}
          aria-hidden={i !== current}
          aria-label={`Photo ${i + 1} of ${photos.length}`}
        >
          <img
            className="hero-carousel-img"
            src={src}
            alt={`${alt} ${i + 1}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            onLoad={() => setLoadedImages((s) => new Set(s).add(i))}
            style={{ opacity: loadedImages.has(i) ? 1 : 0, transition: 'opacity 400ms ease' }}
          />
          {/* Skeleton while loading */}
          {!loadedImages.has(i) && (
            <div className="skeleton" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
          )}
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="hero-carousel-gradient" />

      {/* Photo count */}
      <div className="hero-photo-count" aria-live="polite">
        📷 {current + 1} / {photos.length}
      </div>

      {/* Nav arrows (only if >1 photo) */}
      {photos.length > 1 && (
        <>
          <button
            className="hero-carousel-nav prev"
            onClick={prev}
            aria-label="Previous photo"
          >‹</button>
          <button
            className="hero-carousel-nav next"
            onClick={next}
            aria-label="Next photo"
          >›</button>
        </>
      )}

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="hero-carousel-dots" role="tablist" aria-label="Slides">
          {photos.map((_, i) => (
            <button
              key={i}
              className={`hero-carousel-dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
