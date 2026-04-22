import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

import img1 from '../assets/11.png';
import img2 from '../assets/22.png';
import img3 from '../assets/33.png';
import img4 from '../assets/44.png';

const IMAGES = [img1, img2, img3, img4];

/** Inline z-index so the overlay is never dropped by Tailwind purge (dynamic class strings are not scanned). */
const Z_OVERLAY = 2147483645;
const Z_OVERLAY_CHILD = 2147483646;

const shellStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: Z_OVERLAY,
  margin: 0,
  padding: 0,
};

export default function SchoolAtlasTour({ onClose }) {
  const [phase, setPhase] = useState('welcome');
  const [imgIndex, setImgIndex] = useState(0);

  const handleFinish = useCallback(() => {
    onClose();
  }, [onClose]);

  const nextImage = useCallback(() => {
    if (imgIndex + 1 >= IMAGES.length) {
      onClose();
      return;
    }
    setImgIndex((i) => i + 1);
  }, [imgIndex, onClose]);

  if (typeof document === 'undefined') {
    return null;
  }

  const body = document.body;
  if (!body) {
    return null;
  }

  // ── Welcome Screen ──────────────────────────────────────────────
  if (phase === 'welcome') {
    return createPortal(
      <div
        style={{
          ...shellStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          className="flex w-[90%] max-w-[360px] flex-col items-center gap-7 rounded-[20px] bg-white p-9 shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
          style={{ position: 'relative', zIndex: Z_OVERLAY_CHILD }}
        >

          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>

          <div className="text-center">
            <h1 className="m-0 mb-2 text-[22px] font-bold leading-snug text-black">
              Welcome to<br />Kathmandu Valley SchoolAtlas
            </h1>
            <p className="m-0 text-sm text-neutral-500">
              Would you like a quick tour of the features?
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] border-0 bg-black px-3.5 py-3.5 text-[15px] font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
              onClick={() => { setImgIndex(0); setPhase('guide'); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              Guide Me
            </button>
            <button
              type="button"
              className="w-full cursor-pointer rounded-[14px] border-0 bg-neutral-100 px-3.5 py-3.5 text-[15px] font-semibold text-black"
              onClick={handleFinish}
            >
              Skip
            </button>
          </div>

        </div>
      </div>,
      body
    );
  }

  // ── Guide / Image Slideshow ─────────────────────────────────────
  return createPortal(
    <div
      style={{ ...shellStyle, cursor: 'pointer' }}
      onClick={nextImage}
    >
      <button
        type="button"
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: Z_OVERLAY_CHILD,
          cursor: 'pointer',
          borderRadius: 9999,
          border: '1px solid rgba(255,255,255,0.25)',
          background: 'rgba(0,0,0,0.65)',
          color: '#fff',
          padding: '10px 18px',
          fontSize: 14,
          fontWeight: 600,
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleFinish();
        }}
      >
        Finish
      </button>

      <img
        src={IMAGES[imgIndex]}
        alt={`Tour step ${imgIndex + 1}`}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
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

      <div
        style={{
          position: 'fixed',
          bottom: 110,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 8,
          pointerEvents: 'none',
          zIndex: Z_OVERLAY_CHILD,
        }}
      >
        {IMAGES.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === imgIndex ? 24 : 8,
              height: 8,
              borderRadius: 999,
              background: i === imgIndex ? '#fff' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: Z_OVERLAY_CHILD,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          whiteSpace: 'nowrap',
          borderRadius: 9999,
          border: '1.5px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.75)',
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          padding: '13px 28px',
          letterSpacing: '0.01em',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11V6a3 3 0 0 1 6 0v5" />
          <path d="M9 11H6a3 3 0 0 0-3 3v1a8 8 0 0 0 16 0v-4a3 3 0 0 0-3-3h-1" />
        </svg>
        Tap anywhere to continue
        <span style={{ opacity: 0.55, fontWeight: 400, fontSize: 13 }}>
          {imgIndex + 1} / {IMAGES.length}
        </span>
      </div>
    </div>,
    body
  );
}
