import React, { useState } from "react";
import { Palette, RotateCcw, X, Check, Sparkles } from "lucide-react";
import { soundEngine } from "../../services/soundEffects";

interface ColoringCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  palette: { name: string; hex: string }[];
}

export const ColoringCanvas: React.FC<ColoringCanvasProps> = ({
  isOpen,
  onClose,
  palette,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(palette[0]?.hex || "#0284C7");
  const [sectionColors, setSectionColors] = useState<Record<string, string>>({
    sky: "#e2e8f0",
    sun: "#e2e8f0",
    mountains: "#e2e8f0",
    ocean: "#e2e8f0",
    sand: "#e2e8f0",
    palmFronds: "#e2e8f0",
    palmTrunk: "#e2e8f0",
    dolphin1: "#e2e8f0",
    dolphin2: "#e2e8f0",
  });

  if (!isOpen) return null;

  const handleColorRegion = (regionKey: string) => {
    setSectionColors((prev) => ({
      ...prev,
      [regionKey]: selectedColor,
    }));
    soundEngine.playObjectFoundChime();
  };

  const handleReset = () => {
    setSectionColors({
      sky: "#e2e8f0",
      sun: "#e2e8f0",
      mountains: "#e2e8f0",
      ocean: "#e2e8f0",
      sand: "#e2e8f0",
      palmFronds: "#e2e8f0",
      palmTrunk: "#e2e8f0",
      dolphin1: "#e2e8f0",
      dolphin2: "#e2e8f0",
    });
    soundEngine.playPageTurn();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-2xl bg-[#14233c] border-2 border-amber-400/70 rounded-3xl p-5 sm:p-6 text-white shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-300">
                DAY 5 EXPLORER COLORING
              </span>
              <h3 className="text-base font-extrabold text-white">
                Color Creation Shore
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title="Reset coloring"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Child-Safe Palette Selector */}
        <div className="mt-3 flex items-center justify-center gap-2 sm:gap-3 shrink-0 pb-2">
          {palette.map((p) => (
            <button
              key={p.hex}
              onClick={() => {
                setSelectedColor(p.hex);
                soundEngine.playCorrectSound();
              }}
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl border-4 transition-transform flex items-center justify-center shadow-lg ${
                selectedColor === p.hex
                  ? "border-white scale-110 shadow-amber-400/50"
                  : "border-transparent opacity-85 hover:opacity-100"
              }`}
              style={{ backgroundColor: p.hex }}
              title={p.name}
              aria-label={`Select ${p.name}`}
            >
              {selectedColor === p.hex && <Check className="w-5 h-5 text-slate-950 stroke-[3]" />}
            </button>
          ))}
        </div>

        {/* Stylized Illustrated SVG Coloring Canvas */}
        <div className="mt-2 flex-1 bg-white rounded-2xl p-3 border-4 border-slate-300 overflow-hidden shadow-inner flex items-center justify-center">
          <svg
            viewBox="0 0 600 400"
            className="w-full h-auto max-h-[50vh] cursor-pointer drop-shadow-md"
          >
            {/* Sky */}
            <rect
              x="0"
              y="0"
              width="600"
              height="240"
              fill={sectionColors.sky}
              stroke="#475569"
              strokeWidth="2.5"
              onClick={() => handleColorRegion("sky")}
            />

            {/* Sun */}
            <circle
              cx="480"
              cy="70"
              r="40"
              fill={sectionColors.sun}
              stroke="#475569"
              strokeWidth="2.5"
              onClick={() => handleColorRegion("sun")}
            />

            {/* Mountains */}
            <polygon
              points="60,240 180,80 300,240"
              fill={sectionColors.mountains}
              stroke="#475569"
              strokeWidth="2.5"
              onClick={() => handleColorRegion("mountains")}
            />
            <polygon
              points="240,240 360,110 460,240"
              fill={sectionColors.mountains}
              stroke="#475569"
              strokeWidth="2.5"
              onClick={() => handleColorRegion("mountains")}
            />

            {/* Ocean */}
            <rect
              x="0"
              y="230"
              width="600"
              height="110"
              fill={sectionColors.ocean}
              stroke="#475569"
              strokeWidth="2.5"
              onClick={() => handleColorRegion("ocean")}
            />

            {/* Beach Sand */}
            <polygon
              points="0,400 600,400 600,320 0,350"
              fill={sectionColors.sand}
              stroke="#475569"
              strokeWidth="2.5"
              onClick={() => handleColorRegion("sand")}
            />

            {/* Palm Trunk */}
            <path
              d="M70,360 Q90,260 110,180 L125,185 Q105,260 85,360 Z"
              fill={sectionColors.palmTrunk}
              stroke="#475569"
              strokeWidth="2"
              onClick={() => handleColorRegion("palmTrunk")}
            />

            {/* Palm Fronds */}
            <ellipse
              cx="115"
              cy="165"
              rx="45"
              ry="20"
              transform="rotate(-20 115 165)"
              fill={sectionColors.palmFronds}
              stroke="#475569"
              strokeWidth="2"
              onClick={() => handleColorRegion("palmFronds")}
            />
            <ellipse
              cx="120"
              cy="165"
              rx="45"
              ry="20"
              transform="rotate(40 120 165)"
              fill={sectionColors.palmFronds}
              stroke="#475569"
              strokeWidth="2"
              onClick={() => handleColorRegion("palmFronds")}
            />

            {/* Dolphins */}
            <path
              d="M320,250 Q360,210 400,240 Q370,250 350,265 Z"
              fill={sectionColors.dolphin1}
              stroke="#475569"
              strokeWidth="2"
              onClick={() => handleColorRegion("dolphin1")}
            />
            <path
              d="M380,260 Q410,225 440,250 Q415,260 400,270 Z"
              fill={sectionColors.dolphin2}
              stroke="#475569"
              strokeWidth="2"
              onClick={() => handleColorRegion("dolphin2")}
            />
          </svg>
        </div>

        <p className="mt-3 text-center text-xs text-slate-300 italic shrink-0">
          Tap any color above, then tap any part of Creation Shore to fill it with color!
        </p>
      </div>
    </div>
  );
};
