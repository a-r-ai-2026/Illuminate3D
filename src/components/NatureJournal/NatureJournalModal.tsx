import React, { useState } from "react";
import { BookOpen, Save, X, Sparkles, Check } from "lucide-react";
import { soundEngine } from "../../services/soundEffects";

interface NatureJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEntries: { seen: string; heard: string; praise: string };
  onSave: (entries: { seen: string; heard: string; praise: string }) => void;
}

export const NatureJournalModal: React.FC<NatureJournalModalProps> = ({
  isOpen,
  onClose,
  initialEntries,
  onSave,
}) => {
  const [seen, setSeen] = useState(initialEntries.seen || "");
  const [heard, setHeard] = useState(initialEntries.heard || "");
  const [praise, setPraise] = useState(initialEntries.praise || "");
  const [savedNotification, setSavedNotification] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ seen, heard, praise });
    soundEngine.playCorrectSound();
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#14233c] border-2 border-amber-400/70 rounded-3xl p-5 sm:p-6 text-white shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-300">
                DAY 5 APPLY PROMPT
              </span>
              <h3 className="text-base font-extrabold text-white">
                Take a Walk Outside Journal
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-300 leading-relaxed">
          Step outside with a parent or friend. Look and listen closely to God's creation, then write or dictate your observations below:
        </p>

        {/* Inputs */}
        <div className="mt-4 space-y-3.5 select-text">
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1">
              1. What wonder did you see in creation?
            </label>
            <input
              type="text"
              value={seen}
              onChange={(e) => setSeen(e.target.value)}
              placeholder="e.g. A bright yellow butterfly, fluffy clouds, tall green oak..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/15 focus:border-amber-400 text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1">
              2. What wonder did you hear in creation?
            </label>
            <input
              type="text"
              value={heard}
              onChange={(e) => setHeard(e.target.value)}
              placeholder="e.g. Birds singing in the trees, rustling leaves in the wind..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/15 focus:border-amber-400 text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1">
              3. What praise will you give to God?
            </label>
            <textarea
              rows={3}
              value={praise}
              onChange={(e) => setPraise(e.target.value)}
              placeholder="e.g. Thank You God for making such an orderly, beautiful world and caring for us!"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/15 focus:border-amber-400 text-xs sm:text-sm text-white placeholder-slate-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-5 flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-400 italic">Saved privately on this device</span>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
          >
            {savedNotification ? <Check className="w-4 h-4 stroke-[3]" /> : <Save className="w-4 h-4" />}
            <span>{savedNotification ? "SAVED TO JOURNAL!" : "SAVE JOURNAL ENTRY"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
