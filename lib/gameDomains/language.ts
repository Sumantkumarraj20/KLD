/**
 * Language Learning Domain Module - Enhanced for 50 Levels
 * Includes: Writing (Draw & Type), Reading, Listening & Comprehension
 * Evidence-based progression following Reading Recovery & Fountas & Pinnell
 */

import {
  WritingQuestion,
  ReadingQuestion,
  ListeningQuestion,
  Question,
} from "../gameTypes";

// Comprehensive content for all 50 levels
const LanguageContent = {
  // Phase 1: Phonemic Awareness (Levels 1-5)
  phase1: {
    1: { letters: ["a", "e", "i", "o", "u"], title: "Vowels" },
    2: { letters: ["b", "c", "d", "f", "g"], title: "Beginning Consonants" },
    3: { letters: ["h", "j", "k", "l", "m"], title: "More Consonants" },
    4: { letters: ["n", "p", "q", "r", "s"], title: "Ending Consonants" },
    5: { letters: ["t", "v", "w", "x", "y", "z"], title: "Alphabet Complete" },
  },
  // Phase 2: CVC Words (Levels 6-15)
  phase2CVC: {
    shortA: ["cat", "bat", "hat", "mat", "rat", "sat", "fat", "pat", "tan", "can", "fan", "man", "pan", "van", "ran"],
    shortE: ["bed", "red", "fed", "led", "pet", "wet", "net", "set", "get", "bet", "let", "ten", "hen", "pen", "den"],
    shortI: ["big", "dig", "fig", "pig", "rig", "bit", "fit", "hit", "kit", "sit", "wit", "bin", "fin", "pin", "tin"],
    shortO: ["box", "cot", "dot", "got", "hot", "lot", "pot", "rot", "cod", "god", "nod", "pod", "sod", "bog", "cog", "dog", "fog", "hog", "jog", "log"],
    shortU: ["bug", "hug", "jug", "mug", "rug", "tug", "bud", "cud", "dud", "mud", "bus", "gus", "pus", "bun", "fun", "gun", "run", "sun"],
  },
  // Phase 3: Sight Words & Simple Sentences (Levels 16-30)
  sightWords: [
    "the", "a", "and", "to", "of", "in", "is", "was", "it", "he", "she", "for", "you", "are", "that", "be", "with", "have", "this", "will", "not", "do", "can", "all", "on", "we", "as", "by", "from", "they", "go", "no", "me", "my", "them", "who", "which", "what", "when", "where", "why", "how", "so", "up", "out", "if", "about", "one", "two", "three", "or",
  ],
  simpleStories: [
    { text: "The cat is sleeping.", comprehension: "What is the cat doing?" },
    { text: "A dog can run fast.", comprehension: "What animal is running?" },
    { text: "I like to play games.", comprehension: "What does the child like?" },
    { text: "The sun is bright and warm.", comprehension: "How is the sun?" },
    { text: "Birds can fly in the sky.", comprehension: "What can birds do?" },
  ],
  // Phase 4: Advanced Reading (Levels 31-40)
  advancedContent: {
    adjectives: ["happy", "sad", "big", "small", "fast", "slow", "hot", "cold", "bright", "dark", "clean", "dirty", "smart", "silly", "kind", "mean"],
    stories: [
      "Once upon a time, there lived a little red fox. The fox was very clever. One day, the fox found a beautiful apple tree. The tree had many red apples. The fox was happy to find such good fruit.",
      "A young girl named Emma had a special dream. She wanted to become a teacher. Emma studied very hard every day. She read many books. She practiced writing and math. One day, Emma's teacher told her: 'You are a great student. I believe you will be an excellent teacher one day.' Emma felt so proud.",
    ],
  },
};

/* ==================== Writing Questions ==================== */

