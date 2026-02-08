/**
 * Daily Bonus System for Gamification
 * Tracks daily login bonuses, streaks, and reward multipliers
 * Frontend-only using localStorage persistence
 */

/**
 * Daily bonus record for a user
 */
export interface DailyBonusRecord {
  kidId: string;
  lastClaimedDate: string; // ISO date string (YYYY-MM-DD)
  bonusPoints: number;
  streakDays: number; // consecutive days claimed
  totalClaimsThisMonth: number;
  claimHistory: { date: string; points: number }[]; // last 30 claims
}

/**
 * Result of attempting to claim a daily bonus
 */
export interface ClaimBonusResult {
  success: boolean;
  message: string;
  pointsAwarded: number;
  streakDays: number;
  multiplier: number;
  nextClaimAvailableAt?: Date;
}

const STORAGE_KEY_PREFIX = "daily_bonus_";
const BASE_BONUS_POINTS = 5;
const STREAK_MILESTONES = {
  1: { multiplier: 1, points: 5 },
  3: { multiplier: 1.5, points: 8 },
  7: { multiplier: 2, points: 10 },
  14: { multiplier: 2.5, points: 12 },
  30: { multiplier: 3, points: 15 },
};

/**
 * Get storage key for a specific kid
 */
function getStorageKey(kidId: string): string {
  return `${STORAGE_KEY_PREFIX}${kidId}`;
}

/**
 * Get current date as ISO string (YYYY-MM-DD)
 */
function getCurrentDate(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Get default daily bonus record
 */
function getDefaultRecord(kidId: string): DailyBonusRecord {
  return {
    kidId,
    lastClaimedDate: "",
    bonusPoints: 0,
    streakDays: 0,
    totalClaimsThisMonth: 0,
    claimHistory: [],
  };
}

/**
 * Load daily bonus record from localStorage
 */
export function loadDailyBonusRecord(kidId: string): DailyBonusRecord {
  if (typeof window === "undefined") {
    return getDefaultRecord(kidId);
  }

  const key = getStorageKey(kidId);
  const stored = localStorage.getItem(key);

  if (!stored) {
    return getDefaultRecord(kidId);
  }

  try {
    return JSON.parse(stored) as DailyBonusRecord;
  } catch (error) {
    console.error(`Failed to parse daily bonus record for ${kidId}:`, error);
    return getDefaultRecord(kidId);
  }
}

/**
 * Save daily bonus record to localStorage
 */
export function saveDailyBonusRecord(record: DailyBonusRecord): void {
  if (typeof window === "undefined") {
    return;
  }

  const key = getStorageKey(record.kidId);
  localStorage.setItem(key, JSON.stringify(record));
}

/**
 * Check if bonus is eligible to be claimed today
 */
export function checkClaimEligibility(kidId: string): boolean {
  const record = loadDailyBonusRecord(kidId);
  const today = getCurrentDate();

  return record.lastClaimedDate !== today;
}

/**
 * Calculate streak multiplier based on consecutive days
 */
export function calculateStreakMultiplier(streakDays: number): number {
  // Find the highest milestone met
  const milestones = Object.entries(STREAK_MILESTONES)
    .sort(([daysA], [daysB]) => Number(daysB) - Number(daysA));

  for (const [days, config] of milestones) {
    if (streakDays >= Number(days)) {
      return config.multiplier;
    }
  }

  return 1;
}

/**
 * Calculate bonus points based on streak
 */
export function calculateBonusPoints(streakDays: number): number {
  // Find the base points for this streak level
  const milestones = Object.entries(STREAK_MILESTONES)
    .sort(([daysA], [daysB]) => Number(daysB) - Number(daysA));

  for (const [days, config] of milestones) {
    if (streakDays >= Number(days)) {
      return config.points;
    }
  }

  return BASE_BONUS_POINTS;
}

/**
 * Claim daily bonus for a kid
 * Returns success status and points awarded
 */
export function claimDailyBonus(kidId: string): ClaimBonusResult {
  const today = getCurrentDate();
  const record = loadDailyBonusRecord(kidId);

  // Check if already claimed today
  if (record.lastClaimedDate === today) {
    const nextClaimTime = new Date();
    nextClaimTime.setDate(nextClaimTime.getDate() + 1);
    nextClaimTime.setHours(0, 0, 0, 0);

    return {
      success: false,
      message: "Bonus already claimed today. Come back tomorrow!",
      pointsAwarded: 0,
      streakDays: record.streakDays,
      multiplier: calculateStreakMultiplier(record.streakDays),
      nextClaimAvailableAt: nextClaimTime,
    };
  }

  // Check if streak should continue or reset
  const lastClaimedDate = new Date(record.lastClaimedDate);
  const today_date = new Date(today);
  const daysSinceLastClaim = Math.floor(
    (today_date.getTime() - lastClaimedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let newStreak = record.streakDays;
  if (daysSinceLastClaim === 1) {
    // Consecutive day - continue streak
    newStreak = (record.streakDays || 0) + 1;
  } else if (daysSinceLastClaim > 1) {
    // Streak broken - reset to 1
    newStreak = 1;
  } else if (record.lastClaimedDate === "") {
    // First claim
    newStreak = 1;
  }

  // Calculate bonus points
  const bonusPoints = calculateBonusPoints(newStreak);
  const multiplier = calculateStreakMultiplier(newStreak);

  // Update record
  record.lastClaimedDate = today;
  record.streakDays = newStreak;
  record.bonusPoints += bonusPoints;
  record.totalClaimsThisMonth += 1;
  record.claimHistory.push({ date: today, points: bonusPoints });

  // Keep only last 30 claims in history
  if (record.claimHistory.length > 30) {
    record.claimHistory = record.claimHistory.slice(-30);
  }

  // Save updated record
  saveDailyBonusRecord(record);

  const streakBroken = daysSinceLastClaim > 1 && record.lastClaimedDate !== "";

  return {
    success: true,
    message: streakBroken
      ? `Streak reset! Starting fresh. +${bonusPoints} points`
      : newStreak === 1
        ? `First claim! +${bonusPoints} points`
        : `Streak day ${newStreak}! +${bonusPoints} points${newStreak >= 7 ? " (2x multiplier!) 🔥" : ""}`,
    pointsAwarded: bonusPoints,
    streakDays: newStreak,
    multiplier: multiplier,
  };
}

/**
 * Get current daily bonus status
 */
export function getDailyBonusStatus(kidId: string) {
  const record = loadDailyBonusRecord(kidId);
  const today = getCurrentDate();
  const eligible = record.lastClaimedDate !== today;

  const nextPoints = calculateBonusPoints((record.streakDays || 0) + 1);
  const nextMultiplier = calculateStreakMultiplier((record.streakDays || 0) + 1);

  return {
    eligible,
    claimedToday: record.lastClaimedDate === today,
    streakDays: record.streakDays,
    totalPoints: record.bonusPoints,
    upcomingPoints: nextPoints,
    upcomingMultiplier: nextMultiplier,
    lastClaimedDate: record.lastClaimedDate,
    claimHistory: record.claimHistory,
  };
}

/**
 * Reset daily bonus for a kid (useful for testing or admin)
 */
export function resetDailyBonus(kidId: string): void {
  const key = getStorageKey(kidId);
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
}

/**
 * Get streak milestone information
 */
export function getStreakMilestones() {
  return STREAK_MILESTONES;
}
