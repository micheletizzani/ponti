import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Preferences, UserProfile } from '../types/domain';
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
    displayName: 'Bambino',
    bornYear: null,
    role: 'child',
    interests: ['dinosauri', 'treni', 'animali', 'disegno'],
    createdAt: new Date().toISOString(),
  };
}

interface AppState {
  profile: UserProfile;
  preferences: Preferences;
  /** Modalità dichiarata senza salvataggio: nessuna scrittura nella cassaforte. */
  ephemeral: boolean;
  /** Chiave della cassaforte presente in memoria (mai persistita). */
  vaultUnlocked: boolean;
  setEphemeral: (value: boolean) => void;
  setVaultUnlocked: (value: boolean) => void;
  setPreference: <Key extends keyof Preferences>(key: Key, value: Preferences[Key]) => void;
  setDisplayName: (name: string) => void;
  setInterests: (interests: string[]) => void;
  resetProfile: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: createProfile(),
      preferences: DEFAULT_PREFERENCES,
      ephemeral: false,
      vaultUnlocked: false,
      setEphemeral: (ephemeral) => set({ ephemeral }),
      setVaultUnlocked: (vaultUnlocked) => set({ vaultUnlocked }),
      setPreference: (key, value) =>
        set((state) => ({ preferences: { ...state.preferences, [key]: value } })),
      setDisplayName: (displayName) =>
        set((state) => ({ profile: { ...state.profile, displayName: displayName.trim() || 'Bambino' } })),
      setInterests: (interests) => set((state) => ({ profile: { ...state.profile, interests } })),
      resetProfile: () => set({ profile: createProfile(), preferences: DEFAULT_PREFERENCES }),
    }),
    {
      name: 'ponti-preferences',
      version: 1,
      partialize: (state) => ({ profile: state.profile, preferences: state.preferences }),
    },
  ),
);
