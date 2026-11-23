import type { Niche, Weights, Momentum } from './types';
import { MOMENTUMS } from './types';

export const DEFAULT_WEIGHTS: Weights = { trend: 40, virality: 35, competition: 25 };

/** Weighted opportunity score: high trend + high virality + LOW competition = best. */
export function opportunityScore(n: Niche, w: Weights = DEFAULT_WEIGHTS): number {
  const total = w.trend + w.virality + w.competition || 1;
  const competitionInverse = 100 - n.competition.score;
  const raw =
    (n.trend.score * w.trend + n.virality.potential * w.virality + competitionInverse * w.competition) /
    total;
  return Math.round(clamp(raw, 0, 100));
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export type ScoreTier = 'elite' | 'strong' | 'promising' | 'risky';

export function scoreTier(score: number): { tier: ScoreTier; label: string; color: string } {
  if (score >= 78) return { tier: 'elite', label: 'Elite', color: '#34d399' };
  if (score >= 62) return { tier: 'strong', label: 'Strong', color: '#a3e635' };
  if (score >= 45) return { tier: 'promising', label: 'Promising', color: '#f59e0b' };
  return { tier: 'risky', label: 'Risky', color: '#fb7185' };
}

export function momentumMeta(m: Momentum) {
  return MOMENTUMS.find((x) => x.id === m) ?? MOMENTUMS[1];
}

/** Simple linear-regression slope over the history, normalised to -1..1. */
export function trendSlope(history: number[]): number {
  if (history.length < 2) return 0;
  const n = history.length;
  const meanX = (n - 1) / 2;
  const meanY = history.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (history[i] - meanY);
    den += (i - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  // normalise against the value range
  const range = Math.max(...history) - Math.min(...history) || 1;
  return clamp(slope / (range / n), -1, 1);
}

export function editingProgress(n: Niche): number {
  const all = [...n.videoPlan.editing, ...n.videoPlan.capcut];
  if (!all.length) return 0;
  return Math.round((all.filter((i) => i.done).length / all.length) * 100);
}

export function assetProgress(n: Niche): number {
  if (!n.assets.length) return 0;
  return Math.round((n.assets.filter((a) => a.status === 'downloaded').length / n.assets.length) * 100);
}

export function readiness(n: Niche): number {
  const e = editingProgress(n);
  const a = assetProgress(n);
  const ideaDone = n.videoPlan.ideas.filter((i) => i.done).length;
  const ideaPct = n.videoPlan.ideas.length ? (ideaDone / n.videoPlan.ideas.length) * 100 : 0;
  return Math.round(e * 0.45 + a * 0.35 + ideaPct * 0.2);
}

export function fmtNumber(s: string): string {
  return s;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}
