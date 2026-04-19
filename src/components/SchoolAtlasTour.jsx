import React, { useState, useCallback } from 'react';

import img1 from '../assets/11.png';
import img2 from '../assets/22.png';
import img3 from '../assets/33.png';
import img4 from '../assets/44.png';

const IMAGES = [img1, img2, img3, img4];

export default function SchoolAtlasTour({
  onDismiss,
  dismissedStorageKey = 'schoolAtlasTourDismissed_v2',
}) {
  const [phase, setPhase] = useState('welcome');
  const [imgIndex, setImgIndex] = useState(0);

  const markTourSeen = useCallback(() => {
    try {
      localStorage.removeItem('hasSeenSchoolAtlasTour');
      localStorage.setItem(dismissedStorageKey, 'true');
    } catch {
      // ignore (e.g. storage unavailable)
    }
    onDismiss?.();
  }, [dismissedStorageKey, onDismiss]);

  const finish = useCallback(() => {
    setPhase('done');
    markTourSeen();
  }, [markTourSeen]);

  const nextImage = useCallback(() => {
    setImgIndex((prev) => {
      if (prev + 1 >= IMAGES.length) {
        queueMicrotask(() => {
          setPhase('done');
          markTourSeen();
        });
        return prev;
      }
      return prev + 1;
    });
  }, [markTourSeen]);

  if (phase === 'done') return null;

  // ── Welcome Screen ──────────────────────────────────────────────
  if (phase === 'welcome') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2147483000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          padding: '40px 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
          maxWidth: '360px',
          width: '90%',
        }}>

          {/* Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>

          {/* Text */}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#000', margin: '0 0 8px 0', lineHeight: 1.3 }}>
              Welcome to<br />Kathmandu SchoolAtlas
            </h1>
            <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
              Would you like a quick tour of the features?
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <button
              style={{
                width: '100%',
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '14px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
              onClick={() => { setImgIndex(0); setPhase('guide'); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              Guide Me
            </button>
            <button
              style={{
                width: '100%',
                background: '#f0f0f0',
                color: '#000',
                border: 'none',
                borderRadius: '14px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
              onClick={finish}
            >
              Skip
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ── Guide / Image Slideshow ─────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2147483000,
        cursor: 'pointer',
        margin: 0,
        padding: 0,
      }}
      onClick={nextImage}
    >
      {/* Full screen image */}
      <img
        src={IMAGES[imgIndex]}
        alt={`Tour step ${imgIndex + 1}`}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          display: 'block',
          margin: 0,
          padding: 0,
          border: 'none',
        }}
        draggable={false}
      />

      {/* Step dots */}
      <div style={{
        position: 'fixed',
        bottom: '110px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        pointerEvents: 'none',
        zIndex: 2147483001,
      }}>
        {IMAGES.map((_, i) => (
          <div key={i} style={{
            width: i === imgIndex ? '24px' : '8px',
            height: '8px',
            borderRadius: '999px',
            background: i === imgIndex ? '#fff' : 'rgba(255,255,255,0.4)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Tap hint bar */}
      <div style={{
        position: 'fixed',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 2147483001,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(0,0,0,0.75)',
        color: '#fff',
        fontSize: '15px',
        fontWeight: '600',
        padding: '13px 28px',
        borderRadius: '999px',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1.5px solid rgba(255,255,255,0.2)',
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11V6a3 3 0 0 1 6 0v5" />
          <path d="M9 11H6a3 3 0 0 0-3 3v1a8 8 0 0 0 16 0v-4a3 3 0 0 0-3-3h-1" />
        </svg>
        Tap anywhere to continue
        <span style={{ opacity: 0.55, fontWeight: '400', fontSize: '13px' }}>
          {imgIndex + 1} / {IMAGES.length}
        </span>
      </div>
    </div>
  );
}