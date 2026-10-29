import React from "react";
import { Compass, Search, Link2, Sparkles, Lightbulb, Check } from "lucide-react";
import { soundEngine } from "../../services/soundEffects";

interface DayBadgeBarProps {
  currentDay: number;
  onSelectDay: (day: number) => void;
  completedDays: Record<string, boolean>; // e.g., "l1-d1": true
  lessonId: number;
}

const BADGES = [
  {
    day: 1,
    name: "Discover",
    icon: Compass,
    color: "#EF4444",
    bgClass: "from-red-600/30 to-red-900/20",
    borderClass: "border-red-500",
    textClass: "text-red-400",
    scripture: "Gen 1:1-23",
  },
  {
    day: 2,
    name: "Investigate",
    icon: Search,
    color: "#10B981",
    bgClass: "from-emerald-600/30 to-emerald-900/20",
    borderClass: "border-emerald-500",
    textClass: "text-emerald-400",
    scripture: "Ps 33:6-9",
  },
  {
    day: 3,
    name: "Connect",
    icon: Link2,
    color: "#F97316",
    bgClass: "from-orange-600/30 to-orange-900/20",
    borderClass: "border-orange-500",
    textClass: "text-orange-400",
    scripture: "Ps 104:24-32",
  },
  {
    day: 4,
    name: "Focus",
    icon: Sparkles,
    color: "#8B5CF6",
    bgClass: "from-purple-600/30 to-purple-900/20",
    borderClass: "border-purple-500",
    textClass: "text-purple-400",
    scripture: "John 1:1-5",
  },
  {
    day: 5,
    name: "Illuminate",
    icon: Lightbulb,
    color: "#3B82F6",
    bgClass: "from-blue-600/30 to-blue-900/20",
    borderClass: "border-blue-500",
    textClass: "text-blue-400",
    scripture: "Ps 148:1-6",
  },
];

export const DayBadgeBar: React.FC<DayBadgeBarProps> = ({
  currentDay,
  onSelectDay,
  completedDays,
  lessonId,
}) => {
  return (
    <nav
      className="flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 py-2 bg-[#0f2537]/90 border border-sky-900/60 rounded-2xl shadow-xl backdrop-blur-md max-w-full overflow-x-auto"
      aria-label="Daily lesson tabs"
    >
      {BADGES.map((b) => {
        const isSelected = currentDay === b.day;
        const isLit = !!completedDays[`l${lessonId}-d${b.day}`];
        const IconComponent = b.icon;

        return (
          <button
            key={b.day}
            onClick={() => {
              if (currentDay !== b.day) {
                soundEngine.playPageTurn();
                onSelectDay(b.day);
              }
            }}
            className={`group relative flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all duration-300 font-medium select-none ${
              isSelected
                ? `bg-gradient-to-r ${b.bgClass} border-2 ${b.borderClass} shadow-lg scale-105`
                : "bg-white/5 hover:bg-white/10 border border-white/10 opacity-80 hover:opacity-100"
            }`}
            style={{
              borderColor: isSelected ? b.color : undefined,
              boxShadow: isLit ? `0 0 12px ${b.color}55` : undefined,
            }}
            aria-selected={isSelected}
            aria-label={`Day ${b.day}: ${b.name} (${b.scripture})`}
          >
            {/* Lit Badge Indicator or Icon */}
            <div
              className="relative w-6 h-6 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{
                backgroundColor: isLit || isSelected ? b.color : "rgba(255,255,255,0.1)",
                color: isLit || isSelected ? "#ffffff" : "#94a3b8",
              }}
            >
              {isLit ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <IconComponent className="w-3.5 h-3.5" />}
            </div>

            {/* Label & Scripture */}
            <div className="text-left hidden min-[420px]:block">
              <div className="flex items-center gap-1">
                <span
                  className="text-[9px] uppercase font-bold tracking-wider"
                  style={{ color: b.color }}
                >
                  DAY {b.day}
                </span>
                {isLit && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Badge Lit!" />
                )}
              </div>
              <div
                className={`text-xs font-bold leading-tight ${
                  isSelected ? "text-white" : "text-slate-300"
                }`}
              >
                {b.name}
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
};
