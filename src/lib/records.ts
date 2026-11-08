import { useCallback, useEffect, useState } from 'react';
import type { RecordKind } from './db';
import type { DiaryEntry, SharedGoal, VisualSchedule } from '../types/domain';
import { loadRecords } from './vault';
import { useAppStore } from './store';

interface RecordTypes {
  diary: DiaryEntry;
  goal: SharedGoal;
  schedule: VisualSchedule;
}

/** Carica i record di un tipo dalla cassaforte e li rilegge quando si apre. */
export function useRecords<Kind extends RecordKind>(kind: Kind) {
  const vaultUnlocked = useAppStore((state) => state.vaultUnlocked);
  const [items, setItems] = useState<RecordTypes[Kind][]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const loaded = await loadRecords(kind);
    setItems(loaded);
    setLoading(false);
  }, [kind]);

  useEffect(() => {
    void refresh();
  }, [refresh, vaultUnlocked]);

  return { items, loading, refresh };
}

/** Note dal più recente: prima la data della giornata, poi l'ultima modifica. */
export function sortDiary(entries: DiaryEntry[]): DiaryEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));
}

/** L'ultima nota che ha qualcosa da raccontare (momenti o una cosa bella). */
export function latestStory(entries: DiaryEntry[]): DiaryEntry | null {
  return sortDiary(entries).find((entry) => entry.moments.length > 0 || entry.highlight.trim().length > 0) ?? null;
}
