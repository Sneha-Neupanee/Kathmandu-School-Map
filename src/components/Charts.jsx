import React, { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { Lightbulb } from 'lucide-react';

/* ─────────────────────────────────────────────
   THEME-AWARE CSS variables (injected inline)
   Works in both light and dark contexts.
───────────────────────────────────────────── */
const themeStyle = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');

  .charts-root {
    --card-bg: #ffffff;
    --card-border: #e2e8f0;
    --card-shadow: 0 4px 24px 0 rgba(30,41,59,0.08);
    --header-bg: #f8fafc;
    --header-border: #e2e8f0;
    --heading-color: #0f172a;
    --label-color: #475569;
    --text-main: #1e293b;
    --insight-bg: rgba(239,246,255,0.7);
    --insight-border: #bfdbfe;
    --insight-icon: #3b82f6;
    --pct-badge-bg: #f1f5f9;
    --pct-badge-border: #e2e8f0;
    --pct-badge-text: #334155;
    --legend-dot-shadow: 0 2px 6px rgba(0,0,0,0.18);
  }

  @media (prefers-color-scheme: dark) {
    .charts-root {
      --card-bg: #1e293b;
      --card-border: #334155;
      --card-shadow: 0 4px 24px 0 rgba(0,0,0,0.35);
      --header-bg: #0f172a;
      --header-border: #334155;
      --heading-color: #f1f5f9;
      --label-color: #94a3b8;
      --text-main: #e2e8f0;
      --insight-bg: rgba(30,58,138,0.18);
      --insight-border: #1e40af;
      --insight-icon: #60a5fa;
      --pct-badge-bg: #0f172a;
      --pct-badge-border: #334155;
      --pct-badge-text: #94a3b8;
      --legend-dot-shadow: 0 2px 8px rgba(0,0,0,0.45);
    }
  }

  .charts-root .chart-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 20px;
    box-shadow: var(--card-shadow);
    overflow: hidden;
    transition: box-shadow 0.25s ease;
  }
  .charts-root .chart-card:hover {
    box-shadow: 0 8px 36px 0 rgba(30,41,59,0.14);
  }

  .charts-root .chart-header {
    background: var(--header-bg);
    border-bottom: 1px solid var(--header-border);
    padding: 14px 20px 12px;
  }

  .charts-root .chart-heading {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 1.05rem;
    font-weight: 400;
    letter-spacing: 0.01em;
    color: var(--heading-color);
    margin: 0;
    line-height: 1.2;
  }

  .charts-root .chart-subcount {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--label-color);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 1px;
  }

  .charts-root .legend-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 0;
    cursor: default;
    border-radius: 8px;
    transition: background 0.15s;
  }
  .charts-root .legend-row:hover {
    background: var(--pct-badge-bg);
  }

  .charts-root .legend-dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: var(--legend-dot-shadow);
  }

  .charts-root .legend-name {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--text-main);
    flex: 1;
  }

  .charts-root .legend-pct {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--pct-badge-text);
    background: var(--pct-badge-bg);
    border: 1px solid var(--pct-badge-border);
    padding: 1px 7px;
    border-radius: 20px;
    min-width: 44px;
    text-align: center;
  }

  .charts-root .legend-count {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    color: var(--label-color);
    min-width: 30px;
    text-align: right;
  }

  .charts-root .center-label-val {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 1.6rem;
    fill: var(--heading-color, #0f172a);
  }
  .charts-root .center-label-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    fill: var(--label-color, #64748b);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .charts-root .insight-box {
    background: var(--insight-bg);
    border: 1px solid var(--insight-border);
    border-radius: 16px;
    padding: 14px 16px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .charts-root .insight-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 0.92rem;
    color: var(--heading-color);
    margin-bottom: 2px;
  }

  .charts-root .insight-body {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    color: var(--label-color);
    line-height: 1.5;
  }
`;

/* ─────────────────────────────────────────────
   Color palettes with gradient stops for 3-D feel
───────────────────────────────────────────── */
const QUALITY_PALETTE = [
  { base: '#10b981', light: '#34d399', dark: '#059669' }, // emerald
  { base: '#f59e0b', light: '#fbbf24', dark: '#d97706' }, // amber
];

const OWNERSHIP_PALETTE = [
  { base: '#3b82f6', light: '#60a5fa', dark: '#2563eb' }, // blue
  { base: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed' }, // violet
  { base: '#ef4444', light: '#f87171', dark: '#dc2626' }, // red
  { base: '#94a3b8', light: '#cbd5e1', dark: '#64748b' }, // slate
];

/* ─────────────────────────────────────────────
   3-D active shape (slice lifts and glows)
───────────────────────────────────────────── */
function ActiveShape3D({ palette }) {
  return function renderActiveShape(props) {
    const {
      cx, cy, innerRadius, outerRadius,
      startAngle, endAngle, fill,
      payload, percent, value,
    } = props;

    const idx = palette.findIndex(p => p.base === fill);
    const colors = palette[idx] || { base: fill, light: fill, dark: fill };

    return (
      <g>
        {/* Outer glow ring */}
        <Sector
          cx={cx} cy={cy}
          innerRadius={outerRadius + 4}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={colors.light}
          opacity={0.35}
        />
        {/* Main lifted segment */}
        <Sector
          cx={cx} cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={colors.base}
          style={{ filter: `drop-shadow(0 4px 10px ${colors.base}88)` }}
        />
        {/* Highlight rim for 3-D illusion */}
        <Sector
          cx={cx} cy={cy}
          innerRadius={outerRadius + 2}
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={colors.light}
          opacity={0.7}
        />
      </g>
    );
  };
}

/* ─────────────────────────────────────────────
   Center label inside donut
───────────────────────────────────────────── */
function CenterLabel({ viewBox, total, label }) {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" className="center-label-val" style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.45rem', fill: 'currentColor' }}>
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.6rem', fill: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </text>
    </g>
  );
}

/* ─────────────────────────────────────────────
   Reusable DonutChart
───────────────────────────────────────────── */
function DonutChart({ data, palette, total, centerLabel }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const activeShape = useCallback(ActiveShape3D({ palette }), [palette]);

  // Build gradient defs for 3-D look
  const gradientDefs = palette.map((p, i) => (
    <radialGradient key={i} id={`grad-${i}`} cx="40%" cy="35%" r="65%">
      <stop offset="0%" stopColor={p.light} />
      <stop offset="60%" stopColor={p.base} />
      <stop offset="100%" stopColor={p.dark} />
    </radialGradient>
  ));

  const coloredData = data.map((d, i) => ({
    ...d,
    fill: palette[i % palette.length].base,
    gradientFill: `url(#grad-${i})`,
  }));

  return (
    <ResponsiveContainer width="100%" height={190}>
      <PieChart>
        <defs>{gradientDefs}</defs>
        <Pie
          data={coloredData}
          cx="50%" cy="50%"
          innerRadius={54}
          outerRadius={78}
          paddingAngle={4}
          dataKey="value"
          stroke="none"
          activeIndex={activeIndex}
          activeShape={activeShape}
          onMouseEnter={(_, i) => setActiveIndex(i)}
          onMouseLeave={() => setActiveIndex(null)}
          startAngle={90}
          endAngle={-270}
        >
          {coloredData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.gradientFill}
              style={{
                filter: activeIndex === index
                  ? `drop-shadow(0 0 8px ${palette[index % palette.length].base}66)`
                  : 'none',
                transition: 'filter 0.2s',
                cursor: 'pointer',
              }}
            />
          ))}
        </Pie>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.5rem', fill: '#64748b' }}>
          {/* recharts doesn't support dynamic text in label well here; handled via labelList */}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ─────────────────────────────────────────────
   Legend strip
