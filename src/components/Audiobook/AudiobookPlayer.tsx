import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, FastForward, Heart, Cross, BookOpen } from "lucide-react";
import { narrationEngine, NarrationListener } from "../../services/narrationEngine";
import { soundEngine } from "../../services/soundEffects";
import { StorySection, MemoryVerse } from "../../types/illuminate";

interface AudiobookPlayerProps {
  storyTitle: string;
  sections: StorySection[];
  memoryVerse: MemoryVerse;
  prayerPoint: string;
  christFocus: string;
  badgeName: string;
  badgeColor: string;
  onAdvanceDay?: () => void;
  trackType: "explorer" | "investigator";
}

export const AudiobookPlayer: React.FC<AudiobookPlayerProps> = ({
  storyTitle,
  sections,
  memoryVerse,
  prayerPoint,
  christFocus,
  badgeName,
  badgeColor,
  trackType,
}) => {
  const [currentSectionIdx, setCurrentSectionIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeWordIdx, setActiveWordIdx] = useState<number>(-1);
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [activePhraseIdx, setActivePhraseIdx] = useState<number | null>(null);

  const activeSection = sections[currentSectionIdx] || sections[0];

  useEffect(() => {
    const listener: NarrationListener = {
      onWordIndexChange: (secId, wordIdx) => {
        if (secId === activeSection?.id) {
          setActiveWordIdx(wordIdx);
        }
      },
      onSentenceComplete: () => {},
      onSectionComplete: () => {
        setIsPlaying(false);
        setActiveWordIdx(-1);
      },
      onStateChange: (playing) => {
        setIsPlaying(playing);
      },
    };

    const unsubscribe = narrationEngine.subscribe(listener);
    return () => {
      unsubscribe();
      narrationEngine.stop();
    };
  }, [activeSection?.id]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      narrationEngine.pause();
    } else {
      if (activeSection) {
        narrationEngine.playSection(activeSection.id, activeSection.text);
      }
    }
  };

  const handleReplay = () => {
    if (activeSection) {
      narrationEngine.stop();
      setActiveWordIdx(-1);
      setTimeout(() => {
        narrationEngine.playSection(activeSection.id, activeSection.text);
      }, 100);
    }
  };

  const handleCycleSpeed = () => {
    const speeds = [0.8, 0.95, 1.15];
    const nextIdx = (speeds.indexOf(speechRate) + 1) % speeds.length;
    const nextRate = speeds[nextIdx];
    setSpeechRate(nextRate);
    narrationEngine.setRate(nextRate);
  };

  const words = (activeSection?.text || "").split(/\s+/).filter(Boolean);

  return (
    <div className="bg-[#14233c]/95 border-2 border-sky-800/80 rounded-2xl p-4 sm:p-5 text-white shadow-2xl backdrop-blur-md max-w-2xl w-full">
      {/* Top Banner: Day Badge & Story Title */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-sm"
            style={{ backgroundColor: badgeColor }}
          >
            {badgeName}
          </span>
          <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
            {storyTitle}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-sky-200">
          <span className="font-mono bg-white/10 px-2 py-0.5 rounded-md">
            Part {currentSectionIdx + 1} of {sections.length}
          </span>
        </div>
      </div>

      {/* Section Subheading */}
      {activeSection?.heading && (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            {activeSection.heading}
          </span>
        </div>
      )}

      {/* Read-Aloud Synchronized Text Area */}
      <div className="mt-2.5 p-3.5 sm:p-4 bg-black/25 border border-white/10 rounded-xl min-h-[110px] sm:min-h-[130px] leading-relaxed text-sm sm:text-base text-slate-100 font-sans select-text">
        {words.map((word, idx) => {
          const isHighlighted = idx === activeWordIdx;
          return (
            <span
              key={idx}
              className={`transition-colors duration-150 rounded px-0.5 inline-block ${
                isHighlighted
                  ? "bg-amber-400 text-slate-950 font-bold shadow-md scale-105"
                  : "hover:text-amber-300"
              }`}
            >
              {word}{" "}
            </span>
          );
        })}
      </div>

      {/* Playback Controls Row */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-transform active:scale-95"
            aria-label={isPlaying ? "Pause narration" : "Play narration"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? "PAUSE" : "LISTEN ALOUD"}</span>
          </button>

          {/* Replay Button */}
          <button
            onClick={handleReplay}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sky-200 hover:text-white transition-colors"
            title="Replay from start"
            aria-label="Replay audio"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Button */}
          <button
            onClick={handleCycleSpeed}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sky-200 text-xs font-mono font-semibold transition-colors"
            title="Adjust reading speed"
            aria-label="Audio speed"
          >
            {speechRate}x
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1">
          {sections.map((_, sIdx) => (
            <button
              key={sIdx}
              onClick={() => {
                narrationEngine.stop();
                setCurrentSectionIdx(sIdx);
                soundEngine.playPageTurn();
              }}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                currentSectionIdx === sIdx
                  ? "bg-amber-400 text-slate-950 shadow-md font-extrabold"
                  : "bg-white/10 hover:bg-white/20 text-slate-300"
              }`}
              aria-label={`Jump to story part ${sIdx + 1}`}
            >
              {sIdx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Verse Box with Phrase-by-Phrase Repetition */}
      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-400/30 rounded-xl">
        <div className="flex items-center justify-between pb-1">
          <span className="text-[11px] uppercase tracking-wider font-bold text-amber-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            MEMORY VERSE ({memoryVerse.ref})
          </span>
          <span className="text-[10px] text-slate-400 italic">Tap phrase to hear</span>
        </div>

        {/* Phrase repetition buttons */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(memoryVerse.phrases || [memoryVerse.text]).map((phrase, pIdx) => (
            <button
              key={pIdx}
              onClick={() => {
                setActivePhraseIdx(pIdx);
                narrationEngine.playPhrase(phrase, () => setActivePhraseIdx(null));
                soundEngine.playObjectFoundChime();
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border text-left transition-all ${
                activePhraseIdx === pIdx
                  ? "bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-md scale-105"
                  : "bg-white/10 hover:bg-white/20 text-amber-100 border-white/10"
              }`}
            >
              "{phrase}"
            </button>
          ))}
        </div>
      </div>

      {/* Prayer Point & Christ Focus */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl">
          <div className="flex items-center gap-1 text-rose-300 font-bold uppercase tracking-wider text-[10px] pb-1">
            <Heart className="w-3 h-3 text-rose-400" />
            <span>PRAYER POINT</span>
          </div>
          <p className="text-rose-100 leading-snug">{prayerPoint}</p>
        </div>

        <div className="p-2.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl">
          <div className="flex items-center gap-1 text-indigo-300 font-bold uppercase tracking-wider text-[10px] pb-1">
            <Cross className="w-3 h-3 text-indigo-400" />
            <span>CHRIST FOCUS</span>
          </div>
          <p className="text-indigo-100 leading-snug">{christFocus}</p>
        </div>
      </div>
    </div>
  );
};
