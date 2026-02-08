/**
 * Mathematics Learning Domain Module
 * Operations: Addition, Subtraction, Multiplication, Division
 * Progressive difficulty based on level
 */

import { MathQuestion } from "../gameTypes";

export class MathQuestionGenerator {
  /**
   * Generate math questions based on level
   * Level 1-5: Addition (0-10)
   * Level 6-10: Subtraction (0-20)
   * Level 11-15: Multiplication (1-10)
   * Level 16+: Division and mixed operations
   */
  static generateMathQuestions(level: number): MathQuestion[] {
    const questions: MathQuestion[] = [];

    if (level <= 5) {
      // Addition (0-10)
      for (let i = 0; i < 5; i++) {
        const num1 = Math.floor(Math.random() * (level + 3));
        const num2 = Math.floor(Math.random() * (level + 3));

        questions.push({
          question_id: `math-${level}-addition-${i}`,
          type: "math",
          difficulty: level > 3 ? "medium" : "easy",
          operation: "addition",
          num1,
          num2,
          correct_answer: num1 + num2,
          time_limit_seconds: 30,
        });
      }
    } else if (level <= 10) {
      // Subtraction (0-20)
      for (let i = 0; i < 5; i++) {
        const num1 = Math.floor(Math.random() * 20) + (level - 5);
        const num2 = Math.floor(Math.random() * Math.min(num1, 10));

        questions.push({
          question_id: `math-${level}-subtraction-${i}`,
          type: "math",
          difficulty: "medium",
          operation: "subtraction",
          num1,
          num2,
          correct_answer: num1 - num2,
          time_limit_seconds: 35,
        });
      }
    } else if (level <= 15) {
      // Multiplication (1-10)
      for (let i = 0; i < 5; i++) {
        const num1 = Math.floor(Math.random() * 10) + 1;
        let num2 = Math.floor(Math.random() * (level - 10)) + 1;
        if (num2 > 10) num2 = 10;

        questions.push({
          question_id: `math-${level}-multiplication-${i}`,
          type: "math",
          difficulty: "hard",
          operation: "multiplication",
          num1,
          num2,
          correct_answer: num1 * num2,
          time_limit_seconds: 40,
        });
      }
    } else {
      // Division and mixed
      for (let i = 0; i < 5; i++) {
        if (i < 3) {
          // Division
          const divisor = Math.floor(Math.random() * 9) + 1;
          const quotient = Math.floor(Math.random() * 9) + 1;
          const num1 = divisor * quotient;

          questions.push({
            question_id: `math-${level}-division-${i}`,
            type: "math",
            difficulty: "hard",
            operation: "division",
            num1,
            num2: divisor,
            correct_answer: quotient,
            time_limit_seconds: 45,
          });
        } else {
          // Mixed operations
          const operations: Array<
            "addition" | "subtraction" | "multiplication"
          > = ["addition", "subtraction", "multiplication"];
          const operation = operations[i % 3];
          const num1 = Math.floor(Math.random() * 20) + 1;
          const num2 = Math.floor(Math.random() * 10) + 1;

          let correctAnswer = 0;
          switch (operation) {
            case "addition":
              correctAnswer = num1 + num2;
              break;
            case "subtraction":
              correctAnswer = num1 - num2;
              break;
            case "multiplication":
              correctAnswer = num1 * num2;
              break;
          }

          questions.push({
            question_id: `math-${level}-mixed-${i}`,
            type: "math",
            difficulty: "hard",
            operation,
            num1,
            num2,
            correct_answer: correctAnswer,
            time_limit_seconds: 50,
          });
        }
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

/**
 * Progressively increase difficulty with level
 */
export const MATH_DIFFICULTY_MAP: Record<number, "easy" | "medium" | "hard"> = {
  1: "easy",
  2: "easy",
  3: "easy",
  4: "medium",
  5: "medium",
  6: "medium",
  7: "medium",
  8: "hard",
  9: "hard",
  10: "hard",
};
