import React, { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, Sparkles, ChevronRight, RotateCcw } from "lucide-react";
import { Question, ReviewQuestion } from "../../types/illuminate";
import { soundEngine } from "../../services/soundEffects";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions?: Question[];
  reviewQuiz?: ReviewQuestion[];
  isReviewQuiz?: boolean;
  onAnswerCorrect: (questionIdOrNum: string | number) => void;
  answeredMap: Record<string, number>;
  onCompleteQuiz?: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  questions = [],
  reviewQuiz = [],
  isReviewQuiz = false,
  onAnswerCorrect,
  answeredMap,
  onCompleteQuiz,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalQuestions = isReviewQuiz ? reviewQuiz.length : questions.length;
  const currentQ = isReviewQuiz ? reviewQuiz[currentIdx] : questions[currentIdx];

  if (!currentQ) return null;

  const promptText = isReviewQuiz ? (currentQ as ReviewQuestion).question : (currentQ as Question).prompt;
  const options = currentQ.options;
  const correctIdx = currentQ.correctIndex;
  const qKey = isReviewQuiz ? `rev-${(currentQ as ReviewQuestion).number}` : (currentQ as Question).id;
  const isAlreadyAnswered = answeredMap[qKey] !== undefined;

  const handleSelectOption = (idx: number) => {
    if (hasSubmitted || isAlreadyAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setHasSubmitted(true);
    if (selectedOption === correctIdx) {
      soundEngine.playCorrectSound();
      onAnswerCorrect(isReviewQuiz ? (currentQ as ReviewQuestion).number : (currentQ as Question).id);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
      soundEngine.playPageTurn();
    } else {
      if (isReviewQuiz && onCompleteQuiz) {
        onCompleteQuiz();
      }
      onClose();
    }
  };

  const isCorrect = selectedOption === correctIdx;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#14233c] border-2 border-sky-600/70 rounded-3xl p-5 sm:p-6 text-white shadow-2xl relative select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
              ?
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300">
              {isReviewQuiz ? "LIGHT THE LANTERN QUIZ" : "LESSON DISCUSSION"}
            </span>
          </div>
          <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-full text-sky-200">
            Question {currentIdx + 1} of {totalQuestions}
          </span>
        </div>

        {/* Question Prompt */}
        <div className="mt-4">
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
            {promptText}
          </h3>
        </div>

        {/* Options List */}
        <div className="mt-4 space-y-2.5">
          {options.map((opt, oIdx) => {
            const isSelected = selectedOption === oIdx;
            let btnStyle = "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200";

            if (hasSubmitted || isAlreadyAnswered) {
              if (oIdx === correctIdx) {
                btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-md font-bold";
              } else if (isSelected) {
                btnStyle = "bg-rose-950/80 border-rose-500 text-rose-200";
              } else {
                btnStyle = "bg-white/5 border-white/10 text-slate-500 opacity-50";
              }
            } else if (isSelected) {
              btnStyle = "bg-amber-400/20 border-amber-400 text-amber-200 font-bold shadow-md";
            }

            return (
              <button
                key={oIdx}
                onClick={() => handleSelectOption(oIdx)}
                disabled={hasSubmitted || isAlreadyAnswered}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between text-xs sm:text-sm ${btnStyle}`}
              >
                <span>{opt}</span>
                {(hasSubmitted || isAlreadyAnswered) && oIdx === correctIdx && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {(hasSubmitted || isAlreadyAnswered) && isSelected && oIdx !== correctIdx && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Callout */}
        {(hasSubmitted || isAlreadyAnswered) && (
          <div className="mt-3.5 p-3 rounded-xl bg-sky-950/70 border border-sky-500/40 text-xs text-sky-200 leading-relaxed">
            <strong className="text-amber-300 block mb-1">
              {isCorrect || isAlreadyAnswered ? "Great Discovery!" : "Keep Exploring!"}
            </strong>
            {(!isReviewQuiz && (currentQ as Question).explanation) ||
              "Every answer reveals more about God's eternal power, wisdom, and love."}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-between pt-2">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 transition-colors"
          >
            Close for Now
          </button>

          {!hasSubmitted && !isAlreadyAnswered ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all"
            >
              CONFIRM ANSWER
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
            >
              <span>{currentIdx < totalQuestions - 1 ? "NEXT QUESTION" : "FINISH QUIZ"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
