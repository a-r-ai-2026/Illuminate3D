import React, { useState } from "react";
import { Music, Play, Square, X, Sparkles } from "lucide-react";
import { soundEngine } from "../../services/soundEffects";

interface MelodyPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoryVerseText: string;
}

// Melody frequencies for Twinkle & London Bridge
const TWINKLE_NOTES = [
  { note: "C4", freq: 261.63, word: "In the", duration: 0.4 },
  { note: "C4", freq: 261.63, word: "be-", duration: 0.4 },
  { note: "G4", freq: 392.0, word: "gin-", duration: 0.4 },
  { note: "G4", freq: 392.0, word: "ning", duration: 0.4 },
  { note: "A4", freq: 440.0, word: "God cre-", duration: 0.4 },
  { note: "A4", freq: 440.0, word: "ated", duration: 0.4 },
  { note: "G4", freq: 392.0, word: "all,", duration: 0.8 },
  { note: "F4", freq: 349.23, word: "Heav-", duration: 0.4 },
  { note: "F4", freq: 349.23, word: "ens", duration: 0.4 },
  { note: "E4", freq: 329.63, word: "and the", duration: 0.4 },
  { note: "E4", freq: 329.63, word: "earth He", duration: 0.4 },
  { note: "D4", freq: 293.66, word: "made them", duration: 0.4 },
  { note: "D4", freq: 293.66, word: "call!", duration: 0.4 },
  { note: "C4", freq: 261.63, word: "(Gen. 1:1)", duration: 0.8 },
];

const LONDON_NOTES = [
  { note: "G4", freq: 392.0, word: "In the be-", duration: 0.45 },
  { note: "A4", freq: 440.0, word: "gin-", duration: 0.25 },
  { note: "G4", freq: 392.0, word: "ning", duration: 0.4 },
  { note: "F4", freq: 349.23, word: "God cre-", duration: 0.4 },
  { note: "E4", freq: 329.63, word: "ated,", duration: 0.4 },
  { note: "F4", freq: 349.23, word: "all the", duration: 0.4 },
  { note: "G4", freq: 392.0, word: "world,", duration: 0.6 },
  { note: "D4", freq: 293.66, word: "heavens", duration: 0.4 },
  { note: "E4", freq: 329.63, word: "and the", duration: 0.4 },
  { note: "F4", freq: 349.23, word: "earth,", duration: 0.6 },
  { note: "E4", freq: 329.63, word: "Gen-e-", duration: 0.4 },
  { note: "F4", freq: 349.23, word: "sis", duration: 0.4 },
  { note: "G4", freq: 392.0, word: "One-One!", duration: 0.8 },
];

const HAND_MOTIONS = [
  { phrase: "In the beginning", motion: "Hands spread open wide like the vast, endless sky" },
  { phrase: "God created", motion: "Hands rolling and shaping like an artist forming clay" },
  { phrase: "the heavens", motion: "Both arms reach upward toward the twinkling stars" },
  { phrase: "and the earth", motion: "Both hands cup together to hold a round world below" },
  { phrase: "Genesis 1:1", motion: "Hands together flat, opening like a holy Bible book" },
];

export const MelodyPlayerModal: React.FC<MelodyPlayerModalProps> = ({
  isOpen,
  onClose,
  memoryVerseText,
}) => {
  const [selectedTune, setSelectedTune] = useState<"twinkle" | "london">("twinkle");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeNoteIdx, setActiveNoteIdx] = useState<number>(-1);

  if (!isOpen) return null;

  const activeNotes = selectedTune === "twinkle" ? TWINKLE_NOTES : LONDON_NOTES;

  const handlePlayMelody = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    let idx = 0;

    const playNext = () => {
      if (idx >= activeNotes.length) {
        setIsPlaying(false);
        setActiveNoteIdx(-1);
        return;
      }

      const note = activeNotes[idx];
      setActiveNoteIdx(idx);
      soundEngine.playMusicalNote(note.freq, note.duration);

      const nextDelay = note.duration * 1000 + 40;
      idx++;
      setTimeout(playNext, nextDelay);
    };

    playNext();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#14233c] border-2 border-amber-400/70 rounded-3xl p-5 sm:p-6 text-white shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-300">
                DAY 3 CONNECT ACTIVITY
              </span>
              <h3 className="text-base font-extrabold text-white">
                Sing the Memory Verse!
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tune Selector */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setSelectedTune("twinkle");
              setActiveNoteIdx(-1);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              selectedTune === "twinkle"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "bg-white/10 text-slate-300 hover:text-white"
            }`}
          >
            Twinkle, Twinkle Little Star
          </button>
          <button
            onClick={() => {
              setSelectedTune("london");
              setActiveNoteIdx(-1);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              selectedTune === "london"
                ? "bg-cyan-400 text-slate-950 shadow-md"
                : "bg-white/10 text-slate-300 hover:text-white"
            }`}
          >
            London Bridge Is Falling Down
          </button>
        </div>

        {/* Melody Visualizer / Words */}
        <div className="mt-4 p-4 bg-black/30 border border-white/10 rounded-2xl flex flex-wrap gap-2 justify-center min-h-[90px] items-center">
          {activeNotes.map((n, i) => (
            <span
              key={i}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                activeNoteIdx === i
                  ? "bg-amber-400 text-slate-950 scale-110 shadow-lg"
                  : "bg-white/5 text-slate-300"
              }`}
            >
              {n.word}
            </span>
          ))}
        </div>

        {/* Play Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handlePlayMelody}
            disabled={isPlaying}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isPlaying ? "SINGING..." : "PLAY MELODY"}</span>
          </button>
        </div>

        {/* Hand Motion Prompts */}
        <div className="mt-5 p-3.5 bg-sky-950/60 border border-sky-600/40 rounded-xl space-y-2">
          <span className="text-[11px] font-extrabold text-sky-300 uppercase tracking-wider block">
            HAND-MOTION PROMPTS:
          </span>
          <div className="space-y-1 text-xs text-sky-100">
            {HAND_MOTIONS.map((m, mIdx) => (
              <div key={mIdx} className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span>
                  <strong className="text-amber-200">"{m.phrase}":</strong> {m.motion}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
