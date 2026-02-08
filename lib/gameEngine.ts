/**
 * Game Level Generator
 * Generates complete game levels for all domains
 * Handles scoring, star calculation, and session management
 */

import {
  GameLevel,
  GameSession,
  GameDomain,
  Question,
  GameSessionResult,
  GameAnswer,
} from "./gameTypes";
import { LanguageLevelGenerator } from "./gameDomains/language";
import { MathQuestionGenerator } from "./gameDomains/mathematics";
import { LogicalQuestionGenerator } from "./gameDomains/logical";

export const GAME_CONFIG = {
  maxLevelsPerDomain: 100, // Infinite levels that scale over time
  questionsPerLevel: 5,
  starsThreshold: {
    1: 0.6, // 60% correct = 1 star
    2: 0.7,
    3: 0.8,
    4: 0.9,
    5: 1.0, // 100% correct = 5 stars
  },
  pointsPerStar: {
    1: 5,
    2: 10,
    3: 15,
    4: 20,
    5: 25,
  },
  timeBonus: {
    enabled: true,
    pointsPerSecondSaved: 0.1, // Bonus for finishing early
  },
};

export class GameLevelGenerator {
  /**
   * Generate a complete game level for a domain
   */
  static generateLevel(
    domain: GameDomain,
    levelNumber: number,
    options?: { locale?: "en" | "hi" | "zh" }
  ): GameLevel & { questions: Question[] } {
    const level: GameLevel = {
      level_id: `${domain}-level-${levelNumber}`,
      domain,
      level_number: levelNumber,
      difficulty: this.calculateDifficulty(levelNumber),
      title: this.generateLevelTitle(domain, levelNumber),
      description: this.generateLevelDescription(domain, levelNumber),
      max_stars: 5,
      created_at: new Date().toISOString(),
      is_available: true,
    };

    const questions = this.generateQuestions(domain, levelNumber, options?.locale);

    return {
      ...level,
      questions,
    };
  }

  /**
   * Generate questions based on domain
   */
  private static generateQuestions(domain: GameDomain, level: number, locale?: "en" | "hi" | "zh"): Question[] {
    switch (domain) {
      case "language":
        return LanguageLevelGenerator.generateLevel(level, locale || "en") as Question[];
      case "mathematics":
        return MathQuestionGenerator.generateMathQuestions(level) as Question[];
      case "logical":
        return LogicalQuestionGenerator.generateLogicalQuestions(level) as Question[];
      default:
        return [];
    }
  }

  /**
   * Calculate difficulty based on level
   */
  private static calculateDifficulty(
    level: number
  ): "easy" | "medium" | "hard" {
    if (level <= 5) return "easy";
    if (level <= 15) return "medium";
    return "hard";
  }

  /**
   * Generate level title
   */
  private static generateLevelTitle(domain: GameDomain, level: number): string {
    const domainNames: Record<GameDomain, string> = {
      language: "Language",
      mathematics: "Math",
      logical: "Logic",
    };

    return `${domainNames[domain]} Level ${level}`;
  }

  /**
   * Generate level description based on domain and level
   */
  private static generateLevelDescription(
    domain: GameDomain,
    level: number
  ): string {
    const descriptions: Record<GameDomain, Record<string, string>> = {
      language: {
        early: "Learn letters and basic words",
        intermediate: "Practice reading and writing",
        advanced: "Master sentences and comprehension",
      },
      mathematics: {
        early: "Discover numbers and simple addition",
        intermediate: "Practice multiplication and division",
        advanced: "Solve complex math problems",
      },
      logical: {
        early: "Recognize patterns and sequences",
        intermediate: "Solve puzzles and remember patterns",
        advanced: "Master complex logic challenges",
      },
    };

    const stage =
      level <= 5
        ? "early"
        : level <= 15
          ? "intermediate"
          : "advanced";

    return descriptions[domain][stage];
  }
}

/**
 * Game Session Manager
 * Handles scoring, star calculation, and result processing
 */
export class GameSessionManager {
  /**
   * Create a new game session
   */
  static createSession(
    kidId: string,
    levelId: string,
    domain: GameDomain,
    levelNumber: number
  ): GameSession {
    return {
      session_id: `session-${kidId}-${Date.now()}`,
      kid_id: kidId,
      level_id: levelId,
      domain,
      level_number: levelNumber,
      started_at: new Date().toISOString(),
      score: 0,
      time_taken_seconds: 0,
      answers: [],
      stars_earned: 0,
      is_completed: false,
    };
  }

