'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { AppData, Niche, Settings } from './types';
import { seedData, blankNiche, uid, DEFAULT_SETTINGS } from './seed';

const KEY = 'tubeniche-lab:v1';

function load(): AppData {
  if (typeof window === 'undefined') return seedData();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seedData();
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed?.niches) return seedData();
    return {
      version: parsed.version ?? 1,
      niches: parsed.niches,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return seedData();
  }
}

function save(data: AppData) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* quota — ignore */
  }
}

export function useStoreInternal() {
  const [data, setData] = useState<AppData>(() => seedData());
  const [hydrated, setHydrated] = useState(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    setData(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) save(data);
  }, [data, hydrated]);

  const update = useCallback((fn: (d: AppData) => AppData) => {
    setData((prev) => fn(prev));
  }, []);

  const addNiche = useCallback((partial?: Partial<Niche>) => {
    const n = { ...blankNiche(partial?.name ?? 'New Niche'), ...partial };
    setData((prev) => ({ ...prev, niches: [n, ...prev.niches] }));
    return n;
  }, []);

  const updateNiche = useCallback((id: string, fn: (n: Niche) => Niche) => {
    setData((prev) => ({
      ...prev,
      niches: prev.niches.map((n) =>
        n.id === id ? { ...fn(n), updatedAt: Date.now() } : n,
      ),
    }));
  }, []);

  const removeNiche = useCallback((id: string) => {
    setData((prev) => ({ ...prev, niches: prev.niches.filter((n) => n.id !== id) }));
  }, []);

  const removeMany = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setData((prev) => ({ ...prev, niches: prev.niches.filter((n) => !set.has(n.id)) }));
  }, []);

  const logActivity = useCallback((id: string, text: string) => {
    setData((prev) => ({
      ...prev,
      niches: prev.niches.map((n) =>
        n.id === id
          ? { ...n, activity: [{ id: uid(), at: Date.now(), text }, ...n.activity].slice(0, 60) }
          : n,
      ),
    }));
  }, []);

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const importData = useCallback((incoming: AppData) => {
    setData({
      version: 1,
      niches: incoming.niches ?? [],
      settings: { ...DEFAULT_SETTINGS, ...(incoming.settings ?? {}) },
    });
  }, []);

  const resetAll = useCallback(() => setData(seedData()), []);
  const clearAll = useCallback(
    () => setData((prev) => ({ ...prev, niches: [] })),
    [],
  );

  return useMemo(
    () => ({
      data,
      hydrated,
      update,
      addNiche,
      updateNiche,
      removeNiche,
      removeMany,
      logActivity,
      setSettings,
      importData,
      resetAll,
      clearAll,
    }),
    [data, hydrated, update, addNiche, updateNiche, removeNiche, removeMany, logActivity, setSettings, importData, resetAll, clearAll],
  );
}

export type Store = ReturnType<typeof useStoreInternal>;

const StoreCtx = createContext<Store | null>(null);

export function StoreProvider({ value, children }: { value: Store; children: React.ReactNode }) {
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
