import React from 'react';
import { ArrowRight } from 'lucide-react';
import MatchExplainer from './MatchExplainer';

const difficultyStyles = {
  beginner: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
  intermediate: 'border-blue-400/35 bg-blue-400/10 text-blue-200',
  advanced: 'border-indigo-400/35 bg-indigo-400/10 text-indigo-200',
};

const getScoreColor = (score) => {
  if (score >= 80) return '#38bdf8';
  if (score >= 60) return '#60a5fa';
  return '#818cf8';
};

const MiniScoreRing = ({ score }) => {
  const radius = 24;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const size = 64;
  const center = size / 2;
  const color = getScoreColor(score);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-podium text-base text-white leading-none">{score}</span>
      </div>
    </div>
  );
};

const IssueCard = ({ issue }) => {
  const {
    title,
    repo,
    stars,
    languages = [],
    difficulty,
    matchScore = 0,
    explanation,
    url,
    onAttempt,
  } = issue;

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl transition-all duration-300 hover:border-cyan-500/20 hover:bg-white/[0.04]" style={{ padding: '28px' }}>
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-7">
        {/* Score ring */}
        <MiniScoreRing score={matchScore} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold text-white font-inter leading-snug">
            {title}
          </h3>

          <p className="text-sm text-blue-100/45 font-inter mt-2.5">
            {repo} <span className="ml-1.5">★ {stars}</span>
          </p>

          {/* Language pills + difficulty badge */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {languages.map((lang) => (
              <span
                key={lang}
                className="border border-blue-400/15 bg-blue-400/5 rounded-full px-2.5 py-0.5 text-[11px] text-blue-100/70 font-inter"
              >
                {lang}
              </span>
            ))}
            <span
              className={`border rounded-full px-3 py-1 text-[11px] font-medium font-inter capitalize ${
                difficultyStyles[difficulty] || ''
              }`}
            >
              {difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Match explainer */}
      <MatchExplainer explanation={explanation} />

      {/* Bottom link */}
      <div className="flex justify-end mt-5">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onAttempt}
          className="flex items-center gap-1.5 text-sm text-cyan-400/70 hover:text-cyan-300 font-medium transition-colors font-inter"
        >
          Begin This Path
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default IssueCard;
