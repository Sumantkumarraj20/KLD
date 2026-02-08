"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { api } from "@/lib/api";

interface Kid {
  kid_id: string;
  name: string;
  balance: number;
  emoji: string;
}

interface HeaderProps {
  className?: string;
  kids?: Kid[];
  activeKid?: Kid | null;
  onSelectKid?: (kid: Kid) => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  className = "",
  kids = [],
  activeKid = null,
  onSelectKid = () => {},
  isLoading = false,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [localKids, setLocalKids] = useState<Kid[]>(kids || []);
  const [localActiveKid, setLocalActiveKid] = useState<Kid | null>(activeKid || null);
  const [loadingKids, setLoadingKids] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load kids and selected kid from localStorage if props aren't provided
useEffect(() => {
  let mounted = true;

  const load = async () => {
    if ((kids?.length || 0) === 0) {
      setLoadingKids(true);
      try {
        const fetchedRaw = await api.getKids();
        const fetched = (fetchedRaw as Kid[]) || [];
        if (!mounted) return;

        setLocalKids(fetched);

        if (typeof window !== "undefined") {
          const sel = localStorage.getItem("selectedKidId");

          if (sel) {
            const found = fetched.find((k) => k.kid_id === sel) || null;
            setLocalActiveKid(found);
          } else if (fetched.length > 0) {
            setLocalActiveKid(fetched[0]); // ✅ auto-select first kid
          }
        }
      } catch (e) {
        // ignore
      } finally {
        setLoadingKids(false);
      }
    } else {
      // props-driven mode
      setLocalKids(kids);
      setLocalActiveKid(activeKid || kids[0] || null); // ✅ fallback
    }
  };

  load();

  // listen for global changes
  const onKidChanged = (e: Event) => {
    const detail = (e as CustomEvent).detail as Kid | undefined;
    if (detail) setLocalActiveKid(detail);
  };

  window.addEventListener("kidChanged", onKidChanged as EventListener);

  return () => {
    mounted = false;
    window.removeEventListener("kidChanged", onKidChanged as EventListener);
  };
}, [kids, activeKid]);


  /* Skeleton header during SSR → prevents layout shift */
  if (!isClient) {
    return (
      <header
        className={`sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-primary-600 to-primary-700 ${className}`}
      >
        <div className="mx-auto h-16 max-w-7xl px-4 sm:px-6 lg:px-8" />
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-primary-600 to-primary-700 backdrop-blur supports-[backdrop-filter]:bg-primary-600/90 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-xl shadow-inner transition group-hover:bg-white/25">
              🎯
            </span>

            <div className="leading-tight">
              <h1 className="text-sm font-semibold sm:text-base">
                Kids Points
              </h1>
              <p className="text-[11px] text-primary-100">
                Family Learning System
              </p>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Profile Switcher - Shows when kids data is available */}
            {(localKids.length > 0 || kids.length > 0) && (
              <ProfileSwitcher
                kids={localKids.length > 0 ? localKids : kids}
                activeKid={localActiveKid || activeKid}
                onSelectKid={(k) => {
                  // propagate to parent if provided
                  try {
                    onSelectKid(k);
                  } catch (e) {
                    // ignore
                  }
                  setLocalActiveKid(k);
                }}
                isLoading={loadingKids || isLoading}
                compact={!!(localActiveKid || activeKid)}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
