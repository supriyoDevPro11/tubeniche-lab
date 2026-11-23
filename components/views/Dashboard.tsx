'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { opportunityScore, scoreTier, readiness, momentumMeta, editingProgress, assetProgress } from '@/lib/scoring';
import { STAGES, MOMENTUMS } from '@/lib/types';
import { Sparkline, BarChart, Funnel, Gauge } from '@/lib/charts';
import { Empty, ProgressBar } from '@/components/ui';
import type { Route } from '@/components/App';

export function Dashboard({
  stats,
  go,
  onAdd,
}: {
  stats: { total: number; avg: number; inPipeline: number; published: number; favorites: number };
  go: (r: Route) => void;
  onAdd: () => void;
  push: (t: string, i?: string) => void;
}) {
  const { data } = useStore();
  const weights = data.settings.weights;
  const niches = data.niches;

  const ranked = useMemo(
    () =>
      [...niches]
        .map((n) => ({ n, score: opportunityScore(n, weights) }))
        .sort((a, b) => b.score - a.score),
    [niches, weights],
  );

  const stageCounts = useMemo(
    () =>
      STAGES.map((s) => ({
        label: s.label,
        count: niches.filter((n) => n.stage === s.id).length,
        color: s.color,
      })),
    [niches],
  );

  const momentumCounts = useMemo(
    () =>
      MOMENTUMS.map((m) => ({
        label: m.label,
        value: niches.filter((n) => n.trend.momentum === m.id).length,
        color: m.id === 'rising' ? '#34d399' : m.id === 'falling' ? '#fb7185' : '#a78bfa',
      })),
    [niches],
  );

  // aggregate trend history across niches
  const avgHistory = useMemo(() => {
    if (!niches.length) return [];
    const len = Math.max(...niches.map((n) => n.trend.history.length));
    return Array.from({ length: len }, (_, i) =>
      Math.round(
        niches.reduce((acc, n) => acc + (n.trend.history[i] ?? n.trend.history[n.trend.history.length - 1] ?? 0), 0) /
          niches.length,
      ),
    );
  }, [niches]);

  const topThree = ranked.slice(0, 3);
  const editingAvg = niches.length
    ? Math.round(niches.reduce((a, n) => a + editingProgress(n), 0) / niches.length)
    : 0;
  const assetAvg = niches.length
    ? Math.round(niches.reduce((a, n) => a + assetProgress(n), 0) / niches.length)
    : 0;

  if (!niches.length) {
    return (
      <>
        <div className="page-head">
          <div>
            <h1 className="page-title">Welcome to <em>TubeNiche Lab</em></h1>
            <p className="page-sub">
              Track trendiness, virality, competition, and the full production plan for every YouTube
              niche you want to attack.
            </p>
          </div>
        </div>
        <Empty
          icon="🧪"
          title="No niches yet"
          sub="Add your first niche to start scoring trends, mapping competition, and building a repeatable video workflow."
          action={
            <button className="btn btn-primary" onClick={onAdd}>
              ＋ Add your first niche
            </button>
          }
        />
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            Niche <em>Command Center</em>
          </h1>
          <p className="page-sub">
            Your whole YouTube niche portfolio at a glance — opportunity scores, momentum, and
            production readiness.
          </p>
        </div>
        <div className="head-actions">
          <button className="btn" onClick={() => go({ view: 'compare' })}>
            ⇄ Compare
          </button>
          <button className="btn btn-primary" onClick={onAdd}>
            ＋ New Niche
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <Stat label="Niches tracked" value={String(stats.total)} foot={`${stats.favorites} favorited`} grad="linear-gradient(135deg, rgba(139,92,246,.22), transparent)" icon="▤" />
        <Stat label="Avg opportunity" value={String(stats.avg)} foot={scoreTier(stats.avg).label + ' tier'} grad="linear-gradient(135deg, rgba(236,72,153,.22), transparent)" icon="◈" />
        <Stat label="In production" value={String(stats.inPipeline)} foot={`${editingAvg}% avg edited`} grad="linear-gradient(135deg, rgba(245,158,11,.22), transparent)" icon="⇉" />
        <Stat label="Published" value={String(stats.published)} foot={`${assetAvg}% assets ready`} grad="linear-gradient(135deg, rgba(52,211,153,.22), transparent)" icon="🚀" />
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="row-between" style={{ marginBottom: 16 }}>
            <div>
              <div className="card-title">📈 Portfolio trend</div>
              <div className="card-sub">Average trend score across all niches</div>
            </div>
            <Sparkline data={avgHistory} width={110} height={34} color="#a78bfa" />
          </div>
          <BarChart data={momentumCounts} height={120} />
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 4 }}>🎯 Stage funnel</div>
          <div className="card-sub" style={{ marginBottom: 16 }}>Where your niches sit right now</div>
          <Funnel stages={stageCounts} />
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="row-between" style={{ marginBottom: 14 }}>
            <div>
              <div className="card-title">🏆 Top opportunities</div>
              <div className="card-sub">Highest weighted score with current weights</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => go({ view: 'library' })}>
              View all →
            </button>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            {topThree.map(({ n, score }, i) => {
              const tier = scoreTier(score);
              const mm = momentumMeta(n.trend.momentum);
              return (
                <button
                  key={n.id}
                  className="opp-bar"
                  style={{ cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  onClick={() => go({ view: 'niche', id: n.id })}
                >
                  <span className="tiny mono" style={{ color: 'var(--muted-2)', width: 18 }}>#{i + 1}</span>
                  <span style={{ fontSize: 19 }}>{n.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 650, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {n.name}
                    </div>
                    <div className="tiny" style={{ color: 'var(--muted-2)', display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                      <span>{n.category}</span>
                      <span className={mm.cls}>{mm.icon} {mm.label}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="opp-num" style={{ color: tier.color, fontSize: 19 }}>{score}</div>
                    <div className="tiny" style={{ color: 'var(--muted-2)' }}>{tier.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 4 }}>⚙️ Production health</div>
          <div className="card-sub" style={{ marginBottom: 18 }}>Editing & asset completion</div>
          <div className="row" style={{ gap: 22, justifyContent: 'space-around', flexWrap: 'wrap' }}>
            <Gauge value={editingAvg} label="Edited" color="#fb7185" />
            <Gauge value={assetAvg} label="Assets" color="#22d3ee" />
            <Gauge value={stats.avg} label="Opportunity" color="#a78bfa" />
          </div>
          <div style={{ marginTop: 20 }}>
            <ProgressBar pct={editingAvg} label="Average editing completion" />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="row-between" style={{ marginBottom: 14 }}>
          <div>
            <div className="card-title">🔥 Momentum board</div>
            <div className="card-sub">Rising niches deserve your next slot</div>
          </div>
        </div>
        <div className="grid-3">
          {niches
            .filter((n) => n.trend.momentum === 'rising')
            .slice(0, 6)
            .map((n) => (
              <button
                key={n.id}
                className="card card-hover"
                style={{ textAlign: 'left', cursor: 'pointer', padding: 15 }}
                onClick={() => go({ view: 'niche', id: n.id })}
              >
                <div className="row" style={{ gap: 9 }}>
                  <span style={{ fontSize: 18 }}>{n.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.name}
                    </div>
                    <div className="tiny trend-up">▲ {n.trend.score} trend</div>
                  </div>
                  <Sparkline data={n.trend.history} width={54} height={24} color="#34d399" fill={false} />
                </div>
              </button>
            ))}
          {!niches.some((n) => n.trend.momentum === 'rising') && (
            <div className="tiny muted" style={{ padding: 12 }}>
              No rising niches flagged yet — set momentum in a niche&apos;s Trend tab.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  foot,
  grad,
  icon,
}: {
  label: string;
  value: string;
  foot: string;
  grad: string;
  icon: string;
}) {
  return (
    <div className="stat" style={{ ['--accent-grad' as string]: grad }}>
      <div className="stat-label">
        <span style={{ fontSize: 12 }}>{icon}</span>
        {label}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">{foot}</div>
    </div>
  );
}
