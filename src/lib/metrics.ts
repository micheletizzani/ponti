import type { ModuleId, SessionMetric } from '../types/domain';

export const MODULE_LABELS: Record<ModuleId, string> = {
  matrici: 'Matrix-Talk',
  sintassi: 'Sintassi dinamica',
  ritmo: 'Ritmo e sillabe',
  racconto: 'Trama e nessi',
  sociale: 'Social Deck',
  storie: 'Storie sociali',
};

export interface ModuleSummary {
  moduleId: ModuleId;
  sessions: number;
  items: number;
  correct: number;
  accuracy: number | null;
  averageLatencyMs: number | null;
  bestScaffold: number | null;
  reversibleAccuracy: number | null;
  lastSsi: number | null;
}

export function summarizeByModule(sessions: SessionMetric[]): ModuleSummary[] {
  const grouped = new Map<ModuleId, SessionMetric[]>();
  for (const session of sessions) {
    const list = grouped.get(session.moduleId) ?? [];
    list.push(session);
    grouped.set(session.moduleId, list);
  }

  return [...grouped.entries()].map(([moduleId, list]) => {
    const items = list.reduce((sum, session) => sum + session.items, 0);
    const correct = list.reduce((sum, session) => sum + session.correct, 0);
    const latencies = list.flatMap((session) => (session.latencyMs === null ? [] : [session.latencyMs]));
    const reversible = list.flatMap((session) =>
      session.reversibleAccuracy === undefined ? [] : [session.reversibleAccuracy],
    );
    const ssi = list.flatMap((session) =>
      session.syllableSegregationIndex === undefined ? [] : [session.syllableSegregationIndex],
    );
    const sorted = [...list].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    const lastSsi = ssi.length > 0 ? (ssi[ssi.length - 1] ?? null) : null;

    return {
      moduleId,
      sessions: list.length,
      items,
      correct,
      accuracy: items > 0 ? correct / items : null,
      averageLatencyMs:
        latencies.length > 0 ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length) : null,
      bestScaffold: sorted.length > 0 ? Math.max(...sorted.map((session) => session.scaffoldLevel)) : null,
      reversibleAccuracy:
        reversible.length > 0
          ? reversible.reduce((sum, value) => sum + value, 0) / reversible.length
          : null,
      lastSsi,
    } satisfies ModuleSummary;
  });
}

export function averageLatency(sessions: SessionMetric[]): number | null {
  const values = sessions.flatMap((session) => (session.latencyMs === null ? [] : [session.latencyMs]));
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function formatSeconds(ms: number | null): string {
  if (ms === null) return '—';
  return `${(ms / 1000).toFixed(1).replace('.', ',')} s`;
}

export function formatPercent(value: number | null): string {
  if (value === null) return '—';
  return `${Math.round(value * 100)}%`;
}

export function uid(prefix: string): string {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${prefix}_${random}`;
}
