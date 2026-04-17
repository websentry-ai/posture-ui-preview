'use client';

import { useEffect, useState, useCallback } from 'react';

type Store = {
  pendingActions: PendingAction[];
  frozenDevices: Record<string, string>;
  approvedMcps: string[];
};

export type PendingAction = {
  id: string;
  kind: 'policy-push' | 'freeze' | 'mcp-approve' | 'integration-test';
  label: string;
  detail: string;
  at: string;
  eta?: string;
};

const KEY = 'posture-preview-store-v1';
const EMPTY_STORE: Store = { pendingActions: [], frozenDevices: {}, approvedMcps: [] };

function readStore(): Store {
  if (typeof window === 'undefined') return EMPTY_STORE;
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null') ?? EMPTY_STORE;
  } catch {
    return EMPTY_STORE;
  }
}

function writeStore(s: Store) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent('posture-store-change'));
}

export function useStore<T>(selector: (s: Store) => T): [T, {
  addAction: (a: Omit<PendingAction, 'id' | 'at'>) => void;
  removeAction: (id: string) => void;
  setFrozen: (deviceId: string, level: string) => void;
  clearFrozen: (deviceId: string) => void;
  addApprovedMcp: (name: string) => void;
}] {
  // Initialize with empty store so SSR and client first-render match.
  // localStorage hydration happens after mount inside the effect.
  const [value, setValue] = useState<T>(() => selector(EMPTY_STORE));

  useEffect(() => {
    const sync = () => setValue(selector(readStore()));
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('posture-store-change', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('posture-store-change', sync);
    };
  }, [selector]);

  const actions = {
    addAction: useCallback((a: Omit<PendingAction, 'id' | 'at'>) => {
      const s = readStore();
      const entry: PendingAction = { ...a, id: Math.random().toString(36).slice(2, 9), at: new Date().toISOString() };
      writeStore({ ...s, pendingActions: [entry, ...s.pendingActions].slice(0, 5) });
    }, []),
    removeAction: useCallback((id: string) => {
      const s = readStore();
      writeStore({ ...s, pendingActions: s.pendingActions.filter((a) => a.id !== id) });
    }, []),
    setFrozen: useCallback((deviceId: string, level: string) => {
      const s = readStore();
      writeStore({ ...s, frozenDevices: { ...s.frozenDevices, [deviceId]: level } });
    }, []),
    clearFrozen: useCallback((deviceId: string) => {
      const s = readStore();
      const next = { ...s.frozenDevices };
      delete next[deviceId];
      writeStore({ ...s, frozenDevices: next });
    }, []),
    addApprovedMcp: useCallback((name: string) => {
      const s = readStore();
      if (s.approvedMcps.includes(name)) return;
      writeStore({ ...s, approvedMcps: [...s.approvedMcps, name] });
    }, []),
  };

  return [value, actions];
}