  /**
   * Calculate session result and stars earned
   */
  static calculateResult(
    session: GameSession,
    totalTimeLimitSeconds: number
  ): GameSessionResult {
    const totalQuestions = session.answers.length;
    const correctAnswers = session.answers.filter((a) => a.is_correct).length;
    const percentage = (correctAnswers / totalQuestions) * 100;

    // Calculate stars based on percentage
    let starsEarned = 0;
    for (let stars = 5; stars >= 1; stars--) {
      const threshold =
        GAME_CONFIG.starsThreshold[stars as keyof typeof GAME_CONFIG.starsThreshold] * 100;
      if (percentage >= threshold) {
        starsEarned = stars;
        break;
      }
    }

    // Calculate base points
    const basePoints =
      GAME_CONFIG.pointsPerStar[starsEarned as keyof typeof GAME_CONFIG.pointsPerStar] || 0;

    // Calculate time bonus
    let timeBonus = 0;
    if (GAME_CONFIG.timeBonus.enabled) {
      const timeSaved = Math.max(0, totalTimeLimitSeconds - session.time_taken_seconds);
      timeBonus = Math.floor(timeSaved * GAME_CONFIG.timeBonus.pointsPerSecondSaved);
    }

    const totalPoints = basePoints + timeBonus;

    return {
      session_id: session.session_id,
      level_id: session.level_id,
      domain: session.domain,
      level_number: session.level_number,
      is_completed: starsEarned >= 1,
      stars_earned: starsEarned,
      score: session.score,
      percentage: Math.round(percentage),
      time_taken_seconds: session.time_taken_seconds,
      feedback: this.generateFeedback(percentage, starsEarned),
      next_level_available: starsEarned >= 3, // Need at least 3 stars to unlock next level
      points_awarded: totalPoints,
    };
  }

  /**
   * Generate feedback message based on performance
   */
  private static generateFeedback(percentage: number, stars: number): string {
    if (stars === 5) {
      return "🌟 Perfect! You're a superstar!";
    } else if (stars === 4) {
      return "⭐ Excellent work!";
    } else if (stars === 3) {
      return "Good job! Keep practicing!";
    } else if (stars === 2) {
      return "Nice try! You can do better!";
    } else if (stars === 1) {
      return "✨ You passed! Try again to improve!";
    } else {
      return "Keep practicing! You'll get it next time!";
    }
  }

  /**
   * Record an answer in the session
   */
  static recordAnswer(
    session: GameSession,
    answer: GameAnswer
  ): GameSession {
    const updatedSession = { ...session };
    updatedSession.answers.push(answer);

    // Update score
    if (answer.is_correct) {
      updatedSession.score += 10;
    }

    // Update total time
    updatedSession.time_taken_seconds += answer.time_taken_seconds;

    return updatedSession;
  }

  /**
   * Complete session
   */
  static completeSession(session: GameSession): GameSession {
    return {
      ...session,
      is_completed: true,
      completed_at: new Date().toISOString(),
    };
  }

  /**
   * Generate reason string for Google Sheets logging
   */
  static generateReason(
    domain: GameDomain,
    levelNumber: number,
    starsEarned: number
  ): string {
    const domainDisplayName: Record<GameDomain, string> = {
      language: "Language",
      mathematics: "Mathematics",
      logical: "Logical Thinking",
    };

    return `${domainDisplayName[domain]} Level ${levelNumber} - ${starsEarned} Stars`;
  }
}

/**
 * Progress Tracker
 * Tracks kid's progress across all domains
 */
export class ProgressTracker {
  /**
   * Calculate next available level based on completed levels
   */
  static getNextLevel(
    maxLevelCompleted: number,
    starsOnCurrentLevel: number
  ): number {
    // Need at least 3 stars to progress to next level
    if (starsOnCurrentLevel >= 3) {
      return maxLevelCompleted + 1;
    }
    return maxLevelCompleted;
  }

  /**
   * Calculate skill metrics for language domain
   */
  static calculateLanguageSkillMetrics(sessions: GameSession[]): Record<string, number> {
    const skillMetrics = {
      writing: 0,
      reading: 0,
      listening: 0,
    };

    // Analyze sessions to determine skill levels
    // This would be enhanced with actual question type analysis
    const totalSessions = sessions.length;
    if (totalSessions > 0) {
      skillMetrics.writing = Math.min(10, Math.ceil(totalSessions / 5));
      skillMetrics.reading = Math.min(10, Math.ceil(totalSessions / 4));
      skillMetrics.listening = Math.min(10, Math.ceil(totalSessions / 6));
    }

    return skillMetrics;
  }

  /**
   * Get achievement badges based on progress
   */
  static getAchievements(
    totalStars: number,
    levelsByDomain: Record<GameDomain, number>
  ): string[] {
    const achievements: string[] = [];

    if (totalStars >= 10) achievements.push("🌟 Star Collector (10 stars)");
    if (totalStars >= 50) achievements.push("⭐ Star Master (50 stars)");
    if (totalStars >= 100) achievements.push("✨ Star Legend (100 stars)");

    if (levelsByDomain.language >= 5)
      achievements.push("📚 Language Learner (5 levels)");
    if (levelsByDomain.mathematics >= 5)
      achievements.push("🔢 Math Genius (5 levels)");
    if (levelsByDomain.logical >= 5)
      achievements.push("🧩 Logic Master (5 levels)");

    const totalLevels =
      (levelsByDomain.language || 0) +
      (levelsByDomain.mathematics || 0) +
      (levelsByDomain.logical || 0);
    if (totalLevels >= 15) achievements.push("🏆 Ultimate Learner (15 levels)");

    return achievements;
  }
}
