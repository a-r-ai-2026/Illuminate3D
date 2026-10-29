import React, { useState } from "react";
import {
  X,
  Users,
  Printer,
  RotateCcw,
  BookOpen,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
} from "lucide-react";
import { TrackType, AvatarId, DayLesson, Lesson } from "../../types/illuminate";
import { soundEngine } from "../../services/soundEffects";

interface ParentTeacherPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrack: TrackType;
  onSelectTrack: (track: TrackType) => void;
  selectedAvatar: AvatarId;
  onSelectAvatar: (avatar: AvatarId) => void;
  currentLesson: Lesson;
  currentDayLesson: DayLesson;
  onResetProgress: () => void;
  onOpenVerificationSheet: () => void;
}

const AVATARS = [
  { id: "leo" as AvatarId, name: "Leo", trait: "Thoughtful & Curious", color: "#38bdf8" },
  { id: "maya" as AvatarId, name: "Maya", trait: "Joyful & Energetic", color: "#f59e0b" },
  { id: "noah" as AvatarId, name: "Noah", trait: "Faithful & Observant", color: "#10b981" },
  { id: "chloe" as AvatarId, name: "Chloe", trait: "Wonder-filled & Kind", color: "#ec4899" },
];

export const ParentTeacherPanel: React.FC<ParentTeacherPanelProps> = ({
  isOpen,
  onClose,
  selectedTrack,
  onSelectTrack,
  selectedAvatar,
  onSelectAvatar,
  currentLesson,
  currentDayLesson,
  onResetProgress,
  onOpenVerificationSheet,
}) => {
  const [activeTab, setActiveTab] = useState<"settings" | "guide" | "print">("settings");

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-4xl max-h-[92vh] bg-[#0c1b2c] border-2 border-amber-400/50 rounded-3xl p-5 sm:p-7 text-white shadow-2xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg">
              LS
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-300">
                LIFESTONE MINISTRIES
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Parent & Teacher Sanctuary
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            aria-label="Close Parent Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4 flex gap-2 shrink-0 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "settings"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "bg-white/5 hover:bg-white/10 text-slate-300"
            }`}
          >
            Curriculum Controls & Avatar
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "guide"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "bg-white/5 hover:bg-white/10 text-slate-300"
            }`}
          >
            Raw Guide Book Text
          </button>
          <button
            onClick={() => setActiveTab("print")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "print"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "bg-white/5 hover:bg-white/10 text-slate-300"
            }`}
          >
            Print Activity Card
          </button>
        </div>

        {/* Content Area */}
        <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-5 scrollbar-thin scrollbar-thumb-sky-700">
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Age Track Switcher */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <h3 className="text-sm font-bold text-sky-200 mb-1 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  Active Age Track
                </h3>
                <p className="text-xs text-slate-300 mb-3">
                  Both tracks share the same 3D scenes and hidden objects. Text, audio, and question complexity adapt to the student.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      onSelectTrack("explorer");
                      soundEngine.playPageTurn();
                    }}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                      selectedTrack === "explorer"
                        ? "bg-amber-400/20 border-amber-400 text-white shadow-lg"
                        : "bg-black/20 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="font-extrabold text-sm text-amber-300">
                      Explorer Track (1st–2nd Grade)
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Student Workbook companion text. Shorter read-aloud story with word highlighting, picture-choice questions, and family activities.
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTrack("investigator");
                      soundEngine.playPageTurn();
                    }}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                      selectedTrack === "investigator"
                        ? "bg-sky-400/20 border-sky-400 text-white shadow-lg"
                        : "bg-black/20 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="font-extrabold text-sm text-sky-300">
                      Investigator Track (3rd–6th Grade)
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Guide Book core narrative. Full theological depth, Scripture Connections, scientific Did You Know facts, and Review assessments.
                    </div>
                  </button>
                </div>
              </div>

              {/* Explorer Avatar Selector */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <h3 className="text-sm font-bold text-sky-200 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Select Explorer Avatar
                </h3>
                <p className="text-xs text-slate-300 mb-3">
                  Choose the avatar carrying the lantern through the storybook world.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      onClick={() => {
                        onSelectAvatar(av.id);
                        soundEngine.playObjectFoundChime();
                      }}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        selectedAvatar === av.id
                          ? "bg-amber-400/20 border-amber-400 shadow-md scale-102"
                          : "bg-black/20 border-white/10 hover:border-white/30 text-slate-300"
                      }`}
                    >
                      <div
                        className="w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-slate-950 mb-2 shadow"
                        style={{ backgroundColor: av.color }}
                      >
                        {av.name[0]}
                      </div>
                      <div className="font-bold text-xs text-white">{av.name}</div>
                      <div className="text-[10px] text-slate-400">{av.trait}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions & Verification Sheet */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                <button
                  onClick={onOpenVerificationSheet}
                  className="px-4 py-2 bg-sky-600/80 hover:bg-sky-500 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  View PDF Verification Sheet
                </button>

                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reset all lesson progress and lantern light?")) {
                      onResetProgress();
                      soundEngine.playPageTurn();
                    }
                  }}
                  className="px-4 py-2 bg-rose-600/80 hover:bg-rose-500 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Student Progress
                </button>
              </div>

              {/* Legal, Heritage & External Curriculum Link */}
              <div className="p-4 bg-sky-950/40 border border-sky-800/60 rounded-2xl text-xs text-sky-200 space-y-2">
                <p className="font-bold text-white">
                  LifeStone Ministries — with a publishing legacy dating to 1902, formerly Union Gospel Press.
                </p>
                <p className="text-slate-300">
                  Scripture taken from the New King James Version®. Copyright © 1982 by Thomas Nelson. Used by permission. All rights reserved.
                </p>
                <div className="pt-2">
                  <a
                    href="https://lifestoneministries.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-bold underline"
                  >
                    Get the printed curriculum at LifeStone Ministries
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === "guide" && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <span className="font-mono text-amber-300 text-xs block mb-1">
                  1ST-6TH GRADE GUIDE BOOK VERBATIM TEXT: DAY {currentDayLesson.day} ({currentDayLesson.scripture})
                </span>
                <h3 className="text-base font-extrabold text-white">
                  {currentLesson.title} — {currentDayLesson.badge}
                </h3>
              </div>

              {currentDayLesson.tracks.investigator.sections.map((sec) => (
                <div key={sec.id} className="p-4 bg-black/20 border border-white/10 rounded-xl space-y-2">
                  <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs">
                    {sec.heading}
                  </h4>
                  <p className="text-slate-200 font-serif leading-relaxed text-sm select-text">
                    {sec.text}
                  </p>
                </div>
              ))}

              {currentDayLesson.tracks.investigator.didYouKnow && (
                <div className="p-3 bg-amber-500/10 border border-amber-400/30 rounded-xl">
                  <strong className="text-amber-300 block mb-1">DID YOU KNOW?</strong>
                  <p className="text-amber-100">{currentDayLesson.tracks.investigator.didYouKnow}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "print" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Printable Activity Card: Day {currentDayLesson.day} {currentDayLesson.badge}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Formatted for home printing and family activities.
                  </p>
                </div>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Now
                </button>
              </div>

              {/* Printable Card Preview */}
              <div className="p-6 bg-white text-slate-900 rounded-2xl border-4 border-amber-400 shadow-xl space-y-4">
                <div className="border-b-2 border-slate-200 pb-3">
                  <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                    LifeStone Ministries — Illuminate Bible Series
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    {currentDayLesson.tracks.explorer.activityCard?.title ||
                      currentDayLesson.tracks.investigator.focalPoint?.title ||
                      "Day Activity Sheet"}
                  </h2>
                  <div className="text-xs font-semibold text-slate-600">
                    Lesson 1, Day {currentDayLesson.day} ({currentDayLesson.scripture})
                  </div>
                </div>

                <div className="text-sm leading-relaxed text-slate-800">
                  <p className="font-semibold text-slate-900 mb-2">Instructions:</p>
                  <p>
                    {currentDayLesson.tracks.explorer.activityCard?.instructions ||
                      "Follow the daily hands-on activity steps together as a family to celebrate God's creation."}
                  </p>
                </div>

                {currentDayLesson.tracks.investigator.focalPoint?.supplies && (
                  <div className="text-xs bg-slate-100 p-3 rounded-lg">
                    <p className="font-bold text-slate-900 mb-1">Supplies Needed:</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {currentDayLesson.tracks.investigator.focalPoint.supplies.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
                  <span>Scripture: Genesis 1:1 (NKJV)</span>
                  <span>Homeschool Bible Curriculum, Volume 1</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
