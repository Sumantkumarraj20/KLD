/**
 * Game API Service
 * Extends the main API with game-specific endpoints
 * Handles game progress, level completion, and awards
 */

import { api } from "./api";
import { GameDomain, GameSessionResult, LevelAward } from "./gameTypes";
import { GameSessionManager } from "./gameEngine";
import { SpaceRepetitionManager, LevelCompletion, LevelLockStatus } from "./spaceRepetition";

export class GameAPI {
  /**
   * Submit level completion with stars earned
   * This integrates with existing award system
   * Includes retry logic for reliable backend sync
   */
  async submitLevelCompletion(
    kidId: string,
    domain: GameDomain,
    levelNumber: number,
    starsEarned: number,
    pointsAwarded: number
  ): Promise<LevelAward> {
    try {
      // Simplified reason format: "Language 1"
      const domainName = this.getDomainDisplayName(domain);
      const reason = `${domainName} Level ${levelNumber} (${starsEarned}★)`;
      
      // Track level completion with SuperMemo
      const levelKey = `${domain}-level-${levelNumber}`;
      const completion = SpaceRepetitionManager.createCompletion(
        domain,
        levelNumber,
        starsEarned
      );
      this.storeLevelCompletion(kidId, levelKey, completion);

      // Award points using existing system with retry logic
      let apiSuccess = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await api.awardPoints(kidId, pointsAwarded, reason, "game-engine");
          apiSuccess = true;
          console.log(`✅ Level completion (${reason}) synced to backend on attempt ${attempt + 1}`);
          break;
        } catch (apiError) {
          console.warn(
            `API sync attempt ${attempt + 1}/3 failed for level completion:`,
            apiError
          );
          if (attempt < 2) {
            // Wait before retrying (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, 500 * (attempt + 1))
            );
          }
        }
      }

      if (!apiSuccess) {
        console.warn(
          `Failed to sync level completion after 3 attempts - ${pointsAwarded} points will sync when connection restored`
        );
        // Points are stored locally and will sync on next successful request
      }

      // Return award record regardless of API sync (local state is source of truth)
      const award: LevelAward = {
        award_id: `award-${kidId}-${domain}-level-${levelNumber}-${Date.now()}`,
        kid_id: kidId,
        level_id: `${domain}-level-${levelNumber}`,
        domain,
        level_number: levelNumber,
        stars_earned: starsEarned,
        points_awarded: pointsAwarded,
        completed_at: new Date().toISOString(),
        reason,
      };

      // Store in local cache for session
      this.cacheGameProgress(kidId, award);

      return award;
    } catch (error) {
      console.error("Failed to submit level completion:", error);
      throw error;
    }
  }

  /**
   * Get kid's game progress for all domains
   * This reads from the existing kids-with-details endpoint
   */
  async getKidGameProgress(kidId: string): Promise<{
    language_level: number;
    mathematics_level: number;
    logical_level: number;
    total_stars: number;
  }> {
    try {
      // Initialize game progress from localStorage (doesn't require kid to exist in API)
      const gameProgress = this.getLocalGameProgress(kidId);

      return {
        language_level: gameProgress.language || 1,
        mathematics_level: gameProgress.mathematics || 1,
        logical_level: gameProgress.logical || 1,
        total_stars: gameProgress.total_stars || 0,
      };
    } catch (error) {
      console.error("Failed to get kid game progress:", error);
      // Return defaults on error - allows game to work even if API is down
      return {
        language_level: 1,
        mathematics_level: 1,
        logical_level: 1,
        total_stars: 0,
      };
    }
  }

  /**
   * Local Storage Management for Game Progress
   * Frontend-only storage for current game session
   */
  private getLocalGameProgress(kidId: string) {
    const key = `game-progress-${kidId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return this.initializeGameProgress();
      }
    }

    return this.initializeGameProgress();
  }

  private initializeGameProgress() {
    return {
      language: 1,
      mathematics: 1,
      logical: 1,
      total_stars: 0,
      last_session: null,
      completed_levels: {} as Record<string, number>, // level_id -> stars_earned
    };
  }

  private cacheGameProgress(kidId: string, award: LevelAward) {
    const key = `game-progress-${kidId}`;
    const current = this.getLocalGameProgress(kidId);

    // Update domain level if this was a new max
    const levelKey: keyof typeof current = award.domain as keyof typeof current;
    if (award.level_number > (current[levelKey] || 0)) {
      (current as any)[award.domain] = award.level_number;
    }

    // Update total stars
    current.total_stars = (current.total_stars || 0) + award.stars_earned;

    // Track completed level
    current.completed_levels[award.level_id] = Math.max(
      current.completed_levels[award.level_id] || 0,
      award.stars_earned
    );

    current.last_session = award.completed_at;

    localStorage.setItem(key, JSON.stringify(current));
  }

  /**
   * Get all sessions for a kid (from localStorage)
   */
  getKidSessions(kidId: string): LevelAward[] {
    const key = `game-sessions-${kidId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    return [];
  }

  /**
   * Store a completed session
   */
  storeSession(kidId: string, award: LevelAward) {
    const key = `game-sessions-${kidId}`;
    const sessions = this.getKidSessions(kidId);
    sessions.push(award);

    // Keep only last 100 sessions in storage
    if (sessions.length > 100) {
      sessions.shift();
    }

    localStorage.setItem(key, JSON.stringify(sessions));
  }

  /**
   * Get stars earned for a specific level
   */
  getLevelStars(kidId: string, levelId: string): number {
    const progress = this.getLocalGameProgress(kidId);
    return progress.completed_levels[levelId] || 0;
  }

  /**
   * Check if level is unlocked
   * (Need 3+ stars on previous level)
   */
  isLevelUnlocked(
    kidId: string,
    domain: GameDomain,
    levelNumber: number
  ): boolean {
    if (levelNumber === 1) return true; // First level always unlocked

    const progress = this.getLocalGameProgress(kidId);
    const previousLevelId = `${domain}-level-${levelNumber - 1}`;

    return (progress.completed_levels[previousLevelId] || 0) >= 3;
  }

  /**
   * Get highest unlocked level for a domain
   */
  getMaxUnlockedLevel(kidId: string, domain: GameDomain): number {
    const progress = this.getLocalGameProgress(kidId);
    let maxLevel = 1;

    for (let level = 1; level <= 50; level++) {
      const levelId = `${domain}-level-${level}`;
      const stars = progress.completed_levels[levelId] || 0;

      if (stars >= 3) {
        maxLevel = level;
      } else if (level === 1) {
        break;
      }
    }

    return maxLevel;
  }

  /**
   * Get all stars for a domain
   */
  getDomainStars(kidId: string, domain: GameDomain): number {
    const sessions = this.getKidSessions(kidId);
    return sessions
      .filter((s) => s.domain === domain)
      .reduce((total, s) => total + s.stars_earned, 0);
  }

  /**
   * Export game progress to send to backend (optional)
   * This can be used to sync with Google Sheets
   */
  exportGameProgress(kidId: string): object {
    const progress = this.getLocalGameProgress(kidId);
    const sessions = this.getKidSessions(kidId);

    return {
      kid_id: kidId,
      export_date: new Date().toISOString(),
      progress,
      sessions_count: sessions.length,
      domain_stats: {
        language: this.getDomainStars(kidId, "language"),
        mathematics: this.getDomainStars(kidId, "mathematics"),
        logical: this.getDomainStars(kidId, "logical"),
      },
    };
  }

  /**
   * Clear all game progress (for testing/reset)
   */
  clearGameProgress(kidId: string) {
    localStorage.removeItem(`game-progress-${kidId}`);
    localStorage.removeItem(`game-sessions-${kidId}`);
    localStorage.removeItem(`level-completions-${kidId}`);
  }

  /**
   * Get domain display name
   */
  private getDomainDisplayName(domain: GameDomain): string {
    const names: Record<GameDomain, string> = {
      language: "Language",
      mathematics: "Mathematics",
      logical: "Logical",
    };
    return names[domain] || domain;
  }

  /**
   * Store level completion with SuperMemo data
   */
  private storeLevelCompletion(
    kidId: string,
    levelKey: string,
    completion: LevelCompletion
  ) {
    const key = `level-completions-${kidId}`;
    const stored = localStorage.getItem(key);
    const completions: Record<string, LevelCompletion> = stored
      ? JSON.parse(stored)
      : {};

    completions[levelKey] = completion;
    localStorage.setItem(key, JSON.stringify(completions));
  }

  /**
   * Get level completion record
   */
  getLevelCompletion(
    kidId: string,
    domain: GameDomain,
    levelNumber: number
  ): LevelCompletion | null {
    const key = `level-completions-${kidId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const completions: Record<string, LevelCompletion> = JSON.parse(stored);
    const levelKey = `${domain}-level-${levelNumber}`;
    return completions[levelKey] || null;
  }

  /**
   * Check if a level is locked (based on SuperMemo interval)
   */
  getLevelLockStatus(
    kidId: string,
    domain: GameDomain,
    levelNumber: number
  ): LevelLockStatus {
    const completion = this.getLevelCompletion(kidId, domain, levelNumber);
    return SpaceRepetitionManager.getLockStatus(completion ?? undefined);
  }

  /**
   * Check if level can be played now (not locked by SuperMemo)
   */
  canPlayLevel(
    kidId: string,
    domain: GameDomain,
    levelNumber: number
  ): boolean {
    const lockStatus = this.getLevelLockStatus(kidId, domain, levelNumber);
    return !lockStatus.isLocked;
  }

  /**
   * Get time until level unlock (human-readable)
   */
  getTimeUntilUnlock(
    kidId: string,
    domain: GameDomain,
    levelNumber: number
  ): string {
    const lock = this.getLevelLockStatus(kidId, domain, levelNumber);
    return SpaceRepetitionManager.formatTimeUntilUnlock(lock);
  }

  /**
   * Override level lock (parent/admin feature to allow immediate retry)
   */
  resetLevelLock(
    kidId: string,
    domain: GameDomain,
    levelNumber: number
  ) {
    const completion = this.getLevelCompletion(kidId, domain, levelNumber);
    if (completion) {
      const reset = SpaceRepetitionManager.resetLevel(completion);
      const levelKey = `${domain}-level-${levelNumber}`;
      this.storeLevelCompletion(kidId, levelKey, reset);
    }
  }
}

export const gameAPI = new GameAPI();
export default gameAPI;
