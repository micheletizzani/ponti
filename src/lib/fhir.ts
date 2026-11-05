import type { ModuleId, SessionMetric, UserProfile } from '../types/domain';

/**
 * Esportazione pronta per la mappatura FHIR R4/R5.
 * I codici sono locali (ponti.local) finché non vengono validati i mapping
 * LOINC/SNOMED CT con l'équipe clinica: nessun codice inventato spacciato per standard.
 */

const MODULE_CODES: Record<ModuleId, { code: string; display: string }> = {
  matrici: { code: 'matrix-talk', display: 'Ragionamento logico-visivo guidato' },
  sintassi: { code: 'dynamic-syntax', display: 'Comprensione di frasi reversibili' },
  ritmo: { code: 'speech-pacer', display: 'Coarticolazione e prosodia' },
  racconto: { code: 'narrative-weaver', display: 'Nessi causali e temporali' },
  sociale: { code: 'social-deck', display: 'Avvio del dialogo' },
  storie: { code: 'social-stories', display: 'Storie sociali e comprensione' },
};

function observation(metric: SessionMetric, profile: UserProfile) {
  return {
    resourceType: 'Observation' as const,
    id: metric.id,
    status: 'final' as const,
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'therapy',
            display: 'Therapy',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'https://ponti.local/CodeSystem/modules',
          code: MODULE_CODES[metric.moduleId].code,
          display: MODULE_CODES[metric.moduleId].display,
        },
      ],
      text: MODULE_CODES[metric.moduleId].display,
    },
    subject: { reference: `Patient/${profile.id}` },
    effectiveDateTime: metric.endedAt,
    component: [
      {
        code: { text: 'Prove completate' },
        valueInteger: metric.items,
      },
      {
        code: { text: 'Prove senza aiuto' },
        valueInteger: metric.correct,
      },
      {
        code: { text: 'Livello di scaffolding' },
        valueInteger: metric.scaffoldLevel,
      },
      ...(metric.latencyMs === null
        ? []
        : [
            {
              code: { text: 'Latenza stimolo-risposta' },
              valueQuantity: { value: metric.latencyMs, unit: 'ms', system: 'http://unitsofmeasure.org', code: 'ms' },
            },
          ]),
      ...(metric.reversibleAccuracy === undefined
        ? []
        : [
            {
              code: { text: 'Accuratezza frasi reversibili' },
              valueQuantity: { value: Math.round(metric.reversibleAccuracy * 100), unit: '%' },
            },
          ]),
      ...(metric.syllableSegregationIndex === undefined
        ? []
        : [
            {
              code: { text: 'Indice di segregazione sillabica (stima)' },
              valueQuantity: { value: metric.syllableSegregationIndex, unit: 'ratio' },
            },
          ]),
    ],
    note: metric.notes ? [{ text: metric.notes }] : undefined,
  };
}

export function buildExport(sessions: SessionMetric[], profile: UserProfile) {
  return {
    schema: 'ponti/export-v1',
    exportedAt: new Date().toISOString(),
    disclaimer:
      'Dati generati da un prototipo di supporto all’apprendimento. Non constituiscono diagnosi né misura clinica validata.',
    patient: {
      resourceType: 'Patient' as const,
      id: profile.id,
      name: [{ text: profile.displayName }],
      extension: [
        { url: 'https://ponti.local/StructureDefinition/role', valueString: profile.role },
        ...(profile.bornYear === null ? [] : [{ url: 'https://ponti.local/StructureDefinition/birth-year', valueInteger: profile.bornYear }]),
      ],
    },
    carePlan: {
      resourceType: 'CarePlan' as const,
      status: 'active' as const,
      intent: 'plan' as const,
      title: 'Ponti — piano di pratica domiciliare',
      subject: { reference: `Patient/${profile.id}` },
      period: { start: profile.createdAt },
      note: [{ text: 'Moduli e livelli di aiuto da confermare con il clinico di riferimento.' }],
    },
    observations: sessions.map((session) => observation(session, profile)),
  };
}
