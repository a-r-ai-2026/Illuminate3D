import React, { useState } from "react";
import { Check, Eye, ChevronDown, ChevronUp, Waves, Compass, HelpCircle } from "lucide-react";
import { ISpyItem } from "../../types/illuminate";
import { soundEngine } from "../../services/soundEffects";

interface ISpyTrayProps {
  items: ISpyItem[];
  cameraMode: "surface" | "underwater";
  onSwitchCamera: (mode: "surface" | "underwater") => void;
  foundObjectIds: Record<string, boolean>;
  onInspectItem: (item: ISpyItem) => void;
}

export const ISpyTray: React.FC<ISpyTrayProps> = ({
  items,
  cameraMode,
  onSwitchCamera,
  foundObjectIds,
  onInspectItem,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [selectedItemHint, setSelectedItemHint] = useState<ISpyItem | null>(null);

  const currentCameraItems = items.filter((item) => item.camera === cameraMode);
  const totalFoundInView = currentCameraItems.filter((i) => foundObjectIds[i.id]).length;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-[920px] select-none">
      {/* Collapse / Expand Toggle Button */}
      <div className="flex justify-center -mb-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="px-4 py-1 bg-[#0f2537] hover:bg-[#15344f] border border-sky-600/40 rounded-t-xl text-sky-200 text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors"
          aria-label={isCollapsed ? "Expand I Spy Tray" : "Collapse I Spy Tray"}
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Show I Spy Wonders</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Hide Tray (Cinema View)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Bottom Dock */}
      {!isCollapsed && (
        <div className="bg-[#0f2537]/95 border-2 border-sky-800/80 rounded-2xl shadow-2xl p-3.5 backdrop-blur-md">
          {/* Header Row: Camera Switcher & Progress */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-sky-800/50">
            {/* Camera View Switcher */}
            <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => {
                  if (cameraMode !== "surface") {
                    soundEngine.playWaterTransition(false);
                    onSwitchCamera("surface");
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  cameraMode === "surface"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-sky-200 hover:text-white"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Surface View</span>
              </button>
              <button
                onClick={() => {
                  if (cameraMode !== "underwater") {
                    soundEngine.playWaterTransition(true);
                    onSwitchCamera("underwater");
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  cameraMode === "underwater"
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "text-sky-200 hover:text-white"
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                <span>Underwater Reef</span>
              </button>
            </div>

            {/* Found Tally */}
            <div className="flex items-center gap-2 text-xs text-sky-200">
              <span className="font-semibold text-white">I SPY IN SCENE:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold font-mono">
                {totalFoundInView} / {currentCameraItems.length} Found
              </span>
            </div>
          </div>

          {/* Hint Callout Banner if selected */}
          {selectedItemHint && (
            <div className="mt-2 p-2 bg-sky-950/80 border border-sky-600/40 rounded-xl flex items-center justify-between text-xs text-sky-100 animate-in fade-in">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong className="text-amber-300">{selectedItemHint.label}:</strong> {selectedItemHint.hint}
                </span>
              </div>
              <button
                onClick={() => setSelectedItemHint(null)}
                className="text-slate-400 hover:text-white text-xs px-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Horizontal Grid of I Spy Items */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-sky-700">
            {currentCameraItems.map((item) => {
              const isFound = !!foundObjectIds[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onInspectItem(item);
                    setSelectedItemHint(item);
                  }}
                  className={`group relative flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all select-none ${
                    isFound
                      ? "bg-emerald-950/60 border-emerald-500/70 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      : "bg-white/5 border-white/10 hover:border-amber-400/50 text-slate-300 hover:text-white"
                  }`}
                  aria-label={`${item.label} (Creation Day ${item.creationDay})${isFound ? " - Found" : ""}`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                      isFound ? "bg-emerald-500 text-slate-950" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {isFound ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Eye className="w-3 h-3" />}
                  </div>
                  <div className="text-left">
                    <span className="font-semibold block leading-tight">{item.label}</span>
                    <span className="text-[10px] text-slate-400 block">Day {item.creationDay}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
