'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Profile,
  BabyLog,
  MaternalMoodLog,
  MaternalRecoveryLog,
  BabyLogType,
  BabyLogDetails,
} from '@/types/database';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export interface MaternaContextType {
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  babyLogs: BabyLog[];
  addBabyLog: (type: BabyLogType, details: BabyLogDetails) => Promise<void>;
  deleteBabyLog: (id: string) => Promise<void>;
  moodLogs: MaternalMoodLog[];
  addMoodLog: (score: number, tags: string[], notes?: string) => Promise<void>;
  recoveryLog: MaternalRecoveryLog;
  updateWaterGlasses: (glasses: number) => Promise<void>;
  toggleRecoveryExercise: (exerciseId: string) => Promise<void>;
  toggleMilestone: (milestoneId: string) => Promise<void>;
  toggleFavoriteTrack: (trackId: string) => Promise<void>;
  lastWakeTimestamp: string;
  recordBabyWakeUp: () => void;
  isAiChatOpen: boolean;
  setIsAiChatOpen: (open: boolean) => void;
  isInitialized: boolean;
  userEmail: string | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

const defaultProfile: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  full_name: 'Sarah',
  baby_birth_date: '2026-09-12', // ~6 weeks ago
  baby_name: 'Leo',
  primary_focus: ['Wake Windows & Sleep', 'Nursing & Milk Supply'],
  completed_milestones: ['m-1', 'm-2'],
  favorite_tracks: ['t-1'],
  nap_target: 4,
  baby_weight_lbs: null,
  baby_length_in: null,
  baby_head_in: null,
  created_at: '2026-10-24T00:00:00.000Z',
};

const defaultBabyLogs: BabyLog[] = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    user_id: defaultProfile.id,
    log_type: 'feed',
    details: { side: 'left', duration_mins: 22, amount_ml: 120 },
    timestamp: '2026-10-24T08:48:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    user_id: defaultProfile.id,
    log_type: 'diaper',
    details: { type: 'wet' },
    timestamp: '2026-10-24T08:15:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    user_id: defaultProfile.id,
    log_type: 'sleep',
    details: { duration_mins: 85, notes: 'Morning nap in crib' },
    timestamp: '2026-10-24T07:30:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000104',
    user_id: defaultProfile.id,
    log_type: 'feed',
    details: { side: 'right', duration_mins: 18 },
    timestamp: '2026-10-24T05:30:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000105',
    user_id: defaultProfile.id,
    log_type: 'sleep',
    details: { duration_mins: 95, notes: 'Early morning stretch' },
    timestamp: '2026-10-24T03:30:00.000Z',
  },
];

const defaultMoodLogs: MaternalMoodLog[] = [
  {
    id: '00000000-0000-0000-0000-000000000201',
    user_id: defaultProfile.id,
    score: 4,
    tags: ["Baby's Feeding", 'Grateful', 'Partner Support'],
    notes: 'Feeling centered after a restful nursing session and breathing exercise.',
    logged_date: '2026-10-24',
  },
  {
    id: '00000000-0000-0000-0000-000000000202',
    user_id: defaultProfile.id,
    score: 5,
    tags: ['Grateful', 'Partner Support', 'Quiet Time'],
    notes: 'Baby smiled after morning feed!',
    logged_date: '2026-10-23',
  },
  {
    id: '00000000-0000-0000-0000-000000000203',
    user_id: defaultProfile.id,
    score: 3,
    tags: ["Baby's Feeding", 'Physical Healing'],
    logged_date: '2026-10-22',
  },
  {
    id: '00000000-0000-0000-0000-000000000204',
    user_id: defaultProfile.id,
    score: 4,
    tags: ["Baby's Feeding", 'Partner Support'],
    logged_date: '2026-10-21',
  },
  {
    id: '00000000-0000-0000-0000-000000000205',
    user_id: defaultProfile.id,
    score: 2,
    tags: ['Sleep Deprivation', 'Hormonal Shift', "Baby's Feeding"],
    notes: 'Cluster feeding night, feeling tender and tired.',
    logged_date: '2026-10-20',
  },
  {
    id: '00000000-0000-0000-0000-000000000206',
    user_id: defaultProfile.id,
    score: 4,
    tags: ['Grateful', 'Physical Healing'],
    logged_date: '2026-10-19',
  },
  {
    id: '00000000-0000-0000-0000-000000000207',
    user_id: defaultProfile.id,
    score: 3,
    tags: ['Sleep Deprivation', "Baby's Feeding"],
    logged_date: '2026-10-18',
  },
];

