"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useGame } from "@/lib/useGame";
import { QuestionCard } from "@/components/QuestionCard";
import { GameResult, LevelProgress } from "@/components/GameResult";
import { DomainSelector, LevelSelector, QuickStats } from "@/components/GameSelector";
import { GameDomain } from "@/lib/gameTypes";
import { ArrowLeft, Loader } from "lucide-react";

interface Kid {
  kid_id: string;
  name: string;
  balance: number;
  emoji: string;
}

export default function GamePage() {
  const [kids, setKids] = useState<Kid[]>([]);
  const [kid, setKid] = useState<Kid | null>(null);
  const [showKidSelector, setShowKidSelector] = useState(false);
  const [gamePhase, setGamePhase] = useState<"domain" | "level" | "playing" | "result">("domain");
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<"en" | "hi" | "zh">("en");

  const gameState = useGame(kid?.kid_id || "");

  // Load kids from API on mount
  useEffect(() => {
    loadKids();
  }, []);

  // Listen for global kid changes (from Header/ProfileSwitcher)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Kid | undefined;
      if (detail) setKid(detail);
    };
    window.addEventListener("kidChanged", handler as EventListener);
    return () => window.removeEventListener("kidChanged", handler as EventListener);
  }, []);

  // Auto-start if URL query contains domain/level/lang
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qDomain = params.get("domain") as GameDomain | null;
      const qLevel = params.get("level");
      const qLang = params.get("lang");

      if (qLang === "hi" || qLang === "zh") setLocale(qLang as "hi" | "zh");

      if (qDomain && qLevel && kid) {
        const lvl = parseInt(qLevel, 10);
        if (!isNaN(lvl)) {
          // start the game with optional locale
          gameState.startGame(qDomain, lvl, { locale: locale });
          setGamePhase("playing");
        }
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kid]);

  const loadKids = async () => {
    try {
      const kidsData = await api.getKids();
      setKids(kidsData as Kid[] || []);

      // Check if a kid is already logged in
      const loggedInUser = auth.getUser();
      if (loggedInUser && loggedInUser.role === 'kid') {
        const loggedKid = (kidsData as Kid[]).find(
          (k: Kid) => k.kid_id === loggedInUser.id
        );
        if (loggedKid) {
          setKid(loggedKid);
          setShowKidSelector(false);
        } else {
          // Logged in kid not found in API, show selector
          setShowKidSelector(true);
        }
      } else {
        // No kid logged in, show selector
        setShowKidSelector(true);
      }
    } catch (e) {
      console.error("Failed to load kids", e);
    } finally {
      setLoading(false);
    }
  };

  const selectKid = (selectedKid: Kid) => {
    auth.loginAsKid(selectedKid);
    setKid(selectedKid);
    setShowKidSelector(false);
  };

  const handleSwitchKid = () => {
    setShowKidSelector(true);
  };

  const handleSelectDomain = (domain: GameDomain) => {
    setGamePhase("level");
  };

  const handleSelectLevel = (level: number) => {
    if (gameState.currentLevel) {
      gameState.startGame(gameState.currentLevel, level, { locale });
      setGamePhase("playing");
    }
  };

  const handleAnswer = (answer: string | number) => {
    gameState.submitAnswer(answer);
  };

  const handleCompleteGame = () => {
    gameState.completeGame();
    setGamePhase("result");
  };

  const handleNextLevel = () => {
    const nextLevel = gameState.currentLevelNumber + 1;
    if (gameState.currentLevel) {
      gameState.startGame(gameState.currentLevel, nextLevel);
      setGamePhase("playing");
    }
  };

  const handleRetry = () => {
    if (gameState.currentLevel) {
      gameState.startGame(gameState.currentLevel, gameState.currentLevelNumber);
      setGamePhase("playing");
    }
  };

  const handleBackToDomain = () => {
    gameState.resetGame();
    setGamePhase("domain");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Show kid selector if no kid selected
  if (showKidSelector || !kid) {
    return (
      <>
        <Head>
          <title>Select Kid - Learning Games</title>
          <meta name="description" content="Select a kid to play learning games" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          {/* Header */}
          <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-neutral-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <Link
                  href="/kids"
                  className="inline-flex items-center gap-2 px-4 py-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-sm font-medium">Back to Dashboard</span>
                </Link>
                <h1 className="text-2xl font-bold text-neutral-800">Select a Kid</h1>
                <div className="w-24"></div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kids.map((k) => (
                <button
                  key={k.kid_id}
                  onClick={() => selectKid(k)}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity" />
                  <div className="p-8 text-center">
                    <div className="text-6xl mb-4">{k.emoji}</div>
                    <h3 className="text-2xl font-bold text-neutral-800 mb-2">{k.name}</h3>
                    <p className="text-lg text-amber-600 font-semibold">{k.balance} Points</p>
                  </div>
                </button>
              ))}
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{kid.name} - Learning Games</title>
        <meta name="description" content="Gamified learning for kids" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Error Message */}
          {gameState.error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
              {gameState.error}
            </div>
          )}

          {/* Loading State */}
          {gameState.isLoading && <LoadingScreen />}

          {/* Phase: Domain Selection */}
          {gamePhase === "domain" && !gameState.isLoading && (
            <div className="space-y-8">
              <QuickStats
                kidName={kid.name}
                totalStars={gameState.totalStars.language + gameState.totalStars.mathematics + gameState.totalStars.logical}
                levelsCompleted={{
                  language: gameState.maxLevelCompleted.language,
                  mathematics: gameState.maxLevelCompleted.mathematics,
                  logical: gameState.maxLevelCompleted.logical,
                }}
                totalPoints={kid.balance}
              />

              <div>
                <h2 className="text-3xl font-bold text-neutral-800 mb-6">
                  Choose a Learning Domain
                </h2>
                <DomainSelector
                  selectedDomain={gameState.currentLevel}
                  onSelectDomain={(domain) => {
                    gameState.currentLevel !== domain && setGamePhase("level");
                    if (domain !== gameState.currentLevel) {
                      setGamePhase("level");
                    }
                  }}
                  domainProgress={gameState.maxLevelCompleted}
                  kidId={kid.kid_id}
                />
              </div>

              {/* Quick Info */}
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-8 text-center">
                <h3 className="text-xl font-bold text-neutral-800 mb-3">
                  How to Unlock New Levels
                </h3>
                <p className="text-neutral-700 max-w-2xl mx-auto">
                  Complete each level and earn at least 3 stars ⭐⭐⭐ to unlock the next challenge!
                  More stars = More points!
                </p>
              </div>
            </div>
          )}

          {/* Phase: Level Selection */}
          {gamePhase === "level" && gameState.currentLevel && !gameState.isLoading && (
            <div className="space-y-8">
              <button
                onClick={handleBackToDomain}
                className="inline-flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Domains
              </button>

              <div>
                <h2 className="text-3xl font-bold text-neutral-800 mb-6">
                  Choose Your Level
                </h2>
                <LevelSelector
                  currentDomain={gameState.currentLevel}
                  maxLevelCompleted={gameState.maxLevelCompleted[gameState.currentLevel]}
                  starsPerLevel={gameState.starsPerLevel}
                  onSelectLevel={handleSelectLevel}
                  isLoading={gameState.isLoading}
                />
              </div>

              {/* Progress Card */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <LevelProgress
                  currentLevel={gameState.maxLevelCompleted[gameState.currentLevel]}
                  maxLevel={50}
                  starsPerLevel={gameState.starsPerLevel}
                />
              </div>
            </div>
          )}

          {/* Phase: Playing Game */}
          {gamePhase === "playing" &&
            gameState.currentLevel &&
            gameState.questions.length > 0 &&
            gameState.currentQuestionIndex < gameState.questions.length && (
              <div className="space-y-8">
                {/* Progress */}
                <div className="flex justify-between items-center mb-8">
                  <button
                    onClick={handleBackToDomain}
                    className="inline-flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-neutral-800">
                      {gameState.currentLevel === "language"
                        ? "📚 Language"
                        : gameState.currentLevel === "mathematics"
                          ? "🔢 Mathematics"
                          : "🧩 Logic"}{" "}
                      Level {gameState.currentLevelNumber}
                    </h2>
                  </div>

                  <div className="text-right text-sm text-neutral-600">
                    Score: {gameState.session?.score || 0}
                  </div>
                </div>

                {/* Question */}
                <QuestionCard
                  question={gameState.questions[gameState.currentQuestionIndex]}
                  index={gameState.currentQuestionIndex}
                  totalQuestions={gameState.questions.length}
                  onAnswer={handleAnswer}
                  timeLimit={gameState.questions[gameState.currentQuestionIndex].time_limit_seconds}
                  onTimeUp={() => {
                    // Auto-submit empty answer on time up
                    handleAnswer("");
                  }}
                  isAnswered={(gameState.session?.answers.length ?? 0) > gameState.currentQuestionIndex}
                />

                {/* Next Button */}
                {(gameState.session?.answers.length ?? 0) > gameState.currentQuestionIndex && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        if (gameState.currentQuestionIndex === gameState.questions.length - 1) {
                          handleCompleteGame();
                        } else {
                          gameState.nextQuestion();
                        }
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                    >
                      {gameState.currentQuestionIndex === gameState.questions.length - 1
                        ? "Finish Level"
                        : "Next Question"}
                    </button>
                  </div>
                )}
              </div>
            )}

          {/* Phase: Results */}
          {gamePhase === "result" && gameState.result && (
            <div className="space-y-8">
              <GameResult
                result={gameState.result}
                onNextLevel={handleNextLevel}
                onRetry={handleRetry}
                kidName={kid.name}
              />

              <div className="text-center">
                <button
                  onClick={handleBackToDomain}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-600 hover:bg-neutral-700 text-white font-bold rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to Domains
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

/**
 * Loading Screen Component
 */
function LoadingScreen() {
  return (
    <div className="min-h-96 flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600" />
      <p className="text-lg text-neutral-600">Loading your game...</p>
    </div>
  );
}
