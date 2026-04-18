import React, { useEffect, useState } from 'react';

const steps = [
  {
    text: 'Welcome to Kathmandu SchoolAtlas',
    position: 'center',
  },
  {
    text: 'Search and explore schools easily by name or location.',
    top: 120,
    left: 40,
    width: 260,
    height: 80,
  },
  {
    text: 'Filter schools based on type and category.',
    top: 260,
    left: 40,
    width: 260,
    height: 200,
  },
  {
    text: 'Use advanced tools like analysis, comparison, and heatmaps.',
    top: 20,
    left: 300,
    width: 600,
    height: 80,
  },
  {
    text: 'View insights, statistics, and school analytics.',
    top: 400,
    left: 40,
    width: 260,
    height: 150,
  },
];

export default function SchoolAtlasTour() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= steps.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), 3500);
    return () => clearTimeout(t);
  }, [step]);

  if (step >= steps.length) return null;

  const currentStep = steps[step];
  const isCenter = currentStep.position === 'center';

  return (
    <div
      className="fixed inset-0 z-[9999]"
      onClick={() => setStep((s) => s + 1)}
      role="dialog"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-black/40" />

      {!isCenter && (
        <>
          <div
            className="absolute border-2 border-blue-400 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.7)]"
            style={{
              top: currentStep.top,
              left: currentStep.left,
              width: currentStep.width,
              height: currentStep.height,
            }}
          />

          <div
            className="absolute text-blue-500 text-2xl animate-bounce"
            style={{
              top: currentStep.top - 25,
              left: currentStep.left + currentStep.width / 2,
              transform: 'translateX(-50%)',
            }}
          >
            ↓
          </div>
        </>
      )}

      <button
        className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg"
        onClick={(e) => {
          e.stopPropagation();
          setStep(steps.length);
        }}
      >
        Skip
      </button>

      {isCenter ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="bg-white px-6 py-4 rounded-xl shadow-xl text-lg font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            {currentStep.text}
          </div>
        </div>
      ) : (
        <div
          className="absolute bg-white px-4 py-2 rounded-lg shadow-lg text-sm"
          style={{
            top: currentStep.top + currentStep.height + 10,
            left: currentStep.left,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {currentStep.text}
        </div>
      )}
    </div>
  );
}
