/**
 * Logical Thinking Learning Domain Module - Enhanced for 50 Levels
 * Includes: Pattern Recognition, Sequences, Puzzles, Spatial Reasoning
 * Evidence-based progression using Raven's test principles
 */

import { LogicalQuestion } from "../gameTypes";

// Logical content for all 50 levels
const LogicalContent = {
  // Phase 1: Basic Patterns (Levels 1-10)
  basicPatterns: {
    colors: [
      { question: "🔴 🟡 🟢 ?", options: ["🔵", "🟡", "🔴", "⭐"], correct: 0 },
      { question: "Red Blue Red Blue ?", options: ["Blue", "Red", "Green"],  correct: 0 },
      { question: "🔴 🔴 🟡 🟡 🔴 ?", options: ["🔴", "🟡", "🔵"], correct: 1 },
    ],
    shapes: [
      { question: "Circle Square Triangle ?", options: ["Circle", "Square", "Diamond"] , correct: 0 },
      { question: "▲ ● ■ ▲ ● ?", options: ["▲", "■", "●"], correct: 2 },
    ],
    numbers: [
      { question: "1 2 3 4 ?", options: ["5", "4", "6"], correct: 0 },
      { question: "2 4 6 8 ?", options: ["10", "9", "12"], correct: 0 },
      { question: "5 5 5 5 ?", options: ["5", "6", "4"], correct: 0 },
    ],
  },
  // Phase 2: Sequences (Levels 11-20)
  sequences: {
    arithmetic: [
      [1, 2, 3, 4, 5],
      [2, 4, 6, 8, 10],
      [3, 6, 9, 12, 15],
      [5, 10, 15, 20, 25],
      [10, 20, 30, 40, 50],
    ],
    alternating: [
      [1, 2, 1, 2, 1],
      [1, 2, 3, 1, 2],
      [5, 1, 5, 1, 5],
    ],
    fibonacci: [
      [1, 1, 2, 3, 5],
      [1, 2, 3, 5, 8],
      [2, 2, 4, 6, 10],
    ],
  },
  // Phase 3: Spatial Reasoning (Levels 21-30)
  spatialPatterns: {
    rotations: ["90°", "180°", "270°", "none"],
    reflections: ["vertical", "horizontal", "both", "none"],
  },
  // Phase 4: Logic Puzzles (Levels 31-40)
  logicPuzzles: {
    syllogisms: [
      { premise: "All cats are animals. Fluffy is a cat.", conclusion: "Fluffy is an animal" },
      { premise: "All birds can fly. A penguin is a bird.", conclusion: "A penguin can fly (except it doesn't!)" },
    ],
    conditions: [
      { statement: "If it rains, the ground is wet.", question: "It's raining. Is ground wet?", answer: "yes" },
      { statement: "If it's hot, I eat ice cream.", question: "I'm eating ice cream. Is it hot?", answer: "maybe" },
    ],
  },
};

export class LogicalQuestionGenerator {
  /**
   * Generate logical thinking questions
   * Comprehensive 50-level progression
   */
  static generateLogicalQuestions(level: number): LogicalQuestion[] {
    const questions: LogicalQuestion[] = [];

    // Phase 1: Basic Patterns (Levels 1-10)
    if (level <= 10) {
      for (let i = 0; i < 5; i++) {
        questions.push(this.generateBasicPatternQuestion(level, i));
      }
    }
    // Phase 2: Sequences (Levels 11-20)
    else if (level <= 20) {
      for (let i = 0; i < 5; i++) {
        questions.push(this.generateSequenceQuestion(level, i));
      }
    }
    // Phase 3: Spatial Reasoning (Levels 21-30)
    else if (level <= 30) {
      for (let i = 0; i < 5; i++) {
        questions.push(this.generateSpatialQuestion(level, i));
      }
    }
    // Phase 4: Logic Puzzles (Levels 31-40)
    else if (level <= 40) {
      for (let i = 0; i < 5; i++) {
        questions.push(this.generateLogicPuzzleQuestion(level, i));
      }
    }
    // Phase 5: Advanced Reasoning (Levels 41-50)
    else {
      for (let i = 0; i < 5; i++) {
        questions.push(this.generateAdvancedQuestion(level, i));
      }
    }

    return questions;
  }

