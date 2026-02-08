/**
 * Game Types & Interfaces
 * Defines all data structures for the gamified learning platform
 */

/* ==================== Game Domain Types ==================== */

export type GameDomain = "language" | "mathematics" | "logical";

export type LanguageSkill = "writing" | "reading" | "listening";

/* ==================== Level & Game Progress ==================== */

export interface GameLevel {
  level_id: string;
  domain: GameDomain;
  level_number: number;
  difficulty: "easy" | "medium" | "hard";
  title: string;
  description: string;
  max_stars: number; // 1-5 stars
  created_at: string;
  is_available: boolean;
}

export interface GameSession {
  session_id: string;
  kid_id: string;
  level_id: string;
  domain: GameDomain;
  level_number: number;
  started_at: string;
  completed_at?: string;
  stars_earned: number;
  score: number;
  time_taken_seconds: number;
  answers: GameAnswer[];
  is_completed: boolean;
}

export interface GameAnswer {
  question_id: string;
  user_answer: string | number | string[];
  correct_answer: string | number | string[];
  is_correct: boolean;
  time_taken_seconds: number;
}

export interface KidProgress {
  kid_id: string;
  domain: GameDomain;
  max_level_completed: number;
  total_stars: number;
  sessions_completed: number;
  last_played: string;
  skill_levels?: {
    [key in LanguageSkill]?: number;
  };
}

export interface LevelAward {
  award_id: string;
  kid_id: string;
  level_id: string;
  domain: GameDomain;
  level_number: number;
  stars_earned: number;
  points_awarded: number;
  completed_at: string;
  reason: string; // e.g., "Level 5 - Language Writing - 5 Stars"
}

/* ==================== Question Types ==================== */

export interface BaseQuestion {
  question_id: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  time_limit_seconds: number;
}

// Language Questions
export interface WritingQuestion extends BaseQuestion {
  type: "writing";
  prompt: string; // e.g., "Draw and type the letter 'A'"
  skill: "draw" | "type";
  correct_answer: string;
}

export interface ReadingQuestion extends BaseQuestion {
  type: "reading";
  text: string;
  question: string;
  options: string[];
  correct_answer_index: number;
  image_url?: string;
}

export interface ListeningQuestion extends BaseQuestion {
  type: "listening";
  audio_url: string;
  question: string;
  options: string[];
  correct_answer_index: number;
}

// Math Questions
export interface MathQuestion extends BaseQuestion {
  type: "math";
  operation: "addition" | "subtraction" | "multiplication" | "division";
  num1: number;
  num2: number;
  correct_answer: number;
}

// Logical Questions
export interface LogicalQuestion extends BaseQuestion {
  type: "logical";
  sub_type: "pattern" | "sequence" | "puzzle" | "memory";
  question: string;
  options: string[];
  correct_answer_index: number;
  image_urls?: string[];
}

export type Question =
  | WritingQuestion
  | ReadingQuestion
  | ListeningQuestion
  | MathQuestion
  | LogicalQuestion;

/* ==================== Game Configuration ==================== */

export interface DomainConfig {
  domain: GameDomain;
  name: string;
  description: string;
  icon: string;
  color: string;
  max_questions_per_level: number;
  points_per_star: number;
}

export interface LevelDifficulty {
  [key: number]: "easy" | "medium" | "hard";
}

export interface GameConfig {
  max_levels_per_domain: number;
  min_questions_per_level: number;
  max_questions_per_level: number;
  stars_threshold: {
    1: number; // % correct for 1 star
    2: number;
    3: number;
    4: number;
    5: number; // % correct for 5 stars
  };
  time_bonus_enabled: boolean;
  time_bonus_points_per_second: number;
}

/* ==================== Play Session Response ==================== */

export interface GameSessionResult {
  session_id: string;
  level_id: string;
  domain: GameDomain;
  level_number: number;
  is_completed: boolean;
  stars_earned: number;
  score: number;
  percentage: number;
  time_taken_seconds: number;
  feedback: string;
  next_level_available: boolean;
  points_awarded: number;
}
