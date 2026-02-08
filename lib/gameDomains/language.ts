/**
 * Language Learning Domain Module
 * Includes: Writing (Draw & Type), Reading & Pronunciation, Listening & Comprehension
 */

import {
  WritingQuestion,
  ReadingQuestion,
  ListeningQuestion,
  Question,
} from "../gameTypes";

/* ==================== Writing Questions ==================== */

export class WritingQuestionGenerator {
  /**
   * Generate writing practice questions (draw and type)
   * Level 1-5: Letters A-Z
   * Level 6-10: Short words
   * Level 11+: Sentences
   */
  static generateWritingQuestions(
    level: number,
    skill: "draw" | "type"
    , locale: "en" | "hi" | "zh" = "en"
  ): WritingQuestion[] {
    const questions: WritingQuestion[] = [];

    if (level <= 5) {
      // Letter practice (locale aware)
      let letters: string[] = [];
      if (locale === "en") letters = "ABCDEFGHIJ".split("");
      else if (locale === "hi") letters = ["अ", "आ", "इ", "ई", "उ", "ए", "ओ", "क", "ख", "ग"];
      else if (locale === "zh") letters = ["你", "我", "他", "是", "不", "了", "在", "有", "这", "那"];

      for (const letter of letters.slice(0, level + 1)) {
        questions.push({
          question_id: `writing-${locale}-${level}-${letter}`,
          type: "writing",
          skill,
          difficulty: level > 3 ? "medium" : "easy",
          prompt: `${skill === "draw" ? "Draw" : "Type"} the character "${letter}"`,
          correct_answer: letter,
          time_limit_seconds: skill === "draw" ? 60 : 20,
        });
      }
    } else if (level <= 10) {
      // Short words
      const words = locale === "en" ? [
        "cat",
        "dog",
        "fish",
        "bird",
        "tree",
        "sun",
        "moon",
        "star",
        "apple",
        "ball",
      ] : locale === "hi" ? [
        "बिल्ली",
        "कुत्ता",
        "मछली",
        "पक्षी",
        "पेड़",
        "सूरज",
        "चाँद",
        "तारा",
        "सेब",
        "गेंद",
      ] : [
        "猫",
        "狗",
        "鱼",
        "鸟",
        "树",
        "太阳",
        "月亮",
        "星星",
        "苹果",
        "球",
      ];
      const sampleWords = words.slice(0, level - 4);
      for (const word of sampleWords) {
        questions.push({
          question_id: `writing-${level}-${word}`,
          type: "writing",
          skill,
          difficulty: "medium",
          prompt: `${skill === "draw" ? "Draw" : "Type"} the word/word-character "${word}"`,
          correct_answer: word,
          time_limit_seconds: skill === "draw" ? 90 : 30,
        });
      }
    } else {
      // Sentences
      const sentences = [
        "The cat is sleeping",
        "I like to play games",
        "The sun is bright",
      ];
      for (const sentence of sentences.slice(0, 3)) {
        questions.push({
          question_id: `writing-${level}-${sentence.replace(/ /g, "-")}`,
          type: "writing",
          skill,
          difficulty: "hard",
          prompt: `${skill === "draw" ? "Draw" : "Type"} this sentence: "${sentence}"`,
          correct_answer: sentence.toLowerCase(),
          time_limit_seconds: skill === "draw" ? 120 : 60,
        });
      }
    }

    return questions.slice(0, 5); // Return max 5 questions per level
  }
}

/* ==================== Reading Questions ==================== */

