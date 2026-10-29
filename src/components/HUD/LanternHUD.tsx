import React, { useState } from "react";
import { Sparkles, Flame, Sun, ChevronUp, ChevronDown } from "lucide-react";

interface LanternHUDProps {
  glowLevel: number; // 0 to 100
  isDay4WhiteLight: boolean;
  foundCount: number;
  totalFoundNeeded: number;
  avatarName: string;
}

export const LanternHUD: React.FC<LanternHUDProps> = ({
  glowLevel,
  isDay4WhiteLight,
  foundCount,
  totalFoundNeeded,
  avatarName,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Flame color calculation
  const flameColor = isDay4WhiteLight
    ? "#ffffff"
    : glowLevel > 70
    ? "#f59e0b"
    : glowLevel > 35
    ? "#fbbf24"
    : "#f97316";

  const glowBoxShadow = isDay4WhiteLight
    ? "0 0 28px rgba(255, 255, 255, 0.9), 0 0 60px rgba(186, 230, 253, 0.6)"
    : `0 0 24px rgba(245, 158, 11, ${0.3 + (glowLevel / 100) * 0.6}), 0 0 48px rgba(251, 191, 36, 0.4)`;

  return (
    <div className="fixed bottom-4 left-4 z-30 select-none">
      {/* Expanded Light Card */}
      {isExpanded && (
        <div className="mb-3 w-64 bg-[#14233c]/95 border border-[#38bdf8]/40 rounded-2xl p-4 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#fde047] flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              Explorer's Lantern
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-sky-200">
              {Math.round(glowLevel)}% Lit
            </span>
          </div>

          <div className="mt-3 text-xs text-sky-100/90 space-y-1.5">
            <div className="flex justify-between">
              <span>Carrier:</span>
              <span className="font-semibold text-white">{avatarName}</span>
            </div>
            <div className="flex justify-between">
              <span>I Spy Wonders:</span>
              <span className="font-semibold text-amber-300">
                {foundCount} of {totalFoundNeeded} found
              </span>
            </div>
            <div className="flex justify-between">
              <span>Light Source:</span>
              <span className="font-semibold text-sky-300">
                {isDay4WhiteLight ? "The Word (John 1)" : "Creation Dawn"}
              </span>
            </div>
          </div>

          <div className="mt-3 w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(8, glowLevel))}%`,
                backgroundColor: flameColor,
                boxShadow: glowBoxShadow,
              }}
            />
          </div>
          <p className="mt-2 text-[10px] text-sky-200/70 italic text-center">
            Every discovered wonder, answered question, and memorized verse adds light to your lantern!
          </p>
        </div>
      )}

      {/* Primary Lantern Button HUD */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group relative flex items-center gap-3 px-3.5 py-2.5 bg-[#0f2537]/90 hover:bg-[#142e48] border-2 border-amber-400/60 hover:border-amber-300 rounded-2xl shadow-xl transition-all duration-300 active:scale-95"
        style={{ boxShadow: glowBoxShadow }}
        aria-label="Toggle Explorer Lantern status"
      >
        {/* Stylized Illustrated Lantern Icon */}
        <div className="relative w-11 h-11 flex items-center justify-center bg-gradient-to-b from-[#1e3a5f] to-[#0a1626] rounded-xl border border-amber-400/40 overflow-hidden">
          {/* Glass pane glow */}
          <div
            className="absolute inset-1 rounded-lg transition-all duration-700"
            style={{
              backgroundColor: isDay4WhiteLight ? "rgba(255,255,255,0.3)" : "rgba(245, 158, 11, 0.25)",
              boxShadow: `inset 0 0 12px ${flameColor}`,
            }}
          />
          {/* Flame Icon */}
          <Flame
            className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
            style={{
              color: flameColor,
              filter: `drop-shadow(0 0 8px ${flameColor})`,
            }}
          />
          {/* Sparkles */}
          <Sparkles className="absolute top-1 right-1 w-3 h-3 text-yellow-200 opacity-80" />
        </div>

        {/* Text Details */}
        <div className="text-left pr-1">
          <div className="text-[10px] tracking-widest uppercase font-bold text-amber-300 flex items-center gap-1">
            <span>LANTERN LIGHT</span>
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </div>
          <div className="text-sm font-black text-white flex items-center gap-1.5">
            <span>{Math.round(glowLevel)}%</span>
            <span className="text-xs font-normal text-sky-200">
              ({foundCount}/{totalFoundNeeded} Wonders)
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};
