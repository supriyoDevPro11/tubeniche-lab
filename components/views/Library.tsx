'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { opportunityScore, scoreTier, momentumMeta, readiness } from '@/lib/scoring';
import { STAGES, MOMENTUMS, CATEGORIES } from '@/lib/types';
import { Sparkline } from '@/lib/charts';
import { Empty, Confirm } from '@/components/ui';
import type { Route } from '@/components/App';

type SortKey = 'opportunity' | 'trend' | 'virality' | 'competition' | 'name' | 'updated';

export function Library({
  go,
  onAdd,
  push,
}: {
  go: (r: Route) => void;
  onAdd: () => void;
  push: (t: string, i?: string) => void;
}) {
  const { data, updateNiche, removeMany } = useStore();
  const weights = data.settings.weights;
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [stage, setStage] = useState('all');
  const [momentum, setMomentum] = useState('all');
  const [sort, setSort] = useState<SortKey>('opportunity');
  const [layout, setLayout] = useState<'grid' | 'table'>('grid');
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmBulk, setConfirmBulk] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let out = data.niches.filter((n) => {
      if (category !== 'all' && n.category !== category) return false;
      if (stage !== 'all' && n.stage !== stage) return false;
      if (momentum !== 'all' && n.trend.momentum !== momentum) return false;
      if (!query) return true;
      return [n.name, n.category, n.notes, ...n.trend.keywords, ...n.videoPlan.pillars, ...n.competition.gaps]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });

    out = [...out].sort((a, b) => {
      switch (sort) {
        case 'trend': return b.trend.score - a.trend.score;
        case 'virality': return b.virality.potential - a.virality.potential;
        case 'competition': return a.competition.score - b.competition.score;
        case 'name': return a.name.localeCompare(b.name);
        case 'updated': return b.updatedAt - a.updatedAt;
        default: return opportunityScore(b, weights) - opportunityScore(a, weights);
      }
    });
    return out;
  }, [data.niches, q, category, stage, momentum, sort, weights]);

  const toggleSel = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const toggleFav = (id: string) => {
    updateNiche(id, (n) => ({ ...n, favorite: !n.favorite }));
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            Niche <em>Library</em>
          </h1>
          <p className="page-sub">
            {data.niches.length} niches tracked. Add as many as you want — everything is scored and
            searchable.
          </p>
        </div>
        <div className="head-actions">
          <div className="row" style={{ gap: 4, padding: 3, borderRadius: 11, border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <button
              className={`btn btn-sm ${layout === 'grid' ? '' : 'btn-ghost'}`}
              style={{ border: 'none', background: layout === 'grid' ? 'var(--surface-2)' : 'transparent' }}
              onClick={() => setLayout('grid')}
            >
              ▦ Grid
            </button>
            <button
              className={`btn btn-sm ${layout === 'table' ? '' : 'btn-ghost'}`}
              style={{ border: 'none', background: layout === 'table' ? 'var(--surface-2)' : 'transparent' }}
              onClick={() => setLayout('table')}
            >
              ▤ Table
            </button>
          </div>
          <button className="btn btn-primary" onClick={onAdd}>
            ＋ New Niche
          </button>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="input"
          style={{ flex: 1, minWidth: 160, maxWidth: 300 }}
          placeholder="Filter by name, keyword, gap…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="select" value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="all">All stages</option>
          {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select className="select" value={momentum} onChange={(e) => setMomentum(e.target.value)}>
          <option value="all">Any momentum</option>
          {MOMENTUMS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="opportunity">Sort: Opportunity</option>
          <option value="trend">Sort: Trend</option>
          <option value="virality">Sort: Virality</option>
          <option value="competition">Sort: Least competition</option>
          <option value="name">Sort: Name</option>
          <option value="updated">Sort: Recently updated</option>
        </select>
        <span className="spacer" />
        <span className="chip">{filtered.length} shown</span>
        {selected.length > 0 && (
          <button className="btn btn-sm btn-danger" onClick={() => setConfirmBulk(true)}>
            Delete {selected.length}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <Empty
          icon={data.niches.length ? '🔍' : '🧪'}
          title={data.niches.length ? 'No niches match those filters' : 'Your library is empty'}
          sub={
            data.niches.length
              ? 'Try clearing a filter or widening your search.'
              : 'Add your first niche to begin building your research library.'
          }
          action={
            data.niches.length ? (
              <button className="btn" onClick={() => { setQ(''); setCategory('all'); setStage('all'); setMomentum('all'); }}>
                Clear filters
              </button>
            ) : (
              <button className="btn btn-primary" onClick={onAdd}>＋ Add niche</button>
            )
          }
        />
      ) : layout === 'grid' ? (
        <div className="niche-grid">
          {filtered.map((n) => {
            const score = opportunityScore(n, weights);
            const tier = scoreTier(score);
            const mm = momentumMeta(n.trend.momentum);
            const st = STAGES.find((s) => s.id === n.stage)!;
            return (
              <div
                key={n.id}
                className="niche-card"
                style={{ ['--card-glow' as string]: `${n.color}45` }}
                onClick={() => go({ view: 'niche', id: n.id })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && go({ view: 'niche', id: n.id })}
              >
                <div className="niche-card-top">
                  {selected.includes(n.id) ? (
                    <span
                      className="check-box on"
                      onClick={(e) => { e.stopPropagation(); toggleSel(n.id); }}
                      style={{ marginTop: 14, cursor: 'pointer' }}
                    >
                      ✓
                    </span>
                  ) : null}
                  <div className="niche-emoji" style={{ background: `${n.color}22`, borderColor: `${n.color}44` }}>
                    {n.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="niche-name">{n.name}</div>
                    <div className="niche-meta">
                      <span>{n.category}</span>
                      <span>·</span>
                      <span>{st.icon} {st.label}</span>
                    </div>
                  </div>
                  <button
                    className={`fav-btn ${n.favorite ? 'on' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleFav(n.id); }}
                    aria-label="Toggle favorite"
                  >
                    {n.favorite ? '★' : '☆'}
                  </button>
                </div>

                <div className="score-row">
                  <MiniMeter label="Trend" value={n.trend.score} color="#a78bfa" />
                  <MiniMeter label="Viral" value={n.virality.potential} color="#f472b6" />
                  <MiniMeter label="Comp" value={n.competition.score} color="#fcd34d" invert />
                </div>

                <div className="opp-bar">
                  <span className="opp-num" style={{ color: tier.color }}>{score}</span>
                  <div style={{ flex: 1 }}>
                    <div className="opp-label">Opportunity</div>
                    <div className="tiny" style={{ color: tier.color, fontWeight: 650 }}>{tier.label}</div>
                  </div>
                  <Sparkline data={n.trend.history} width={58} height={26} color={tier.color} fill={false} />
                  <span className={`chip ${mm.id === 'rising' ? 'chip-emerald' : mm.id === 'falling' ? 'chip-coral' : ''}`}>
                    {mm.icon} {mm.label}
                  </span>
                </div>

                <div className="row-between tiny" style={{ color: 'var(--muted-2)' }}>
                  <span>{readiness(n)}% production-ready</span>
                  <span>{n.assets.length} assets · {n.videoPlan.ideas.length} ideas</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto', maxHeight: '70vh' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 34 }}></th>
                <th>Niche</th>
                <th>Category</th>
                <th>Stage</th>
                <th className="num">Trend</th>
                <th className="num">Viral</th>
                <th className="num">Comp</th>
                <th className="num">Opportunity</th>
                <th className="num">Ready</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => {
                const score = opportunityScore(n, weights);
                const tier = scoreTier(score);
                const st = STAGES.find((s) => s.id === n.stage)!;
                return (
                  <tr key={n.id} style={{ cursor: 'pointer' }} onClick={() => go({ view: 'niche', id: n.id })}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.includes(n.id)}
                        onChange={() => toggleSel(n.id)}
                        style={{ accentColor: '#ec4899', cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <span style={{ fontSize: 15, marginRight: 6 }}>{n.emoji}</span>
                      <b>{n.name}</b>
                      {n.favorite && <span style={{ color: '#fcd34d', marginLeft: 5 }}>★</span>}
                    </td>
                    <td className="muted">{n.category}</td>
                    <td><span className="chip">{st.icon} {st.label}</span></td>
                    <td className="num">{n.trend.score}</td>
                    <td className="num">{n.virality.potential}</td>
                    <td className="num">{n.competition.score}</td>
                    <td className="num">
                      <span style={{ color: tier.color, fontWeight: 750 }}>{score}</span>
                    </td>
                    <td className="num">{readiness(n)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {confirmBulk && (
        <Confirm
          title={`Delete ${selected.length} niches?`}
          message="This permanently removes the selected niches and all their assets and production plans. This cannot be undone."
          onCancel={() => setConfirmBulk(false)}
          onConfirm={() => {
            removeMany(selected);
            push(`Deleted ${selected.length} niches`, '🗑️');
            setSelected([]);
            setConfirmBulk(false);
          }}
        />
      )}
    </>
  );
}

function MiniMeter({
  label,
  value,
  color,
  invert,
}: {
  label: string;
  value: number;
  color: string;
  invert?: boolean;
}) {
  return (
    <div className="mini-meter">
      <div className="mini-meter-label">
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <div className="meter-track">
        <div
          className="meter-fill"
          style={{
            width: `${value}%`,
            background: invert
              ? `linear-gradient(90deg, #34d399, ${color})`
              : `linear-gradient(90deg, ${color}, ${color}aa)`,
          }}
        />
      </div>
    </div>
  );
}