export class WritingQuestionGenerator {
  /**
   * Generate writing practice questions (draw and type)
   * Comprehensive 50-level progression
   */
  static generateWritingQuestions(
    level: number,
    skill: "draw" | "type",
    locale: "en" | "hi" | "zh" = "en"
  ): WritingQuestion[] {
    const questions: WritingQuestion[] = [];

    // Levels 1-5: Individual letters/characters
    if (level <= 5) {
      const letters = this.getLettersForLevel(level, locale);
      for (let i = 0; i < Math.min(5, letters.length); i++) {
        const letter = letters[i];
        questions.push({
          question_id: `writing-${locale}-${level}-${i}`,
          type: "writing",
          skill,
          difficulty: level >3 ? "medium" : "easy",
          prompt: `${skill === "draw" ? "Draw" : "Type"} the letter: "${letter}"`,
          correct_answer: letter,
          time_limit_seconds: skill === "draw" ? 45 : 15,
        });
      }
    }
    // Levels 6-15: CVC and simple words
    else if (level <= 15) {
      const wordBank = this.getWordsForLevel(level, locale);
      const selected = wordBank.slice(0, 5);
      for (const word of selected) {
        questions.push({
          question_id: `writing-${level}-${word}`,
          type: "writing",
          skill,
          difficulty: "medium",
          prompt: `${skill === "draw" ? "Draw and label" : "Type"} the word: "${word}"`,
          correct_answer: word,
          time_limit_seconds: skill === "draw" ? 60 : 25,
        });
      }
    }
    // Levels 16-30: Sight words and simple sentences
    else if (level <= 30) {
      const sight = LanguageContent.sightWords[(level - 16) * 5];
      questions.push({
        question_id: `writing-${level}-sight`,
        type: "writing",
        skill,
        difficulty: "medium",
        prompt: `${skill === "draw" ? "Write" : "Type"} the word: "${sight}"`,
        correct_answer: sight,
        time_limit_seconds: skill === "draw" ? 60 : 20,
      });
      // Add simple sentence
      const sentence = `The ${sight} is here.`;
      questions.push({
        question_id: `writing-${level}-sentence`,
        type: "writing",
        skill,
        difficulty: "hard",
        prompt: `${skill === "draw" ? "Write" : "Type"} this sentence: "${sentence}"`,
        correct_answer: sentence.toLowerCase(),
        time_limit_seconds: skill === "draw" ? 90 : 45,
      });
    }
    // Levels 31-50: Complex sentences and paragraphs
    else {
      const story = LanguageContent.advancedContent.stories[(level - 31) % 2];
      const excerpt = story.substring(0, 100);
      questions.push({
        question_id: `writing-${level}-paragraph`,
        type: "writing",
        skill,
        difficulty: "hard",
        prompt: `Write about what you learned from this story: "${excerpt}..."`,
        correct_answer: "brief response expected",
        time_limit_seconds: 120,
      });
    }

    return questions.slice(0, 5);
  }

  private static getLettersForLevel(level: number, locale: "en" | "hi" | "zh"): string[] {
    if (locale === "en") {
      const allLetters = "abcdefghijklmnopqrstuvwxyz".split("");
      const startIdx = (level - 1) * 5;
      return allLetters.slice(startIdx, startIdx + 5);
    } else if (locale === "hi") {
      return ["अ", "आ", "इ", "ई", "उ", "ए", "ओ", "क", "ख", "ग"].slice(0, level + 1);
    } else {
      return ["你", "我", "他", "是", "不", "了", "在", "有", "这", "那"].slice(0, level + 1);
    }
  }

  private static getWordsForLevel(level: number, locale: "en" | "hi" | "zh"): string[] {
    const levelRange = level - 5;
    if (levelRange <= 5) {
      return LanguageContent.phase2CVC.shortA.slice(0, 5);
    } else if (levelRange <= 10) {
      return LanguageContent.phase2CVC.shortE.slice(0, 5);
    } else {
      return LanguageContent.phase2CVC.shortI.slice(0, 5);
    }
  }
}

/* ==================== Reading Questions ==================== */

