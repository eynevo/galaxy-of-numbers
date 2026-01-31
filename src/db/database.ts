import Dexie, { type EntityTable } from 'dexie';
import type {
  Profile,
  TableProgress,
  FactStat,
  QuizAttempt,
  Session,
  Streak,
  UnlockedCharacter,
  StarBalance,
  AppSettings,
  AssessmentResult,
} from '../types';

// Define the database
class GalaxyDatabase extends Dexie {
  profiles!: EntityTable<Profile, 'id'>;
  tableProgress!: EntityTable<TableProgress, 'profileId'>;
  factStats!: EntityTable<FactStat, 'profileId'>;
  quizAttempts!: EntityTable<QuizAttempt, 'id'>;
  sessions!: EntityTable<Session, 'id'>;
  streaks!: EntityTable<Streak, 'profileId'>;
  unlockedCharacters!: EntityTable<UnlockedCharacter, 'profileId'>;
  starBalances!: EntityTable<StarBalance, 'profileId'>;
  settings!: EntityTable<AppSettings, 'parentPin'>;
  assessments!: EntityTable<AssessmentResult, 'profileId'>;

  constructor() {
    super('GalaxyOfNumbers');

    this.version(2).stores({
      profiles: 'id, name, createdAt, lastActiveAt',
      tableProgress: '[profileId+tableNumber], profileId, status',
      factStats: '[profileId+fact], profileId, nextReviewDate',
      quizAttempts: 'id, profileId, tableNumber, date',
      sessions: 'id, profileId, startTime',
      streaks: 'profileId',
      unlockedCharacters: '[profileId+characterId], profileId',
      starBalances: 'profileId',
      settings: '++id',
      assessments: 'profileId',
    });
  }
}

export const db = new GalaxyDatabase();

// Helper functions for common database operations

export async function getProfile(id: string): Promise<Profile | undefined> {
  try {
    return await db.profiles.get(id);
  } catch (error) {
    console.error('getProfile error:', error);
    throw error;
  }
}

export async function getAllProfiles(): Promise<Profile[]> {
  try {
    const profiles = await db.profiles.toArray();
    // Sort in memory to avoid index issues
    return profiles.sort((a, b) => 
      new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
    );
  } catch (error) {
    console.error('getAllProfiles error:', error);
    throw error;
  }
}

