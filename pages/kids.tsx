"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { SpeakButton } from "@/components/SpeakButton";
import { logSpeechSynthesisInfo } from "@/lib/speechDebug";

/* ======================= Types ======================= */

interface Kid {
  kid_id: string;
  name: string;
  balance: number;
  emoji: string;
  birthday?: string;
}

interface Reward {
  reward_id: string;
  title: string;
  description: string;
  points_cost: number;
  category: string;
}

/* ===================== Helpers ====================== */

const showToast = (
  message: string,
  type: "success" | "error" | "warning" | "info" = "info",
) => {
  if (typeof window !== "undefined") {
    (window as any).showToast?.(message, type);
  }
};

/* ===================== Page ========================= */

export default function KidsDashboard() {
  const [kids, setKids] = useState<Kid[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [activeKid, setActiveKid] = useState<Kid | null>(null);
  const [loading, setLoading] = useState(false);

  /* -------------------- Load -------------------- */

  useEffect(() => {
    loadData();
    // Log speech synthesis info to help debug Firefox issues
    if (typeof window !== "undefined") {
      logSpeechSynthesisInfo();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kidsData, rewardsData] = await Promise.all([
        api.getKids(),
        api.getRewards(),
      ]);

      setKids(kidsData as Kid[] || []);
      setRewards(rewardsData as Reward[] || []);
    } catch (e) {
      showToast("Failed to load dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------- Actions ------------------- */

  const selectKid = (kid: Kid) => {
    auth.loginAsKid(kid);
    setActiveKid(kid);
    showToast(`Welcome ${kid.name}! 🎉`, "success");
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedKidId", kid.kid_id);
        window.dispatchEvent(new CustomEvent("kidChanged", { detail: kid }));
      }
    } catch (e) {
      // ignore
    }
  };

  // Persist selection and listen for external kid changes
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Kid | undefined;
      if (detail) setActiveKid(detail);
    };
    window.addEventListener("kidChanged", handler as EventListener);
    return () => window.removeEventListener("kidChanged", handler as EventListener);
  }, []);

  const logoutKid = () => {
    auth.logout();
    setActiveKid(null);
    showToast("Switched profile", "info");
  };

  const redeemReward = async (reward: Reward) => {
    if (!activeKid) return;

    if (activeKid.balance < reward.points_cost) {
      showToast(
        `Need ${reward.points_cost - activeKid.balance} more points`,
        "warning",
      );
      return;
    }

    try {
      setLoading(true);
      await api.redeemReward(activeKid.kid_id, reward.reward_id);
      showToast(`🎁 ${reward.title} redeemed!`, "success");
      await loadData();
      setActiveKid(null);
    } catch {
      showToast("Redemption failed", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================== SELECT KID ================== */

  if (!activeKid) {
    return (
      <>
        <Head>
          <title>Kids Dashboard</title>
        </Head>

        <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <header className="text-center mb-12">
              <h1 className="text-4xl font-extrabold">🌈 Kids Dashboard</h1>
              <p className="mt-2 text-neutral-600">
                Choose your profile to begin
              </p>
            </header>

            {loading ? (
              <Loader />
            ) : kids.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {kids.map((kid) => (
                  <KidCard
                    key={kid.kid_id}
                    kid={kid}
                    onSelect={() => selectKid(kid)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </>
    );
  }

  /* ================= KID DASHBOARD ================= */

  return (
    <>
      <Head>
        <title>{activeKid.name} • Dashboard</title>
      </Head>

      <div className="min-h-screen bg-neutral-50">
        <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
          {/* Header */}
          <section className="rounded-3xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-6xl">{activeKid.emoji}</span>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-extrabold">{activeKid.name}</h1>
                    <SpeakButton
                      text={`Welcome ${activeKid.name}! Let's earn some rewards!`}
                      label=""
                      size="sm"
                      className="bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                    />
                  </div>
                  <p className="opacity-90">Let's earn some rewards!</p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex flex-col items-end gap-2">
                  <p className="text-5xl font-extrabold">{activeKid.balance}</p>
                  <p className="opacity-90">⭐ Points</p>
                  <SpeakButton
                    text={`You have ${activeKid.balance} stars!`}
                    label=""
                    size="sm"
                    className="bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-3">
            <Link
              href="/game"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-semibold shadow hover:shadow-lg transition-all"
            >
              🎮 Play Games
            </Link>
            <button
              onClick={logoutKid}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow hover:bg-neutral-100 transition-colors"
              title="Switch to a different kid profile"
            >
              🔄 Switch Profile
            </button>
            <SpeakButton
              text="Click to switch to a different profile"
              label="?"
              size="sm"
            />
          </div>

          {/* Rewards */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">🎁 Rewards</h2>
              <SpeakButton
                text="Here are the rewards you can earn! Choose one and redeem it when you have enough stars."
                label="?"
                size="sm"
              />
            </div>

            {rewards.length === 0 ? (
              <div className="rounded-xl bg-white p-8 text-center shadow">
                <p className="text-neutral-600">No rewards yet</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => {
                  const canRedeem = activeKid.balance >= reward.points_cost;

                  return (
                    <RewardCard
                      key={reward.reward_id}
                      reward={reward}
                      canRedeem={canRedeem}
                      loading={loading}
                      onRedeem={() => redeemReward(reward)}
                      deficit={reward.points_cost - activeKid.balance}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}

/* ===================== UI ===================== */

function KidCard({ kid, onSelect }: { kid: Kid; onSelect: () => void }) {
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't trigger selection if clicking the speak button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    onSelect();
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer rounded-3xl bg-white p-8 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSelect();
        }
      }}
    >
      <div className="text-6xl mb-4">{kid.emoji}</div>
      <h3 className="text-2xl font-bold">{kid.name}</h3>
      <p className="mt-1 text-lg font-semibold text-indigo-600">
        {kid.balance} ⭐
      </p>
      <div className="mt-4 flex items-center justify-center">
        <SpeakButton
          text={`Hi ${kid.name}, you have ${kid.balance} stars!`}
          label="Hear"
          size="sm"
        />
      </div>
      <p className="mt-3 text-sm text-neutral-500 group-hover:text-indigo-600">
        Tap to select →
      </p>
    </div>
  );
}

function RewardCard({
  reward,
  canRedeem,
  onRedeem,
  loading,
  deficit,
}: {
  reward: Reward;
  canRedeem: boolean;
  onRedeem: () => void;
  loading: boolean;
  deficit: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div className="text-4xl">🎁</div>
        <SpeakButton
          text={`${reward.title}. ${reward.description}`}
          label=""
          size="sm"
        />
      </div>

      <h3 className="font-bold text-lg mb-1">{reward.title}</h3>
      <p className="text-sm text-neutral-600 mb-4">{reward.description}</p>

      <div className="flex justify-between items-center mb-4">
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          {reward.category}
        </span>
        <span className="font-bold text-emerald-600">
          {reward.points_cost} ⭐
        </span>
      </div>

      {!canRedeem && (
        <p className="mb-3 text-xs text-rose-600">Need {deficit} more points</p>
      )}

      <button
        onClick={onRedeem}
        disabled={!canRedeem || loading}
        className={`w-full rounded-xl py-2 font-bold transition ${
          canRedeem
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
        }`}
      >
        {loading ? "Processing…" : "Redeem"}
      </button>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white p-12 text-center shadow">
      <p className="mb-4 text-neutral-600">
        No kids found. Ask a parent to add you!
      </p>
      <Link
        href="/"
        className="inline-block rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700"
      >
        Back to Home
      </Link>
    </div>
  );
}
