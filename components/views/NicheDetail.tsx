'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import {
  opportunityScore, scoreTier, momentumMeta, trendSlope,
  readiness, editingProgress, assetProgress, timeAgo,
} from '@/lib/scoring';
import {
  STAGES, ASSET_KINDS, ASSET_STATUS, MOMENTUMS,
  type Asset, type ChecklistItem, type CapCutStep, type VideoIdea,
} from '@/lib/types';
import { Sparkline, Gauge, Radar } from '@/lib/charts';
import { Empty, CheckRow, ProgressBar, Confirm, Modal, Field, Slider, TagEditor } from '@/components/ui';
import { NicheForm } from '@/components/views/NicheForm';
import { uid } from '@/lib/seed';
import type { Route } from '@/components/App';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '◈' },
  { id: 'trend', label: 'Trend', icon: '📈' },
  { id: 'virality', label: 'Virality', icon: '🚀' },
  { id: 'competition', label: 'Competition', icon: '⚔️' },
  { id: 'plan', label: 'Video Plan', icon: '🎬' },
  { id: 'assets', label: 'Assets', icon: '📦' },
  { id: 'activity', label: 'Activity', icon: '🕘' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function NicheDetail({
  id,
  go,
  push,
}: {
  id: string;
  go: (r: Route) => void;
  push: (t: string, i?: string) => void;
}) {
  const { data, updateNiche, removeNiche, logActivity } = useStore();
  const weights = data.settings.weights;
  const niche = data.niches.find((n) => n.id === id);
  const [tab, setTab] = useState<TabId>('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  if (!niche) {
    return (
      <Empty
        icon="🫥"
        title="Niche not found"
        sub="It may have been deleted."
        action={<button className="btn" onClick={() => go({ view: 'library' })}>← Back to library</button>}
      />
    );
  }

  const n = niche;
  const score = opportunityScore(n, weights);
  const tier = scoreTier(score);
  const mm = momentumMeta(n.trend.momentum);
  const st = STAGES.find((s) => s.id === n.stage)!;
  const slope = trendSlope(n.trend.history);

  const patch = (fn: (x: typeof n) => typeof n) => updateNiche(id, fn);

  const changeStage = (stage: typeof n.stage) => {
    updateNiche(id, (x) => ({ ...x, stage }));
    const s = STAGES.find((v) => v.id === stage)!;
    logActivity(id, `Stage → ${s.label}`);
    push(`Moved to ${s.label}`, s.icon);
  };

  return (
    <>
      <button className="back-link" onClick={() => go({ view: 'library' })}>← Niche Library</button>

      <div className="detail-hero" style={{ ['--hero-glow' as string]: `${n.color}38` }}>
        <div className="row-between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div className="row" style={{ gap: 16, minWidth: 0 }}>
            <div
              className="niche-emoji"
              style={{ width: 62, height: 62, fontSize: 30, borderRadius: 18, background: `${n.color}22`, borderColor: `${n.color}44` }}
            >
              {n.emoji}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 className="page-title" style={{ fontSize: 26 }}>{n.name}</h1>
              <div className="row" style={{ gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <span className="chip" style={{ borderColor: `${n.color}55`, color: n.color }}>{n.category}</span>
                <span className="chip">{st.icon} {st.label}</span>
                <span className={`chip ${n.trend.momentum === 'rising' ? 'chip-emerald' : n.trend.momentum === 'falling' ? 'chip-coral' : ''}`}>
                  {mm.icon} {mm.label}
                </span>
                <span className={`chip ${tier.tier === 'elite' ? 'chip-emerald' : tier.tier === 'risky' ? 'chip-coral' : tier.tier === 'promising' ? 'chip-amber' : 'chip-lime'}`}>
                  {tier.label}
                </span>
              </div>
            </div>
          </div>

          <div className="row" style={{ gap: 8 }}>
            <button
              className={`btn btn-icon ${n.favorite ? '' : 'btn-ghost'}`}
              onClick={() => patch((x) => ({ ...x, favorite: !x.favorite }))}
              title="Favorite"
              style={n.favorite ? { color: '#fcd34d' } : undefined}
            >
              {n.favorite ? '★' : '☆'}
            </button>
            <button className="btn btn-icon" onClick={() => setEditOpen(true)} title="Edit">✏️</button>
            <button className="btn btn-icon btn-danger" onClick={() => setConfirmDel(true)} title="Delete">🗑</button>
          </div>
        </div>

        <div className="grid-3" style={{ marginTop: 22, gap: 14 }}>
          <div className="opp-bar">
            <span className="opp-num" style={{ color: tier.color, fontSize: 26 }}>{score}</span>
            <div>
              <div className="opp-label">Opportunity score</div>
              <div className="tiny" style={{ color: tier.color, fontWeight: 650 }}>{tier.label} tier</div>
            </div>
          </div>
          <div className="opp-bar">
            <span className="opp-num" style={{ fontSize: 26, color: slope >= 0 ? '#34d399' : '#fb7185' }}>
              {slope >= 0 ? '▲' : '▼'} {Math.abs(Math.round(slope * 100))}%
            </span>
            <div>
              <div className="opp-label">Trend slope</div>
              <div className="tiny muted">{n.trend.history.length} data points</div>
            </div>
          </div>
          <div className="opp-bar">
            <span className="opp-num" style={{ fontSize: 26, color: '#22d3ee' }}>{readiness(n)}%</span>
            <div>
              <div className="opp-label">Production ready</div>
              <div className="tiny muted">{n.assets.length} assets · {n.videoPlan.ideas.length} ideas</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="tiny muted" style={{ marginBottom: 8, fontWeight: 600 }}>Stage</div>
          <div className="chips">
            {STAGES.map((s) => (
              <button
                key={s.id}
                className={`chip ${n.stage === s.id ? 'chip-violet' : ''}`}
                onClick={() => changeStage(s.id)}
                style={{ cursor: 'pointer', opacity: n.stage === s.id ? 1 : 0.62 }}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span className="ico">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab n={n} patch={patch} score={score} tier={tier} go={go} />}
      {tab === 'trend' && <TrendTab n={n} patch={patch} logActivity={logActivity} />}
      {tab === 'virality' && <ViralityTab n={n} patch={patch} />}
      {tab === 'competition' && <CompetitionTab n={n} patch={patch} />}
      {tab === 'plan' && <PlanTab n={n} patch={patch} push={push} logActivity={logActivity} />}
      {tab === 'assets' && <AssetsTab n={n} patch={patch} push={push} />}
      {tab === 'activity' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Activity log</div>
          {n.activity.length === 0 ? (
            <div className="tiny muted">No activity yet.</div>
          ) : (
            <div className="stack" style={{ gap: 0 }}>
              {n.activity.map((a, i) => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex', gap: 12, padding: '11px 0',
                    borderBottom: i < n.activity.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: n.color, marginTop: 7, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13 }}>{a.text}</div>
                    <div className="tiny muted" style={{ marginTop: 2 }}>{timeAgo(a.at)} · {new Date(a.at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editOpen && (
        <NicheForm
          initial={n}
          onClose={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); push('Niche updated', '💾'); }}
        />
      )}

      {confirmDel && (
        <Confirm
          title={`Delete "${n.name}"?`}
          message="This removes the niche, its video plan, and all assets. This cannot be undone."
          onCancel={() => setConfirmDel(false)}
          onConfirm={() => {
            removeNiche(id);
            push('Niche deleted', '🗑️');
            go({ view: 'library' });
          }}
        />
      )}
    </>
  );
}

/* ---------------- OVERVIEW ---------------- */

function OverviewTab({
  n, patch, score, tier, go,
}: {
  n: ReturnType<typeof useStore>['data']['niches'][number];
  patch: (fn: (x: typeof n) => typeof n) => void;
  score: number;
  tier: ReturnType<typeof scoreTier>;
  go: (r: Route) => void;
}) {
  const radarAxes = [
    { label: 'Trend', value: n.trend.score },
    { label: 'Virality', value: n.virality.potential },
    { label: 'Shareability', value: n.virality.shareability },
    { label: 'Low comp.', value: 100 - n.competition.score },
    { label: 'Monetize', value: n.competition.monetization === 'easy' ? 85 : n.competition.monetization === 'medium' ? 58 : 32 },
    { label: 'Ready', value: readiness(n) },
  ];

  return (
    <div className="stack">
      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 4 }}>Niche fingerprint</div>
          <div className="card-sub" style={{ marginBottom: 8 }}>Six-axis view of the opportunity</div>
          <div style={{ display: 'grid', placeItems: 'center', padding: '6px 0' }}>
            <Radar axes={radarAxes} size={290} color={n.color} />
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Key metrics</div>
            <div className="grid-3" style={{ gap: 10 }}>
              <Gauge value={n.trend.score} label="Trend" color="#a78bfa" size={84} />
              <Gauge value={n.virality.potential} label="Viral" color="#f472b6" size={84} />
              <Gauge value={n.competition.score} label="Comp" color="#fcd34d" size={84} />
            </div>
          </div>
          <div className="card">
            <ProgressBar pct={editingProgress(n)} label="Editing pipeline" />
            <div style={{ height: 12 }} />
            <ProgressBar pct={assetProgress(n)} label="Assets collected" />
            <div style={{ height: 12 }} />
            <ProgressBar pct={readiness(n)} label="Overall readiness" />
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>📝 Notes</div>
          <textarea
            className="textarea"
            value={n.notes}
            placeholder="Strategic thinking, audience insights, anything you don't want to forget…"
            onChange={(e) => patch((x) => ({ ...x, notes: e.target.value }))}
            style={{ width: '100%', minHeight: 110 }}
          />
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>🏷 Quick facts</div>
          <div className="stack" style={{ gap: 0 }}>
            {[
              ['Search volume', n.trend.searchVolume || '—'],
              ['Avg views', n.virality.avgViews || '—'],
              ['Sub growth', n.virality.subGrowth || '—'],
              ['Top channels', String(n.competition.topChannels || '—')],
              ['Saturation', n.competition.saturation],
              ['Monetization', n.competition.monetization],
              ['Created', new Date(n.createdAt).toLocaleDateString()],
              ['Updated', timeAgo(n.updatedAt)],
            ].map(([k, v], i, arr) => (
              <div
                key={k}
                className="row-between"
                style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <span className="tiny muted">{k}</span>
                <b style={{ fontSize: 13, textTransform: k === 'Saturation' || k === 'Monetization' ? 'capitalize' : 'none' }}>{v}</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(n.trend.keywords.length > 0 || n.videoPlan.pillars.length > 0 || n.competition.gaps.length > 0) && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>🏷 Tags & angles</div>
          <div className="stack" style={{ gap: 14 }}>
            {n.trend.keywords.length > 0 && (
              <div>
                <div className="tiny muted" style={{ marginBottom: 7, fontWeight: 650 }}>Keywords</div>
                <div className="chips">{n.trend.keywords.map((k) => <span key={k} className="chip chip-violet">{k}</span>)}</div>
              </div>
            )}
            {n.videoPlan.pillars.length > 0 && (
              <div>
                <div className="tiny muted" style={{ marginBottom: 7, fontWeight: 650 }}>Content pillars</div>
                <div className="chips">{n.videoPlan.pillars.map((k) => <span key={k} className="chip chip-fuchsia">{k}</span>)}</div>
              </div>
            )}
            {n.competition.gaps.length > 0 && (
              <div>
                <div className="tiny muted" style={{ marginBottom: 7, fontWeight: 650 }}>Content gaps</div>
                <div className="chips">{n.competition.gaps.map((k) => <span key={k} className="chip chip-emerald">{k}</span>)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- TREND ---------------- */

function TrendTab({
  n, patch, logActivity,
}: {
  n: ReturnType<typeof useStore>['data']['niches'][number];
  patch: (fn: (x: typeof n) => typeof n) => void;
  logActivity: (id: string, text: string) => void;
}) {
  return (
    <div className="grid-2">
      <div className="stack">
        <div className="card">
          <div className="row-between" style={{ marginBottom: 16 }}>
            <div>
              <div className="card-title">📈 Trend score</div>
              <div className="card-sub">How hot the niche is right now</div>
            </div>
            <span className="opp-num" style={{ color: '#a78bfa' }}>{n.trend.score}</span>
          </div>
          <Slider
            label="Trend score"
            value={n.trend.score}
            color="#a78bfa"
            onChange={(v) => patch((x) => ({ ...x, trend: { ...x.trend, score: v } }))}
          />
          <div style={{ height: 18 }} />
          <div className="field">
            <label>Momentum</label>
            <div className="chips">
              {MOMENTUMS.map((m) => (
                <button
                  key={m.id}
                  className={`chip ${n.trend.momentum === m.id ? 'chip-violet' : ''}`}
                  onClick={() => patch((x) => ({ ...x, trend: { ...x.trend, momentum: m.id } }))}
                  style={{ cursor: 'pointer', opacity: n.trend.momentum === m.id ? 1 : 0.6 }}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 18 }} />
          <Field label="Search volume">
            <input
              className="input"
              value={n.trend.searchVolume}
              onChange={(e) => patch((x) => ({ ...x, trend: { ...x.trend, searchVolume: e.target.value } }))}
              placeholder="e.g. 1.2M/mo"
            />
          </Field>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>🔑 Search keywords</div>
          <TagEditor
            tags={n.trend.keywords}
            onChange={(keywords) => patch((x) => ({ ...x, trend: { ...x.trend, keywords } }))}
            placeholder="Add a keyword…"
          />
        </div>
      </div>

      <div className="stack">
        <div className="card">
          <div className="row-between" style={{ marginBottom: 10 }}>
            <div>
              <div className="card-title">Trend history</div>
              <div className="card-sub">Last {n.trend.history.length} readings</div>
            </div>
            <Sparkline data={n.trend.history} width={130} height={40} color="#a78bfa" />
          </div>
          <SparkHistoryChart history={n.trend.history} />
          <div className="row" style={{ gap: 8, marginTop: 14 }}>
            <button
              className="btn btn-sm"
              onClick={() => {
                const next = Math.min(100, Math.round(n.trend.history[n.trend.history.length - 1] * 1.06) || 50);
                patch((x) => ({ ...x, trend: { ...x.trend, history: [...x.trend.history, next].slice(-24) } }));
                logActivity(n.id, 'Logged new trend reading');
              }}
            >
              ＋ Log reading
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => patch((x) => ({ ...x, trend: { ...x.trend, history: x.trend.history.slice(0, -1) } }))}
              disabled={n.trend.history.length < 2}
            >
              Undo last
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>🎯 Opportunity breakdown</div>
          <div className="stack" style={{ gap: 12 }}>
            <ProgressBar pct={n.trend.score} label="Trend contribution" />
            <ProgressBar pct={n.virality.potential} label="Virality contribution" />
            <ProgressBar pct={100 - n.competition.score} label="Competition advantage" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SparkHistoryChart({ history }: { history: number[] }) {
  const w = 100;
  const h = 34;
  if (history.length < 2) return <div className="tiny muted">Log at least two readings to see a chart.</div>;
  const max = Math.max(...history, 100);
  const min = Math.min(...history, 0);
  const range = max - min || 1;
  const step = w / (history.length - 1);
  const pts = history.map((v, i) => [(i * step).toFixed(2), (h - ((v - min) / range) * h).toFixed(2)]);
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 110 }}>
      <defs>
        <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill="url(#histGrad)" />
      <path d={line} fill="none" stroke="#a78bfa" strokeWidth="0.9" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.9" fill="#a78bfa" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

/* ---------------- VIRALITY ---------------- */

function ViralityTab({
  n, patch,
}: {
  n: ReturnType<typeof useStore>['data']['niches'][number];
  patch: (fn: (x: typeof n) => typeof n) => void;
}) {
  const [hook, setHook] = useState('');

  const addHook = () => {
    const v = hook.trim();
    if (!v) return;
    patch((x) => ({ ...x, virality: { ...x.virality, hooks: [...x.virality.hooks, v] } }));
    setHook('');
  };

  return (
    <div className="grid-2">
      <div className="stack">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 4 }}>🚀 Virality potential</div>
          <div className="card-sub" style={{ marginBottom: 16 }}>How likely this content travels beyond your subscribers</div>
          <Slider label="Viral potential" value={n.virality.potential} color="#f472b6"
            onChange={(v) => patch((x) => ({ ...x, virality: { ...x.virality, potential: v } }))} />
          <div style={{ height: 18 }} />
          <Slider label="Shareability" value={n.virality.shareability} color="#22d3ee"
            onChange={(v) => patch((x) => ({ ...x, virality: { ...x.virality, shareability: v } }))} />
          <div className="form-grid" style={{ marginTop: 18 }}>
            <Field label="Avg views">
              <input className="input" value={n.virality.avgViews}
                onChange={(e) => patch((x) => ({ ...x, virality: { ...x.virality, avgViews: e.target.value } }))}
                placeholder="e.g. 180K" />
            </Field>
            <Field label="Sub growth">
              <input className="input" value={n.virality.subGrowth}
                onChange={(e) => patch((x) => ({ ...x, virality: { ...x.virality, subGrowth: e.target.value } }))}
                placeholder="e.g. +14%/mo" />
            </Field>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>🎞 Formats that work</div>
          <TagEditor
            tags={n.virality.formats}
            onChange={(formats) => patch((x) => ({ ...x, virality: { ...x.virality, formats } }))}
            placeholder="e.g. Screen-recording explainer…"
          />
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 4 }}>🪝 Hook bank</div>
        <div className="card-sub" style={{ marginBottom: 14 }}>Lines that stop the scroll — reuse and remix these</div>
        <div className="row" style={{ gap: 8, marginBottom: 14 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHook()}
            placeholder='e.g. "This AI tool replaced my $2,000/mo editor"'
          />
          <button className="btn" onClick={addHook}>Add</button>
        </div>
        {n.virality.hooks.length === 0 ? (
          <div className="tiny muted">No hooks saved yet.</div>
        ) : (
          <div className="stack" style={{ gap: 8 }}>
            {n.virality.hooks.map((h, i) => (
              <div key={i} className="opp-bar" style={{ alignItems: 'flex-start' }}>
                <span className="mono" style={{ color: 'var(--muted-2)', fontSize: 10.5 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ flex: 1, fontSize: 13, lineHeight: 1.5 }}>{h}</span>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => patch((x) => ({ ...x, virality: { ...x.virality, hooks: x.virality.hooks.filter((_, j) => j !== i) } }))}
                  aria-label="Remove hook"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- COMPETITION ---------------- */

function CompetitionTab({
  n, patch,
}: {
  n: ReturnType<typeof useStore>['data']['niches'][number];
  patch: (fn: (x: typeof n) => typeof n) => void;
}) {
  return (
    <div className="grid-2">
      <div className="stack">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 4 }}>⚔️ Competition analysis</div>
          <div className="card-sub" style={{ marginBottom: 16 }}>Higher score = more crowded = harder to break in</div>
          <Slider label="Competition score" value={n.competition.score} color="#fcd34d"
            onChange={(v) => patch((x) => ({ ...x, competition: { ...x.competition, score: v } }))} />
          <div className="form-grid" style={{ marginTop: 18 }}>
            <Field label="Saturation">
              <select className="select" value={n.competition.saturation}
                onChange={(e) => patch((x) => ({ ...x, competition: { ...x.competition, saturation: e.target.value as 'low' | 'medium' | 'high' } }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>
            <Field label="Monetization difficulty">
              <select className="select" value={n.competition.monetization}
                onChange={(e) => patch((x) => ({ ...x, competition: { ...x.competition, monetization: e.target.value as 'easy' | 'medium' | 'hard' } }))}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </Field>
            <Field label="Top channels count">
              <input className="input" type="number" value={n.competition.topChannels || ''}
                onChange={(e) => patch((x) => ({ ...x, competition: { ...x.competition, topChannels: Number(e.target.value) || 0 } }))}
                placeholder="0" />
            </Field>
            <Field label="Views per sub ratio">
              <input className="input" value={n.competition.viewsPerSub}
                onChange={(e) => patch((x) => ({ ...x, competition: { ...x.competition, viewsPerSub: e.target.value } }))}
                placeholder="e.g. 1.8x" />
            </Field>
          </div>
        </div>

        <div className="card">
          <div className="row-between" style={{ marginBottom: 12 }}>
            <div>
              <div className="card-title">💡 Content gaps</div>
              <div className="card-sub">Where the competition is weak — your entry point</div>
            </div>
            <span className="chip chip-emerald">{n.competition.gaps.length}</span>
          </div>
          <TagEditor
            tags={n.competition.gaps}
            onChange={(gaps) => patch((x) => ({ ...x, competition: { ...x.competition, gaps } }))}
            placeholder="e.g. Real-world cost breakdowns…"
          />
        </div>
      </div>

      <div className="stack">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Difficulty read-out</div>
          <div className="stack" style={{ gap: 14 }}>
            <ProgressBar pct={n.competition.score} label="Crowdedness" />
            <ProgressBar pct={100 - n.competition.score} label="Your opening" />
            <ProgressBar
              pct={n.competition.monetization === 'easy' ? 88 : n.competition.monetization === 'medium' ? 55 : 26}
              label="Monetization ease"
            />
          </div>
          <div className="opp-bar" style={{ marginTop: 18 }}>
            <span style={{ fontSize: 22 }}>{n.competition.score > 72 ? '🔥' : n.competition.score > 50 ? '⚖️' : '🌱'}</span>
            <div>
              <div className="opp-label">Verdict</div>
              <div className="tiny" style={{ marginTop: 2 }}>
                {n.competition.score > 72
                  ? 'Very crowded — only enter with a sharp differentiator.'
                  : n.competition.score > 50
                  ? 'Moderately competitive — execution and angle decide it.'
                  : 'Low competition — room to establish authority fast.'}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>🎯 Strategic summary</div>
          <div className="stack" style={{ gap: 0 }}>
            {[
              ['Trending', `${n.trend.score}/100 · ${n.trend.momentum}`],
              ['Virality', `${n.virality.potential}/100`],
              ['Competition', `${n.competition.score}/100 · ${n.competition.saturation}`],
              ['Opportunity', `${opportunityScore(n)}/100`],
            ].map(([k, v], i, arr) => (
              <div key={k} className="row-between"
                style={{ padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span className="tiny muted">{k}</span>
                <b style={{ fontSize: 13, textTransform: 'capitalize' }}>{v}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- VIDEO PLAN ---------------- */

function PlanTab({
  n, patch, push, logActivity,
}: {
  n: ReturnType<typeof useStore>['data']['niches'][number];
  patch: (fn: (x: typeof n) => typeof n) => void;
  push: (t: string, i?: string) => void;
  logActivity: (id: string, text: string) => void;
}) {
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [idea, setIdea] = useState<VideoIdea>({
    id: '', title: '', hook: '', format: '', cta: '', difficulty: 'medium', done: false,
  });

  const editingDone = n.videoPlan.editing.filter((i) => i.done).length;
  const capcutDone = n.videoPlan.capcut.filter((i) => i.done).length;

  const toggleEditing = (item: ChecklistItem) =>
    patch((x) => ({
      ...x,
      videoPlan: {
        ...x.videoPlan,
        editing: x.videoPlan.editing.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)),
      },
    }));

  const toggleCapCut = (item: CapCutStep) =>
    patch((x) => ({
      ...x,
      videoPlan: {
        ...x.videoPlan,
        capcut: x.videoPlan.capcut.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)),
      },
    }));

  const addIdea = () => {
    if (!idea.title.trim()) return;
    const created: VideoIdea = { ...idea, id: uid(), title: idea.title.trim() };
    patch((x) => ({ ...x, videoPlan: { ...x.videoPlan, ideas: [...x.videoPlan.ideas, created] } }));
    logActivity(n.id, `Video idea added: ${created.title}`);
    setIdea({ id: '', title: '', hook: '', format: '', cta: '', difficulty: 'medium', done: false });
    setIdeaOpen(false);
    push('Idea added', '💡');
  };

  return (
    <div className="stack">
      <div className="grid-2">
        <div className="card">
          <div className="row-between" style={{ marginBottom: 4 }}>
            <div>
              <div className="card-title">🎬 Video ideas</div>
              <div className="card-sub">Titles, hooks, formats — your backlog</div>
            </div>
            <button className="btn btn-sm" onClick={() => setIdeaOpen(true)}>＋ Add idea</button>
          </div>
          {n.videoPlan.ideas.length === 0 ? (
            <div className="tiny muted" style={{ padding: '18px 0' }}>
              No video ideas yet. Add the first one — title, hook, format, and CTA.
            </div>
          ) : (
            <div className="stack" style={{ gap: 9, marginTop: 12 }}>
              {n.videoPlan.ideas.map((vi) => (
                <div key={vi.id} className={`check-row ${vi.done ? 'done' : ''}`} style={{ cursor: 'default' }}>
                  <span
                    className={`check-box ${vi.done ? 'on' : ''}`}
                    onClick={() => patch((x) => ({
                      ...x,
                      videoPlan: {
                        ...x.videoPlan,
                        ideas: x.videoPlan.ideas.map((i) => (i.id === vi.id ? { ...i, done: !i.done } : i)),
                      },
                    }))}
                    style={{ cursor: 'pointer' }}
                  >
                    {vi.done ? '✓' : ''}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="check-label" style={{ fontWeight: 600 }}>{vi.title}</div>
                    {vi.hook && <div className="check-hint">🪝 {vi.hook}</div>}
                    <div className="chips" style={{ marginTop: 6 }}>
                      {vi.format && <span className="chip chip-fuchsia">{vi.format}</span>}
                      {vi.cta && <span className="chip chip-cyan">CTA: {vi.cta}</span>}
                      <span className={`chip ${vi.difficulty === 'easy' ? 'chip-emerald' : vi.difficulty === 'hard' ? 'chip-coral' : 'chip-amber'}`}>
                        {vi.difficulty}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => patch((x) => ({
                      ...x,
                      videoPlan: { ...x.videoPlan, ideas: x.videoPlan.ideas.filter((i) => i.id !== vi.id) },
                    }))}
                    aria-label="Delete idea"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>🏛 Content pillars</div>
            <TagEditor
              tags={n.videoPlan.pillars}
              onChange={(pillars) => patch((x) => ({ ...x, videoPlan: { ...x.videoPlan, pillars } }))}
              placeholder="e.g. $5 dinners…"
            />
            <div style={{ height: 16 }} />
            <Field label="Project folder path">
              <input
                className="input mono"
                value={n.videoPlan.projectPath}
                onChange={(e) => patch((x) => ({ ...x, videoPlan: { ...x.videoPlan, projectPath: e.target.value } }))}
                placeholder="D:/Projects/my-niche/"
              />
            </Field>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>💡 Format ideas</div>
            <TagEditor
              tags={n.virality.formats}
              onChange={(formats) => patch((x) => ({ ...x, virality: { ...x.virality, formats } }))}
              placeholder="e.g. 60-second tip…"
            />
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="row-between" style={{ marginBottom: 14 }}>
            <div>
              <div className="card-title">✂️ Editing workflow</div>
              <div className="card-sub">{editingDone}/{n.videoPlan.editing.length} complete</div>
            </div>
            <span className="chip chip-fuchsia">{Math.round((editingDone / (n.videoPlan.editing.length || 1)) * 100)}%</span>
          </div>
          <ProgressBar pct={Math.round((editingDone / (n.videoPlan.editing.length || 1)) * 100)} />
          <div className="checklist" style={{ marginTop: 12 }}>
            {n.videoPlan.editing.map((item) => (
              <CheckRow key={item.id} done={item.done} label={item.label} hint={item.hint} onToggle={() => toggleEditing(item)} />
            ))}
          </div>
        </div>

        <div className="card">
          <div className="row-between" style={{ marginBottom: 14 }}>
            <div>
              <div className="card-title">🎥 CapCut workflow</div>
              <div className="card-sub">{capcutDone}/{n.videoPlan.capcut.length} complete · mapped to your local scripts</div>
            </div>
            <span className="chip chip-cyan">{Math.round((capcutDone / (n.videoPlan.capcut.length || 1)) * 100)}%</span>
          </div>
          <ProgressBar pct={Math.round((capcutDone / (n.videoPlan.capcut.length || 1)) * 100)} />
          <div className="checklist" style={{ marginTop: 12 }}>
            {n.videoPlan.capcut.map((item) => (
              <CheckRow key={item.id} done={item.done} label={item.label} hint={item.hint} script={item.script} onToggle={() => toggleCapCut(item)} />
            ))}
          </div>
        </div>
      </div>

      {ideaOpen && (
        <Modal
          title="Add video idea"
          icon="💡"
          onClose={() => setIdeaOpen(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setIdeaOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addIdea} disabled={!idea.title.trim()}>Add idea</button>
            </>
          }
        >
          <div className="stack" style={{ gap: 14 }}>
            <Field label="Video title / working title">
              <input className="input" autoFocus value={idea.title} onChange={(e) => setIdea({ ...idea, title: e.target.value })} placeholder="e.g. I Cooked a Week of Meals for $20" />
            </Field>
            <Field label="Hook (first 3 seconds)" hint="The line that stops the scroll">
              <input className="input" value={idea.hook} onChange={(e) => setIdea({ ...idea, hook: e.target.value })} placeholder='e.g. "Show the empty fridge, then the full week."' />
            </Field>
            <div className="form-grid">
              <Field label="Format">
                <input className="input" value={idea.format} onChange={(e) => setIdea({ ...idea, format: e.target.value })} placeholder="e.g. Shorts recipe" />
              </Field>
              <Field label="CTA">
                <input className="input" value={idea.cta} onChange={(e) => setIdea({ ...idea, cta: e.target.value })} placeholder="e.g. Save for later" />
              </Field>
              <Field label="Difficulty">
                <select className="select" value={idea.difficulty} onChange={(e) => setIdea({ ...idea, difficulty: e.target.value as VideoIdea['difficulty'] })}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </Field>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- ASSETS ---------------- */

function AssetsTab({
  n, patch, push,
}: {
  n: ReturnType<typeof useStore>['data']['niches'][number];
  patch: (fn: (x: typeof n) => typeof n) => void;
  push: (t: string, i?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Asset>({
    id: '', name: '', kind: 'image', source: '', license: '', cost: '', status: 'needed', note: '',
  });

  const addAsset = () => {
    if (!draft.name.trim()) return;
    const created = { ...draft, id: uid(), name: draft.name.trim() };
    patch((x) => ({ ...x, assets: [...x.assets, created] }));
    setDraft({ id: '', name: '', kind: 'image', source: '', license: '', cost: '', status: 'needed', note: '' });
    setOpen(false);
    push('Asset added', '📦');
  };

  const setStatus = (assetId: string, status: Asset['status']) =>
    patch((x) => ({ ...x, assets: x.assets.map((a) => (a.id === assetId ? { ...a, status } : a)) }));

  const downloaded = n.assets.filter((a) => a.status === 'downloaded').length;

  return (
    <div className="stack">
      <div className="card">
        <div className="row-between">
          <div>
            <div className="card-title">📦 Asset checklist</div>
            <div className="card-sub" style={{ marginTop: 3 }}>
              Everything needed to produce this niche's videos — {downloaded}/{n.assets.length} downloaded
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>＋ Add asset</button>
        </div>
        <div style={{ marginTop: 14 }}>
          <ProgressBar pct={n.assets.length ? Math.round((downloaded / n.assets.length) * 100) : 0} />
        </div>
      </div>

      {n.assets.length === 0 ? (
        <Empty
          icon="📦"
          title="No assets tracked yet"
          sub="Log every image, B-roll clip, music track, font, LUT, and tool you need. Mark them ready when collected and downloaded when in hand."
          action={<button className="btn btn-primary" onClick={() => setOpen(true)}>＋ Add first asset</button>}
        />
      ) : (
        <div className="grid-3">
          {ASSET_KINDS.map((kind) => {
            const items = n.assets.filter((a) => a.kind === kind.id);
            if (!items.length) return null;
            return (
              <div key={kind.id} className="card">
                <div className="card-title" style={{ marginBottom: 12, fontSize: 13 }}>
                  <span>{kind.icon}</span> {kind.label}
                  <span className="chip" style={{ marginLeft: 'auto' }}>{items.length}</span>
                </div>
                <div className="stack" style={{ gap: 9 }}>
                  {items.map((a) => {
                    const stObj = ASSET_STATUS.find((s) => s.id === a.status)!;
                    return (
                      <div key={a.id} style={{ padding: 10, borderRadius: 11, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        <div className="row-between" style={{ gap: 8, alignItems: 'flex-start' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 650 }}>{a.name}</div>
                            {a.source && <div className="tiny muted" style={{ marginTop: 2 }}>{a.source}{a.license ? ` · ${a.license}` : ''}{a.cost ? ` · ${a.cost}` : ''}</div>}
                            {a.note && <div className="tiny" style={{ color: 'var(--muted-2)', marginTop: 3 }}>{a.note}</div>}
                          </div>
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => patch((x) => ({ ...x, assets: x.assets.filter((v) => v.id !== a.id) }))}
                            aria-label="Remove"
                            style={{ padding: '0 6px' }}
                          >
                            ✕
                          </button>
                        </div>
                        <div className="row" style={{ gap: 5, marginTop: 8 }}>
                          {ASSET_STATUS.map((s) => (
                            <button
                              key={s.id}
                              className={`chip ${a.status === s.id ? s.cls : ''}`}
                              style={{ cursor: 'pointer', opacity: a.status === s.id ? 1 : 0.5, fontSize: 10.5, padding: '2px 8px' }}
                              onClick={() => setStatus(a.id, s.id)}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <Modal
          title="Add asset"
          icon="📦"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addAsset} disabled={!draft.name.trim()}>Add asset</button>
            </>
          }
        >
          <div className="form-grid">
            <Field label="Asset name">
              <input className="input" autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Warm kitchen LUT" />
            </Field>
            <Field label="Type">
              <select className="select" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as Asset['kind'] })}>
                {ASSET_KINDS.map((k) => <option key={k.id} value={k.id}>{k.icon} {k.label}</option>)}
              </select>
            </Field>
            <Field label="Source">
              <input className="input" value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} placeholder="e.g. Pexels, Epidemic Sound" />
            </Field>
            <Field label="License">
              <input className="input" value={draft.license} onChange={(e) => setDraft({ ...draft, license: e.target.value })} placeholder="e.g. CC0, OFL, Owned" />
            </Field>
            <Field label="Cost">
              <input className="input" value={draft.cost} onChange={(e) => setDraft({ ...draft, cost: e.target.value })} placeholder="e.g. $0, $15/mo" />
            </Field>
            <Field label="Status">
              <select className="select" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Asset['status'] })}>
                {ASSET_STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <div className="full">
              <Field label="Note">
                <input className="input" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="Optional detail…" />
              </Field>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
