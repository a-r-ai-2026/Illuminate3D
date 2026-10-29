import React from "react";
import {
  Sparkles,
  CheckCircle2,
  Circle,
  BookOpen,
  Volume2,
  Key,
  Pickaxe,
  Flame,
  Scroll,
  Music,
  X,
  Compass,
} from "lucide-react";
import { AdventurerInventory, ScriptureRecitation } from "./PlatformerEngine";

export interface ZoneObjective {
  id: string;
  label: string;
  isComplete: boolean;
  dayNumber: number;
}

interface ZoneHUDProps {
  currentZone: 1 | 2 | 3;
  zoneTitle: string;
  objectives: ZoneObjective[];
  nearbyPrompt?: string | null;
  memoryVerseRef: string;
  memoryVerseText: string;
  onReadMemoryVerse?: () => void;
  coinsCollected?: number;
  totalCoins?: number;
  onOpenHelp?: () => void;
  inventory?: AdventurerInventory;
  activeScripture?: ScriptureRecitation | null;
  onDismissScripture?: () => void;
  isBgmPlaying?: boolean;
  onToggleBgm?: () => void;
}

export const ZoneHUD: React.FC<ZoneHUDProps> = ({
  currentZone,
  zoneTitle,
  objectives,
  nearbyPrompt,
  memoryVerseRef,
  memoryVerseText,
  onReadMemoryVerse,
  coinsCollected = 0,
  totalCoins = 12,
  onOpenHelp,
  inventory = { templeKey: false, pickaxe: false, oilFlask: false, scriptureSeal: false },
  activeScripture = null,
  onDismissScripture,
  isBgmPlaying = true,
  onToggleBgm,
}) => {
  return (
    <>
      {/* Top Left: Zone Title & Objectives Card */}
      <div className="absolute top-16 left-4 right-4 sm:right-auto sm:max-w-md z-20 pointer-events-none select-none">
        <div className="bg-[#002244]/90 border border-sky-600/60 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                ZONE {currentZone}
              </span>
              <h2 className="text-xs sm:text-sm font-extrabold text-white truncate">
                {zoneTitle}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-black text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-lg shadow-inner">
                ⭐ {coinsCollected}/{totalCoins}
              </span>
              <span className="text-[10px] font-mono text-emerald-300 font-bold">
                {objectives.filter((o) => o.isComplete).length}/{objectives.length} Done
              </span>
            </div>
          </div>

          {/* Objectives Checklist */}
          <div className="mt-2.5 space-y-1.5">
            {objectives.map((obj) => (
              <div
                key={obj.id}
                className={`flex items-start gap-2 text-xs transition-colors ${
                  obj.isComplete ? "text-emerald-300 font-bold" : "text-slate-300"
                }`}
              >
                {obj.isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                )}
                <span className="leading-tight">{obj.label}</span>
              </div>
            ))}
          </div>

          {/* Memory Verse Quick Bar */}
          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-sky-200">
            <div className="flex items-center gap-1.5 truncate">
              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-bold text-white shrink-0">{memoryVerseRef}:</span>
              <span className="truncate italic">"{memoryVerseText}"</span>
            </div>
            {onReadMemoryVerse && (
              <button
                onClick={onReadMemoryVerse}
                className="ml-2 p-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 shrink-0 transition-colors cursor-pointer"
                title="Hear memory verse"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Proximity Interaction Prompt Banner */}
        {nearbyPrompt && (
          <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-2xl border-2 border-white flex items-center justify-between animate-bounce pointer-events-auto">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 fill-current" />
              <span>{nearbyPrompt}</span>
            </div>
            <span className="bg-slate-950 text-white px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider">
              PRESS [E]
            </span>
          </div>
        )}

        {/* Desktop Controls Quick Reminder */}
        <div className="hidden sm:flex items-center justify-between mt-2 text-[10px] text-slate-300 font-mono bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <span>WASD: Move</span>
            <span>•</span>
            <span>SPACE: Jump</span>
            <span>•</span>
            <span>E: Grab / Use</span>
            <span>•</span>
            <span>Scroll: Zoom</span>
          </div>
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer pointer-events-auto ml-2"
            >
              Guide [?]
            </button>
          )}
        </div>
      </div>

      {/* Top Right: BGM Music Toggle & Explorer Inventory */}
      <div className="absolute top-16 right-4 z-20 pointer-events-auto flex flex-col items-end gap-2.5 select-none">
        {/* Ambient Backing Music Button */}
        {onToggleBgm && (
          <button
            onClick={onToggleBgm}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-lg backdrop-blur-md cursor-pointer ${
              isBgmPlaying
                ? "bg-[#002244]/90 border-amber-400 text-amber-300 shadow-amber-500/20"
                : "bg-slate-900/80 border-slate-700 text-slate-400"
            }`}
            title="Toggle Relaxing Acoustic Music"
          >
            <Music className={`w-3.5 h-3.5 ${isBgmPlaying ? "animate-pulse text-amber-400" : ""}`} />
            <span className="hidden sm:inline">Relaxing Music:</span>
            <span>{isBgmPlaying ? "ON" : "OFF"}</span>
          </button>
        )}

        {/* Adventurer Backpack Inventory Bar */}
        <div className="bg-[#002244]/90 border border-amber-500/50 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-300 px-1 border-b border-white/10 pb-1">
            <span>🎒 BACKPACK INVENTORY</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Slot 1: Temple Key */}
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                inventory.templeKey
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/30"
                  : "bg-black/30 border-white/10 text-slate-600"
              }`}
              title={inventory.templeKey ? "Bronze Temple Key (Opens Eden Portcullis)" : "Empty Slot: Temple Key"}
            >
              <Key className="w-4 h-4" />
            </div>

            {/* Slot 2: Archaeologist's Pickaxe */}
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                inventory.pickaxe
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/30"
                  : "bg-black/30 border-white/10 text-slate-600"
              }`}
              title={inventory.pickaxe ? "Archaeologist's Pickaxe (Shatters Ore Boulder)" : "Empty Slot: Pickaxe"}
            >
              <Pickaxe className="w-4 h-4" />
            </div>

            {/* Slot 3: Sacred Oil Flask */}
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                inventory.oilFlask
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/30"
                  : "bg-black/30 border-white/10 text-slate-600"
              }`}
              title={inventory.oilFlask ? "Sacred Oil Flask (Anoints Summit Altars)" : "Empty Slot: Oil Flask"}
            >
              <Flame className="w-4 h-4" />
            </div>

            {/* Slot 4: Scripture Scroll Seal */}
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                inventory.scriptureSeal
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/30"
                  : "bg-black/30 border-white/10 text-slate-600"
              }`}
              title={inventory.scriptureSeal ? "Scripture Scroll Seal (Activates Sacred Crossings)" : "Empty Slot: Scripture Seal"}
            >
              <Scroll className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* CENTERED SCRIPTURE SPEECH BUBBLE BANNER (Illuminated Parchment Quote) */}
      {activeScripture && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl z-40 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto select-none">
          <div className="relative bg-slate-950/95 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
            {/* Antique corner filigree embellishment */}
            <div className="absolute top-2 left-2 text-amber-400/40 text-xs">✦</div>
            <div className="absolute top-2 right-2 text-amber-400/40 text-xs">✦</div>
            <div className="absolute bottom-2 left-2 text-amber-400/40 text-xs">✦</div>
            <div className="absolute bottom-2 right-2 text-amber-400/40 text-xs">✦</div>

            {/* Header Lockup */}
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wide">
                  {activeScripture.reference} (NKJV)
                </span>
              </div>
              {onDismissScripture && (
                <button
                  onClick={onDismissScripture}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Dismiss Quote"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Verbatim NKJV Scripture Text */}
            <div className="my-3 text-sm sm:text-base font-serif italic text-amber-100 leading-relaxed text-center px-2">
              "{activeScripture.text}"
            </div>

            {/* Theological Doctrine / Christ Focus */}
            {activeScripture.doctrine && (
              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-center gap-1.5 text-center text-[11px] text-amber-300/90 font-sans">
                <span className="font-bold text-amber-400 uppercase tracking-wider">CHRIST FOCUS:</span>
                <span>{activeScripture.doctrine}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