export async function createProfile(profile: Profile): Promise<string> {
  try {
    console.log('Creating profile:', profile);
    const result = await db.profiles.add(profile);
    console.log('Profile created with id:', result);
    return result;
  } catch (error) {
    console.error('createProfile error:', error);
    throw error;
  }
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<void> {
  try {
    await db.profiles.update(id, updates);
  } catch (error) {
    console.error('updateProfile error:', error);
    throw error;
  }
}

export async function deleteProfile(id: string): Promise<void> {
  await db.transaction('rw', [
    db.profiles,
    db.tableProgress,
    db.factStats,
    db.quizAttempts,
    db.sessions,
    db.streaks,
    db.unlockedCharacters,
    db.starBalances,
    db.assessments,
  ], async () => {
    await db.profiles.delete(id);
    await db.tableProgress.where('profileId').equals(id).delete();
    await db.factStats.where('profileId').equals(id).delete();
    await db.quizAttempts.where('profileId').equals(id).delete();
    await db.sessions.where('profileId').equals(id).delete();
    await db.streaks.delete(id);
    await db.unlockedCharacters.where('profileId').equals(id).delete();
    await db.starBalances.delete(id);
    await db.assessments.delete(id);
  });
}

export async function getTableProgress(profileId: string): Promise<TableProgress[]> {
  return db.tableProgress.where('profileId').equals(profileId).toArray();
}

export async function getTableProgressForTable(
  profileId: string,
  tableNumber: number
): Promise<TableProgress | undefined> {
  return db.tableProgress.get([profileId, tableNumber]);
}

export async function updateTableProgress(progress: TableProgress): Promise<void> {
  await db.tableProgress.put(progress);
}

export async function getFactStats(profileId: string): Promise<FactStat[]> {
  return db.factStats.where('profileId').equals(profileId).toArray();
}

export async function updateFactStat(stat: FactStat): Promise<void> {
  await db.factStats.put(stat);
}

export async function getStreak(profileId: string): Promise<Streak | undefined> {
  return db.streaks.get(profileId);
}

export async function updateStreak(streak: Streak): Promise<void> {
  await db.streaks.put(streak);
}

export async function getStarBalance(profileId: string): Promise<StarBalance | undefined> {
  return db.starBalances.get(profileId);
}

export async function updateStarBalance(balance: StarBalance): Promise<void> {
  await db.starBalances.put(balance);
}

export async function addStars(profileId: string, amount: number): Promise<void> {
  const balance = await getStarBalance(profileId);
  if (balance) {
    balance.totalStars += amount;
    balance.lifetimeStars += amount;
    await updateStarBalance(balance);
  } else {
    await updateStarBalance({
      profileId,
      totalStars: amount,
      lifetimeStars: amount,
    });
  }
}

export async function getUnlockedCharacters(profileId: string): Promise<UnlockedCharacter[]> {
  return db.unlockedCharacters.where('profileId').equals(profileId).toArray();
}

export async function unlockCharacter(profileId: string, characterId: string): Promise<void> {
  await db.unlockedCharacters.put({
    profileId,
    characterId,
    unlockedAt: new Date(),
  });
}

export async function getSettings(): Promise<AppSettings | undefined> {
  const settings = await db.settings.toArray();
  return settings[0];
}

export async function updateSettings(settings: AppSettings): Promise<void> {
  const existing = await db.settings.toArray();
  if (existing.length > 0) {
    await db.settings.update(existing[0].parentPin, settings);
  } else {
    await db.settings.add(settings);
  }
}

export async function saveQuizAttempt(attempt: QuizAttempt): Promise<void> {
  await db.quizAttempts.add(attempt);
}

export async function getQuizAttempts(profileId: string, tableNumber?: number): Promise<QuizAttempt[]> {
  if (tableNumber !== undefined) {
    return db.quizAttempts
      .where('profileId')
      .equals(profileId)
      .filter(a => a.tableNumber === tableNumber)
      .toArray();
  }
  return db.quizAttempts.where('profileId').equals(profileId).toArray();
}

// Initialize default settings if none exist
export async function initializeSettings(): Promise<void> {
  try {
    const settings = await getSettings();
    if (!settings) {
      await db.settings.add({
        parentPin: '1234', // Default PIN
        breakReminderMinutes: 20,
        soundEnabled: true,
      });
    }
  } catch (error) {
    console.error('initializeSettings error:', error);
  }
}

// Initialize progress for a new profile
export async function initializeProfileProgress(profileId: string): Promise<void> {
  try {
    // Table unlock order: 1, 10, 2, 5, 3, 4, 9, 6, 7, 8
    const unlockOrder = [1, 10, 2, 5, 3, 4, 9, 6, 7, 8];

    for (let i = 0; i < unlockOrder.length; i++) {
      const tableNumber = unlockOrder[i];
      await db.tableProgress.put({
        profileId,
        tableNumber,
        status: i === 0 ? 'learning' : 'locked', // First table is unlocked
        teachingCompleted: false,
        guidedPracticeCompleted: false,
        masteryScore: 0,
        lastPracticedAt: null,
      });
    }

    // Initialize star balance
    await db.starBalances.put({
      profileId,
      totalStars: 0,
      lifetimeStars: 0,
    });

    // Initialize streak
    await db.streaks.put({
      profileId,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
    });

    console.log('Profile progress initialized for:', profileId);
  } catch (error) {
    console.error('initializeProfileProgress error:', error);
    throw error;
  }
}

// Get assessment result
export async function getAssessmentResult(profileId: string): Promise<AssessmentResult | undefined> {
  return db.assessments.get(profileId);
}

// Save assessment result
export async function saveAssessmentResult(result: AssessmentResult): Promise<void> {
  await db.assessments.put(result);
}
