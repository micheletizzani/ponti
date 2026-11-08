/** Avviso visibile su ogni schermata: il prototipo non è ancora pronto per dati reali. */
export function PrototypeNotice() {
  return (
    <aside aria-label="Avviso sul prototipo" className="border-b border-agent-line bg-agent-fill">
      <p className="mx-auto max-w-shell px-4 py-2 text-sm text-agent-ink sm:px-6">
        <strong>Prototipo di prova.</strong> Non inserire dati reali di bambini o bambine: Ponti non è ancora validato né
        autorizzato per l’uso clinico o scolastico.
      </p>
    </aside>
  );
}
