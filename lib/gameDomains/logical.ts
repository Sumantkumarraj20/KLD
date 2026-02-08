/**
 * Logical Thinking Learning Domain Module
 * Includes: Pattern Recognition, Sequences, Puzzles, Memory Games
 */

import { LogicalQuestion } from "../gameTypes";

export class LogicalQuestionGenerator {
  /**
   * Generate logical thinking questions
   * Includes patterns, sequences, puzzles, and memory challenges
   */
  static generateLogicalQuestions(level: number): LogicalQuestion[] {
    const questions: LogicalQuestion[] = [];

    const questionTypes: Array<"pattern" | "sequence" | "puzzle" | "memory"> = [
      "pattern",
      "sequence",
      "puzzle",
      "memory",
    ];

    for (let i = 0; i < 5; i++) {
      const subType = questionTypes[i % 4];

      switch (subType) {
        case "pattern":
          questions.push(this.generatePatternQuestion(level, i));
          break;
        case "sequence":
          questions.push(this.generateSequenceQuestion(level, i));
          break;
        case "puzzle":
          questions.push(this.generatePuzzleQuestion(level, i));
          break;
        case "memory":
          questions.push(this.generateMemoryQuestion(level, i));
          break;
      }
    }

    return questions;
  }

  /**
   * Pattern Recognition Questions
   */
  private static generatePatternQuestion(
    level: number,
    index: number
  ): LogicalQuestion {
    const patterns = [
      {
        question: "Which shape comes next? 🔴 🟡 🟢 ?",
        options: ["🔵", "🟡", "🔴", "⭐"],
        correctIndex: 0,
        difficulty: "easy" as const,
      },
      {
        question: "Which color pattern continues? Red Blue Red Blue ?",
        options: ["Blue", "Red", "Green", "Yellow"],
        correctIndex: 0,
        difficulty: "medium" as const,
      },
      {
        question: "Find the pattern: 2 4 6 8 ?",
        options: ["10", "9", "12", "14"],
        correctIndex: 0,
        difficulty: "hard" as const,
      },
      {
        question: "What comes next? 🟠 🟠🟠 🟠🟠🟠 ?",
        options: ["🟠", "🟠🟠🟠🟠", "🟡🟡", "⭐"],
        correctIndex: 1,
        difficulty: "medium" as const,
      },
      {
        question: "Complete the pattern: AB AB AB ?",
        options: ["AB", "BA", "AC", "BB"],
        correctIndex: 0,
        difficulty: "easy" as const,
      },
    ];

    const selectedPattern = patterns[index % patterns.length];
    const adjustedDifficulty =
      level <= 5
        ? "easy"
        : level <= 10
          ? "medium"
          : "hard";

    return {
      question_id: `logical-${level}-pattern-${index}`,
      type: "logical",
      sub_type: "pattern",
      difficulty: adjustedDifficulty,
      question: selectedPattern.question,
      options: selectedPattern.options,
      correct_answer_index: selectedPattern.correctIndex,
      time_limit_seconds: 30,
    };
  }

  /**
   * Sequence Questions
   */
  private static generateSequenceQuestion(
    level: number,
    index: number
  ): LogicalQuestion {
    const sequences = [
      {
        question: "Continue the sequence: 1 2 3 4 ?",
        options: ["5", "6", "3", "2"],
        correctIndex: 0,
        difficulty: "easy" as const,
      },
      {
        question: "What number is missing? 2 4 6 ? 10",
        options: ["7", "8", "5", "9"],
        correctIndex: 1,
        difficulty: "medium" as const,
      },
      {
        question: "Next in sequence: 1 1 2 3 5 8 ?",
        options: ["10", "13", "12", "11"],
        correctIndex: 1,
        difficulty: "hard" as const,
      },
      {
        question: "What comes next? Z Y X W ?",
        options: ["V", "U", "T", "S"],
        correctIndex: 0,
        difficulty: "medium" as const,
      },
      {
        question: "Find next: 5 10 15 20 ?",
        options: ["25", "30", "22", "24"],
        correctIndex: 0,
        difficulty: "easy" as const,
      },
    ];

    const selectedSequence = sequences[index % sequences.length];
    const adjustedDifficulty =
      level <= 5
        ? "easy"
        : level <= 10
          ? "medium"
          : "hard";

    return {
      question_id: `logical-${level}-sequence-${index}`,
      type: "logical",
      sub_type: "sequence",
      difficulty: adjustedDifficulty,
      question: selectedSequence.question,
      options: selectedSequence.options,
      correct_answer_index: selectedSequence.correctIndex,
      time_limit_seconds: 35,
    };
  }