const defaultRecoveryLog: MaternalRecoveryLog = {
  id: '00000000-0000-0000-0000-000000000301',
  user_id: defaultProfile.id,
  logged_date: '2026-10-24',
  water_glasses: 6,
  completed_exercises: ['ex-1'],
};

const STORAGE_KEYS = {
  PROFILE: 'materna_postpartum_profile_v3',
  BABY_LOGS: 'materna_postpartum_baby_logs_v3',
  MOOD_LOGS: 'materna_postpartum_mood_logs_v3',
  RECOVERY_LOG: 'materna_postpartum_recovery_log_v3',
  WAKE_TIMESTAMP: 'materna_postpartum_wake_timestamp_v3',
};

const fallbackContextValue: MaternaContextType = {
  profile: defaultProfile,
  updateProfile: async () => {},
  babyLogs: defaultBabyLogs,
  addBabyLog: async () => {},
  deleteBabyLog: async () => {},
  moodLogs: defaultMoodLogs,
  addMoodLog: async () => {},
  recoveryLog: defaultRecoveryLog,
  updateWaterGlasses: async () => {},
  toggleRecoveryExercise: async () => {},
  toggleMilestone: async () => {},
  toggleFavoriteTrack: async () => {},
  lastWakeTimestamp: '2026-10-24T07:30:00.000Z',
  recordBabyWakeUp: () => {},
  isAiChatOpen: false,
  setIsAiChatOpen: () => {},
  isInitialized: true,
  userEmail: null,
  isAuthenticated: false,
  signOut: async () => {},
};

const MaternaContext = createContext<MaternaContextType>(fallbackContextValue);

