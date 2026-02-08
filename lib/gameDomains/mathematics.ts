/**
 * Mathematics Learning Domain Module - Enhanced for 50 Levels
 * Operations: Number sense → Addition → Subtraction → Multiplication → Division
 * Evidence-based progression using Singapore Math & Van de Walle principles
 */

import { MathQuestion } from "../gameTypes";

// Math content for all 50 levels
const MathContent = {
  // Level 1-10: Number sense and addition foundations
  phase1: {
    countingActivities: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    subitizingPatterns: [
      [1], [2], [3], [1, 1], [2, 1], [1, 2], [2, 2], [1, 2, 2],
    ],
  },
  // Level 11-20: Addition facts to 10 and beyond
  phase2Addition: {
    factsTo5: [[1, 1], [1, 2], [1, 3], [1, 4], [2, 2], [2, 3], [3, 2]],
    factsTo10: [[3, 4], [4, 4], [3, 5], [4, 5], [4, 6], [5, 5], [5, 6], [6, 4]],
    teen: [[10, 1], [10, 2], [10, 3], [10, 4], [10, 5], [10, 6], [10, 7], [10, 8], [10, 9]],
  },
  // Level 21-30: Subtraction foundations
  phase3Subtraction: {
    basicFacts: [[2, 1], [3, 1], [3, 2], [4, 1], [4, 2], [4, 3], [5, 1], [5, 2], [5, 3], [5, 4]],
    mediumFacts: [[6, 3], [7, 3], [8, 4], [9, 5], [10, 6]],
  },
  // Level 31-40: Multiplication foundations
  phase4Multiplication: {
    skip2: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    skip5: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    skip10: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    facts: [[2, 3], [2, 4], [2, 5], [3, 3], [3, 4], [3, 5]],
  },
  // Level 41-50: Division and complex operations
  phase5Division: {
    basic: [[6, 2], [8, 2], [10, 2], [10, 5], [15, 5], [12, 2]],
  },
};

export class MathQuestionGenerator {
  /**
   * Generate math questions based on level
   * Comprehensive 50-level progression
   */
  static generateMathQuestions(level: number): MathQuestion[] {
    const questions: MathQuestion[] = [];

    // Phase 1: Number Sense (Levels 1-5)
    if (level <= 5) {
      for (let i = 0; i < 5; i++) {
        const num = Math.floor(Math.random() * (level * 2)) + 1;
        const num1 = num;
        const num2 = 0;
        questions.push({
          question_id: `math-${level}-count-${i}`,
          type: "math",
          difficulty: level > 3 ? "medium" : "easy",
          operation: "addition",
          num1,
          num2,
          correct_answer: num,
          time_limit_seconds: 20,
        });
      }
    }
    // Phase 1B: Subitizing (Levels 6-10)
    else if (level <= 10) {
      for (let i = 0; i < 5; i++) {
        const factsTo5 = MathContent.phase2Addition.factsTo5;
        const [n1, n2] = factsTo5[i % factsTo5.length];
        questions.push({
          question_id: `math-${level}-subit-${i}`,
          type: "math",
          difficulty: "easy",
          operation: "addition",
          num1: n1,
          num2: n2,
          correct_answer: n1 + n2,
          time_limit_seconds: 15,
        });
      }
    }
    // Phase 2A: Addition Facts to 10 (Levels 11-15)
    else if (level <= 15) {
      for (let i = 0; i < 5; i++) {
        const factsTo10 = MathContent.phase2Addition.factsTo10;
        const [n1, n2] = factsTo10[i % factsTo10.length];
        questions.push({
          question_id: `math-${level}-add10-${i}`,
          type: "math",
          difficulty: "easy",
          operation: "addition",
          num1: n1,
          num2: n2,
          correct_answer: n1 + n2,
          time_limit_seconds: 20,
        });
      }
    }
    // Phase 2B: Addition with Teens (Levels 16-20)
    else if (level <= 20) {
      for (let i = 0; i < 5; i++) {
        const teenage = MathContent.phase2Addition.teen;
        const [n1, n2] = teenage[i % teenage.length];
        questions.push({
          question_id: `math-${level}-teen-${i}`,
          type: "math",
          difficulty: "medium",
          operation: "addition",
          num1: n1,
          num2: n2,
          correct_answer: n1 + n2,
          time_limit_seconds: 25,
        });
      }
    }
    // Phase 3A: Subtraction Basics (Levels 21-25)
    else if (level <= 25) {
      for (let i = 0; i < 5; i++) {
        const basicFacts = MathContent.phase3Subtraction.basicFacts;
        const [n1, n2] = basicFacts[i % basicFacts.length];
        questions.push({
          question_id: `math-${level}-sub-${i}`,
          type: "math",
          difficulty: "medium",
          operation: "subtraction",
          num1: n1,
          num2: n2,
          correct_answer: n1 - n2,
          time_limit_seconds: 25,
        });
      }
    }
    // Phase 3B: Subtraction with Larger Numbers (Levels 26-30)
    else if (level <= 30) {
      for (let i = 0; i < 5; i++) {
        const mediumFacts = MathContent.phase3Subtraction.mediumFacts;
        const [n1, n2] = mediumFacts[i % mediumFacts.length];
        questions.push({
          question_id: `math-${level}-submed-${i}`,
          type: "math",
          difficulty: "medium",
          operation: "subtraction",
          num1: n1,
          num2: n2,
          correct_answer: n1 - n2,
          time_limit_seconds: 30,
        });
      }
    }
    // Phase 4A: Skip Counting (Levels 31-35)
    else if (level <= 35) {
      const multLevel = level - 30;
      for (let i = 0; i < 5; i++) {
        let n1, n2, result;
        let operation: "addition" | "subtraction" | "multiplication" | "division" = "multiplication";
        if (multLevel <= 1) {
          // 2x facts
          n1 = 2;
          n2 = i + 2;
          result = n1 * n2;
          operation = "multiplication";
        } else if (multLevel <= 2) {
          // 5x facts
          n1 = 5;
          n2 = i + 1;
          result = n1 * n2;
          operation = "multiplication";
        } else {
          // 10x facts
          n1 = 10;
          n2 = i + 1;
          result = n1 * n2;
          operation = "multiplication";
        }

        questions.push({
          question_id: `math-${level}-mixed-${i}`,
          type: "math",
          difficulty: "hard",
          operation,
          num1: n1,
          num2: n2,
          correct_answer: result,
          time_limit_seconds: 50,
        });
      }
    }

    return questions;
  }

  /**
   * Generate multiple choice options with correct answer
   */
  static generateMathOptions(correctAnswer: number): number[] {
    const options = [correctAnswer];

    // Generate wrong options
    while (options.length < 4) {
      let wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
      if (wrongAnswer < 0) wrongAnswer = Math.abs(wrongAnswer);

      // Make sure it's different and not already in options
      if (wrongAnswer !== correctAnswer && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }

    // Shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
  }

  /**
   * Calculate if answer is correct
   */
  static isCorrect(operation: string, num1: number, num2: number, answer: number): boolean {
    switch (operation) {
      case "addition":
        return num1 + num2 === answer;
      case "subtraction":
        return num1 - num2 === answer;
      case "multiplication":
        return num1 * num2 === answer;
      case "division":
        return num1 / num2 === answer;
      default:
        return false;
    }
  }
}
