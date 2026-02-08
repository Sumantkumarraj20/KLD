/**
 * SuperMemo 2 Algorithm Implementation
 * For spaced repetition of completed game levels
 * Prevents immediate re-attempt and space out reviews
 */

export interface LevelCompletion {
  domain: string;
  levelNumber: number;
  completedAt: string; // ISO timestamp
  starsEarned: number;
  quality: number; // 0-5 rating (user quality of answer)
  repetitions: number; // How many times reviewed
  interval: number; // Days until next review
  easeFactor: number; // Difficulty factor (starts at 2.5)
  nextReviewAt?: string; // ISO timestamp when level unlocks for retry
}

export interface LevelLockStatus {
  isLocked: boolean;
  nextUnlockAt?: string; // ISO timestamp
  daysUntilUnlock?: number;
  hoursUntilUnlock?: number;
  minutesUntilUnlock?: number;
}

export class SpaceRepetitionManager {
  private static readonly DEFAULT_EASE_FACTOR = 2.5;
  private static readonly MIN_INTERVAL = 1; // Minimum 1 day

  /**
   * Calculate next interval using SuperMemo 2 algorithm
   * Based on quality of answer (0-5 scale)
   *
   * SuperMemo 2 formulas:
   * - If quality < 3: interval = 1, repetitions = 1
   * - If quality >= 3:
   *   - EF' = EF + (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02))
   *   - interval = previous_interval × EF'
   */
  static calculateNextInterval(
    quality: number, // 0-5 where 5 is perfect
    previousInterval: number = 0,
    previousEaseFactor: number = this.DEFAULT_EASE_FACTOR
  ): { interval: number; easeFactor: number } {
    // Clamp quality to 0-5
    const q = Math.max(0, Math.min(5, Math.round(quality)));

    if (q < 3) {
      // Failed - restart from beginning
      return {
        interval: this.MIN_INTERVAL,
        easeFactor: this.DEFAULT_EASE_FACTOR,
      };
    }

    // Calculate new ease factor
    const newEaseFactor = Math.max(
      1.3, // Minimum ease factor
      previousEaseFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
    );

    // Calculate interval
    let interval: number;
    if (previousInterval === 0) {
      // First review
      interval = 1;
    } else if (previousInterval === 1) {
      // Second review
      interval = 3;
    } else {
      // Subsequent reviews
      interval = Math.ceil(previousInterval * newEaseFactor);
    }

    return {
      interval: Math.max(this.MIN_INTERVAL, interval),
      easeFactor: newEaseFactor,
    };
  }

  /**
   * Create a new level completion record
   */
  static createCompletion(
    domain: string,
    levelNumber: number,
    starsEarned: number
  ): LevelCompletion {
    const now = new Date();
    const nextReview = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day

    // Map stars (1-5) to quality (0-5)
    // 1 star = quality 1, 5 stars = quality 5
    const quality = Math.max(0, Math.min(5, starsEarned));

    return {
      domain,
      levelNumber,
      completedAt: now.toISOString(),
      starsEarned,
      quality,
      repetitions: 1,
      interval: 1,
      easeFactor: this.DEFAULT_EASE_FACTOR,
      nextReviewAt: nextReview.toISOString(),
    };
  }

  /**
   * Review a level and calculate next unlock time
   */
  static reviewCompletion(
    completion: LevelCompletion,
    quality: number
  ): LevelCompletion {
    const { interval, easeFactor } = this.calculateNextInterval(
      quality,
      completion.interval,
      completion.easeFactor
    );

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      ...completion,
      starsEarned: Math.max(completion.starsEarned, Math.round(quality)),
      repetitions: completion.repetitions + 1,
      interval,
      easeFactor,
      nextReviewAt: nextReview.toISOString(),
    };
  }

  /**
   * Check if a level is currently locked (cannot be attempted)
   */
  static getLockStatus(
    lastCompletion?: LevelCompletion
  ): LevelLockStatus {
    if (!lastCompletion || !lastCompletion.nextReviewAt) {
      return { isLocked: false };
    }

    const nextUnlock = new Date(lastCompletion.nextReviewAt);
    const now = new Date();

    if (now >= nextUnlock) {
      return { isLocked: false };
    }

    // Calculate time remaining
    const diffMs = nextUnlock.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      isLocked: true,
      nextUnlockAt: nextUnlock.toISOString(),
      daysUntilUnlock: diffDays,
      hoursUntilUnlock: diffHours,
      minutesUntilUnlock: diffMinutes,
    };
  }

  /**
   * Get human-readable time until unlock
   */
  static formatTimeUntilUnlock(lock: LevelLockStatus): string {
    if (!lock.isLocked) return "";

    if (!lock.daysUntilUnlock && !lock.hoursUntilUnlock) {
      return `${lock.minutesUntilUnlock} min`;
    } else if (!lock.daysUntilUnlock) {
      return `${lock.hoursUntilUnlock}h ${lock.minutesUntilUnlock}m`;
    } else {
      return `${lock.daysUntilUnlock}d ${lock.hoursUntilUnlock}h`;
    }
  }

  /**
   * Reset level for immediate retry (for admin/parent override)
   */
  static resetLevel(completion: LevelCompletion): LevelCompletion {
    return {
      ...completion,
      nextReviewAt: new Date().toISOString(),
    };
  }
}
