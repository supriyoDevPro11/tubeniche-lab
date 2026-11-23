'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { opportunityScore, scoreTier, readiness } from '@/lib/scoring';
import { Radar } from '@/lib/charts';
import { Empty } from '@/components/ui';
import type { Route } from '@/components/App';

export function Compare({ go }: { go: (r: Route) => void }) {
  const { data } = useStore();
  const weights = data.settings.weights;
  const [picked, setPicked] = useState<string[]>(data.niches.slice(0, 3).map((n) => n.id));

  const selected = useMemo(
    () => picked.map((id) => data.niches.find((n) => n.id === id)).filter(Boolean) as typeof data.niches,
    [picked, data.niches],
  );

  const toggle = (id: string) => {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 4 ? p : [...p, id]));
  };

  const rows: { label: string; get: (n: typeof data.niches[number]) => string | number; hi?: 'max' | 'min' }[] = [
    { label: 'Opportunity score', get: (n) => opportunityScore(n, weights), hi: 'max' },
    { label: 'Trend score', get: (n) => n.trend.score, hi: 'max' },
    { label: 'Momentum', get: (n) => n.trend.momentum },
    { label: 'Virality potential', get: (n) => n.virality.potential, hi: 'max' },
    { label: 'Shareability', get: (n) => n.virality.shareability, hi: 'max' },
    { label: 'Competition', get: (n) => n.competition.score, hi: 'min' },
    { label: 'Saturation', get: (n) => n.competition.saturation },
    { label: 'Monetization', get: (n) => n.competition.monetization },
    { label: 'Avg views', get: (n) => n.virality.avgViews || '—' },
    { label: 'Search volume', get: (n) => n.trend.searchVolume || '—' },
    { label: 'Production ready', get: (n) => `${readiness(n)}%`, hi: 'max' },
    { label: 'Assets tracked', get: (n) => n.assets.length, hi: 'max' },
    { label: 'Video ideas', get: (n) => n.videoPlan.ideas.length, hi: 'max' },
  ];

  const best = (row: typeof rows[number]) => {
    if (!row.hi || selected.length < 2) return null;
    const vals = selected.map((n) => Number(row.get(n))).filter((v) => !Number.isNaN(v));
    if (!vals.length) return null;
    return row.hi === 'max' ? Math.max(...vals) : Math.min(...vals);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Compare <em>Niches</em></h1>
          <p className="page-sub">
            Pick up to 4 niches for a side-by-side breakdown. Best value in each row is highlighted.
          </p>
        </div>
        <span className="chip chip-violet">{picked.length}/4 selected</span>
      </div>

      <div className="toolbar">
        <span className="tiny muted" style={{ fontWeight: 650 }}>Select:</span>
        {data.niches.map((n) => (
          <button
            key={n.id}
            className={`chip ${picked.includes(n.id) ? 'chip-fuchsia' : ''}`}
            style={{ cursor: 'pointer', opacity: picked.includes(n.id) ? 1 : 0.55 }}
            onClick={() => toggle(n.id)}
          >
            {n.emoji} {n.name}
          </button>
        ))}
      </div>

      {selected.length === 0 ? (
        <Empty icon="⇄" title="Nothing selected" sub="Pick at least two niches above to compare them." />
      ) : (
        <div className="stack">
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Shape comparison</div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`, gap: 10, placeItems: 'center' }}>
              {selected.map((n) => (
                <div key={n.id} style={{ textAlign: 'center' }}>
                  <div className="tiny" style={{ marginBottom: 4, fontWeight: 650 }}>{n.emoji} {n.name}</div>
                  <Radar
                    size={230}
                    color={n.color}
                    axes={[
                      { label: 'Trend', value: n.trend.score },
                      { label: 'Viral', value: n.virality.potential },
                      { label: 'Share', value: n.virality.shareability },
                      { label: 'LowComp', value: 100 - n.competition.score },
                      { label: 'Ready', value: readiness(n) },
                    ]}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ minWidth: 150 }}>Metric</th>
                  {selected.map((n) => (
                    <th key={n.id} style={{ textAlign: 'right' }}>
                      {n.emoji} {n.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const b = best(row);
                  return (
                    <tr key={row.label}>
                      <td className="muted" style={{ fontWeight: 600 }}>{row.label}</td>
                      {selected.map((n) => {
                        const v = row.get(n);
                        const isBest = b !== null && Number(v) === b;
                        return (
                          <td key={n.id} style={{ textAlign: 'right', textTransform: 'capitalize' }}>
                            <span
                              className={isBest ? 'chip chip-emerald' : ''}
                              style={isBest ? { fontWeight: 750 } : { fontWeight: 600 }}
                            >
                              {isBest && '★ '}
                              {v}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid-2">
            {selected.map((n) => {
              const score = opportunityScore(n, weights);
              const tier = scoreTier(score);
              return (
                <div key={n.id} className="card">
                  <div className="row" style={{ gap: 11 }}>
                    <div className="niche-emoji" style={{ background: `${n.color}22`, borderColor: `${n.color}44` }}>{n.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{n.name}</div>
                      <div className="tiny muted">{n.category}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="opp-num" style={{ color: tier.color }}>{score}</div>
                      <div className="tiny" style={{ color: tier.color }}>{tier.label}</div>
                    </div>
                  </div>
                  {n.notes && <p className="tiny muted" style={{ marginTop: 10, lineHeight: 1.55 }}>{n.notes}</p>}
                  <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={() => go({ view: 'niche', id: n.id })}>
                    Open niche →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
