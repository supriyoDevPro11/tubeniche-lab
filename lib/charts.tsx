'use client';

/** Hand-rolled SVG charts — no dependencies, works offline. */

export function Sparkline({
  data,
  width = 120,
  height = 32,
  color = '#a78bfa',
  fill = true,
  strokeWidth = 1.8,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  strokeWidth?: number;
}) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const pts = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - strokeWidth * 2) - strokeWidth;
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  const gid = `spark-${color.replace('#', '')}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.34" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2.6} fill={color} />
    </svg>
  );
}

export function Gauge({
  value,
  size = 96,
  color = '#8b5cf6',
  label,
  thickness = 7,
}: {
  value: number;
  size?: number;
  color?: string;
  label?: string;
  thickness?: number;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * c;

  return (
    <div className="gauge-wrap">
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.09)" strokeWidth={thickness} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            style={{ transition: 'stroke-dasharray .7s cubic-bezier(.22,1,.36,1)', filter: `drop-shadow(0 0 6px ${color}70)` }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            flexDirection: 'column',
          }}
        >
          <span className="gauge-val">{Math.round(pct)}</span>
        </div>
      </div>
      {label && <span className="gauge-lbl">{label}</span>}
    </div>
  );
}

export function Radar({
  axes,
  size = 260,
  color = '#ec4899',
  compareColor = '#22d3ee',
  compare,
}: {
  axes: { label: string; value: number }[];
  size?: number;
  color?: string;
  compareColor?: string;
  compare?: number[];
}) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 34;
  const n = axes.length;

  const pointAt = (i: number, v: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rr = (Math.max(0, Math.min(100, v)) / 100) * maxR;
    return [cx + Math.cos(angle) * rr, cy + Math.sin(angle) * rr] as const;
  };

  const poly = (vals: number[]) =>
    vals.map((v, i) => pointAt(i, v).join(',')).join(' ');

  const rings = [25, 50, 75, 100];

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={Array.from({ length: n }, (_, i) => pointAt(i, ring).join(',')).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,.075)"
          strokeWidth={1}
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pointAt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,.075)" strokeWidth={1} />;
      })}
      {compare && (
        <polygon
          points={poly(compare)}
          fill={compareColor}
          fillOpacity={0.13}
          stroke={compareColor}
          strokeWidth={1.8}
          strokeDasharray="4 3"
        />
      )}
      <polygon
        points={poly(axes.map((a) => a.value))}
        fill={color}
        fillOpacity={0.2}
        stroke={color}
        strokeWidth={2.2}
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 10px ${color}60)` }}
      />
      {axes.map((a, i) => {
        const [x, y] = pointAt(i, 118);
        return (
          <text
            key={a.label}
            x={x}
            y={y}
            textAnchor={Math.abs(x - cx) < 14 ? 'middle' : x > cx ? 'start' : 'end'}
            dominantBaseline="middle"
            fontSize="9.5"
            fontWeight="600"
            fill="rgba(243,239,253,.62)"
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}

export function BarChart({
  data,
  height = 130,
  color = '#22d3ee',
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  color?: string;
}) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height, paddingTop: 8 }}>
      {data.map((d) => {
        const h = (d.value / max) * (height - 32);
        return (
          <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{d.value}</span>
            <div
              style={{
                width: '100%',
                maxWidth: 42,
                height: Math.max(4, h),
                borderRadius: 7,
                background: d.color ?? color,
                boxShadow: `0 0 18px -4px ${d.color ?? color}`,
                transition: 'height .6s cubic-bezier(.22,1,.36,1)',
              }}
            />
            <span style={{ fontSize: 9.5, color: 'var(--muted-2)', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Funnel({ stages }: { stages: { label: string; count: number; color: string }[] }) {
  const max = Math.max(...stages.map((s) => s.count), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {stages.map((s) => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 80, fontSize: 11.5, color: 'var(--muted)', fontWeight: 600, flexShrink: 0 }}>{s.label}</span>
          <div style={{ flex: 1, height: 22, borderRadius: 7, background: 'rgba(255,255,255,.055)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.max(4, (s.count / max) * 100)}%`,
                height: '100%',
                borderRadius: 7,
                background: `linear-gradient(90deg, ${s.color}, ${s.color}99)`,
                transition: 'width .6s cubic-bezier(.22,1,.36,1)',
              }}
            />
          </div>
          <span style={{ width: 24, textAlign: 'right', fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{s.count}</span>
        </div>
      ))}
    </div>
  );
}