export class ReadingQuestionGenerator {
  /**
   * Generate reading comprehension questions
   * Level 1-5: Single letters recognition
   * Level 6-10: Short word reading
   * Level 11+: Sentence comprehension
   */
  static generateReadingQuestions(level: number, locale: "en" | "hi" | "zh" = "en"): ReadingQuestion[] {
    const questions: ReadingQuestion[] = [];

    if (level <= 5) {
      // Letter recognition (locale aware)
      const letters = locale === "en" ? "ABCDEFGHIJ".split("") : locale === "hi" ? ["अ","आ","इ","ई","उ","ए","ओ","क","ख","ग"] : ["你","我","他","是","不","了","在","有","这","那"];
      const selectedLetters = letters.slice(0, Math.min(5, level + 2));

      for (let i = 0; i < selectedLetters.length; i++) {
        const targetLetter = selectedLetters[i];
        const options = this.generateLetterOptions(targetLetter, locale);

        questions.push({
          question_id: `reading-${locale}-${level}-letter-${i}`,
          type: "reading",
          difficulty: level > 3 ? "medium" : "easy",
          text: `Which character is "${targetLetter}"?`,
          question: `Look at the characters below. Find "${targetLetter}"`,
          options,
          correct_answer_index: options.indexOf(targetLetter),
          time_limit_seconds: 15,
        });
      }
    } else if (level <= 10) {
      // Word reading
      const words = [
        "cat",
        "dog",
        "fish",
        "bird",
        "tree",
        "sun",
        "moon",
        "star",
        "apple",
        "ball",
      ];
      const selectedWords = words.slice(0, 5);

      for (let i = 0; i < selectedWords.length; i++) {
        const targetWord = selectedWords[i];
        const options = this.generateWordOptions(targetWord);

        questions.push({
          question_id: `reading-${level}-word-${i}`,
          type: "reading",
          difficulty: "medium",
          text: `Read: ${targetWord}`,
          question: `Which word says "${targetWord}"?`,
          options,
          correct_answer_index: options.indexOf(targetWord),
          time_limit_seconds: 20,
        });
      }
    } else {
      // Sentence comprehension
      const passages = [
        {
          text: "A cat is playing with a ball. It is very happy.",
          question: "What is the cat playing with?",
          options: ["a toy", "a ball", "a dog", "a rope"],
          correctIndex: 1,
        },
        {
          text: "The sun is bright and warm. It helps plants grow.",
          question: "What does the sun help?",
          options: ["animals", "rocks", "plants", "water"],
          correctIndex: 2,
        },
      ];

      for (let i = 0; i < passages.length; i++) {
        const passage = passages[i];
        questions.push({
          question_id: `reading-${level}-sentence-${i}`,
          type: "reading",
          difficulty: "hard",
          text: passage.text,
          question: passage.question,
          options: passage.options,
          correct_answer_index: passage.correctIndex,
          time_limit_seconds: 30,
        });
      }
    }

    return questions.slice(0, 5);
  }

  private static generateLetterOptions(target: string, locale: "en" | "hi" | "zh" = "en"): string[] {
    const alphabet = locale === "en" ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("") : locale === "hi" ? ["अ","आ","इ","ई","उ","ए","ओ","क","ख","ग","घ","च"] : ["你","我","他","是","不","了","在","有","这","那","他","她"];
    const options = [target];

    while (options.length < 4) {
      const random = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!options.includes(random)) {
        options.push(random);
      }
    }