export class ReadingQuestionGenerator {
  /**
   * Generate reading comprehension questions
   * Comprehensive 50-level progression
   */
  static generateReadingQuestions(level: number, locale: "en" | "hi" | "zh" = "en"): ReadingQuestion[] {
    const questions: ReadingQuestion[] = [];

    // Levels 1-5: Letter recognition
    if (level <= 5) {
      const allLetters = locale === "en" ? "abcdefghijklmnopqrstuvwxyz".split("") : locale === "hi" ? ["अ","आ","इ","ई","उ","ए","ओ","क","ख","ग","घ","च"] : ["你","我","他","是","不","了","在","有","这","那","别","和"];
      const startIdx = (level - 1) * 5;
      const selectedLetters = allLetters.slice(startIdx, Math.min(startIdx + 5, allLetters.length));

      for (let i = 0; i < Math.min(5, selectedLetters.length); i++) {
        const targetLetter = selectedLetters[i];
        const options = this.generateLetterOptions(targetLetter, locale);

        questions.push({
          question_id: `reading-${locale}-${level}-letter-${i}`,
          type: "reading",
          difficulty: level > 3 ? "medium" : "easy",
          text: `Which character is "${targetLetter}"?`,
          question: `Look carefully. Find the letter "${targetLetter}"`,
          options,
          correct_answer_index: options.indexOf(targetLetter),
          time_limit_seconds: 12,
        });
      }
    }
    // Levels 6-15: Word reading
    else if (level <= 15) {
      const wordBank = this.getReadingWordsForLevel(level);
      const selectedWords = wordBank.slice(0, 5);

      for (let i = 0; i < selectedWords.length; i++) {
        const targetWord = selectedWords[i];
        const options = this.generateWordOptions(targetWord);

        questions.push({
          question_id: `reading-${level}-word-${i}`,
          type: "reading",
          difficulty: "medium",
          text: `Read the word and find it again`,
          question: `Which word says "${targetWord}"?`,
          options,
          correct_answer_index: options.indexOf(targetWord),
          time_limit_seconds: 18,
        });
      }
    }
    // Levels 16-30: Simple sentence comprehension
    else if (level <= 30) {
      const readingPassages = [
        { text: "The cat sat on the mat.", question: "Where did the cat sit?", options: ["on a bed", "on the mat", "on a chair", "on a box"], answer: 1 },
        { text: "Dogs like to play and run.", question: "What do dogs like to do?", options: ["sit", "play and run", "sleep", "eat"], answer: 1 },
        { text: "The sun is hot and bright.", question: "How is the sun?", options: ["cold", "small", "hot and bright", "dark"], answer: 2 },
        { text: "Birds can fly high in the sky.", question: "What can birds do?", options: ["swim", "run", "fly in the sky", "climb"], answer: 2 },
        { text: "I like apples. They are red and sweet.", question: "What color are the apples?", options: ["green", "yellow", "red", "blue"], answer: 2 },
      ];

      const passage = readingPassages[(level - 16) % readingPassages.length];
      questions.push({
        question_id: `reading-${level}-passage`,
        type: "reading",
        difficulty: "medium",
        text: passage.text,
        question: passage.question,
        options: passage.options,
        correct_answer_index: passage.answer,
        time_limit_seconds: 25,
      });
    }
    // Levels 31-50: Complex comprehension
    else {
      const complexPassages = [
        {
          text: "Emma loves to read books. She goes to the library every week. Her favorite books are about animals and adventures. Emma wants to be a writer one day.",
          question: "Where does Emma go to find books?",
          options: ["school", "library", "home", "park"],
          answer: 1,
        },
        {
          text: "Yesterday, I went to the park with my family. We played games and had a picnic. My sister climbed the big tree. We had so much fun!",
          question: "What did the family do at the park?",
          options: ["watched TV", "played games", "studied", "slept"],
          answer: 1,
        },
        {
          text: "Bees are very important insects. They fly from flower to flower. Bees collect pollen and make honey. Honey is sweet and healthy.",
          question: "Why are bees important?",
          options: ["they are big", "they collect pollen", "they can fly", "they sleep"],
          answer: 1,
        },
      ];

      const passage = complexPassages[(level - 31) % complexPassages.length];
      questions.push({
        question_id: `reading-${level}-complex`,
        type: "reading",
        difficulty: "hard",
        text: passage.text,
        question: passage.question,
        options: passage.options,
        correct_answer_index: passage.answer,
        time_limit_seconds: 35,
      });
    }

    return questions.slice(0, 5);
  }

