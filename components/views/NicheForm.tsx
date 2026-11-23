'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { Niche, Stage } from '@/lib/types';
import { CATEGORIES, STAGES, THEME_COLORS } from '@/lib/types';
import { defaultEditing, defaultCapCut } from '@/lib/seed';
import { Modal, Field, Slider, TagEditor } from '@/components/ui';

const EMOJIS = ['🎯','🤖','🍜','🎮','📊','🔧','🏛️','✈️','💪','🎨','🎧','🚗','🧘','🐕','💡','🔬','🏠','👗','📱','🎬','🌱','💰','⚽','🧪'];

export function NicheForm({
  onClose,
  onSaved,
  initial,
}: {
  onClose: () => void;
  onSaved: (id: string) => void;
  initial?: Niche;
}) {
  const { addNiche, updateNiche, logActivity } = useStore();
  const editing = !!initial;

  const [name, setName] = useState(initial?.name ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🎯');
  const [category, setCategory] = useState(initial?.category ?? 'Tech');
  const [color, setColor] = useState(initial?.color ?? '#8b5cf6');
  const [stage, setStage] = useState<Stage>(initial?.stage ?? 'idea');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [trendScore, setTrendScore] = useState(initial?.trend.score ?? 60);
  const [momentum, setMomentum] = useState<string>(initial?.trend.momentum ?? 'rising');
  const [searchVolume, setSearchVolume] = useState(initial?.trend.searchVolume ?? '');
  const [keywords, setKeywords] = useState<string[]>(initial?.trend.keywords ?? []);
  const [viral, setViral] = useState(initial?.virality.potential ?? 60);
  const [shareability, setShareability] = useState(initial?.virality.shareability ?? 55);
  const [avgViews, setAvgViews] = useState(initial?.virality.avgViews ?? '');
  const [competition, setCompetition] = useState(initial?.competition.score ?? 50);
  const [saturation, setSaturation] = useState<string>(initial?.competition.saturation ?? 'medium');
  const [pillars, setPillars] = useState<string[]>(initial?.videoPlan.pillars ?? []);

  const valid = name.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    if (editing && initial) {
      updateNiche(initial.id, (n) => ({
        ...n,
        name: name.trim(),
        emoji,
        category,
        color,
        stage,
        notes,
        trend: { ...n.trend, score: trendScore, momentum: momentum as Niche['trend']['momentum'], searchVolume, keywords },
        virality: { ...n.virality, potential: viral, shareability, avgViews },
        competition: { ...n.competition, score: competition, saturation: saturation as Niche['competition']['saturation'] },
        videoPlan: { ...n.videoPlan, pillars },
      }));
      logActivity(initial.id, 'Niche details updated');
      onSaved(initial.id);
    } else {
      const created = addNiche({
        name: name.trim(),
        emoji,
        category,
        color,
        stage,
        notes,
        trend: {
          score: trendScore,
          momentum: momentum as Niche['trend']['momentum'],
          searchVolume: searchVolume || '—',
          history: [Math.max(0, trendScore - 18), Math.max(0, trendScore - 12), Math.max(0, trendScore - 7), Math.max(0, trendScore - 3), trendScore],
          keywords,
        },
        virality: {
          potential: viral,
          shareability,
          avgViews: avgViews || '—',
          subGrowth: '—',
          formats: [],
          hooks: [],
        },
        competition: {
          score: competition,
          saturation: saturation as Niche['competition']['saturation'],
          topChannels: 0,
          viewsPerSub: '—',
          monetization: 'medium',
          gaps: [],
        },
        videoPlan: {
          pillars,
          ideas: [],
          editing: defaultEditing(),
          capcut: defaultCapCut(),
          projectPath: '',
        },
        assets: [],
      });
      onSaved(created.id);
    }
  };

  return (
    <Modal
      title={editing ? `Edit ${initial?.name}` : 'New Niche'}
      icon={editing ? '✏️' : '✨'}
      onClose={onClose}
      wide
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={!valid} style={{ opacity: valid ? 1 : 0.5 }}>
            {editing ? 'Save changes' : 'Create niche'}
          </button>
        </>
      }
    >
      <div className="form-section">Identity</div>
      <div className="form-grid">
        <Field label="Niche name">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Micro-Budget Cooking" autoFocus />
        </Field>
        <Field label="Category">
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Icon">
          <div className="chips" style={{ maxHeight: 92, overflowY: 'auto' }}>
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  fontSize: 17, width: 32, height: 32, borderRadius: 8,
                  border: `1px solid ${emoji === e ? color : 'var(--border)'}`,
                  background: emoji === e ? `${color}25` : 'var(--surface-2)',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Accent color">
          <div className="chips">
            {THEME_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 28, height: 28, borderRadius: 9, background: c,
                  border: color === c ? '2px solid #fff' : '2px solid transparent',
                  boxShadow: color === c ? `0 0 12px ${c}` : 'none',
                }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </Field>
        <Field label="Production stage">
          <select className="select" value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
            {STAGES.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
          </select>
        </Field>
        <Field label="Notes">
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Quick strategic note…" />
        </Field>
      </div>

      <div className="form-section">Trendiness</div>
      <div className="form-grid">
        <Slider label="Trend score" value={trendScore} onChange={setTrendScore} color="#a78bfa" hint="How hot is this niche right now?" />
        <Slider label="Virality potential" value={viral} onChange={setViral} color="#f472b6" hint="Likelihood of outsized reach" />
        <Slider label="Shareability" value={shareability} onChange={setShareability} color="#22d3ee" />
        <Slider label="Competition score" value={competition} onChange={setCompetition} color="#fcd34d" hint="Higher = more crowded" />
        <Field label="Momentum">
          <select className="select" value={momentum} onChange={(e) => setMomentum(e.target.value)}>
            <option value="rising">▲ Rising</option>
            <option value="stable">▬ Stable</option>
            <option value="falling">▼ Falling</option>
          </select>
        </Field>
        <Field label="Saturation">
          <select className="select" value={saturation} onChange={(e) => setSaturation(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>
        <Field label="Search volume">
          <input className="input" value={searchVolume} onChange={(e) => setSearchVolume(e.target.value)} placeholder="e.g. 740K/mo" />
        </Field>
        <Field label="Avg views">
          <input className="input" value={avgViews} onChange={(e) => setAvgViews(e.target.value)} placeholder="e.g. 180K" />
        </Field>
      </div>

      <div className="form-section">Research</div>
      <div className="stack" style={{ gap: 14 }}>
        <Field label="Search keywords" hint="Press Enter after each keyword">
          <TagEditor tags={keywords} onChange={setKeywords} placeholder="e.g. cheap meals…" />
        </Field>
        <Field label="Content pillars" hint="Recurring series/themes you'll publish">
          <TagEditor tags={pillars} onChange={setPillars} placeholder="e.g. $5 dinners…" />
        </Field>
      </div>
    </Modal>
  );
}
