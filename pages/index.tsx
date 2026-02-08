"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import {
  ArrowRight,
  Star,
  Trophy,
  GamepadIcon,
  Users,
  Award,
  BarChart3,
  Target,
} from "lucide-react";

interface NavCard {
  title: string;
  description: string;
  href: string;
  color: string;
  icon: React.ReactNode;
}

const navCards: NavCard[] = [
  {
    title: "Kids Dashboard",
    description: "Track points and redeem rewards",
    href: "/kids",
    color: "from-blue-500/10 to-blue-500/5 border-blue-200",
    icon: <Star className="h-7 w-7 text-blue-600" />,
  },
  {
    title: "Parent Portal",
    description: "Manage kids and award points",
    href: "/parent",
    color: "from-emerald-500/10 to-emerald-500/5 border-emerald-200",
    icon: <Users className="h-7 w-7 text-emerald-600" />,
  },
  {
    title: "Leaderboard",
    description: "See who’s winning (Coming soon)",
    href: "#",
    color: "from-amber-500/10 to-amber-500/5 border-amber-200",
    icon: <Trophy className="h-7 w-7 text-amber-600" />,
  },
  {
    title: "Learning Games",
    description: "Gamified learning for all domains",
    href: "/kids",
    color: "from-rose-500/10 to-rose-500/5 border-rose-200",
    icon: <GamepadIcon className="h-7 w-7 text-rose-600" />,
  },
];

const features = [
  {
    icon: <Target className="h-8 w-8" />,
    title: "Goal-Oriented",
    description: "Set achievable goals and celebrate milestones together.",
    color: "text-blue-600",
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Track Progress",
    description: "Visual analytics to monitor learning and growth.",
    color: "text-emerald-600",
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: "Meaningful Rewards",
    description: "Rewards that motivate kids consistently.",
    color: "text-amber-600",
  },
];

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <Head>
        <title>Kids Points System</title>
        <meta name="description" content="Family Learning & Reward System" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-white">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />

          <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
                <Star className="h-4 w-4" />
                Trusted by families
              </span>

              <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
                <span className="block text-neutral-900">
                  Turn Learning Into
                </span>
                <span className="block bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  Fun & Rewards
                </span>
              </h1>

              <p className="mb-12 text-lg leading-relaxed text-neutral-600">
                A modern family platform that motivates kids, tracks progress,
                and celebrates achievements through smart rewards.
              </p>

              {/* STATS */}
              <div className="mx-auto grid max-w-md grid-cols-3 gap-6">
                {[
                  { value: "100+", label: "Families", color: "text-blue-600" },
                  {
                    value: "500+",
                    label: "Points Earned",
                    color: "text-emerald-600",
                  },
                  { value: "50+", label: "Rewards", color: "text-amber-600" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className={`text-3xl font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="mt-1 text-sm text-neutral-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* NAV CARDS */}
        <section className="mx-auto mb-24 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {navCards.map((card) => (
              <Link key={card.title} href={card.href} className="group">
                <div
                  className={`flex h-full flex-col rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 ${card.color} ${
                    card.href !== "#"
                      ? "hover:-translate-y-1 hover:shadow-xl"
                      : "opacity-60"
                  }`}
                >
                  <div className="mb-4">{card.icon}</div>

                  <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                    {card.title}
                  </h3>

                  <p className="mb-6 flex-grow text-sm text-neutral-600">
                    {card.description}
                  </p>

                  {card.href !== "#" ? (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 group-hover:text-neutral-900">
                      Get started <ArrowRight className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-neutral-500">
                      Coming soon
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="mx-auto mb-24 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-12 shadow-lg">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="mb-4 text-4xl font-bold text-neutral-900">
                Why Families Love It
              </h2>
              <p className="text-lg text-neutral-600">
                Designed for balance — engagement for kids, clarity for parents.
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl p-6 transition hover:bg-neutral-50"
                >
                  <div className={`mb-4 ${feature.color}`}>{feature.icon}</div>
                  <h3 className="mb-3 text-xl font-semibold text-neutral-900">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto mb-24 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-14 text-center text-white shadow-xl">
            <h2 className="mb-4 text-4xl font-bold">
              Start Your Family Journey
            </h2>
            <p className="mb-10 text-lg text-blue-100">
              Turn everyday learning into exciting achievements.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/kids"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 font-semibold text-blue-600 hover:bg-blue-50"
              >
                Explore as Kid <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/parent"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-8 py-3 font-semibold text-white hover:bg-blue-700"
              >
                <Users className="h-5 w-5" />
                Manage as Parent
              </Link>
            </div>

            <p className="mt-8 text-sm text-blue-100">
              Free for up to 3 kids • No credit card required
            </p>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </>
  );
}
