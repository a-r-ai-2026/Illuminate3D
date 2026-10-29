import React, { useEffect, useState } from "react";
import { Keyboard, Smartphone, X, Sparkles, Move, ArrowUp, MousePointer, Hand } from "lucide-react";

interface ControlInstructionsBannerProps {
  hasPlayerMoved: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const ControlInstructionsBanner: React.FC<ControlInstructionsBannerProps> = ({
  hasPlayerMoved,
  isOpen,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Automatically fade out after initial player movement (with 1.2s delay) or after 7 seconds
  useEffect(() => {
    if (hasPlayerMoved) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [hasPlayerMoved]);

  useEffect(() => {
    const autoTimer = setTimeout(() => {
      setIsVisible(false);
    }, 8000);
    return () => clearTimeout(autoTimer);
  }, []);

  // Sync external open state
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-2xl select-none animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="bg-gradient-to-r from-[#0f2537]/98 via-[#142942]/98 to-[#0f2537]/98 border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 text-white shadow-[0_0_35px_rgba(245,158,11,0.35)] backdrop-blur-xl relative">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="absolute top-3 right-3 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          aria-label="Dismiss controls"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title Header */}
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-300 block">
              EXPLORER CONTROLS
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight">
              How to Guide Your Explorer
            </h3>
          </div>
        </div>

        {/* Dual Controls Grid (Desktop & Touch) */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Keyboard & Mouse */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-sky-300 pb-1 border-b border-white/5">
              <Keyboard className="w-4 h-4" />
              <span>Keyboard & Mouse</span>
            </div>
            <div className="space-y-1.5 text-slate-200 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Move:</span>
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-amber-300 font-bold">
                  WASD / Arrow Keys
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Jump:</span>
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-sky-300 font-bold">
                  SPACEBAR
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Grab Block:</span>
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-yellow-300 font-bold">
                  [E] Push & Pull
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Camera / Zoom:</span>
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-slate-200">
                  Auto Chase / Scroll Zoom
                </span>
              </div>
            </div>
          </div>


          {/* Touchscreen & Tablet */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 pb-1 border-b border-white/5">
              <Smartphone className="w-4 h-4" />
              <span>Touch & Tablet</span>
            </div>
            <div className="space-y-1.5 text-slate-200 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Move:</span>
                <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                  Bottom-Left Joystick
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Jump:</span>
                <span className="bg-sky-400/20 text-sky-300 px-2 py-0.5 rounded font-bold">
                  ▲ JUMP Button
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Interact:</span>
                <span className="bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded font-bold">
                  ✨ INTERACT Button
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Look Around:</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-slate-300">
                  Drag anywhere on screen
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-fade hint */}
        <p className="mt-2.5 text-[10px] text-center text-sky-200/70 italic">
          Start moving to automatically dismiss this guide. Press '?' at the top anytime to reopen!
        </p>
      </div>
    </div>
  );
};
