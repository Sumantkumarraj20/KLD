/**
 * useGame Hook
 * Manages game state, scoring, and level progression
 */

import { useState, useCallback, useEffect } from "react";
import {
  GameDomain,
  GameSession,
  GameSessionResult,
  Question,
  GameAnswer,
} from "@/lib/gameTypes";
import {
  GameLevelGenerator,
  GameSessionManager,
  ProgressTracker,
} from "@/lib/gameEngine";
import { gameAPI } from "@/lib/gameAPI";

export interface UseGameState {
  // Current game state
  currentLevel: GameDomain | null;
  currentLevelNumber: number;
  questions: Question[];
  currentQuestionIndex: number;
  session: GameSession | null;
  result: GameSessionResult | null;

  // Progress tracking
  maxLevelCompleted: Record<GameDomain, number>;
  totalStars: Record<GameDomain, number>;
  starsPerLevel: Record<number, number>;

  // Actions
  startGame: (domain: GameDomain, levelNumber: number, options?: { locale?: "en" | "hi" | "zh" }) => void;
  submitAnswer: (answer: string | number) => void;
  completeGame: () => void;
  nextQuestion: () => void;
  retryLevel: () => void;
  resetGame: () => void;

  // Utility
  isLoading: boolean;
  error: string | null;
}

export function useGame(kidId: string): UseGameState {
  const [currentLevel, setCurrentLevel] = useState<GameDomain | null>(null);
  const [currentLevelNumber, setCurrentLevelNumber] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [session, setSession] = useState<GameSession | null>(null);
  const [result, setResult] = useState<GameSessionResult | null>(null);

  const [maxLevelCompleted, setMaxLevelCompleted] = useState<Record<GameDomain, number>>({
    language: 1,
    mathematics: 1,
    logical: 1,
  });

  const [totalStars, setTotalStars] = useState<Record<GameDomain, number>>({
    language: 0,
    mathematics: 0,
    logical: 0,
  });

  const [starsPerLevel, setStarsPerLevel] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize game progress on mount
  useEffect(() => {
    loadGameProgress();
  }, [kidId]);

  const loadGameProgress = async () => {
    try {
      setIsLoading(true);
      const progress = await gameAPI.getKidGameProgress(kidId);

      setMaxLevelCompleted({
        language: progress.language_level,
        mathematics: progress.mathematics_level,
        logical: progress.logical_level,
      });

      // Update total stars from sessions
      const languageStars = gameAPI.getDomainStars(kidId, "language");
      const mathStars = gameAPI.getDomainStars(kidId, "mathematics");
      const logicalStars = gameAPI.getDomainStars(kidId, "logical");

      setTotalStars({
        language: languageStars,
        mathematics: mathStars,
        logical: logicalStars,
      });

      // Build stars per level map
      const sessions = gameAPI.getKidSessions(kidId);
      const starsMap: Record<number, number> = {};

      sessions.forEach((award) => {
        starsMap[award.level_number] = Math.max(
          starsMap[award.level_number] || 0,
          award.stars_earned
        );
      });

      setStarsPerLevel(starsMap);
    } catch (err) {
      console.error("Failed to load game progress:", err);
      setError("Failed to load your progress");
    } finally {
      setIsLoading(false);
    }
  };

  const startGame = useCallback(
    (domain: GameDomain, levelNumber: number, options?: { locale?: "en" | "hi" | "zh" }) => {
      try {
        setError(null);
        setIsLoading(true);

        // Check if level is unlocked
        if (!gameAPI.isLevelUnlocked(kidId, domain, levelNumber)) {
          setError("This level is not unlocked yet. Complete the previous level!");
          setIsLoading(false);
          return;
        }

        // Generate level
        const levelData = GameLevelGenerator.generateLevel(domain, levelNumber, options);
        const generatedQuestions = levelData.questions;

        // Create session
        const newSession = GameSessionManager.createSession(
          kidId,
          levelData.level_id,
          domain,
          levelNumber
        );

        setCurrentLevel(domain);
        setCurrentLevelNumber(levelNumber);
        setQuestions(generatedQuestions);
        setCurrentQuestionIndex(0);
        setSession(newSession);
        setResult(null);

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to start game:", err);
        setError("Failed to start game. Please try again.");
        setIsLoading(false);
      }
    },
    [kidId]
  );

  const submitAnswer = useCallback(
    (answer: string | number) => {
      if (!session || currentQuestionIndex >= questions.length) return;

      const question = questions[currentQuestionIndex];
      const isCorrect = checkAnswer(question, answer);

      const newAnswer: GameAnswer = {
        question_id: question.question_id,
        user_answer: answer,
        correct_answer: (question as any).correct_answer,
        is_correct: isCorrect,
        time_taken_seconds: question.time_limit_seconds, // Simplified for now
      };

      const updatedSession = GameSessionManager.recordAnswer(session, newAnswer);
      setSession(updatedSession);

      // Move to next question or finish
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        completeGameInternal(updatedSession);
      }
    },
    [session, currentQuestionIndex, questions]
  );

  const checkAnswer = (question: Question, answer: string | number): boolean => {
    const correctAnswer = (question as any).correct_answer;

    if (question.type === "math") {
      return answer === correctAnswer;
    } else if (["reading", "listening", "logical"].includes(question.type)) {
      return answer === (question as any).correct_answer_index;
    } else if (question.type === "writing") {
      // Normalize text comparison
      return String(answer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim();
    }

    return false;
  };

  const completeGameInternal = async (completedSession: GameSession) => {
    try {
      const totalTimeLimit = questions.reduce(
        (sum, q) => sum + q.time_limit_seconds,
        0
      );

      const gameResult = GameSessionManager.calculateResult(
        GameSessionManager.completeSession(completedSession),
        totalTimeLimit
      );

      setResult(gameResult);

      // Save to API and update progress
      if (gameResult.stars_earned > 0) {
        await gameAPI.submitLevelCompletion(
          kidId,
          gameResult.domain,
          gameResult.level_number,
          gameResult.stars_earned,
          gameResult.points_awarded
        );

        // Reload progress
        await loadGameProgress();

        // Update local state
        const updatedStars = { ...starsPerLevel };
        updatedStars[gameResult.level_number] = gameResult.stars_earned;
        setStarsPerLevel(updatedStars);
      }
    } catch (err) {
      console.error("Failed to complete game:", err);
      setError("Failed to save your score");
    }
  };

  const completeGame = useCallback(() => {
    if (session) {
      completeGameInternal(session);
    }
  }, [session]);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const retryLevel = useCallback(() => {
    if (currentLevel) {
      startGame(currentLevel, currentLevelNumber);
    }
  }, [currentLevel, currentLevelNumber, startGame]);

  const resetGame = useCallback(() => {
    setCurrentLevel(null);
    setCurrentLevelNumber(1);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSession(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    currentLevel,
    currentLevelNumber,
    questions,
    currentQuestionIndex,
    session,
    result,
    maxLevelCompleted,
    totalStars,
    starsPerLevel,
    startGame,
    submitAnswer,
    completeGame,
    nextQuestion,
    retryLevel,
    resetGame,
    isLoading,
    error,
  };
}
