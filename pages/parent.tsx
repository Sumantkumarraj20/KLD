"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  Award,
  Star,
  Users,
  Trophy,
  LogOut,
  RefreshCw,
  TrendingUp,
  Gift,
  ChevronRight,
  Shield,
  Sparkles,
  PlusCircle,
  Target,
} from "lucide-react";

/* ----------------------------- Types ----------------------------- */

interface Kid {
  kid_id: string;
  name: string;
  balance: number;
  emoji: string;
}

interface Reward {
  reward_id: string;
  title: string;
  description: string;
  points_cost: number;
  category: string;
}

interface UserProfile {
  user_id: string;
  name: string;
  role: string;
  active: any;
}

/* --------------------------- Utilities --------------------------- */

const showToast = (
  message: string,
  type: "success" | "error" | "warning" | "info" = "info",
) => {
  if (typeof window !== "undefined") {
    (window as any).showToast?.(message, type);
  }
};

/* ============================ PAGE ============================ */

export default function ParentPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  const [userId, setUserId] = useState("");
  const [pin, setPin] = useState("");
  const [selectedKid, setSelectedKid] = useState("");
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  /* ------------------------- Effects ------------------------- */

  useEffect(() => {
    const user = auth.getUser();
    if (user && auth.isParent()) {
      setIsLoggedIn(true);
      loadDashboard();
    } else {
      loadProfiles();
    }
  }, []);

  /* -------------------------- Data --------------------------- */

  const loadProfiles = async () => {
    try {
      const data = await api.getUsers();
      setUsers(
        (data as UserProfile[]).filter(
          (u) => String(u.active).toUpperCase() === "TRUE",
        ),
      );
    } catch {
      showToast("Failed to load profiles", "error");
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [kidsData, rewardsData] = await Promise.all([
        api.getKids(),
        api.getRewards(),
      ]);
      setKids((kidsData as Kid[]) || []);
      setRewards((rewardsData as Reward[]) || []);
    } catch {
      showToast("Failed to sync dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------- Actions -------------------------- */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !pin) return showToast("Missing credentials", "warning");

    try {
      setLoading(true);
      const res = await auth.loginAsParent(userId, pin);
      if (!res.success) throw new Error();
      setIsLoggedIn(true);
      showToast("Welcome back!", "success");
      await loadDashboard();
    } catch {
      showToast("Invalid PIN", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKid || points <= 0 || !reason)
      return showToast("Complete all fields", "warning");

    try {
      setLoading(true);
      await api.awardPoints(selectedKid, points, reason, auth.getUser()?.id);
      showToast(`⭐ ${points} stars awarded`, "success");
      setPoints(0);
      setReason("");
      setSelectedKid("");
      loadDashboard();
    } catch {
      showToast("Failed to award points", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------- Derived Data ------------------------ */

  const totalStars = useMemo(
    () => kids.reduce((sum, k) => sum + k.balance, 0),
    [kids],
  );

  const topKid = useMemo(
    () =>
      kids.length
        ? kids.reduce((a, b) => (b.balance > a.balance ? b : a))
        : null,
    [kids],
  );

  /* ========================== LOGIN ========================== */

  if (!isLoggedIn) {
    return (
      <>
        <Head>
          <title>Parent Login</title>
        </Head>

        <main className="min-h-screen grid place-items-center bg-gradient-to-b from-neutral-50 to-white px-4">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
          >
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white">
              <Shield className="absolute right-6 top-6 opacity-30" />
              <div className="text-5xl mb-3">🔐</div>
              <h1 className="text-2xl font-bold">Parent Portal</h1>
              <p className="text-blue-100 text-sm mt-1">Secure family access</p>
            </div>

            <div className="p-8 space-y-6">
              <select
                className="w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-blue-200"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              >
                <option value="">Select profile</option>
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>

              <input
                type="password"
                placeholder="PIN"
                maxLength={6}
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-center tracking-widest font-mono text-lg"
                required
              />

              <button
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Authenticating…" : "Unlock Dashboard"}
              </button>

              <Link
                href="/"
                className="block text-center text-sm text-gray-500 hover:text-blue-600"
              >
                ← Back to home
              </Link>
            </div>
          </form>
        </main>
      </>
    );
  }

  /* ======================== DASHBOARD ======================== */

  return (
    <>
      <Head>
        <title>Parent Dashboard</title>
      </Head>

      <main className="min-h-screen bg-neutral-50">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
            <h1 className="text-xl font-bold">Parent Dashboard</h1>
            <div className="flex gap-3">
              <button
                onClick={loadDashboard}
                className="rounded-lg px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  auth.logout();
                  location.href = "/";
                }}
                className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 px-6 py-8">
          {/* Left */}
          <section className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Stat label="Kids" value={kids.length} />
                <Stat label="Total Stars" value={totalStars} />
                <Stat label="Rewards" value={rewards.length} />
                <Stat label="Top Kid" value={topKid?.name || "—"} />
              </div>
            </div>

            {/* Kids */}
            <Card title="Your Kids">
              <div className="grid sm:grid-cols-2 gap-4">
                {kids.map((k) => (
                  <div
                    key={k.kid_id}
                    className="rounded-xl border p-4 flex justify-between items-center"
                  >
                    <div className="flex gap-3 items-center">
                      <span className="text-3xl">{k.emoji}</span>
                      <div>
                        <p className="font-semibold">{k.name}</p>
                        <p className="text-xs text-gray-500">{k.balance} ⭐</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedKid(k.kid_id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Award
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Rewards */}
            <Card title="Rewards">
              <div className="space-y-3">
                {rewards.map((r) => (
                  <div
                    key={r.reward_id}
                    className="flex justify-between border rounded-lg p-4"
                  >
                    <div>
                      <p className="font-medium">{r.title}</p>
                      <p className="text-sm text-gray-500">{r.description}</p>
                    </div>
                    <span className="font-bold">{r.points_cost} ⭐</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Right */}
          <aside className="space-y-6">
            <Card title="Award Stars">
              <form onSubmit={handleAward} className="space-y-4">
                <select
                  value={selectedKid}
                  onChange={(e) => setSelectedKid(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="">Select kid</option>
                  {kids.map((k) => (
                    <option key={k.kid_id} value={k.kid_id}>
                      {k.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min={1}
                  value={points}
                  onChange={(e) => setPoints(+e.target.value || 0)}
                  placeholder="Stars"
                  className="w-full rounded-lg border px-3 py-2"
                />

                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason"
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2"
                />

                <button
                  disabled={loading}
                  className="w-full rounded-lg bg-emerald-600 py-2 text-white font-semibold hover:bg-emerald-700"
                >
                  Award Stars
                </button>
              </form>
            </Card>
          </aside>
        </div>
      </main>
    </>
  );
}

/* ------------------------- UI Bits -------------------------- */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-bold">{title}</h2>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl bg-white/10 p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-blue-100">{label}</p>
    </div>
  );
}
