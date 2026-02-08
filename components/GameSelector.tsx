/**
 * GameSelector Components
 * Domain selection and level selection UI
 */

import { BookOpen, Calculator, Brain, Lock, Zap } from "lucide-react";
import Link from "next/link";
import { GameDomain } from "@/lib/gameTypes";
import { gameAPI } from "@/lib/gameAPI";

interface DomainSelectorProps {
  selectedDomain: GameDomain | null;
  onSelectDomain: (domain: GameDomain) => void;
  domainProgress: Record<GameDomain, number>;
  kidId?: string;
}

export function DomainSelector({
  selectedDomain,
  onSelectDomain,
  domainProgress,
  kidId,
}: DomainSelectorProps) {
  const domains: Array<{
    id: GameDomain;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      id: "language",
      name: "Language",
      description: "Writing, Reading & Listening",
      icon: <BookOpen className="h-8 w-8" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "mathematics",
      name: "Mathematics",
      description: "Numbers & Operations",
      icon: <Calculator className="h-8 w-8" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "logical",
      name: "Logic",
      description: "Puzzles & Patterns",
      icon: <Brain className="h-8 w-8" />,
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {domains.map((domain) => {
        const nextLevel = (domainProgress[domain.id] || 1) + 1;
        const lockStatus = kidId ? gameAPI.getLevelLockStatus(kidId, domain.id, nextLevel) : { isLocked: false };
        const timeUntilUnlock = kidId ? gameAPI.getTimeUntilUnlock(kidId, domain.id, nextLevel) : "";

        return (
          <Link key={domain.id} href={`/domains/${domain.id}`}>
            <div
              onClick={() => onSelectDomain(domain.id)}
              className={`p-6 rounded-xl transition-all transform hover:scale-105 block cursor-pointer ${
                selectedDomain === domain.id
                  ? `bg-gradient-to-r ${domain.color} text-white shadow-xl ring-2 ring-offset-2`
                  : "bg-white text-neutral-800 shadow hover:shadow-lg border-2 border-transparent"
              }`}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className={`p-3 rounded-lg ${
                    selectedDomain === domain.id
                      ? "bg-white/20"
                      : `bg-gradient-to-r ${domain.color} text-white p-3 rounded-lg`
                  }`}
                >
                  {domain.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{domain.name}</h3>
                  <p className="text-sm opacity-75">{domain.description}</p>
                </div>
                <div className="text-2xl font-bold">
                  Level {domainProgress[domain.id] || 1}
                </div>

                {lockStatus.isLocked && (
                  <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
                    <Lock className="h-4 w-4" />
                    <span>Next unlocks in {timeUntilUnlock}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

interface LevelSelectorProps {
  currentDomain: GameDomain;
  maxLevelCompleted: number;
  starsPerLevel: Record<number, number>;
  onSelectLevel: (level: number) => void;
  isLoading?: boolean;
}

export function LevelSelector({
  currentDomain,
  maxLevelCompleted,
  starsPerLevel,
  onSelectLevel,
  isLoading = false,
}: LevelSelectorProps) {
  const levelList = Array.from({ length: Math.min(maxLevelCompleted + 5, 50) }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-neutral-800">Select a Level</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {levelList.map((level) => {
          const stars = starsPerLevel[level] || 0;
          const isCompleted = stars > 0;
          const isAvailable = level <= maxLevelCompleted + 1;
          const isCurrent = level === maxLevelCompleted + 1;

          return (
            <button
              key={level}
              onClick={() => {
                if (isAvailable && !isLoading) {
                  onSelectLevel(level);
                }
              }}
              disabled={!isAvailable || isLoading}
              className={`relative p-4 rounded-lg font-bold transition-all ${
                isCurrent
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg ring-2 ring-blue-300 animate-pulse"
                  : isAvailable
                    ? isCompleted
                      ? "bg-gradient-to-br from-amber-100 to-yellow-100 text-neutral-800 hover:shadow-md"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <div className="text-lg font-bold">{level}</div>
              {isAvailable && (
                <div className="flex gap-0.5 justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < stars ? "block" : "opacity-20"}`}>
                      ⭐
                    </span>
                  ))}
                </div>
              )}
              {!isAvailable && <Lock className="h-4 w-4 mx-auto mt-1" />}
              {isCurrent && (
                <div className="absolute -top-2 -right-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-900">
          💡 Complete levels with 3+ stars to unlock the next level
        </p>
      </div>
    </div>
  );
}

/**
 * Quick Stats Component
 * Shows kid's overall progress
 */
interface QuickStatsProps {
  kidName: string;
  totalStars: number;
  levelsCompleted: Record<GameDomain, number>;
  totalPoints: number;
}

export function QuickStats({
  kidName,
  totalStars,
  levelsCompleted,
  totalPoints,
}: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Name" value={kidName} icon="👤" />
      <StatCard label="Total Stars" value={totalStars.toString()} icon="⭐" />
      <StatCard
        label="Levels"
        value={Object.values(levelsCompleted).reduce((a, b) => a + b, 0).toString()}
        icon="🎯"
      />
      <StatCard label="Points" value={totalPoints.toString()} icon="🏆" />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center border-l-4 border-blue-500">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xs text-neutral-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-neutral-800">{value}</div>
    </div>
  );
}
