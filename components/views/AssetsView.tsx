'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { ASSET_KINDS, ASSET_STATUS, type Asset } from '@/lib/types';
import { Empty } from '@/components/ui';
import type { Route } from '@/components/App';

export function AssetsView({
  go,
  push,
}: {
  go: (r: Route) => void;
  push: (t: string, i?: string) => void;
}) {
  const { data, updateNiche } = useStore();
  const [filter, setFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [q, setQ] = useState('');

  const all = useMemo(
    () =>
      data.niches.flatMap((n) =>
        n.assets.map((a) => ({ ...a, nicheId: n.id, nicheName: n.name, nicheEmoji: n.emoji, nicheColor: n.color })),
      ),
    [data.niches],
  );

  const filtered = useMemo(
    () =>
      all.filter((a) => {
        if (filter !== 'all' && a.kind !== filter) return false;
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        if (q.trim()) {
          const s = `${a.name} ${a.source} ${a.nicheName} ${a.note}`.toLowerCase();
          if (!s.includes(q.trim().toLowerCase())) return false;
        }
        return true;
      }),
    [all, filter, statusFilter, q],
  );

  const counts = {
    total: all.length,
    downloaded: all.filter((a) => a.status === 'downloaded').length,
    ready: all.filter((a) => a.status === 'ready').length,
    needed: all.filter((a) => a.status === 'needed').length,
  };

  const cycleStatus = (nicheId: string, asset: Asset) => {
    const order: Asset['status'][] = ['needed', 'ready', 'downloaded'];
    const next = order[(order.indexOf(asset.status) + 1) % order.length];
    updateNiche(nicheId, (n) => ({
      ...n,
      assets: n.assets.map((a) => (a.id === asset.id ? { ...a, status: next } : a)),
    }));
    push(`${asset.name} → ${next}`, '🔄');
  };

  const removeAsset = (nicheId: string, assetId: string) => {
    updateNiche(nicheId, (n) => ({ ...n, assets: n.assets.filter((a) => a.id !== assetId) }));
    push('Asset removed', '🗑️');
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Global <em>Asset Library</em></h1>
          <p className="page-sub">
            Every asset across all niches in one place — spot what's missing and what's ready.
          </p>
        </div>
        <div className="head-actions">
          <span className="chip chip-emerald">{counts.downloaded} downloaded</span>
          <span className="chip chip-amber">{counts.ready} ready</span>
          <span className="chip chip-coral">{counts.needed} needed</span>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="input"
          style={{ flex: 1, minWidth: 160, maxWidth: 300 }}
          placeholder="Search assets, sources, niches…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All types</option>
          {ASSET_KINDS.map((k) => <option key={k.id} value={k.id}>{k.icon} {k.label}</option>)}
        </select>
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Any status</option>
          {ASSET_STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <span className="spacer" />
        <span className="chip">{filtered.length} of {counts.total}</span>
      </div>

      {filtered.length === 0 ? (
        <Empty
          icon="📦"
          title={counts.total ? 'No assets match those filters' : 'No assets yet'}
          sub={
            counts.total
              ? 'Try clearing a filter.'
              : 'Open any niche and use its Assets tab to log what you need for production.'
          }
          action={
            counts.total ? (
              <button className="btn" onClick={() => { setQ(''); setFilter('all'); setStatusFilter('all'); }}>Clear filters</button>
            ) : (
              <button className="btn btn-primary" onClick={() => go({ view: 'library' })}>Go to niches</button>
            )
          }
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto', maxHeight: '72vh' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>Niche</th>
                <th>Source</th>
                <th>License</th>
                <th>Cost</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const kind = ASSET_KINDS.find((k) => k.id === a.kind)!;
                const st = ASSET_STATUS.find((s) => s.id === a.status)!;
                return (
                  <tr key={`${a.nicheId}-${a.id}`}>
                    <td>
                      <b style={{ fontSize: 12.5 }}>{a.name}</b>
                      {a.note && <div className="tiny muted" style={{ marginTop: 2 }}>{a.note}</div>}
                    </td>
                    <td><span className="chip">{kind.icon} {kind.label.split(' ')[0]}</span></td>
                    <td>
                      <button
                        className="chip"
                        style={{ cursor: 'pointer', borderColor: `${a.nicheColor}55`, color: a.nicheColor }}
                        onClick={() => go({ view: 'niche', id: a.nicheId })}
                      >
                        {a.nicheEmoji} {a.nicheName}
                      </button>
                    </td>
                    <td className="muted tiny">{a.source || '—'}</td>
                    <td className="muted tiny">{a.license || '—'}</td>
                    <td className="muted tiny">{a.cost || '—'}</td>
                    <td>
                      <button
                        className={`chip ${st.cls}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => cycleStatus(a.nicheId, a)}
                        title="Click to cycle status"
                      >
                        {st.label}
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => removeAsset(a.nicheId, a.id)}
                        aria-label="Remove asset"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
