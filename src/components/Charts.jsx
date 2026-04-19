import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { Lightbulb } from 'lucide-react';

/* ─────────────────────────────────────────────
   THEME-AWARE CSS variables (injected inline)
   Works in both light and dark contexts.
───────────────────────────────────────────── */
const themeStyle = `
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
    --row-bg: rgba(241, 245, 249, 0.4);
    --row-border: #e2e8f0;
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
      --row-bg: rgba(30, 41, 59, 0.4);
      --row-border: #334155;
    }
  }

  .charts-root .chart-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 24px;
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
    font-family: inherit;
    font-size: 1.05rem;
    font-weight: 650;
    letter-spacing: -0.01em;
    color: var(--heading-color);
    margin: 0;
    line-height: 1.2;
  }

  .charts-root .chart-subcount {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--label-color);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 1px;
  }

  .charts-root .panel-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .charts-root .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: var(--legend-dot-shadow);
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
    font-family: inherit;
    font-size: 0.92rem;
    font-weight: 650;
    color: var(--heading-color);
    margin-bottom: 2px;
  }

  .charts-root .insight-body {
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
      startAngle, endAngle, midAngle, payload
    } = props;

    // Depend on payload.fill which is the raw un-gradiented original color
    const colors = palette.find(p => p.base === payload.fill) || palette[0];

    const RADIAN = Math.PI / 180;
    const offset = 10;
    const x = cx + Math.cos(-midAngle * RADIAN) * offset;
    const y = cy + Math.sin(-midAngle * RADIAN) * offset;

    return (
      <g>
        {/* BACKGROUND SHADOW (depth illusion) */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill="#00000020"
        />

        {/* MAIN ACTIVE SLICE (offset + larger) */}
        <Sector
          cx={x}
          cy={y}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 12}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={colors.dark}
          style={{ filter: `drop-shadow(0 8px 18px ${colors.base}88)` }}
        />
      </g>
    );
  };
}

/* ─────────────────────────────────────────────
   Center label inside donut
───────────────────────────────────────────── */
function CustomCenterLabel({ activeEntry, total }) {
  if (!activeEntry) return null;

  const pct = total > 0 ? ((activeEntry.value / total) * 100).toFixed(1) : '0.0';

  return (
    <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-10" style={{ fontFamily: 'inherit', fontSize: '1.6rem', fontWeight: 700, fill: 'var(--heading-color, #0f172a)' }}>
        {pct}%
      </tspan>
      <tspan x="50%" dy="22" style={{ fontFamily: 'inherit', fontSize: '0.65rem', fill: 'var(--label-color, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {activeEntry.name}
      </tspan>
      <tspan x="50%" dy="16" style={{ fontFamily: 'inherit', fontSize: '0.75rem', fill: 'var(--label-color, #64748b)' }}>
        {activeEntry.value.toLocaleString()} schools
      </tspan>
    </text>
  );
}

/* ─────────────────────────────────────────────
   Reusable DonutChart
───────────────────────────────────────────── */
function DonutChart({ data, palette, total }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % data.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [data]);

  const activeShape = useMemo(() => ActiveShape3D({ palette }), [palette]);

  const gradientDefs = palette.map((p, i) => (
    <radialGradient key={i} id={`grad-${p.base.replace('#', '')}`} cx="40%" cy="35%" r="65%">
      <stop offset="0%" stopColor={p.light} />
      <stop offset="60%" stopColor={p.base} />
      <stop offset="100%" stopColor={p.dark} />
    </radialGradient>
  ));

  const coloredData = data.map((d, i) => ({
    ...d,
    fill: palette[i % palette.length].base,
    gradientFill: `url(#grad-${palette[i % palette.length].base.replace('#', '')})`,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '20px' }}>
      {/* ── Left Side: Category Details Panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '20px' }}>
        {coloredData.map((entry, i) => {
          const isActive = i === activeIndex;
          const color = palette[i % palette.length].base;
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';

          return (
            <div
              key={i}
              className="panel-row"
              style={{
                background: isActive ? `${color}10` : 'var(--row-bg)',
                border: `1px solid ${isActive ? color + '60' : 'var(--row-border)'}`,
                boxShadow: isActive ? `0 1px 5px ${color}55` : 'none',
              }}
            >
              <span className="legend-dot" style={{ background: color }} />
              <span style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.85rem',
                flex: 1,
                color: isActive ? color : 'var(--text-main)',
                fontWeight: isActive ? 700 : 500,
              }}>
                {entry.name}
              </span>
              <span style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.8rem',
                color: isActive ? color : 'var(--label-color)',
                fontWeight: isActive ? 600 : 400,
                textAlign: 'right'
              }}>
                {entry.value.toLocaleString()}
              </span>
              <span style={{
                fontFamily: '"Sora", sans-serif',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: isActive ? color : 'var(--pct-badge-text)',
                background: isActive ? `${color}18` : 'var(--pct-badge-bg)',
                border: `1px solid ${isActive ? color + '40' : 'var(--pct-badge-border)'}`,
                padding: '2px 8px',
                borderRadius: '20px',
                minWidth: '50px',
                textAlign: 'center'
              }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Right Side: Chart Only ── */}
      <div style={{ width: '220px', height: '220px', flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>{gradientDefs}</defs>
            <Pie
              data={coloredData}
              cx="50%" cy="50%"
              innerRadius={75}
              outerRadius={105}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              activeIndex={activeIndex}
              activeShape={activeShape}
              startAngle={90}
              endAngle={-270}
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              animationDuration={420}
              isAnimationActive
            >
              {coloredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.gradientFill}
                  style={{
                    opacity: activeIndex === index ? 1 : 0.85,
                    transform: activeIndex === index ? 'scale(1.03)' : 'scale(0.95)',
                    transformOrigin: 'center',
                    transition: 'all 0.35s ease'
                  }}
                />
              ))}
            </Pie>
            <g>
              <CustomCenterLabel viewBox={{ cx: '50%', cy: '50%' }} activeEntry={coloredData[activeIndex]} total={total} />
            </g>
          </PieChart>
        </ResponsiveContainer>
      </div>
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
          <DonutChart
            data={qualityData}
            palette={QUALITY_PALETTE}
            total={stats.total}
          />
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
          <DonutChart
            data={ownershipData}
            palette={OWNERSHIP_PALETTE}
            total={stats.total}
          />
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
              : `Data quality is strong, ${namedPct}% of queried schools carry valid names, reflecting solid record-keeping.`}
          </p>
        </div>
      </div>
    </div>
  );
}