───────────────────────────────────────────── */
function Legend({ data, palette, total }) {
  return (
    <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {data.map((entry, i) => {
        const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';
        const color = palette[i % palette.length].base;
        return (
          <div key={i} className="legend-row" style={{ padding: '5px 8px' }}>
            <span className="legend-dot" style={{ background: color }} />
            <span className="legend-name">{entry.name}</span>
            <span className="legend-count">{entry.value.toLocaleString()}</span>
            <span className="legend-pct">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main export
───────────────────────────────────────────── */
export default function Charts({ stats }) {
  const qualityData = [
    { name: 'Named Schools', value: stats.named || 0 },
    { name: 'Unnamed Schools', value: stats.unnamed || 0 },
  ];

  const ownershipData = [
    { name: 'Public', value: stats.public || 0 },
    { name: 'Private', value: stats.private || 0 },
    { name: 'Community', value: stats.community || 0 },
    { name: 'Unknown', value: stats.unknown || 0 },
  ].filter(d => d.value > 0);

  const namedPct = stats.total > 0
    ? ((stats.named / stats.total) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="charts-root" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{themeStyle}</style>

      {/* ── Card 1: School Data Quality ── */}
      <div className="chart-card">
        <div className="chart-header">
          <h2 className="chart-heading">School Data Quality</h2>
          <p className="chart-subcount">{(stats.total || 0).toLocaleString()} schools total</p>
        </div>

        {stats.total > 0 ? (
          <>
            <DonutChart
              data={qualityData}
              palette={QUALITY_PALETTE}
              total={stats.total}
              centerLabel="total"
            />
            <Legend data={qualityData} palette={QUALITY_PALETTE} total={stats.total} />
          </>
        ) : (
          <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--label-color)', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem' }}>
            No data available
          </div>
        )}
      </div>

      {/* ── Card 2: School Ownership Types ── */}
      <div className="chart-card">
        <div className="chart-header">
          <h2 className="chart-heading">School Ownership Types</h2>
          <p className="chart-subcount">{ownershipData.length} categories</p>
        </div>

        {ownershipData.length > 0 ? (
          <>
            <DonutChart
              data={ownershipData}
              palette={OWNERSHIP_PALETTE}
              total={stats.total}
              centerLabel="schools"
            />
            <Legend data={ownershipData} palette={OWNERSHIP_PALETTE} total={stats.total} />
          </>
        ) : (
          <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--label-color)', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem' }}>
            No data available
          </div>
        )}
      </div>

      {/* ── Insight box ── */}
      <div className="insight-box">
        <Lightbulb size={18} style={{ color: 'var(--insight-icon)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p className="insight-title">Dynamic Insight</p>
          <p className="insight-body">
            {stats.unnamed > stats.named
              ? 'A majority of schools lack proper names. Focused mapping and data collection efforts are highly recommended.'
              : `Data quality is strong — ${namedPct}% of queried schools carry valid names, reflecting solid record-keeping.`}
          </p>
        </div>
      </div>
    </div>
  );
}