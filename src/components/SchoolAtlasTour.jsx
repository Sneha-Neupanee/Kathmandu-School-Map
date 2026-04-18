import React, { useEffect, useState, useCallback } from 'react';

const IMAGES = ['11.png', '22.png', '33.png', '44.png'];
const DISPLAY_DURATION = 3500;

export default function SchoolAtlasTour() {
  const [phase, setPhase] = useState('welcome');
  const [imgIndex, setImgIndex] = useState(0);

  const finish = useCallback(() => setPhase('done'), []);

  const nextImage = useCallback(() => {
    setImgIndex((prev) => {
      if (prev + 1 >= IMAGES.length) {
        setPhase('done');
        return prev;
      }
      return prev + 1;
    });
  }, []);

  useEffect(() => {
    if (phase !== 'guide') return;
    const t = setTimeout(nextImage, DISPLAY_DURATION);
    return () => clearTimeout(t);
  }, [phase, imgIndex, nextImage]);

  if (phase === 'done') return null;

  // ── Welcome Screen ──────────────────────────────────────────────
  if (phase === 'welcome') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl shadow-2xl px-10 py-10 flex flex-col items-center gap-8 max-w-sm w-full mx-4">

          {/* Icon */}
          <div className="text-black">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>

          {/* Title */}
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold text-black text-center leading-tight">
              Welcome to<br />Kathmandu SchoolAtlas
            </h1>
            <p className="text-gray-500 text-sm text-center">
              Would you like a quick tour of the features?
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <button
              className="w-full bg-black hover:bg-gray-900 active:scale-95 transition-all text-white font-semibold py-3 rounded-xl text-base shadow flex items-center justify-center gap-2"
              onClick={() => { setImgIndex(0); setPhase('guide'); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              Guide Me
            </button>
            <button
              className="w-full bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all text-black font-semibold py-3 rounded-xl text-base"
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
      className="fixed inset-0 z-[9999] cursor-pointer"
      style={{ margin: 0, padding: 0 }}
      onClick={nextImage}
    >
      <img
        src={`/${IMAGES[imgIndex]}`}
        alt={`Tour step ${imgIndex + 1}`}
        style={{
          position: 'fixed',
          inset: 0,
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

      {/* Click anywhere to skip */}
      <div
        style={{
          position: 'fixed',
          bottom: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 10000,
        }}
      >
        <span
          style={{
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            fontSize: '14px',
            padding: '8px 20px',
            borderRadius: '999px',
            backdropFilter: 'blur(4px)',
            whiteSpace: 'nowrap',
          }}
        >
          Click anywhere to skip
        </span>
      </div>
    </div>
  );
}