  /**
   * Basic Pattern Questions (Levels 1-10)
   */
  private static generateBasicPatternQuestion(level: number, index: number): LogicalQuestion {
    const patterns = [
      { question: "🔴 🟡 🟢 ?", options: ["🔵", "🟡", "🔴", "⭐"], correctIndex: 0, difficulty: "easy" as const },
      { question: "▲ ▲ ● ● ■ ?", options: ["■", "▲", "●", "◆"], correctIndex: 2, difficulty: "medium" as const },
      { question: "Small Big Small Big ?", options: ["Big", "Small", "Medium", "Tiny"], correctIndex: 0, difficulty: "medium" as const },
      { question: "1️⃣ 2️⃣ 1️⃣ 2️⃣ ?", options: ["1️⃣", "2️⃣", "3️⃣"], correctIndex: 0, difficulty: "easy" as const },
      { question: "Red Red Blue Blue Red ?", options: ["Red", "Blue", "Green"], correctIndex: 1, difficulty: "hard" as const },
    ];

    const pattern = patterns[index % patterns.length];
    const adjustedDifficulty = level <= 3 ? "easy" : level <= 7 ? "medium" : "hard";

    return {
      question_id: `logical-${level}-pattern-${index}`,
      type: "logical",
      sub_type: "pattern",
      difficulty: adjustedDifficulty,
      question: pattern.question,
      options: pattern.options,
      correct_answer_index: pattern.correctIndex,
      time_limit_seconds: 15,
    };
  }

  /**
   * Sequence Questions (Levels 11-20)
   */
  private static generateSequenceQuestion(level: number, index: number): LogicalQuestion {
    const sequenceLevel = level - 10;
    let question, options, correctIndex, difficulty;

    if (sequenceLevel <= 3) {
      // Arithmetic sequences
      const sequences = [
        { seq: "1 2 3 4 5 ?", opts: ["6", "5", "7"] },
        { seq: "2 4 6 8 10 ?", opts: ["12", "10", "14"] },
        { seq: "5 10 15 20 25 ?", opts: ["30", "25", "35"] },
        { seq: "10 20 30 40 50 ?", opts: ["60", "50", "70"] },
        { seq: "3 6 9 12 15 ?", opts: ["18", "15", "21"] },
      ];
      const seq = sequences[index % sequences.length];
      question = seq.seq;
      options = seq.opts;
      correctIndex = 0;
      difficulty = "medium";
    } else if (sequenceLevel <= 6) {
      // Fibonacci-like
      const sequences = [
        { seq: "1 1 2 3 5 ?", opts: ["8", "6", "7"] },
        { seq: "2 2 4 6 10 ?", opts: ["16", "12", "14"] },
        { seq: "1 2 3 5 8 ?", opts: ["13", "11", "12"] },
      ];
      const seq = sequences[index % sequences.length];
      question = seq.seq;
      options = seq.opts;
      correctIndex = 0;
      difficulty = "hard";
    } else {
      // Complex patterns
      const sequences = [
        { seq: "1 4 9 16 25 ?", opts: ["36", "30", "35"] },  // Squares
        { seq: "2 3 5 8 13 ?", opts: ["21", "18", "20"] },   // Fibonacci
        { seq: "1 1 2 2 3 3 ?", opts: ["4", "3", "5"] },     // Repetition
      ];
      const seq = sequences[index % sequences.length];
      question = seq.seq;
      options = seq.opts;
      correctIndex = 0;
      difficulty = "hard";
    }

    return {
      question_id: `logical-${level}-sequence-${index}`,
      type: "logical",
      sub_type: "sequence",
      difficulty: difficulty as "easy" | "medium" | "hard",
      question,
      options,
      correct_answer_index: correctIndex,
      time_limit_seconds: 20,
    };
  }

