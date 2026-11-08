import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChildGender, Preferences, UserProfile } from '../types/domain';
import { uid } from './metrics';

const DEFAULT_PREFERENCES: Preferences = {
  textSize: 'm',
  contrast: 'soft',
  motion: 'full',
  voiceRate: 0.82,
  voiceEnabled: true,
  dualUser: true,
  inputLockMs: 2000,
};

function createProfile(): UserProfile {
  return {
    id: uid('profile'),
    displayName: '',
    bornYear: null,
    role: 'child',
    gender: 'n',
    interests: ['dinosauri', 'treni', 'animali', 'disegno'],
    createdAt: new Date().toISOString(),
  };
}

/** Avanzamento dell'agenda del giorno: solo id e passi fatti, nessun contenuto. */
export interface AgendaProgress {
  scheduleId: string;
  date: string;
  done: string[];
}

interface AppState {
  profile: UserProfile;
  preferences: Preferences;
  /** Modalità dichiarata senza salvataggio: nessuna scrittura nella cassaforte. */
  ephemeral: boolean;
  /** Chiave della cassaforte presente in memoria (mai persistita). */
  vaultUnlocked: boolean;
  /**
   * Area adulti aperta in questa sessione. Si apre quando l'adulto inserisce la
   * passphrase e si chiude con «Passa al bambino»: mai persistita.
   */
  adultOpen: boolean;
  /** Agenda scelta dall'adulto per oggi. */
  activeScheduleId: string | null;
  agendaProgress: AgendaProgress | null;
  setEphemeral: (value: boolean) => void;
  setVaultUnlocked: (value: boolean) => void;
  setAdultOpen: (value: boolean) => void;
  setPreference: <Key extends keyof Preferences>(key: Key, value: Preferences[Key]) => void;
  setDisplayName: (name: string) => void;
  setGender: (gender: ChildGender) => void;
  setInterests: (interests: string[]) => void;
  setActiveSchedule: (id: string | null) => void;
  setAgendaProgress: (progress: AgendaProgress | null) => void;
  resetProfile: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: createProfile(),
      preferences: DEFAULT_PREFERENCES,
      ephemeral: false,
      vaultUnlocked: false,
      adultOpen: false,
      activeScheduleId: null,
      agendaProgress: null,
      setEphemeral: (ephemeral) => set({ ephemeral }),
      setVaultUnlocked: (vaultUnlocked) =>
        set((state) => ({ vaultUnlocked, adultOpen: vaultUnlocked ? state.adultOpen : false })),
      setAdultOpen: (adultOpen) => set({ adultOpen }),
      setPreference: (key, value) =>
        set((state) => ({ preferences: { ...state.preferences, [key]: value } })),
      setDisplayName: (displayName) =>
        set((state) => ({ profile: { ...state.profile, displayName: displayName.trim() } })),
      setGender: (gender) => set((state) => ({ profile: { ...state.profile, gender } })),
      setInterests: (interests) => set((state) => ({ profile: { ...state.profile, interests } })),
      setActiveSchedule: (activeScheduleId) => set({ activeScheduleId, agendaProgress: null }),
      setAgendaProgress: (agendaProgress) => set({ agendaProgress }),
      resetProfile: () =>
        set({
          profile: createProfile(),
          preferences: DEFAULT_PREFERENCES,
          activeScheduleId: null,
          agendaProgress: null,
        }),
    }),
    {
      name: 'ponti-preferences',
      version: 2,
      partialize: (state) => ({
        profile: state.profile,
        preferences: state.preferences,
        activeScheduleId: state.activeScheduleId,
        agendaProgress: state.agendaProgress,
      }),
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<AppState>;
        if (version < 2 && state.profile) {
          const legacyName = state.profile.displayName === 'Bambino' ? '' : state.profile.displayName;
          state.profile = { ...state.profile, displayName: legacyName ?? '', gender: state.profile.gender ?? 'n' };
        }
        return state as AppState;
      },
    },
  ),
);
