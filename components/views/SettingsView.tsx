'use client';

import { useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { Slider, Field, Confirm } from '@/components/ui';
import type { AppData } from '@/lib/types';

export function SettingsView({ push }: { push: (t: string, i?: string) => void }) {
  const { data, setSettings, importData, resetAll, clearAll } = useStore();
  const weights = data.settings.weights;
  const total = weights.trend + weights.virality + weights.competition;
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tubeniche-lab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    push('Backup downloaded', '💾');
  };

  const exportCSV = () => {
    const headers = [
      'Name', 'Category', 'Stage', 'Emoji', 'Trend', 'Momentum', 'Virality', 'Shareability',
      'Competition', 'Saturation', 'Monetization', 'AvgViews', 'SearchVolume', 'Assets', 'Ideas', 'Notes',
    ];
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [headers.join(',')];
    for (const n of data.niches) {
      lines.push([
        n.name, n.category, n.stage, n.emoji, n.trend.score, n.trend.momentum, n.virality.potential,
        n.virality.shareability, n.competition.score, n.competition.saturation, n.competition.monetization,
        n.virality.avgViews, n.trend.searchVolume, n.assets.length, n.videoPlan.ideas.length, n.notes,
      ].map(esc).join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tubeniche-lab-niches-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    push('CSV exported', '📄');
  };

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppData;
        if (!parsed?.niches) throw new Error('bad');
        importData(parsed);
        push(`Imported ${parsed.niches.length} niches`, '📥');
      } catch {
        push('Import failed — invalid file', '⚠️');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Scoring weights, appearance, and your data.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 4 }}>⚖️ Opportunity score weights</div>
          <div className="card-sub" style={{ marginBottom: 18 }}>
            Balance matters more than raw points. Competition counts inversely — lower competition scores higher.
          </div>
          <div className="stack" style={{ gap: 16 }}>
            <Slider label="Trend weight" value={weights.trend} color="#a78bfa"
              onChange={(v) => setSettings({ weights: { ...weights, trend: v } })} />
            <Slider label="Virality weight" value={weights.virality} color="#f472b6"
              onChange={(v) => setSettings({ weights: { ...weights, virality: v } })} />
            <Slider label="Competition weight" value={weights.competition} color="#fcd34d"
              onChange={(v) => setSettings({ weights: { ...weights, competition: v } })} />
          </div>
          <div className="opp-bar" style={{ marginTop: 18 }}>
            <span style={{ fontSize: 18 }}>{total === 100 ? '✅' : '⚠️'}</span>
            <div style={{ flex: 1 }}>
              <div className="opp-label">Total weight: {total}</div>
              <div className="tiny muted" style={{ marginTop: 2 }}>
                {total === 100 ? 'Perfectly balanced.' : total > 100 ? 'Over 100 — scores still normalise, but tidy up.' : 'Under 100 — scores still normalise.'}
              </div>
            </div>
            <button className="btn btn-sm" onClick={() => setSettings({ weights: { trend: 40, virality: 35, competition: 25 } })}>
              Reset
            </button>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>🎨 Appearance</div>
            <Field label="Theme">
              <div className="chips">
                {(['dark', 'light'] as const).map((t) => (
                  <button
                    key={t}
                    className={`chip ${data.settings.theme === t ? 'chip-violet' : ''}`}
                    style={{ cursor: 'pointer', textTransform: 'capitalize', opacity: data.settings.theme === t ? 1 : 0.6 }}
                    onClick={() => setSettings({ theme: t })}
                  >
                    {t === 'dark' ? '☾' : '☀'} {t}
                  </button>
                ))}
              </div>
            </Field>
            <div style={{ height: 14 }} />
            <Field label="Your name">
              <input
                className="input"
                value={data.settings.ownerName}
                onChange={(e) => setSettings({ ownerName: e.target.value })}
                placeholder="Creator"
              />
            </Field>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>💾 Data</div>
            <div className="card-sub" style={{ marginBottom: 14 }}>
              Everything lives in your browser's localStorage. Back up regularly.
            </div>
            <div className="chips">
              <button className="btn btn-sm" onClick={exportJSON}>⬇ Export JSON</button>
              <button className="btn btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
              <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>⬆ Import JSON</button>
              <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
            </div>
            <div style={{ height: 14 }} />
            <div className="chips">
              <button className="btn btn-sm" onClick={() => setConfirmReset(true)}>↺ Restore demo data</button>
              <button className="btn btn-sm btn-danger" onClick={() => setConfirmClear(true)}>🗑 Delete all niches</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title" style={{ marginBottom: 4 }}>⌨️ Keyboard shortcuts</div>
        <div className="card-sub" style={{ marginBottom: 14 }}>Speed up your workflow</div>
        <div className="grid-3">
          {[
            ['Ctrl / ⌘ + K', 'Focus search'],
            ['Ctrl / ⌘ + N', 'New niche'],
            ['Esc', 'Clear search / close modal'],
            ['Click chip', 'Cycle asset status'],
            ['Drag card', 'Move stage in Pipeline'],
          ].map(([k, v]) => (
            <div key={k} className="row-between" style={{ padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <span className="tiny muted">{v}</span>
              <span className="kbd">{k}</span>
            </div>
          ))}
        </div>
      </div>

      {confirmReset && (
        <Confirm
          title="Restore demo data?"
          message="This replaces all your current niches with the six built-in sample niches. Export a backup first if you want to keep your work."
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => { resetAll(); push('Demo data restored', '↺'); setConfirmReset(false); }}
        />
      )}
      {confirmClear && (
        <Confirm
          title="Delete all niches?"
          message="Every niche, asset, and production plan will be permanently removed. Export a backup first if you want to keep your work."
          onCancel={() => setConfirmClear(false)}
          onConfirm={() => { clearAll(); push('All niches deleted', '🗑️'); setConfirmClear(false); }}
        />
      )}
    </>
  );
}
