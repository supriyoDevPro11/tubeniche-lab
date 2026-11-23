'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { STAGES, type Stage } from '@/lib/types';
import { opportunityScore, scoreTier } from '@/lib/scoring';
import type { Route } from '@/components/App';

export function Pipeline({
  go,
  push,
}: {
  go: (r: Route) => void;
  push: (t: string, i?: string) => void;
}) {
  const { data, updateNiche, logActivity } = useStore();
  const weights = data.settings.weights;
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Stage | null>(null);

  const move = (id: string, stage: Stage) => {
    const niche = data.niches.find((n) => n.id === id);
    if (!niche || niche.stage === stage) return;
    updateNiche(id, (n) => ({ ...n, stage }));
    const s = STAGES.find((v) => v.id === stage)!;
    logActivity(id, `Stage → ${s.label}`);
    push(`${niche.name} → ${s.label}`, s.icon);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Production <em>Pipeline</em></h1>
          <p className="page-sub">
            Drag niches across stages as you move from idea to published. Everything saves instantly.
          </p>
        </div>
        <div className="head-actions">
          <span className="chip chip-violet">{data.niches.length} niches</span>
        </div>
      </div>

      <div className="kanban">
        {STAGES.map((s) => {
          const items = data.niches
            .filter((n) => n.stage === s.id)
            .sort((a, b) => opportunityScore(b, weights) - opportunityScore(a, weights));
          return (
            <div
              key={s.id}
              className={`kcol ${overCol === s.id ? 'over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setOverCol(s.id); }}
              onDragLeave={() => setOverCol((c) => (c === s.id ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                setOverCol(null);
                if (dragId) move(dragId, s.id);
                setDragId(null);
              }}
            >
              <div className="kcol-head">
                <span className="kcol-title" style={{ color: s.color }}>
                  {s.icon} {s.label}
                </span>
                <span className="kcol-count">{items.length}</span>
              </div>

              {items.length === 0 && (
                <div className="tiny muted" style={{ padding: '14px 8px', textAlign: 'center', opacity: 0.6 }}>
                  Drop niches here
                </div>
              )}

              {items.map((n) => {
                const score = opportunityScore(n, weights);
                const tier = scoreTier(score);
                return (
                  <div
                    key={n.id}
                    className={`kcard ${dragId === n.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => setDragId(n.id)}
                    onDragEnd={() => { setDragId(null); setOverCol(null); }}
                    onClick={() => go({ view: 'niche', id: n.id })}
                  >
                    <div className="kcard-title">
                      <span>{n.emoji}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>{n.name}</span>
                    </div>
                    <div className="row-between" style={{ marginTop: 9 }}>
                      <span className="tiny muted">{n.category}</span>
                      <span className="chip" style={{ color: tier.color, borderColor: `${tier.color}55`, fontSize: 10.5, padding: '1px 7px' }}>
                        {score}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