  /**
   * Puzzle Questions
   */
  private static generatePuzzleQuestion(
    level: number,
    index: number
  ): LogicalQuestion {
    const puzzles = [
      {
        question: "A dog has 4 legs. How many legs do 2 dogs have?",
        options: ["6", "8", "2", "4"],
        correctIndex: 1,
        difficulty: "easy" as const,
      },
      {
        question: "If you have 3 apples and add 2 more, how many do you have?",
        options: ["1", "5", "2", "6"],
        correctIndex: 1,
        difficulty: "easy" as const,
      },
      {
        question:
          "What has a face and hands but no legs? (Hint: tells time)",
        options: ["A person", "A clock", "A doll", "A book"],
        correctIndex: 1,
        difficulty: "hard" as const,
      },
      {
        question: "Which weighs more: a pound of feathers or a pound of rocks?",
        options: ["Rocks", "Feathers", "They weigh the same", "Can't tell"],
        correctIndex: 2,
        difficulty: "hard" as const,
      },
      {
        question: "If today is Monday, what day will it be in 2 days?",
        options: ["Tuesday", "Wednesday", "Thursday", "Friday"],
        correctIndex: 1,
        difficulty: "medium" as const,
      },
    ];

    const selectedPuzzle = puzzles[index % puzzles.length];
    const adjustedDifficulty =
      level <= 5
        ? "easy"
        : level <= 10
          ? "medium"
          : "hard";

    return {
      question_id: `logical-${level}-puzzle-${index}`,
      type: "logical",
      sub_type: "puzzle",
      difficulty: adjustedDifficulty,
      question: selectedPuzzle.question,
      options: selectedPuzzle.options,
      correct_answer_index: selectedPuzzle.correctIndex,
      time_limit_seconds: 40,
    };
  }

  /**
   * Memory Questions
   * Kids are shown items briefly, then asked to recall
   */
  private static generateMemoryQuestion(
    level: number,
    index: number
  ): LogicalQuestion {
    const memoryItems = [
      {
        question:
          "You saw these items for 5 seconds: 🍎 🍌 🍊. Which was NOT there?",
        options: ["🍎", "🍌", "🍇", "🍊"],
        correctIndex: 2,
        difficulty: "easy" as const,
      },
      {
        question:
          "Remember these: 🎈 🎀 🎁 🎉. Which is missing from: 🎀 🎁 🎉?",
        options: ["🎈", "🎀", "🎁", "🎉"],
        correctIndex: 0,
        difficulty: "medium" as const,
      },
      {
        question:
          "Recall the shapes: 🔴 🟡 🔵 🟢. Pick the one you remember:",
        options: ["🟡", "🟪", "🟠", "⭐"],
        correctIndex: 0,
        difficulty: "hard" as const,
      },
      {
        question: "You saw: A B C D E. What was in position 3?",
        options: ["A", "B", "C", "D"],
        correctIndex: 2,
        difficulty: "medium" as const,
      },
      {
        question:
          "Remember the order: Cat Dog Bird. Which comes after Dog?",
        options: ["Cat", "Dog", "Bird", "Fish"],
        correctIndex: 2,
        difficulty: "easy" as const,
      },
    ];

    const selectedMemory = memoryItems[index % memoryItems.length];
    const adjustedDifficulty =
      level <= 5
        ? "easy"
        : level <= 10
          ? "medium"
          : "hard";

    return {
      question_id: `logical-${level}-memory-${index}`,
      type: "logical",
      sub_type: "memory",
      difficulty: adjustedDifficulty,
      question: selectedMemory.question,
      options: selectedMemory.options,
      correct_answer_index: selectedMemory.correctIndex,
      time_limit_seconds: 45,
    };
  }
}

/**
 * Logical Difficulty Progression Map
 */
export const LOGICAL_DIFFICULTY_MAP: Record<
  number,
  "easy" | "medium" | "hard"
> = {
  1: "easy",
  2: "easy",
  3: "easy",
  4: "easy",
  5: "medium",
  6: "medium",
  7: "medium",
  8: "medium",
  9: "hard",
  10: "hard",
};
