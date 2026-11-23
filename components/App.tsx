'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { opportunityScore, readiness } from '@/lib/scoring';
import { Toasts, useToasts } from '@/components/ui';
import { Dashboard } from '@/components/views/Dashboard';
import { Library } from '@/components/views/Library';
import { NicheDetail } from '@/components/views/NicheDetail';
import { Pipeline } from '@/components/views/Pipeline';
import { Compare } from '@/components/views/Compare';
import { AssetsView } from '@/components/views/AssetsView';
import { SettingsView } from '@/components/views/SettingsView';
import { NicheForm } from '@/components/views/NicheForm';

export type Route =
  | { view: 'dashboard' }
  | { view: 'library' }
  | { view: 'niche'; id: string }
  | { view: 'pipeline' }
  | { view: 'compare' }
  | { view: 'assets' }
  | { view: 'settings' };

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'library', label: 'Niche Library', icon: '▤' },
  { id: 'pipeline', label: 'Pipeline', icon: '⇉' },
  { id: 'compare', label: 'Compare', icon: '⇄' },
  { id: 'assets', label: 'Asset Library', icon: '◫' },
] as const;

export function App() {
  const store = useStore();
  const { data, hydrated } = store;
  const [route, setRoute] = useState<Route>({ view: 'dashboard' });
  const [query, setQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const { toasts, push } = useToasts();

  // apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', data.settings.theme);
  }, [data.settings.theme]);

  const go = useCallback((r: Route) => {
    setRoute(r);
    setSidebarOpen(false);
    const el = document.querySelector('.content');
    if (el) el.scrollTop = 0;
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('.search-input')?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' && !typing) {
        e.preventDefault();
        setAddOpen(true);
      }
      if (e.key === 'Escape' && query) setQuery('');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [query]);

  const stats = useMemo(() => {
    const niches = data.niches;
    const scores = niches.map((n) => opportunityScore(n, data.settings.weights));
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return {
      total: niches.length,
      avg,
      inPipeline: niches.filter((n) => n.stage !== 'published' && n.stage !== 'idea').length,
      published: niches.filter((n) => n.stage === 'published').length,
      favorites: niches.filter((n) => n.favorite).length,
    };
  }, [data.niches, data.settings.weights]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return data.niches.filter((n) =>
      [n.name, n.category, n.notes, ...n.trend.keywords, ...n.videoPlan.pillars, ...n.competition.gaps]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [query, data.niches]);

  const activeNav =
    route.view === 'niche' ? 'library' : route.view;

  return (
    <div className="app">
      {sidebarOpen && <div className="scrim" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">🧪</div>
          <div className="brand-text">
            <strong>TubeNiche Lab</strong>
            <span>Niche Intelligence</span>
          </div>
        </div>

        <div className="nav-label">Workspace</div>
        <nav className="nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => go({ view: item.id } as Route)}
            >
              <span className="ico">{item.icon}</span>
              {item.label}
              {item.id === 'library' && <span className="badge">{stats.total}</span>}
              {item.id === 'pipeline' && stats.inPipeline > 0 && (
                <span className="badge">{stats.inPipeline}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="nav-label">Preferences</div>
        <nav className="nav">
          <button
            className={`nav-item ${activeNav === 'settings' ? 'active' : ''}`}
            onClick={() => go({ view: 'settings' })}
          >
            <span className="ico">⚙</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-foot">
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
            ＋ New Niche
          </button>
          <div className="tiny muted" style={{ padding: '4px 8px', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
            {hydrated ? 'Saved locally' : 'Loading…'}
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            ☰
          </button>

          <div className="search-wrap">
            <span className="s-ico">⌕</span>
            <input
              className="search-input"
              placeholder="Search niches, keywords, pillars…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="spacer" />

          <span className="chip chip-violet" title="Average opportunity score">
            ◈ {stats.avg} avg
          </span>
          <button
            className="btn btn-icon"
            title="Toggle theme"
            onClick={() =>
              store.setSettings({ theme: data.settings.theme === 'dark' ? 'light' : 'dark' })
            }
          >
            {data.settings.theme === 'dark' ? '☾' : '☀'}
          </button>
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
            ＋ New Niche
          </button>
        </header>

        <main className="content">
          {searchResults ? (
            <SearchResults
              results={searchResults}
              query={query}
              onOpen={(id) => { setQuery(''); go({ view: 'niche', id }); }}
            />
          ) : route.view === 'dashboard' ? (
            <Dashboard stats={stats} go={go} onAdd={() => setAddOpen(true)} push={push} />
          ) : route.view === 'library' ? (
            <Library go={go} onAdd={() => setAddOpen(true)} push={push} />
          ) : route.view === 'niche' ? (
            <NicheDetail id={route.id} go={go} push={push} />
          ) : route.view === 'pipeline' ? (
            <Pipeline go={go} push={push} />
          ) : route.view === 'compare' ? (
            <Compare go={go} />
          ) : route.view === 'assets' ? (
            <AssetsView go={go} push={push} />
          ) : (
            <SettingsView push={push} />
          )}
        </main>
      </div>

      {addOpen && (
        <NicheForm
          onClose={() => setAddOpen(false)}
          onSaved={(id) => {
            setAddOpen(false);
            push('Niche created', '✨');
            go({ view: 'niche', id });
          }}
        />
      )}

      <Toasts toasts={toasts} />
    </div>
  );
}

function SearchResults({
  results,
  query,
  onOpen,
}: {
  results: ReturnType<typeof useStore>['data']['niches'];
  query: string;
  onOpen: (id: string) => void;
}) {
  const weights = useStore().data.settings.weights;
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            Search: <em>{query}</em>
          </h1>
          <p className="page-sub">
            {results.length} {results.length === 1 ? 'result' : 'results'} found
          </p>
        </div>
      </div>
      {results.length === 0 ? (
        <div className="empty">
          <div className="empty-ico">🔍</div>
          <div className="empty-title">Nothing matched</div>
          <div className="empty-sub">Try a category, keyword, or pillar name.</div>
        </div>
      ) : (
        <div className="niche-grid">
          {results.map((n) => (
            <button key={n.id} className="niche-card" onClick={() => onOpen(n.id)} style={{ textAlign: 'left' }}>
              <div className="niche-card-top">
                <div className="niche-emoji">{n.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="niche-name">{n.name}</div>
                  <div className="niche-meta">
                    <span>{n.category}</span>
                  </div>
                </div>
              </div>
              <div className="opp-bar">
                <span className="opp-num" style={{ color: n.color }}>{opportunityScore(n, weights)}</span>
                <span className="opp-label">Opportunity</span>
                <span className="spacer" />
                <span className="chip chip-violet">{readiness(n)}% ready</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
