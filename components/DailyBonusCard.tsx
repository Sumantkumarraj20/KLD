/**
 * Daily Bonus Card Component
 * Displays daily bonus status and claim button
 * Integrates with backend API for point awards
 */

import React, { useState, useEffect } from "react";
import {
  getDailyBonusStatus,
  claimDailyBonus,
  ClaimBonusResult,
} from "../lib/dailyBonus";
import { api } from "../lib/api";

interface DailyBonusCardProps {
  kidId: string;
  onBonusClaimed?: (result: ClaimBonusResult) => void;
  onError?: (error: string) => void;
}

export const DailyBonusCard: React.FC<DailyBonusCardProps> = ({
  kidId,
  onBonusClaimed,
  onError,
}) => {
  const [status, setStatus] = useState(getDailyBonusStatus(kidId));
  const [isLoading, setIsLoading] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState<string | null>(null);
  const [justClaimed, setJustClaimed] = useState(false);

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      if (status.claimedToday) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const timeLeft = tomorrow.getTime() - now.getTime();
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        setTimeUntilNext(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeUntilNext(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [status.claimedToday]);

  const handleClaimBonus = async () => {
    setIsLoading(true);
    try {
      const result = claimDailyBonus(kidId);

      if (result.success) {
        // Award points via API to GoogleSheets for audit trail
        let apiSuccess = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await api.awardPoints(
              kidId,
              result.pointsAwarded,
              `Daily bonus claimed (${result.streakDays} day streak)`,
              "daily_bonus"
            );
            apiSuccess = true;
            console.log("✅ Daily bonus synced to backend successfully");
            break;
          } catch (apiError) {
            console.warn(
              `API sync attempt ${attempt + 1}/3 failed:`,
              apiError
            );
            if (attempt < 2) {
              // Wait before retrying (exponential backoff)
              await new Promise((resolve) =>
                setTimeout(resolve, 500 * (attempt + 1))
              );
            }
          }
        }

        if (!apiSuccess) {
          console.warn(
            "Failed to sync daily bonus after 3 attempts - local state updated"
          );
          if (onError) {
            onError(
              "Bonus claimed but sync pending. Your points will update shortly."
            );
          }
        }

        setJustClaimed(true);
        setStatus(getDailyBonusStatus(kidId));

        // Call callback with result
        if (onBonusClaimed) {
          onBonusClaimed(result);
        }

        // Reset the "just claimed" state after 2 seconds
        setTimeout(() => setJustClaimed(false), 2000);
      } else {
        if (onError) {
          onError(result.message);
        }
      }

      // Refresh status
      setStatus(getDailyBonusStatus(kidId));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to claim bonus";
      console.error("Error claiming daily bonus:", error);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Determine button styling based on state
  const getButtonClasses = (): string => {
    const baseClasses =
      "px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2";

    if (justClaimed) {
      return `${baseClasses} bg-green-500 hover:bg-green-600 text-white shadow-lg`;
    }

    if (status.eligible && !isLoading) {
      return `${baseClasses} bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-lg cursor-pointer transform hover:scale-105`;
    }

    return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed opacity-60`;
  };

  // Determine streak display color
  const getStreakColor = (): string => {
    const streak = status.streakDays;
    if (streak >= 30) return "text-purple-600";
    if (streak >= 14) return "text-red-600";
    if (streak >= 7) return "text-orange-600";
    if (streak >= 3) return "text-blue-600";
    return "text-green-600";
  };

  const getStreakEmoji = (): string => {
    const streak = status.streakDays;
    if (streak >= 30) return "👑";
    if (streak >= 14) return "🔥";
    if (streak >= 7) return "⚡";
    if (streak >= 3) return "🌟";
    return "✨";
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-purple-700 flex items-center gap-2">
          🎁 Daily Bonus
        </h3>
        <div
          className={`text-3xl font-bold ${getStreakColor()}`}
          title={`${status.streakDays} day streak`}
        >
          {getStreakEmoji()}
        </div>
      </div>

      {/* Streak Info */}
      <div className="mb-4 p-3 bg-white rounded-lg border border-purple-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Streak</span>
          <span className={`text-2xl font-bold ${getStreakColor()}`}>
            {status.streakDays} {status.streakDays === 1 ? "day" : "days"}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-300"
            style={{
              width: `${Math.min((status.streakDays / 30) * 100, 100)}%`,
            }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {status.streakDays < 30 ? `Next milestone: 30 days` : "Max streak reached!"}
        </div>
      </div>

      {/* Points Info */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="p-3 bg-white rounded-lg border border-blue-100">
          <div className="text-xs text-gray-600 mb-1">Total Points</div>
          <div className="text-2xl font-bold text-blue-600">
            {status.totalPoints}⭐
          </div>
        </div>
        <div className="p-3 bg-white rounded-lg border border-green-100">
          <div className="text-xs text-gray-600 mb-1">Today's Reward</div>
          <div className="text-2xl font-bold text-green-600">
            {status.upcomingPoints}⭐
          </div>
          {status.upcomingMultiplier > 1 && (
            <div className="text-xs text-green-600 font-semibold">
              {status.upcomingMultiplier}x boost!
            </div>
          )}
        </div>
      </div>

      {/* Claim Button */}
      <button
        onClick={handleClaimBonus}
        disabled={!status.eligible || isLoading}
        className={getButtonClasses()}
        title={
          status.eligible
            ? "Click to claim your daily bonus!"
            : status.claimedToday
              ? `Come back in ${timeUntilNext} for your next bonus`
              : "Loading..."
        }
      >
        {justClaimed ? (
          <>
            <span className="text-xl">🎉</span>
            <span>Bonus Claimed!</span>
          </>
        ) : status.eligible ? (
          <>
            <span className="text-xl">✨</span>
            <span>Claim +{status.upcomingPoints} Points</span>
          </>
        ) : (
          <>
            <span className="text-xl">⏰</span>
            <span>Come back in {timeUntilNext}</span>
          </>
        )}
      </button>

      {/* Additional Info */}
      {status.claimedToday && !justClaimed && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            <span className="font-semibold">💪 Keep your streak alive!</span>
            <div className="text-xs text-blue-700 mt-1">
              Come back tomorrow to claim your next bonus and increase your
              multiplier.
            </div>
          </div>
        </div>
      )}

      {/* Streak Reset Warning */}
      {status.claimedToday && status.streakDays > 1 && (
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
          ⚠️ Missing tomorrow will reset your {status.streakDays} day streak
        </div>
      )}
    </div>
  );
};

export default DailyBonusCard;
