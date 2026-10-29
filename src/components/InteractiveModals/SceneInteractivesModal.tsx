import React from "react";
import { Sparkles, X, Sun, CheckCircle } from "lucide-react";
import { soundEngine } from "../../services/soundEffects";

interface SceneInteractivesModalProps {
  type: "snowman" | "orb" | "butterfly" | "riddle" | "foundObject" | null;
  payload?: any;
  onClose: () => void;
}

export const SceneInteractivesModal: React.FC<SceneInteractivesModalProps> = ({
  type,
  payload,
  onClose,
}) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#14233c] border-2 border-amber-400/70 rounded-3xl p-5 sm:p-6 text-white shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 fill-current" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300">
              {type === "snowman" && "THE DESIGNER'S TOUCH"}
              {type === "orb" && `CREATION DAY ${payload} INFOGRAPHIC`}
              {type === "butterfly" && "GOD'S BOUNDLESS VARIETY"}
              {type === "riddle" && "THE ORANGE RIDDLE"}
              {type === "foundObject" && "WONDER DISCOVERED!"}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3">
          {type === "snowman" && (
            <>
              <h4 className="text-base font-extrabold text-white">
                Did the snowflakes build this by chance?
              </h4>
              <p>
                When you walk outside in winter and see three rounded snow spheres stacked neatly with button eyes and a carrot nose, you instantly know an intelligent person crafted it with their hands and imagination.
              </p>
              <p className="p-3 bg-sky-950/70 border border-sky-600/40 rounded-xl text-sky-100 font-medium">
                How much more does our universe with its orbits, atmospheres, DNA, and living oceans prove there is a glorious Creator God!
              </p>
            </>
          )}

          {type === "orb" && (
            <>
              <h4 className="text-base font-extrabold text-white">
                {payload === 1 && "Day 1: Light and Darkness (Day and Night)"}
                {payload === 2 && "Day 2: The Firmament (Atmosphere & Waters)"}
                {payload === 3 && "Day 3: Dry Land, Seas, Grass, & Fruit Trees"}
                {payload === 4 && "Day 4: Sun, Moon, and Stars for Seasons"}
                {payload === 5 && "Day 5: Sea Creatures and Winged Birds"}
              </h4>
              <p>
                {payload === 1 && "God commanded light into existence out of nothing, dividing the day from the night."}
                {payload === 2 && "God established the expansive sky, separating waters above from waters below."}
                {payload === 3 && "Dry land emerged from the oceans, instantly sprouting green grass, herbs, and flowering trees."}
                {payload === 4 && "God placed celestial lights in the sky to mark days, months, and seasons."}
                {payload === 5 && "Waters teemed with playful sea creatures and skies echoed with singing birds!"}
              </p>
            </>
          )}

          {type === "butterfly" && (
            <>
              <h4 className="text-base font-extrabold text-white">
                8.7 Million Wonder Species!
              </h4>
              <p>
                Scientists estimate there are over 8.7 million distinct living species on Earth. From the tiny painted wings of butterflies to giant whales in the deep, every creature points to God's inexhaustible imagination and beauty.
              </p>
            </>
          )}

          {type === "riddle" && (
            <>
              <h4 className="text-base font-extrabold text-white">
                The Orange Riddle
              </h4>
              <p className="italic text-amber-200">
                "What has a protective peel, juicy sweet compartments, seeds ready to sprout new trees, and never needed a human factory to engineer?"
              </p>
              <p className="p-3 bg-amber-500/10 border border-amber-400/30 rounded-xl text-amber-100 font-medium">
                An orange! God engineered fruit with seeds inside so life would continually reproduce after its own kind.
              </p>
            </>
          )}

          {type === "foundObject" && payload && (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-extrabold text-emerald-300">
                  {payload.label} Found!
                </h4>
              </div>
              <p>
                Created on <strong className="text-amber-300">Day {payload.creationDay}</strong> of creation.
              </p>
              <div className="p-3 bg-sky-950/70 border border-sky-600/40 rounded-xl text-sky-100">
                <p className="italic font-serif text-xs">
                  {payload.creationDay === 1 && "God said, 'Let there be light,' and there was light."}
                  {payload.creationDay === 2 && "God made the firmament and divided the waters."}
                  {payload.creationDay === 3 && "Let the dry land appear... and the earth brought forth grass and trees."}
                  {payload.creationDay === 4 && "God made two great lights: the greater light to rule the day, and the lesser light to rule the night."}
                  {payload.creationDay === 5 && "Let the waters abound with an abundance of living creatures, and let birds fly above the earth."}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-colors"
          >
            CONTINUE EXPEDITION
          </button>
        </div>
      </div>
    </div>
  );
};
