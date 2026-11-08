import type { ReactNode } from 'react';

/** Intestazione delle sotto-pagine: sempre un modo visibile per tornare indietro. */
export function PageHeader({
  backHref,
  backLabel,
  eyebrow,
  title,
  intro,
  action,
}: {
  backHref: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  intro?: string;
  action?: ReactNode;
}) {
  return (
    <header className="space-y-4 border-b border-line pb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a href={backHref} className="ponti-btn-quiet min-h-16 px-4">
          <span aria-hidden="true">←</span> {backLabel}
        </a>
        {action}
      </div>
      <div className="max-w-reading">
        <p className="ponti-label">{eyebrow}</p>
        <h1 className="mt-1 text-3xl leading-tight sm:text-4xl">{title}</h1>
        {intro && <p className="mt-2 text-lg text-ink-soft">{intro}</p>}
      </div>
    </header>
  );
}
