/**
 * GameResult Component
 * Displays game result, stars earned, and performance metrics
 */

import { Trophy, Star, Award, ArrowRight, RotateCcw } from "lucide-react";
import { GameSessionResult } from "@/lib/gameTypes";

interface GameResultProps {
  result: GameSessionResult;
  onNextLevel: () => void;
  onRetry: () => void;
  kidName: string;
}

export function GameResult({
  result,
  onNextLevel,
  onRetry,
  kidName,
}: GameResultProps) {
  const getResultColor = () => {
    if (result.stars_earned === 5) return "from-yellow-400 to-amber-500";
    if (result.stars_earned === 4) return "from-purple-400 to-purple-500";
    if (result.stars_earned === 3) return "from-blue-400 to-blue-500";
    if (result.stars_earned === 2) return "from-cyan-400 to-cyan-500";
    if (result.stars_earned === 1) return "from-gray-400 to-gray-500";
    return "from-red-400 to-red-500";
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Celebration animation background */}
      <div className="relative overflow-hidden">
        {/* Main Result Card */}
        <div
          className={`bg-gradient-to-r ${getResultColor()} rounded-2xl shadow-2xl p-8 text-center text-white mb-6`}
        >
          {/* Trophy Icon */}
          <div className="inline-block p-4 bg-white/20 rounded-full mb-4">
            <Trophy className="h-16 w-16" />
          </div>

          {/* Completion Message */}
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            {result.is_completed ? "🎉 Level Complete!" : "Keep Practicing!"}
          </h2>
          <p className="text-xl opacity-90 mb-6">
            Great job{kidName ? `, ${kidName}` : ""}! 🎊
          </p>

          {/* Stars Display */}
          <div className="flex justify-center gap-2 mb-8 text-5xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`${star <= result.stars_earned ? "block" : "opacity-30"} transition-all duration-300`}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* Feedback Message */}
          <p className="text-lg font-medium mb-4">{result.feedback}</p>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            label="Correct Answers"
            value={`${result.percentage}%`}
            icon="✅"
          />
          <MetricCard
            label="Points Earned"
            value={`${result.points_awarded}`}
            icon="🏆"
          />
          <MetricCard
            label="Time Taken"
            value={`${result.time_taken_seconds}s`}
            icon="⏱️"
          />
          <MetricCard
            label="Level"
            value={`${result.level_number}`}
            icon="📊"
          />
        </div>

        {/* Achievement Unlocked */}
        {result.stars_earned >= 5 && (
          <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 rounded-xl p-6 mb-6 text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <Award className="h-6 w-6 text-amber-600" />
              <span className="text-sm font-bold text-amber-700">
                ACHIEVEMENT UNLOCKED
              </span>
            </div>
            <p className="text-amber-900 font-semibold">
              Perfect Score! You're a level master! 🌟
            </p>
          </div>
        )}

        {/* Next Level Info */}
        {result.stars_earned < 3 && !result.is_completed && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-blue-900 text-sm">
              💡 Tip: Get at least 3 stars to unlock the next level!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onRetry}
            className="flex-1 px-6 py-3 bg-neutral-600 hover:bg-neutral-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
            Try Again
          </button>

          {result.next_level_available && (
            <button
              onClick={onNextLevel}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              Next Level
              <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==================== Metric Card ==================== */
function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-neutral-800 mb-1">{value}</div>
      <div className="text-xs text-neutral-600">{label}</div>
    </div>
  );
}

/**
 * Star Rating Display Component
 * Shows earned stars with animation
 */
interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export function StarRating({
  stars,
  maxStars = 5,
  size = "md",
  animated = false,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className="flex gap-1">
      {[...Array(maxStars)].map((_, i) => (
        <span
          key={i}
          className={`${sizeClasses[size]} ${
            i < stars ? "block" : "opacity-30"
          } transition-all duration-300 ${
            animated && i < stars
              ? "animate-bounce"
              : ""
          }`}
          style={animated && i < stars ? { animationDelay: `${i * 0.1}s` } : {}}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

/**
 * Level Progress Indicator
 */
interface LevelProgressProps {
  currentLevel: number;
  maxLevel: number;
  starsPerLevel: Record<number, number>;
}

export function LevelProgress({
  currentLevel,
  maxLevel,
  starsPerLevel,
}: LevelProgressProps) {
  const progressPercentage = (currentLevel / maxLevel) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-neutral-800">Progress</h3>
        <span className="text-sm text-neutral-600">
          Level {currentLevel} of {maxLevel}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Recent Stars */}
      <div className="flex gap-2 flex-wrap mt-3">
        {[...Array(Math.min(5, currentLevel))].map((_, i) => {
          const levelNum = currentLevel - i;
          const stars = starsPerLevel[levelNum] || 0;
          return (
            <div key={levelNum} className="text-center">
              <div className="text-xs text-neutral-600 mb-1">L{levelNum}</div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <span
                    key={j}
                    className={`text-sm ${
                      j < stars ? "block" : "opacity-20"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
