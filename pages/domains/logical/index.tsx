"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { gameAPI } from "@/lib/gameAPI";
import { GameDomain } from "@/lib/gameTypes";
import { ArrowLeft, Lock, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

const DOMAIN: GameDomain = "logical";

export default function LogicalDomainPage() {
  const [kid, setKid] = useState<{ kid_id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.getUser();
    if (user?.role === "kid") {
      setKid({ kid_id: user.id, name: user.name });
    }
    setLoading(false);
  }, []);

  if (loading || !kid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-neutral-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Logical Thinking - Kids Points</title>
        <meta name="description" content="Practice Logical Thinking Skills" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/game"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-800 mb-4"
            >
              <ArrowLeft size={20} />
              Back to Domains
            </Link>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h1 className="text-4xl font-bold text-emerald-600 mb-2">
                🧩 Logical Thinking
              </h1>
              <p className="text-neutral-600">
                Solve patterns, sequences, puzzles, and memory challenges
              </p>
            </div>
          </div>

          {/* Levels Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 50 }, (_, i) => i + 1).map((level) => (
              <LogicalLevelCard key={level} kidId={kid.kid_id} levelNumber={level} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function LogicalLevelCard({
  kidId,
  levelNumber,
}: {
  kidId: string;
  levelNumber: number;
}) {
  const [isLocked, setIsLocked] = useState(false);
  const [timeUntilUnlock, setTimeUntilUnlock] = useState("");
  const [stars, setStars] = useState(0);
  const router = useRouter();
  useEffect(() => {
    const unlockTime = gameAPI.getTimeUntilUnlock(kidId, "logical", levelNumber);
    const lockStatus = gameAPI.getLevelLockStatus(kidId, "logical", levelNumber);
    const levelCompletion = gameAPI.getLevelCompletion(kidId, "logical", levelNumber);

    setIsLocked(lockStatus.isLocked);
    setTimeUntilUnlock(unlockTime);
    setStars(levelCompletion?.starsEarned || 0);
  }, [kidId, levelNumber]);

  const handleStart = () => {
    router.push(`/game?domain=logical&level=${levelNumber}`);
  };

  return (
    <div
      className={`relative rounded-lg shadow-md p-4 transition-all ${
        isLocked
          ? "bg-neutral-100 opacity-60 cursor-not-allowed"
          : "bg-white hover:shadow-lg cursor-pointer"
      }`}
      onClick={!isLocked ? handleStart : undefined}
    >
      {/* Star Display */}
      {stars > 0 && (
        <div className="absolute top-2 right-2 flex gap-1">
          {Array.from({ length: stars }, (_, i) => (
            <span key={i} className="text-lg">
              ⭐
            </span>
          ))}
        </div>
      )}

      {/* Level Number */}
      <div className="text-3xl font-bold text-emerald-600 mb-2">Level {levelNumber}</div>

      {/* Lock Status */}
      {isLocked ? (
        <div className="flex items-center gap-2 text-amber-600">
          <Clock size={16} />
          <span className="text-sm font-medium">Unlocks in {timeUntilUnlock}</span>
        </div>
      ) : (
        <div className="text-sm text-neutral-600">Ready to play</div>
      )}

      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/5">
          <Lock size={32} className="text-neutral-400" />
        </div>
      )}
    </div>
  );
}
