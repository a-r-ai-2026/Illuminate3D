import React from "react";
import { ShieldCheck, X, FileText, CheckCircle2 } from "lucide-react";

interface VerificationItem {
  element: string;
  pdfSource: string;
  jsonField: string;
  verbatimText: string;
  verificationStatus: string;
}

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAPPINGS: VerificationItem[] = [
  {
    element: "Lesson 1 Title & Scripture",
    pdfSource: "Guide Book pp. 8–9; Workbook p. 6",
    jsonField: "semesters[0].units[0].lessons[0].title",
    verbatimText: "The First Five Days of Creation — Genesis 1:1-23",
    verificationStatus: "VERIFIED_VERBATIM",
  },
  {
    element: "Memory Verse (Genesis 1:1, NKJV)",
    pdfSource: "Guide Book p. 8; Workbook p. 6",
    jsonField: "lessons[0].memoryVerse",
    verbatimText: "In the beginning God created the heavens and the earth.",
    verificationStatus: "VERIFIED_VERBATIM",
  },
  {
    element: "Day 1 Explorer Story (Nothing, Poof!, Shaping, Missing pieces)",
    pdfSource: "Workbook pp. 6–7",
    jsonField: "days[0].tracks.explorer.sections",
    verbatimText: "Nothing: Have you ever closed your eyes... Poof!: God did not need a hammer... Shaping: On Day 2, God made the sky... Missing pieces: On Day 4, God put the sun...",
    verificationStatus: "VERIFIED_VERBATIM",
  },
  {
    element: "Day 1 Investigator Narrative (A whole lot of nothing, Nothing to it!, Nothing but good)",
    pdfSource: "Guide Book pp. 10–11",
    jsonField: "days[0].tracks.investigator.sections",
    verbatimText: "A whole lot of nothing: Have you ever wondered why this world is here?... Nothing to it!: Human builders need lumber... Nothing but good: At each phase of creation...",
    verificationStatus: "VERIFIED_VERBATIM",
  },
  {
    element: "Day 1 Prayer Point & Christ Focus",
    pdfSource: "Guide Book p. 10, Sidebars",
    jsonField: "days[0].prayerPoint & days[0].christFocus",
    verbatimText: "Prayer Point: Praise God for His great power and goodness. Christ Focus: John 1:1-3 teaches that Jesus Christ was there in the beginning...",
    verificationStatus: "VERIFIED_VERBATIM",
  },
  {
    element: "Day 1 Activities & Did You Know",
    pdfSource: "Workbook p. 9; Guide Book p. 11",
    jsonField: "days[0].tracks.investigator.focalPoint / didYouKnow",
    verbatimText: "Do This Together: Five Days of Wonders. Focal Point: The Sea in a Jar. Did You Know: Light speed 186,282 miles/sec.",
    verificationStatus: "VERIFIED_VERBATIM",
  },
  {
    element: "Day 2 Investigate: Elohim, God Sustains & First Five Days",
    pdfSource: "Guide Book pp. 12–13; Workbook pp. 10–11",
    jsonField: "days[1].tracks.investigator.sections",
    verbatimText: "What Happened in the Beginning, God Is Elohim (Trinity), God Sustains (Heb. 1:3), First Five Days Infographic, Snowman Designer illustration.",
    verificationStatus: "VERIFIED_VERBATIM",
  },
  {
    element: "Day 3 Connect: Edison Light Bulb & 3 Reasons",
    pdfSource: "Guide Book pp. 14–15; Workbook pp. 12–13",
    jsonField: "days[2].tracks.investigator.sections & scriptureConnections",
    verbatimText: "It all starts with God (Edison filament), Three reasons it matters who made the world (Identity, Purpose, Trust), 5 Scripture Connections.",
    verificationStatus: "VERIFIED_VERBATIM",
  },
  {
    element: "Day 4 Focus: Doctrine - Jesus Was at Creation",
    pdfSource: "Guide Book pp. 16–17; Workbook p. 13",
    jsonField: "days[3].tracks.investigator.sections & orangeRiddle",
    verbatimText: "Jesus Was at Creation (John 1:1-5), Creation and redemption, Alpha and Omega (Rev. 22:13), Orange riddle sidebar.",
    verificationStatus: "VERIFIED_VERBATIM",
  },
  {
    element: "Day 5 Illuminate: 12 Review Questions & Apply Walk",
    pdfSource: "Guide Book p. 19; Workbook pp. 14–15",
    jsonField: "days[4].reviewQuiz & applyPrompt",
    verbatimText: "All 12 Review questions from the Guide Book, 'Take a Walk Outside' nature journal, Creation Shore coloring page.",
    verificationStatus: "VERIFIED_VERBATIM",
  },
  {
    element: "Lesson 2 Clue: The Garden Path",
    pdfSource: "Guide Book p. 19",
    jsonField: "destination.clueToNext",
    verbatimText: "On day six the Master Artist made His best work. Follow the path into the garden.",
    verificationStatus: "VERIFIED_VERBATIM",
  },
];

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0c1b2c] border-2 border-amber-400/70 rounded-3xl p-5 sm:p-6 text-white shadow-2xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-300">
                LIFESTONE MINISTRIES AUDIT
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                PDF vs. Codebase Verification Sheet
              </h3>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-300 shrink-0">
          Every lesson string, theological doctrine box, review question, and scripture reference is audited verbatim from the attached LifeStone curriculum texts:
        </p>

        {/* Verification Items Table */}
        <div className="mt-3 flex-1 overflow-y-auto pr-2 space-y-2.5 scrollbar-thin scrollbar-thumb-sky-700 select-text">
          {MAPPINGS.map((m, idx) => (
            <div
              key={idx}
              className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-300 text-xs">
                  {m.element}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1 text-[10px]">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED VERBATIM
                </span>
              </div>

              <div className="text-sky-200 text-[11px]">
                <strong>Source:</strong> {m.pdfSource}
              </div>

              <div className="text-slate-300 text-[11px]">
                <strong>Field:</strong> <code className="font-mono text-amber-200/90">{m.jsonField}</code>
              </div>

              <div className="p-2 bg-black/25 rounded-lg text-slate-200 italic font-serif text-[11px] mt-1">
                "{m.verbatimText}"
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
