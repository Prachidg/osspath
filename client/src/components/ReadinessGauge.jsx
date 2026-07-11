import React from 'react';

const ReadinessGauge = ({ score = 0 }) => {
  const radius = 54;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const size = (radius + strokeWidth) * 2;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] rounded-2xl">
      <span className="text-[10px] text-blue-200/40 uppercase tracking-[0.25em] font-inter mb-4">
        Readiness Score
      </span>

      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Foreground arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-podium text-4xl text-white leading-none">
            {score}
          </span>
          <span className="text-xs text-blue-200/40 mt-0.5">/100</span>
        </div>
      </div>
    </div>
  );
};

export default ReadinessGauge;
