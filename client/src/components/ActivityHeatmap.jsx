import React, { useMemo } from 'react';

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getColor = (count) => {
  if (count === 0) return 'bg-white/[0.04]';
  if (count === 1) return 'bg-cyan-500/20';
  if (count === 2) return 'bg-cyan-500/40';
  if (count === 3) return 'bg-cyan-400/60';
  return 'bg-cyan-300';
};

const generateDemoData = () => {
  const data = [];
  const today = new Date();
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Weight toward lower counts for realistic look
    const rand = Math.random();
    let count = 0;
    if (rand > 0.55) count = 1;
    if (rand > 0.75) count = 2;
    if (rand > 0.88) count = 3;
    if (rand > 0.94) count = 4;
    data.push({
      date: d.toISOString().slice(0, 10),
      count,
    });
  }
  return data;
};

const ActivityHeatmap = ({ data: dataProp }) => {
  const data = useMemo(() => dataProp || generateDemoData(), [dataProp]);

  // Organize into weeks (columns) and days (rows)
  const { weeks, monthLabels } = useMemo(() => {
    // Pad start so first entry aligns to its day-of-week
    const firstDate = new Date(data[0].date);
    const startDay = firstDate.getDay(); // 0 = Sunday

    const paddedData = [];
    for (let i = 0; i < startDay; i++) {
      paddedData.push(null);
    }
    data.forEach((d) => paddedData.push(d));

    const weeks = [];
    for (let i = 0; i < paddedData.length; i += 7) {
      weeks.push(paddedData.slice(i, i + 7));
    }

    // Calculate month labels with positions
    const monthLabels = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIdx) => {
      const firstInWeek = week.find((d) => d !== null);
      if (firstInWeek) {
        const month = new Date(firstInWeek.date).getMonth();
        if (month !== lastMonth) {
          monthLabels.push({ label: MONTH_NAMES[month], weekIdx });
          lastMonth = month;
        }
      }
    });

    return { weeks, monthLabels };
  }, [data]);

  return (
    <div className="overflow-x-auto">
      {/* Month labels */}
      <div className="flex ml-8 mb-1.5" style={{ gap: 0 }}>
        {monthLabels.map((m, i) => (
          <span
            key={i}
            className="text-[10px] text-blue-200/30 font-inter"
            style={{
              position: 'relative',
              left: `${m.weekIdx * 16}px`,
              marginLeft: i === 0 ? 0 : `-${monthLabels[i - 1].weekIdx * 16}px`,
            }}
          >
            {m.label}
          </span>
        ))}
      </div>

      <div className="flex gap-0">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-2 pt-0">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-3 flex items-center">
              <span className="text-[10px] text-blue-200/30 font-inter w-6 text-right">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[4px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[4px]">
              {Array.from({ length: 7 }).map((_, di) => {
                const cell = week[di];
                if (!cell) {
                  return <div key={di} className="w-3.5 h-3.5" />;
                }
                return (
                  <div
                    key={di}
                    className={`w-3.5 h-3.5 rounded-sm ${getColor(cell.count)}`}
                    title={`${cell.date}: ${cell.count} contributions`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
