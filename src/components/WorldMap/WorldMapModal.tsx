import React, { useState } from "react";
import { MapPin, Lock, Unlock, Compass, Sparkles, X, ChevronRight, BookOpen } from "lucide-react";
import { Semester, Lesson } from "../../types/illuminate";
import { soundEngine } from "../../services/soundEffects";

interface WorldMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  semesters: Semester[];
  activeLessonId: number;
  unlockedLessonIds: number[];
  completedLessonIds: number[];
  onSelectLesson: (lessonId: number) => void;
  activeClue: string;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  isOpen,
  onClose,
  semesters,
  activeLessonId,
  unlockedLessonIds,
  completedLessonIds,
  onSelectLesson,
  activeClue,
}) => {
  const [selectedSemesterId, setSelectedSemesterId] = useState<number>(1);
  const [selectedDestination, setSelectedDestination] = useState<Lesson | null>(null);

  if (!isOpen) return null;

  const currentSemester = semesters.find((s) => s.id === selectedSemesterId) || semesters[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-5xl h-[88vh] bg-[#0c1b2c] border-2 border-amber-400/50 rounded-3xl p-5 sm:p-7 text-white shadow-2xl flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-300">
                ILLUMINATE WORLD MAP
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Explorer Destination Guide
              </h2>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            aria-label="Close World Map"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Carmen Sandiego Style Clue Box */}
        <div className="mt-3 p-3.5 bg-gradient-to-r from-amber-500/20 via-sky-500/10 to-transparent border border-amber-400/40 rounded-2xl flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-extrabold uppercase text-amber-300 block tracking-wider">
              CARMEN SANDIEGO EXPEDITION CLUE:
            </span>
            <span className="text-slate-100 italic">"{activeClue}"</span>
          </div>
        </div>

        {/* Semester Selector Tabs */}
        <div className="mt-4 flex gap-2 shrink-0">
          {semesters.map((sem) => (
            <button
              key={sem.id}
              onClick={() => {
                setSelectedSemesterId(sem.id);
                soundEngine.playPageTurn();
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedSemesterId === sem.id
                  ? "bg-amber-400 text-slate-950 shadow-lg scale-102"
                  : "bg-white/10 hover:bg-white/15 text-slate-300"
              }`}
            >
              Semester {sem.id}: {sem.title}
            </button>
          ))}
        </div>

        {/* Main Map Scroll Area with Units & Destinations */}
        <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-sky-700">
          {currentSemester.units.map((unit) => (
            <div
              key={unit.id}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner"
            >
              {/* Unit Title */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                <h3 className="text-sm sm:text-base font-extrabold text-sky-200">
                  Unit {unit.number}: {unit.title}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {unit.lessons.length} Lessons
                </span>
              </div>

              {/* Destination Lesson Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {unit.lessons.map((lesson) => {
                  const isUnlocked = unlockedLessonIds.includes(lesson.id);
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  const isActive = activeLessonId === lesson.id;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        if (isUnlocked) {
                          onSelectLesson(lesson.id);
                          soundEngine.playPageTurn();
                          onClose();
                        }
                      }}
                      className={`relative p-3.5 rounded-xl border-2 transition-all select-none ${
                        isActive
                          ? "bg-amber-400/20 border-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.4)] cursor-pointer"
                          : isUnlocked
                          ? "bg-[#142942] hover:bg-[#1c3859] border-sky-500/50 hover:border-amber-300 cursor-pointer shadow-md"
                          : "bg-black/30 border-white/5 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      {/* Status Badge & Week */}
                      <div className="flex items-center justify-between text-[10px] font-bold pb-1.5">
                        <span className="font-mono text-amber-300">WEEK {lesson.week}</span>
                        {isCompleted ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> LIT
                          </span>
                        ) : isUnlocked ? (
                          <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 flex items-center gap-1">
                            <Unlock className="w-2.5 h-2.5" /> UNLOCKED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-400 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> LOCKED
                          </span>
                        )}
                      </div>

                      {/* Destination Label */}
                      <div className="mt-1 flex items-start gap-1.5">
                        <MapPin
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isCompleted
                              ? "text-amber-400"
                              : isUnlocked
                              ? "text-sky-300"
                              : "text-slate-500"
                          }`}
                        />
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                            {lesson.destination.label}
                          </h4>
                          <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                            {lesson.title}
                          </p>
                        </div>
                      </div>

                      {/* Memory verse preview */}
                      <div className="mt-2 text-[10px] text-sky-200/80 font-mono flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-amber-400" />
                        <span>{lesson.memoryVerse.ref}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