export function MaternaProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [babyLogs, setBabyLogs] = useState<BabyLog[]>(defaultBabyLogs);
  const [moodLogs, setMoodLogs] = useState<MaternalMoodLog[]>(defaultMoodLogs);
  const [recoveryLog, setRecoveryLog] = useState<MaternalRecoveryLog>(defaultRecoveryLog);
  const [lastWakeTimestamp, setLastWakeTimestamp] = useState<string>('2026-10-24T07:30:00.000Z');
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const loadSupabaseUserData = useCallback(async (userId: string, email: string | null) => {
    const supabase = createClient();
    if (!supabase) return;

    setUserEmail(email);
    setIsAuthenticated(true);

    try {
      // 1. Fetch or initialize user profile
      const { data: existingProfile } = await (supabase
        .from('profiles') as any)
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (existingProfile) {
        setProfile(existingProfile);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(existingProfile));
        }
      } else {
        const newUserProfile: Profile = {
          ...defaultProfile,
          id: userId,
          created_at: new Date().toISOString(),
        };
        await (supabase.from('profiles') as any).upsert({
          id: userId,
          full_name: newUserProfile.full_name,
          baby_name: newUserProfile.baby_name,
          baby_birth_date: newUserProfile.baby_birth_date,
        });
        setProfile(newUserProfile);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newUserProfile));
        }
      }

      // 2. Fetch baby logs
      const { data: remoteBabyLogs } = await (supabase
        .from('baby_logs') as any)
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (remoteBabyLogs && remoteBabyLogs.length > 0) {
        setBabyLogs(remoteBabyLogs);
        const latestSleep = remoteBabyLogs.find((l: BabyLog) => l.log_type === 'sleep');
        if (latestSleep) {
          setLastWakeTimestamp(latestSleep.timestamp);
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.BABY_LOGS, JSON.stringify(remoteBabyLogs));
        }
      }

      // 3. Fetch maternal mood logs
      const { data: remoteMoodLogs } = await (supabase
        .from('maternal_mood_logs') as any)
        .select('*')
        .eq('user_id', userId)
        .order('logged_date', { ascending: false });

      if (remoteMoodLogs && remoteMoodLogs.length > 0) {
        setMoodLogs(remoteMoodLogs);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.MOOD_LOGS, JSON.stringify(remoteMoodLogs));
        }
      }

      // 4. Fetch today's recovery log
      const todayStr = getTodayDateString();
      const { data: remoteRecovery } = await (supabase
        .from('maternal_recovery_logs') as any)
        .select('*')
        .eq('user_id', userId)
        .eq('logged_date', todayStr)
        .maybeSingle();

      if (remoteRecovery) {
        setRecoveryLog(remoteRecovery);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.RECOVERY_LOG, JSON.stringify(remoteRecovery));
        }
      }
    } catch (err) {
      console.error('Error syncing user data from Supabase:', err);
    }
  }, []);

  useEffect(() => {
    // 1. Hydrate immediately from localStorage for zero-latency UI
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

      const savedBaby = localStorage.getItem(STORAGE_KEYS.BABY_LOGS);
      if (savedBaby) {
        const parsedBaby: BabyLog[] = JSON.parse(savedBaby);
        setBabyLogs(parsedBaby);
      }

      const savedMood = localStorage.getItem(STORAGE_KEYS.MOOD_LOGS);
      if (savedMood) {
        setMoodLogs(JSON.parse(savedMood));
      }

      const savedRecovery = localStorage.getItem(STORAGE_KEYS.RECOVERY_LOG);
      if (savedRecovery) {
        const parsedRec: MaternalRecoveryLog = JSON.parse(savedRecovery);
        if (parsedRec.logged_date === getTodayDateString()) {
          setRecoveryLog(parsedRec);
        }
      }

      const savedWake = localStorage.getItem(STORAGE_KEYS.WAKE_TIMESTAMP);
      if (savedWake) {
        setLastWakeTimestamp(savedWake);
      }
    } catch (err) {
      console.warn('Error reading stored postpartum data:', err);
    } finally {
      setIsInitialized(true);
    }

    // 2. Check Supabase Auth session
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (!supabase) return;

      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          loadSupabaseUserData(user.id, user.email ?? null);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          loadSupabaseUserData(session.user.id, session.user.email ?? null);
        } else {
          setUserEmail(null);
          setIsAuthenticated(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [loadSupabaseUserData]);

  const updateProfile = async (updates: Partial<Profile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    }

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const payload: Record<string, any> = {
              id: user.id,
              full_name: updated.full_name,
              baby_name: updated.baby_name,
              baby_birth_date: updated.baby_birth_date,
              primary_focus: updated.primary_focus,
              completed_milestones: updated.completed_milestones,
              favorite_tracks: updated.favorite_tracks,
              nap_target: updated.nap_target,
              baby_weight_lbs: updated.baby_weight_lbs,
              baby_length_in: updated.baby_length_in,
              baby_head_in: updated.baby_head_in,
              updated_at: new Date().toISOString(),
            };
            const { error } = await (supabase.from('profiles') as any).upsert(payload);
            if (error) {
              // Fallback if optional columns haven't been migrated yet
              await (supabase.from('profiles') as any).upsert({
                id: user.id,
                full_name: updated.full_name,
                baby_name: updated.baby_name,
                baby_birth_date: updated.baby_birth_date,
                updated_at: new Date().toISOString(),
              });
            }
          }
        } catch (e) {
          console.error('Supabase profile update failed:', e);
        }
      }
    }
  };

  const addBabyLog = async (type: BabyLogType, details: BabyLogDetails) => {
    const nowIso = new Date().toISOString();
    const newEntry: BabyLog = {
      id: generateUuid(),
      user_id: profile.id,
      log_type: type,
      details,
      timestamp: nowIso,
    };
    const updated = [newEntry, ...babyLogs];
    setBabyLogs(updated);

    if (type === 'sleep') {
      setLastWakeTimestamp(nowIso);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.WAKE_TIMESTAMP, nowIso);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.BABY_LOGS, JSON.stringify(updated));
    }

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await (supabase.from('baby_logs') as any).insert({
              ...newEntry,
              user_id: user.id,
            });
          }
        } catch (e) {
          console.error('Supabase baby log insert failed:', e);
        }
      }
    }
  };

  const deleteBabyLog = async (id: string) => {
    const updated = babyLogs.filter((l) => l.id !== id);
    setBabyLogs(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.BABY_LOGS, JSON.stringify(updated));
    }

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await (supabase.from('baby_logs') as any)
              .delete()
              .eq('id', id)
              .eq('user_id', user.id);
          }
        } catch (e) {
          console.error('Supabase baby log delete failed:', e);
        }
      }
    }
  };

  const addMoodLog = async (score: number, tags: string[], notes?: string) => {
    const todayStr = getTodayDateString();
    const newEntry: MaternalMoodLog = {
      id: generateUuid(),
      user_id: profile.id,
      score,
      tags,
      notes,
      logged_date: todayStr,
      created_at: new Date().toISOString(),
    };
    const updated = [newEntry, ...moodLogs];
    setMoodLogs(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.MOOD_LOGS, JSON.stringify(updated));
    }

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await (supabase.from('maternal_mood_logs') as any).insert({
              ...newEntry,
              user_id: user.id,
            });
          }
        } catch (e) {
          console.error('Supabase mood log insert failed:', e);
        }
      }
    }
  };

  const syncRecoveryLog = async (updatedRecovery: MaternalRecoveryLog) => {
    setRecoveryLog(updatedRecovery);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.RECOVERY_LOG, JSON.stringify(updatedRecovery));
    }

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await (supabase.from('maternal_recovery_logs') as any).upsert(
              {
                user_id: user.id,
                logged_date: updatedRecovery.logged_date,
                water_glasses: updatedRecovery.water_glasses,
                completed_exercises: updatedRecovery.completed_exercises,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id,logged_date' }
            );
          }
        } catch (e) {
          console.error('Supabase recovery log upsert failed:', e);
        }
      }
    }
  };

  const updateWaterGlasses = async (glasses: number) => {
    const clamped = Math.max(0, Math.min(15, glasses));
    await syncRecoveryLog({
      ...recoveryLog,
      logged_date: getTodayDateString(),
      water_glasses: clamped,
    });
  };

  const toggleRecoveryExercise = async (exerciseId: string) => {
    const current = recoveryLog.completed_exercises || [];
    const next = current.includes(exerciseId)
      ? current.filter((id) => id !== exerciseId)
      : [...current, exerciseId];
    await syncRecoveryLog({
      ...recoveryLog,
      logged_date: getTodayDateString(),
      completed_exercises: next,
    });
  };

  const toggleMilestone = async (milestoneId: string) => {
    const current = profile.completed_milestones || ['m-1', 'm-2'];
    const next = current.includes(milestoneId)
      ? current.filter((id) => id !== milestoneId)
      : [...current, milestoneId];
    await updateProfile({ completed_milestones: next });
  };

  const toggleFavoriteTrack = async (trackId: string) => {
    const current = profile.favorite_tracks || [];
    const next = current.includes(trackId)
      ? current.filter((id) => id !== trackId)
      : [...current, trackId];
    await updateProfile({ favorite_tracks: next });
  };

  const recordBabyWakeUp = () => {
    const nowIso = new Date().toISOString();
    setLastWakeTimestamp(nowIso);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.WAKE_TIMESTAMP, nowIso);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    setUserEmail(null);
    setIsAuthenticated(false);
  };

  return (
    <MaternaContext.Provider
      value={{
        profile,
        updateProfile,
        babyLogs,
        addBabyLog,
        deleteBabyLog,
        moodLogs,
        addMoodLog,
        recoveryLog,
        updateWaterGlasses,
        toggleRecoveryExercise,
        toggleMilestone,
        toggleFavoriteTrack,
        lastWakeTimestamp,
        recordBabyWakeUp,
        isAiChatOpen,
        setIsAiChatOpen,
        isInitialized,
        userEmail,
        isAuthenticated,
        signOut,
      }}
    >
      {children}
    </MaternaContext.Provider>
  );
}

export function useMaterna(): MaternaContextType {
  const context = useContext(MaternaContext);
  return context ?? fallbackContextValue;
}
