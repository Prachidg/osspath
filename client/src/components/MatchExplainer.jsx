import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const MatchExplainer = ({ explanation }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl" style={{ padding: '16px 20px', marginTop: '24px' }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 w-full cursor-pointer bg-transparent border-none p-0"
      >
        <ChevronDown
          className="w-4 h-4 text-blue-200/60 transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
        <span className="text-[11px] tracking-[0.2em] uppercase text-blue-100/60 font-inter">
          Why this match?
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: open ? '200px' : '0px', opacity: open ? 1 : 0 }}
      >
        <p className="text-sm text-blue-50/70 font-inter mt-3.5 leading-relaxed">
          {explanation}
        </p>
      </div>
    </div>
  );
};

export default MatchExplainer;