  private static getReadingWordsForLevel(level: number): string[] {
    const levelRange = level - 5;
    if (levelRange <= 3) {
      return LanguageContent.phase2CVC.shortA;
    } else if (levelRange <= 6) {
      return LanguageContent.phase2CVC.shortE;
    } else if (levelRange <= 9) {
      return LanguageContent.phase2CVC.shortI;
    } else {
      return LanguageContent.phase2CVC.shortO;
    }
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
   * Comprehensive 50-level progression
   */
  static generateListeningQuestions(level: number, locale: "en" | "hi" | "zh" = "en"): ListeningQuestion[] {
    const questions: ListeningQuestion[] = [];

    // Levels 1-5: Letter/character sounds
    if (level <= 5) {
      const allLetters = locale === "en" ? "abcdefghijklmnopqrstuvwxyz".split("") : locale === "hi" ? ["अ","आ","इ","ई","उ","ए","ओ","क","ख","ग"] : ["你","我","他","是","不","了","在","有","这","那"];
      const startIdx = (level - 1) * 5;
      const selectedLetters = allLetters.slice(startIdx, Math.min(startIdx + 5, allLetters.length));

      for (let i = 0; i < Math.min(5, selectedLetters.length); i++) {
        const targetLetter = selectedLetters[i];
        const options = this.generateLetterOptions(targetLetter, locale);
        const correctIndex = options.indexOf(targetLetter);

        questions.push({
          question_id: `listening-${locale}-${level}-${i}`,
          type: "listening",
          difficulty: level > 3 ? "medium" : "easy",
          audio_url: ``,
          question: `Listen to the sound. Which letter/character did you hear?`,
          options,
          correct_answer_index: correctIndex,
          time_limit_seconds: 10,
        });
      }
    }
    // Levels 6-15: Word pronunciation
    else if (level <= 15) {
      const wordBank = this.getListeningWordsForLevel(level);
      const selectedWords = wordBank.slice(0, 5);

      for (let i = 0; i < selectedWords.length; i++) {
        const targetWord = selectedWords[i];
        const options = this.generateWordOptions(targetWord);
        const correctIndex = options.indexOf(targetWord);

        questions.push({
          question_id: `listening-${level}-word-${i}`,
          type: "listening",
          difficulty: "medium",
          audio_url: ``,
          question: `Listen carefully. Which word did you hear?`,
          options,
          correct_answer_index: correctIndex,
          time_limit_seconds: 15,
        });
      }
    }
    // Levels 16-50: Sentence and comprehension listening
    else {
      const listeningPassages = [
        { audio: "A cat is sleeping on the mat", question: "Where is the cat?", options: ["on a bed", "on the mat", "under a table"], answer: 1 },
        { audio: "The dog can run very fast", question: "What can the dog do?", options: ["jump", "run fast", "fly"], answer: 1 },
        { audio: "I like to eat apples", question: "What does he like to eat?", options: ["oranges", "apples", "bananas"], answer: 1 },
        { audio: "The bird is flying in the sky", question: "Where is the bird?", options: ["in a tree", "in the sky", "on ground"], answer: 1 },
        { audio: "Emma has a red pencil and a blue pen", question: "What color is the pencil?", options: ["blue", "red", "green"], answer: 1 },
      ];

      const passage = listeningPassages[(level - 16) % listeningPassages.length];

      questions.push({
        question_id: `listening-${level}-sentence`,
        type: "listening",
        difficulty: level > 40 ? "hard" : "medium",
        audio_url: ``,
        question: passage.question,
        options: passage.options,
        correct_answer_index: passage.answer,
        time_limit_seconds: level > 30 ? 25 : 20,
      });
    }

    return questions.slice(0, 5);
  }

  private static getListeningWordsForLevel(level: number): string[] {
    const levelRange = level - 5;
    if (levelRange <= 3) {
      return LanguageContent.phase2CVC.shortA;
    } else if (levelRange <= 6) {
      return LanguageContent.phase2CVC.shortE;
    } else if (levelRange <= 9) {
      return LanguageContent.phase2CVC.shortI;
    } else {
      return LanguageContent.phase2CVC.shortO;
    }
  }

  private static generateLetterOptions(target: string, locale: "en" | "hi" | "zh" = "en"): string[] {
    const alphabet = locale === "en" ? "abcdefghijklmnopqrstuvwxyz".split("") : locale === "hi" ? ["अ","आ","इ","ई","उ","ए","ओ","क","ख","ग","घ","च","छ","ज","झ","ञ"] : ["你","我","他","是","不","了","在","有","这","那","别","和","也","会","有","了"];
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
    const words = ["cat", "dog", "fish", "bird", "tree", "sun", "moon", "star", "apple", "ball", "run", "jump", "sit", "play", "eat", "sleep"];
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