  /**
   * Spatial Reasoning Questions (Levels 21-30)
   */
  private static generateSpatialQuestion(level: number, index: number): LogicalQuestion {
    const questions = [
      { question: "🔴 rotated 90° clockwise looks like: ?", options: ["🔴 (top-right)", "🔴 (bottom-left)", "🔴 (same)"], correctIndex: 2, difficulty: "medium" as const },
      { question: "▲ flipped horizontally looks like: ?", options: ["▲ (same)", "▼", "◄"], correctIndex: 1, difficulty: "medium" as const },
      { question: "📦 rotated 180° looks like: ?", options: ["📦 (upside down)", "📦 (same)", "📦 (sideways)"], correctIndex: 0, difficulty: "hard" as const },
      { question: "How many sides does a square have?", options: ["3", "4", "5", "6"], correctIndex: 1, difficulty: "easy" as const },
      { question: "Which shape has no corners?", options: ["Square", "Triangle", "Circle", "Pentagon"], correctIndex: 2, difficulty: "easy" as const },
    ];

    const q = questions[index % questions.length];
    return {
      question_id: `logical-${level}-spatial-${index}`,
      type: "logical",
      sub_type: "puzzle",
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      correct_answer_index: q.correctIndex,
      time_limit_seconds: 20,
    };
  }

  /**
   * Logic Puzzle Questions (Levels 31-40)
   */
  private static generateLogicPuzzleQuestion(level: number, index: number): LogicalQuestion {
    const puzzles = [
      { question: "All cats are animals. Fluffy is a cat. Is Fluffy an animal?", options: ["Yes", "No", "Maybe"], correctIndex: 0, difficulty: "hard" as const },
      { question: "If it rains, the ground is wet. It's raining. Is the ground wet?", options: ["Yes", "No", "Maybe"], correctIndex: 0, difficulty: "hard" as const },
      { question: "John is taller than Mary. Mary is taller than Sue. Who is tallest?", options: ["John", "Mary", "Sue"], correctIndex: 0, difficulty: "hard" as const },
      { question: "Red is not blue. The ball is red. Is the ball blue?", options: ["Yes", "No", "Cannot tell"], correctIndex: 1, difficulty: "hard" as const },
      { question: "Some dogs are white. All white things are precious. Are all dogs precious?", options: ["Yes", "No", "Not necessarily"], correctIndex: 2, difficulty: "hard" as const },
    ];

    const puzzle = puzzles[index % puzzles.length];
    return {
      question_id: `logical-${level}-logic-${index}`,
      type: "logical",
      sub_type: "puzzle",
      difficulty: puzzle.difficulty,
      question: puzzle.question,
      options: puzzle.options,
      correct_answer_index: puzzle.correctIndex,
      time_limit_seconds: 25,
    };
  }

  /**
   * Advanced Reasoning Questions (Levels 41-50)
   */
  private static generateAdvancedQuestion(level: number, index: number): LogicalQuestion {
    const advancedQuestions = [
      { question: "Which number completes the pattern? 2 4 8 16 32 ?", options: ["64", "40", "48"], correctIndex: 0, difficulty: "hard" as const },
      { question: "Find the odd one out: Apple, Orange, Carrot, Banana", options: ["Apple", "Carrot", "Orange", "Banana"], correctIndex: 1, difficulty: "hard" as const },
      { question: "If A=1, B=2, C=3... What is the 26th letter?", options: ["Y", "Z", "X"], correctIndex: 1, difficulty: "hard" as const },
      { question: "What comes next in this pattern? 1 4 9 16 25 ?", options: ["36", "35", "34"], correctIndex: 0, difficulty: "hard" as const },
      { question: "Which shape doesn't belong? ▲ ■ ● ◆ ■", options: ["▲", "●", "◆"], correctIndex: 1, difficulty: "hard" as const },
    ];

    const q = advancedQuestions[index % advancedQuestions.length];
    return {
      question_id: `logical-${level}-advanced-${index}`,
      type: "logical",
      sub_type: level > 45 ? "memory" : "puzzle",
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      correct_answer_index: q.correctIndex,
      time_limit_seconds: 30,
    };
  }
}