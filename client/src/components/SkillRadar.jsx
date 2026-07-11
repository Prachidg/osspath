import React, { useRef, useEffect } from 'react';

const SkillRadar = ({ skills = [] }) => {
  const canvasRef = useRef(null);
  const size = 280;
  const center = size / 2;
  const maxRadius = 100;
  const levels = 4;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || skills.length === 0) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const n = skills.length;
    const angleStep = (2 * Math.PI) / n;
    const startAngle = -Math.PI / 2; // start from top

    // Helper: get point on pentagon at a given level (0-1) for vertex i
    const getPoint = (i, fraction) => {
      const angle = startAngle + i * angleStep;
      return {
        x: center + Math.cos(angle) * maxRadius * fraction,
        y: center + Math.sin(angle) * maxRadius * fraction,
      };
    };

    // Draw grid levels
    for (let lvl = 1; lvl <= levels; lvl++) {
      const frac = lvl / levels;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const p = getPoint(i % n, frac);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axis lines
    for (let i = 0; i < n; i++) {
      const p = getPoint(i, 1);
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw skill shape fill
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const frac = skills[i].level / 100;
      const p = getPoint(i, frac);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw dots at vertices
    for (let i = 0; i < n; i++) {
      const frac = skills[i].level / 100;
      const p = getPoint(i, frac);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    }

    // Draw labels
    ctx.fillStyle = 'rgba(219,234,254,0.72)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const p = getPoint(i, 1.22);
      ctx.textAlign = 'center';

      // Adjust alignment for left/right labels
      const angle = startAngle + i * angleStep;
      const cos = Math.cos(angle);
      if (cos > 0.3) ctx.textAlign = 'left';
      else if (cos < -0.3) ctx.textAlign = 'right';

      ctx.fillText(skills[i].name, p.x, p.y);
    }
  }, [skills]);

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl" style={{ padding: '28px' }}>
      {/* Canvas chart */}
      <div className="flex justify-center">
        <canvas ref={canvasRef} style={{ width: size, height: size }} />
      </div>

      {/* Bar chart breakdown */}
      <div className="mt-8 space-y-4">
        {skills.map((skill) => (
          <div key={skill.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-blue-50/70 font-inter">{skill.name}</span>
              <span className="text-xs text-blue-100/45 font-inter">{skill.level}%</span>
            </div>
            <div className="bg-white/[0.06] rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-sky-500 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillRadar;