    return this.shuffle(options);
  }

  private static generateWordOptions(target: string): string[] {
    const words = [
      "cat",
      "dog",
      "fish",
      "bird",
      "tree",
      "sun",
      "moon",
      "star",
      "apple",
      "ball",
      "box",
      "hat",
      "mat",
      "rat",
    ];
    const options = [target];

    while (options.length < 4) {
      const random = words[Math.floor(Math.random() * words.length)];
      if (!options.includes(random)) {
        options.push(random);
      }
    }

    return this.shuffle(options);
  }

  private static shuffle(array: string[]): string[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

/* ==================== Listening Questions ==================== */

export class ListeningQuestionGenerator {
  /**
   * Generate listening comprehension questions
   * Uses text-to-speech for pronunciation
   */
  static generateListeningQuestions(level: number, locale: "en" | "hi" | "zh" = "en"): ListeningQuestion[] {
    const questions: ListeningQuestion[] = [];

    if (level <= 5) {
      // Letter pronunciation
      const letters = "ABCDEFGHIJ".split("");
      for (let i = 0; i < Math.min(5, letters.length); i++) {
        const letter = letters[i];
        questions.push({
          question_id: `listening-${locale}-${level}-letter-${i}`,
          type: "listening",
          difficulty: "easy",
          audio_url: ``, // Will be generated via TTS at runtime
          question: `Listen to the sound. Which did you hear?`,
          options: this.generateLetterOptions(letter, locale),
          correct_answer_index: 0, // Will set dynamically
          time_limit_seconds: 10,
        });
      }
    } else if (level <= 10) {
      // Word pronunciation
      const words = [
        "apple",
        "banana",
        "cat",
        "dog",
        "elephant",
        "fish",
        "grapes",
        "house",
      ];
      for (let i = 0; i < Math.min(5, words.length); i++) {
        const word = words[i];
        questions.push({
          question_id: `listening-${locale}-${level}-word-${i}`,
          type: "listening",
          difficulty: "medium",
          audio_url: ``,
          question: `Listen and choose. Which word/character did you hear?`,
          options: this.generateWordOptions(word),
          correct_answer_index: 0,
          time_limit_seconds: 15,
        });
      }
    } else {
      // Sentence comprehension through listening
      const sentences = [
        {
          text: "The dog can run very fast",
          options: ["The cat runs", "The dog runs", "The bird runs"],
        },
        {
          text: "I like to eat red apples",
          options: ["I like green apples", "I like red apples", "I like oranges"],
        },
      ];

      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        questions.push({
          question_id: `listening-${level}-sentence-${i}`,
          type: "listening",
          difficulty: "hard",
          audio_url: ``,
          question: sentence.text,
          options: sentence.options,
          correct_answer_index: 1,
          time_limit_seconds: 20,
        });
      }
    }

    return questions.slice(0, 5);
  }

  private static generateLetterOptions(target: string, locale: "en" | "hi" | "zh" = "en"): string[] {
    const alphabet =
      locale === "en"
        ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
        : locale === "hi"
        ? ["अ", "आ", "इ", "ई", "उ", "ए", "ओ", "क", "ख", "ग", "घ", "च"]
        : ["你", "我", "他", "是", "不", "了", "在", "有", "这", "那", "他", "她"];
    const options = [target];

    while (options.length < 4) {
      const random = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!options.includes(random)) {
        options.push(random);
      }
    }

    return this.shuffle(options);
  }

  private static generateWordOptions(target: string): string[] {
    const words = [
      "apple",
      "banana",
      "cat",
      "dog",
      "elephant",
      "fish",
      "grapes",
      "house",
      "ice",
      "jacket",
      "kite",
      "lion",
    ];
    const options = [target];

    while (options.length < 4) {
      const random = words[Math.floor(Math.random() * words.length)];
      if (!options.includes(random)) {
        options.push(random);
      }
    }

    return this.shuffle(options);
  }

  private static shuffle(array: string[]): string[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

/* ==================== Language Level Generator ==================== */

export class LanguageLevelGenerator {
  /**
   * Generate complete language level with all three skills
   */
  static generateLevel(
    level: number,
    locale: "en" | "hi" | "zh" = "en"
  ): (WritingQuestion | ReadingQuestion | ListeningQuestion)[] {
    const questions: (WritingQuestion | ReadingQuestion | ListeningQuestion)[] =
      [];

    // 2 writing questions
    const writingQuestions = WritingQuestionGenerator.generateWritingQuestions(
      level,
      level % 2 === 0 ? "draw" : "type",
      locale
    );
    questions.push(...writingQuestions.slice(0, 2));

    // 2 reading questions
    const readingQuestions =
      ReadingQuestionGenerator.generateReadingQuestions(level, locale);
    questions.push(...readingQuestions.slice(0, 2));

    // 1 listening question
    const listeningQuestions =
      ListeningQuestionGenerator.generateListeningQuestions(level, locale);
    questions.push(...listeningQuestions.slice(0, 1));

    return questions;
  }
}
