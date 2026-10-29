import React, { useState, useEffect, useRef } from "react";
import volume1Data from "../content/volume-1.json";
import {
  VolumeCurriculum,
  TrackType,
  AvatarId,
  Lesson,
  DayLesson,
  ISpyItem,
} from "./types/illuminate";
import { PlatformerEngine, PlatformerGameState } from "./components/Platformer/PlatformerEngine";
import { TouchControls, VirtualInputState } from "./components/Platformer/TouchControls";
import { ZoneHUD, ZoneObjective } from "./components/Platformer/ZoneHUD";
import { ControlInstructionsBanner } from "./components/Platformer/ControlInstructionsBanner";
import { CreationShoreScene } from "./components/Scene3D/CreationShoreScene";
import { LanternHUD } from "./components/HUD/LanternHUD";
import { DayBadgeBar } from "./components/HUD/DayBadgeBar";
import { ISpyTray } from "./components/HUD/ISpyTray";
import { AudiobookPlayer } from "./components/Audiobook/AudiobookPlayer";
import { WorldMapModal } from "./components/WorldMap/WorldMapModal";
import { QuestionModal } from "./components/Questions/QuestionModal";
import { ParentTeacherPanel } from "./components/ParentPanel/ParentTeacherPanel";
import { MelodyPlayerModal } from "./components/MelodyPlayer/MelodyPlayerModal";
import { ColoringCanvas } from "./components/Coloring/ColoringCanvas";
import { NatureJournalModal } from "./components/NatureJournal/NatureJournalModal";
import { VerificationModal } from "./components/Verification/VerificationModal";
import { SceneInteractivesModal } from "./components/InteractiveModals/SceneInteractivesModal";
import { soundEngine } from "./services/soundEffects";
import { narrationEngine } from "./services/narrationEngine";
import {
  Compass,
  MapPin,
  Volume2,
  VolumeX,
  HelpCircle,
  Music,
  Palette,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Gamepad2,
  Eye,
  CheckCircle2,
} from "lucide-react";

const curriculum = volume1Data as unknown as VolumeCurriculum;

export default function App() {
  // -------------------------------------------------------------
  // Persistent State (Saved locally only — COPPA & Privacy First)
  // -------------------------------------------------------------
  const [selectedTrack, setSelectedTrack] = useState<TrackType>(() => {
    try {
      return (localStorage.getItem("ILLUMINATE_TRACK") as TrackType) || "explorer";
    } catch {
      return "explorer";
    }
  });

  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(() => {
    try {
      return (localStorage.getItem("ILLUMINATE_AVATAR") as AvatarId) || "leo";
    } catch {
      return "leo";
    }
  });

  const [completedLessons, setCompletedLessons] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("ILLUMINATE_COMPLETED_LESSONS");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [unlockedLessons, setUnlockedLessons] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("ILLUMINATE_UNLOCKED_LESSONS");
      return saved ? JSON.parse(saved) : [1];
    } catch {
      return [1];
    }
  });

  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("ILLUMINATE_COMPLETED_DAYS");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [foundObjectIds, setFoundObjectIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("ILLUMINATE_FOUND_OBJECTS");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [answeredMap, setAnsweredMap] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("ILLUMINATE_ANSWERED_QUESTIONS");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [natureJournal, setNatureJournal] = useState(() => {
    try {
      const saved = localStorage.getItem("ILLUMINATE_JOURNAL");
      return saved ? JSON.parse(saved) : { seen: "", heard: "", praise: "" };
    } catch {
      return { seen: "", heard: "", praise: "" };
    }
  });

  // Game Play Mode: "platformer" (3rd-person Mario 64 style) or "diorama" (tactile inspection)
  const [gameMode, setGameMode] = useState<"platformer" | "diorama">("platformer");
  const [showTouchControls, setShowTouchControls] = useState<boolean>(true);

  // Active Lesson and Day
  const [activeLessonId, setActiveLessonId] = useState<number>(1);
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);
  const [cameraMode, setCameraMode] = useState<"surface" | "underwater">("surface");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAudiobookMinimized, setIsAudiobookMinimized] = useState<boolean>(true);

  // Platformer Virtual Input
  const [virtualInput, setVirtualInput] = useState<VirtualInputState>({
    moveX: 0,
    moveZ: 0,
    isJumping: false,
    isInteracting: false,
  });

  // Live Platformer Game State
  const [platformerState, setPlatformerState] = useState<PlatformerGameState>({
    currentZone: 1,
    hasSpokenLight: false,
    hasPressedSkySwitch: false,
    blocksPushedCount: 0,
    bridgeRaised: false,
    gateOpened: false,
    pressurePlatesPressed: [false, false, false],
    watersParted: false,
    seedsCollected: 0,
    totalSeedsNeeded: 3,
    forestSprouted: false,
    altarsActivated: false,
    creaturesFound: {
      whale: false,
      fish: false,
      robin: false,
      seagull: false,
    },
    coinsCollected: 0,
    totalCoins: 12,
    nearbyPrompt: null,
    lanternGlowMultiplier: 1.0,
    hasPlayerMoved: false,
    inventory: {
      templeKey: false,
      pickaxe: false,
      oilFlask: false,
      scriptureSeal: false,
    },
    boulderShattered: false,
  });

  // Active Scripture Speech Bubble & BGM State
  const [activeScriptureQuote, setActiveScriptureQuote] = useState<{
    reference: string;
    text: string;
    doctrine?: string;
  } | null>(null);
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(true);

  // Auto-dismiss scripture banner after voiceover completion
  useEffect(() => {
    if (!activeScriptureQuote) return;
    const durationMs = Math.max(5000, activeScriptureQuote.text.length * 70);
    const timer = setTimeout(() => {
      setActiveScriptureQuote(null);
    }, durationMs);
    return () => clearTimeout(timer);
  }, [activeScriptureQuote]);

  // Ambient Backing Music Sync
  useEffect(() => {
    if (isBgmPlaying && !isMuted) {
      soundEngine.startAmbientBGM();
    } else {
      soundEngine.stopAmbientBGM();
    }
  }, [isBgmPlaying, isMuted]);

  const [isControlsHelpOpen, setIsControlsHelpOpen] = useState<boolean>(false);

  // Modals State
  const [isWorldMapOpen, setIsWorldMapOpen] = useState<boolean>(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [isReviewQuizOpen, setIsReviewQuizOpen] = useState<boolean>(false);
  const [isParentPanelOpen, setIsParentPanelOpen] = useState<boolean>(false);

  const [isMelodyPlayerOpen, setIsMelodyPlayerOpen] = useState<boolean>(false);
  const [isColoringOpen, setIsColoringOpen] = useState<boolean>(false);
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState<boolean>(false);

  // Interactive Scene Callout Modal
  const [sceneInteractiveType, setSceneInteractiveType] = useState<
    "snowman" | "orb" | "butterfly" | "riddle" | "foundObject" | null
  >(null);
  const [sceneInteractivePayload, setSceneInteractivePayload] = useState<any>(null);

  // LocalStorage Synchronizer
  useEffect(() => {
    try {
      localStorage.setItem("ILLUMINATE_TRACK", selectedTrack);
      localStorage.setItem("ILLUMINATE_AVATAR", selectedAvatar);
      localStorage.setItem("ILLUMINATE_COMPLETED_LESSONS", JSON.stringify(completedLessons));
      localStorage.setItem("ILLUMINATE_UNLOCKED_LESSONS", JSON.stringify(unlockedLessons));
      localStorage.setItem("ILLUMINATE_COMPLETED_DAYS", JSON.stringify(completedDays));
      localStorage.setItem("ILLUMINATE_FOUND_OBJECTS", JSON.stringify(foundObjectIds));
      localStorage.setItem("ILLUMINATE_ANSWERED_QUESTIONS", JSON.stringify(answeredMap));
      localStorage.setItem("ILLUMINATE_JOURNAL", JSON.stringify(natureJournal));
    } catch {
      // Ignore if localStorage unavailable
    }
  }, [
    selectedTrack,
    selectedAvatar,
    completedLessons,
    unlockedLessons,
    completedDays,
    foundObjectIds,
    answeredMap,
    natureJournal,
  ]);

  // Ambient sound start
  useEffect(() => {
    soundEngine.startAmbientLoop(cameraMode === "underwater");
  }, []);

  useEffect(() => {
    soundEngine.updateAmbientCamera(cameraMode === "underwater");
  }, [cameraMode]);

  // Curriculum active day lookup
  const currentSemester = curriculum.semesters[0];
  const currentUnit = currentSemester.units[0];
  const currentLesson: Lesson =
    currentUnit.lessons.find((l) => l.id === activeLessonId) || currentUnit.lessons[0];

  const currentDayLesson: DayLesson =
    (currentLesson.days && currentLesson.days.find((d) => d.day === activeDayNumber)) ||
    (currentLesson.days && currentLesson.days[0]) ||
    ({} as DayLesson);

  const allISpyItems: ISpyItem[] = currentDayLesson.ispy || [];

  // Update Completed Days based on Platformer Milestones
  useEffect(() => {
    if (platformerState.hasSpokenLight && !completedDays["l1-d1"]) {
      setCompletedDays((prev) => ({ ...prev, ["l1-d1"]: true }));
      soundEngine.playBadgeLitSwell();
    }
    if (platformerState.hasPressedSkySwitch && !completedDays["l1-d2"]) {
      setCompletedDays((prev) => ({ ...prev, ["l1-d2"]: true }));
      setActiveDayNumber(2);
      soundEngine.playBadgeLitSwell();
    }
    if (platformerState.forestSprouted && !completedDays["l1-d3"]) {
      setCompletedDays((prev) => ({ ...prev, ["l1-d3"]: true }));
      setActiveDayNumber(3);
      soundEngine.playBadgeLitSwell();
    }
    if (platformerState.altarsActivated && !completedDays["l1-d4"]) {
      setCompletedDays((prev) => ({ ...prev, ["l1-d4"]: true }));
      setActiveDayNumber(4);
      soundEngine.playBadgeLitSwell();
    }

    const allCreatures = Object.values(platformerState.creaturesFound).every(Boolean);
    if (allCreatures && !completedDays["l1-d5"]) {
      setCompletedDays((prev) => ({ ...prev, ["l1-d5"]: true }));
      setActiveDayNumber(5);
      soundEngine.playBadgeLitSwell();

      // Trigger Christ Focus conclusion narration
      narrationEngine.playPhrase(
        "Jesus Christ, the eternal Word, was present at the beginning! All things were made through Him, and in Him is life. When Jesus spoke, the wind and the seas obeyed Him!"
      );
    }
  }, [platformerState]);

  // Lantern Glow Calculation
  const foundCount =
    Object.keys(foundObjectIds).length +
    platformerState.coinsCollected +
    (platformerState.bridgeRaised ? 2 : 0) +
    (platformerState.hasSpokenLight ? 3 : 0) +
    (platformerState.hasPressedSkySwitch ? 3 : 0) +
    (platformerState.gateOpened ? 2 : 0) +
    (platformerState.forestSprouted ? 3 : 0) +
    (platformerState.altarsActivated ? 3 : 0) +
    Object.values(platformerState.creaturesFound).filter(Boolean).length * 2;

  const answeredCount = Object.keys(answeredMap).length;
  const rawGlow = (foundCount / 22) * 50 + (answeredCount / 15) * 50;
  const lanternGlow = Math.min(100, Math.max(15, rawGlow));

  // Handle Object Found
  const handleObjectFound = (item: ISpyItem) => {
    if (!foundObjectIds[item.id]) {
      setFoundObjectIds((prev) => ({ ...prev, [item.id]: true }));
    }
    setSceneInteractiveType("foundObject");
    setSceneInteractivePayload(item);
  };

  const handleCompleteReviewQuiz = () => {
    setCompletedDays((prev) => ({ ...prev, ["l1-d5"]: true }));
    if (!completedLessons.includes(currentLesson.id)) {
      setCompletedLessons((prev) => [...prev, currentLesson.id]);
    }
    if (!unlockedLessons.includes(2)) {
      setUnlockedLessons((prev) => [...prev, 2]);
    }
    soundEngine.playBadgeLitSwell();
  };

  const isDay4WhiteLight = activeDayNumber === 4 || platformerState.altarsActivated;

  const avatarNames: Record<AvatarId, string> = {
    leo: "Leo",
    maya: "Maya",
    noah: "Noah",
    chloe: "Chloe",
  };

  // Live Zone Objectives
  const zoneObjectives: ZoneObjective[] =
    platformerState.currentZone === 1
      ? [
          {
            id: "z1-bridge",
            label: `Push 2 stone blocks into Ruby & Sapphire sockets (${platformerState.blocksPushedCount}/2) to raise bridge`,
            isComplete: platformerState.bridgeRaised,
            dayNumber: 1,
          },
          {
            id: "z1-light",
            label: "Cross bridge to beacon and speak: 'Let there be light!'",
            isComplete: platformerState.hasSpokenLight,
            dayNumber: 1,
          },
          {
            id: "z1-clouds",
            label: "Climb bouncing clouds & pull golden gate lever to open Zone 2",
            isComplete: platformerState.gateOpened,
            dayNumber: 2,
          },
          {
            id: "z1-sky",
            label: "Press Day 2 Sky Switch atop sky pillar to wedge the firmament",
            isComplete: platformerState.hasPressedSkySwitch,
            dayNumber: 2,
          },
        ]
      : platformerState.currentZone === 2
      ? [
          {
            id: "z2-waters",
            label: `Step on 3 colored pressure plates (${platformerState.pressurePlatesPressed.filter(Boolean).length}/3) to lower water barrier`,
            isComplete: platformerState.watersParted,
            dayNumber: 3,
          },
          {
            id: "z2-seeds",
            label: `Collect glowing seeds (${platformerState.seedsCollected}/${platformerState.totalSeedsNeeded}) & plant green forest`,
            isComplete: platformerState.forestSprouted,
            dayNumber: 3,
          },
          {
            id: "z2-altars",
            label: "Scale highest peak to activate Sun, Moon & Star altars",
            isComplete: platformerState.altarsActivated,
            dayNumber: 4,
          },
        ]
      : [
          {
            id: "z3-whale",
            label: "Approach lagoon bay to discover the Breaching Whale",
            isComplete: platformerState.creaturesFound.whale,
            dayNumber: 5,
          },
          {
            id: "z3-fish",
            label: "Examine shallow coral reef to spot the Wiggling Fish",
            isComplete: platformerState.creaturesFound.fish,
            dayNumber: 5,
          },
          {
            id: "z3-robin",
            label: "Climb sea ledge to hear the Chirping Robin",
            isComplete: platformerState.creaturesFound.robin,
            dayNumber: 5,
          },
          {
            id: "z3-seagull",
            label: "Explore sandy shoreline to find the Dancing Seagull",
            isComplete: platformerState.creaturesFound.seagull,
            dayNumber: 5,
          },
        ];

  const zoneTitles: Record<number, string> = {
    1: "Days 1 & 2: Light and Sky",
    2: "Days 3 & 4: Land, Plants, and Stars",
    3: "Day 5: Birds and Sea Creatures",
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0f2537] text-white flex flex-col font-sans select-none">
      {/* ========================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================= */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 bg-gradient-to-b from-[#0f2537]/90 via-[#0f2537]/70 to-transparent pointer-events-auto">
        {/* Left: LifeStone Brand Crest */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => {
              soundEngine.playPageTurn();
              setIsParentPanelOpen(true);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setIsParentPanelOpen(true);
            }}
            title="Click or long-press to open Parent & Teacher Panel"
            className="group flex items-center gap-2 px-2 sm:px-3 py-1 rounded-2xl bg-[#003380]/90 hover:bg-[#003380] border border-sky-400/50 hover:border-amber-400 transition-all shadow-md active:scale-95 cursor-pointer"
            aria-label="LifeStone Ministries Parent Panel"
          >
            <img
              src="/assets/aistudio/Screenshot_2026-10-29_at_10.07.40_AM_89d0dfd1.png"
              alt="LifeStone Ministries Illuminate Bible Series"
              className="h-8 sm:h-9 object-contain rounded-md"
              referrerPolicy="no-referrer"
            />
          </button>


          {/* Mode Switcher: 3D Platformer vs Diorama */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                setGameMode("platformer");
                soundEngine.playPageTurn();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                gameMode === "platformer"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>3D Platformer</span>
            </button>
            <button
              onClick={() => {
                setGameMode("diorama");
                soundEngine.playPageTurn();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                gameMode === "diorama"
                  ? "bg-sky-400 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Diorama</span>
            </button>
          </div>
        </div>

        {/* Center: Day Badge Bar */}
        <div className="hidden lg:flex items-center justify-center">
          <DayBadgeBar
            currentDay={activeDayNumber}
            onSelectDay={(day) => {
              setActiveDayNumber(day);
            }}
            completedDays={completedDays}
            lessonId={currentLesson.id}
          />
        </div>

        {/* Right: Track Switcher, World Map & Audio Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Star Coins Counter */}
          {gameMode === "platformer" && (
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-950/70 border border-amber-400/60 text-xs font-black text-amber-300 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>
                {platformerState.coinsCollected}/{platformerState.totalCoins} Stars
              </span>
            </div>
          )}

          {/* Controls Help Guide Button */}
          {gameMode === "platformer" && (
            <button
              onClick={() => {
                soundEngine.playPageTurn();
                setIsControlsHelpOpen(true);
              }}
              title="View movement and puzzle controls"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-sky-200 hover:text-white transition-all shadow-sm"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Controls</span>
            </button>
          )}

          {/* Track Switcher */}
          <button
            onClick={() => {
              const nextTrack = selectedTrack === "explorer" ? "investigator" : "explorer";
              setSelectedTrack(nextTrack);
              soundEngine.playPageTurn();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold transition-all shadow-sm"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                selectedTrack === "explorer" ? "bg-amber-400" : "bg-sky-400"
              }`}
            />
            <span className="hidden min-[480px]:inline">
              {selectedTrack === "explorer" ? "Explorer" : "Investigator"}
            </span>
          </button>

          {/* World Map */}
          <button
            onClick={() => {
              soundEngine.playPageTurn();
              setIsWorldMapOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-transform active:scale-95 shadow-lg"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">WORLD MAP</span>
          </button>

          {/* Audio Mute */}
          <button
            onClick={() => {
              const next = !isMuted;
              setIsMuted(next);
              soundEngine.setMuted(next);
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-300" />}
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 3D PLAYFIELD (Platformer or Diorama) */}
      {/* ========================================================= */}
      <div className="absolute inset-0 z-0">
        {gameMode === "platformer" ? (
          <PlatformerEngine
            virtualInput={virtualInput}
            onGameStateChange={(s) => setPlatformerState(s)}
            onOpenQuestionModal={() => setIsQuestionModalOpen(true)}
            onOpenMiniAquariumCard={() => setIsParentPanelOpen(true)}
            onTriggerChristFocus={() => {
              narrationEngine.playPhrase(
                "John 1:1-3: 'All things were made through Him, and without Him nothing was made that was made.' Jesus Christ is our Creator and our Savior!"
              );
            }}
            onReciteScripture={(quote) => setActiveScriptureQuote(quote)}
            avatarName={avatarNames[selectedAvatar]}
          />
        ) : (
          <CreationShoreScene
            cameraMode={cameraMode}
            activeDay={activeDayNumber}
            foundObjectIds={foundObjectIds}
            onObjectFound={handleObjectFound}
            allISpyItems={allISpyItems}
          />
        )}
      </div>

      {/* ========================================================= */}
      {/* CONTROL INSTRUCTIONS BANNER (Fades out upon player movement) */}
      {/* ========================================================= */}
      {gameMode === "platformer" && (
        <ControlInstructionsBanner
          hasPlayerMoved={platformerState.hasPlayerMoved}
          isOpen={isControlsHelpOpen}
          onClose={() => setIsControlsHelpOpen(false)}
        />
      )}

      {/* ========================================================= */}
      {/* LIVE ZONE OBJECTIVES HUD (Platformer Mode) */}
      {/* ========================================================= */}
      {gameMode === "platformer" && (
        <ZoneHUD
          currentZone={platformerState.currentZone}
          zoneTitle={zoneTitles[platformerState.currentZone]}
          objectives={zoneObjectives}
          nearbyPrompt={platformerState.nearbyPrompt}
          memoryVerseRef={currentLesson.memoryVerse.ref}
          memoryVerseText={currentLesson.memoryVerse.text}
          coinsCollected={platformerState.coinsCollected}
          totalCoins={platformerState.totalCoins}
          inventory={platformerState.inventory}
          activeScripture={activeScriptureQuote}
          onDismissScripture={() => setActiveScriptureQuote(null)}
          isBgmPlaying={isBgmPlaying}
          onToggleBgm={() => setIsBgmPlaying((prev) => !prev)}
          onOpenHelp={() => setIsControlsHelpOpen(true)}
          onReadMemoryVerse={() => {
            narrationEngine.playPhrase(
              "Genesis 1:1: 'In the beginning God created the heavens and the earth.'"
            );
            setActiveScriptureQuote({
              reference: "Genesis 1:1",
              text: "In the beginning God created the heavens and the earth.",
              doctrine: "Elohim: The Eternal Creator who speaks light and order into being.",
            });
          }}
        />
      )}


      {/* ========================================================= */}
      {/* ON-SCREEN TOUCH JOYSTICK & BUTTONS */}
      {/* ========================================================= */}
      {gameMode === "platformer" && showTouchControls && (
        <TouchControls
          onInputChange={(inp) => setVirtualInput(inp)}
          canInteract={!!platformerState.nearbyPrompt}
          interactLabel={platformerState.nearbyPrompt || "INTERACT"}
        />
      )}

      {/* ========================================================= */}
      {/* FLOATING ACTION TOOLBAR (Right Side) */}
      {/* ========================================================= */}
      <div className="absolute top-28 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* Discussion / Review Questions */}
        <button
          onClick={() => {
            soundEngine.playPageTurn();
            if (activeDayNumber === 5) {
              setIsReviewQuizOpen(true);
            } else {
              setIsQuestionModalOpen(true);
            }
          }}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-[#14233c]/90 hover:bg-[#1a3154] border border-amber-400/50 hover:border-amber-300 rounded-2xl text-xs font-bold text-white shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">
            {activeDayNumber === 5 ? "Light Lantern (12 Qs)" : "Discussion Q&A"}
          </span>
        </button>

        {/* Day 3 Connect: Sing Memory Verse */}
        <button
          onClick={() => {
            soundEngine.playPageTurn();
            setIsMelodyPlayerOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 rounded-2xl text-xs font-extrabold shadow-xl transition-transform active:scale-95"
        >
          <Music className="w-4 h-4" />
          <span className="hidden sm:inline">Sing Memory Verse</span>
        </button>

        {/* Day 5: Tap to Color */}
        {selectedTrack === "explorer" && (
          <button
            onClick={() => {
              soundEngine.playPageTurn();
              setIsColoringOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 rounded-2xl text-xs font-extrabold shadow-xl transition-transform active:scale-95"
          >
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Color Scene</span>
          </button>
        )}

        {/* Day 5: Nature Walk Journal */}
        <button
          onClick={() => {
            soundEngine.playPageTurn();
            setIsJournalOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-2xl text-xs font-extrabold shadow-xl transition-transform active:scale-95"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Nature Journal</span>
        </button>

        {/* Toggle Audiobook Reader */}
        <button
          onClick={() => setIsAudiobookMinimized(!isAudiobookMinimized)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f2537]/80 hover:bg-[#14233c] border border-white/10 rounded-xl text-xs text-sky-200 transition-colors"
        >
          {isAudiobookMinimized ? (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Show Reader</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Hide Reader</span>
            </>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* AUDIOBOOK READER DRAWER */}
      {/* ========================================================= */}
      {!isAudiobookMinimized && (
        <aside className="absolute top-28 right-4 z-10 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 pointer-events-auto transition-all animate-in fade-in slide-in-from-right-4 duration-300">
          <AudiobookPlayer
            storyTitle={
              selectedTrack === "explorer"
                ? currentDayLesson.tracks.explorer.storyTitle
                : `${currentLesson.title}: Day ${currentDayLesson.day}`
            }
            sections={
              selectedTrack === "explorer"
                ? currentDayLesson.tracks.explorer.sections
                : currentDayLesson.tracks.investigator.sections
            }
            memoryVerse={currentLesson.memoryVerse}
            prayerPoint={currentDayLesson.prayerPoint}
            christFocus={currentDayLesson.christFocus}
            badgeName={currentDayLesson.badge}
            badgeColor={currentDayLesson.color}
            trackType={selectedTrack}
          />
        </aside>
      )}

      {/* ========================================================= */}
      {/* BOTTOM-LEFT LANTERN HUD */}
      {/* ========================================================= */}
      <LanternHUD
        glowLevel={lanternGlow}
        isDay4WhiteLight={isDay4WhiteLight}
        foundCount={foundCount}
        totalFoundNeeded={22}
        avatarName={avatarNames[selectedAvatar]}
      />

      {/* ========================================================= */}
      {/* BOTTOM TRAY DOCK (Diorama Mode) */}
      {/* ========================================================= */}
      {gameMode === "diorama" && (
        <ISpyTray
          items={allISpyItems}
          cameraMode={cameraMode}
          onSwitchCamera={(m) => setCameraMode(m)}
          foundObjectIds={foundObjectIds}
          onInspectItem={(item) => handleObjectFound(item)}
        />
      )}

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}
      <WorldMapModal
        isOpen={isWorldMapOpen}
        onClose={() => setIsWorldMapOpen(false)}
        semesters={curriculum.semesters}
        activeLessonId={activeLessonId}
        unlockedLessonIds={unlockedLessons}
        completedLessonIds={completedLessons}
        onSelectLesson={(id) => {
          setActiveLessonId(id);
          setActiveDayNumber(1);
        }}
        activeClue={currentLesson.destination.clueToNext || "Follow the path of God's creation."}
      />

      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        questions={
          selectedTrack === "explorer"
            ? currentDayLesson.tracks.explorer.questions
            : currentDayLesson.tracks.investigator.questions
        }
        onAnswerCorrect={(qId) => {
          setAnsweredMap((prev) => ({ ...prev, [String(qId)]: 1 }));
        }}
        answeredMap={answeredMap}
      />

      <QuestionModal
        isOpen={isReviewQuizOpen}
        onClose={() => setIsReviewQuizOpen(false)}
        reviewQuiz={currentDayLesson.reviewQuiz}
        isReviewQuiz={true}
        onAnswerCorrect={(qNum) => {
          setAnsweredMap((prev) => ({ ...prev, [`rev-${qNum}`]: 1 }));
        }}
        answeredMap={answeredMap}
        onCompleteQuiz={handleCompleteReviewQuiz}
      />

      <ParentTeacherPanel
        isOpen={isParentPanelOpen}
        onClose={() => setIsParentPanelOpen(false)}
        selectedTrack={selectedTrack}
        onSelectTrack={(t) => setSelectedTrack(t)}
        selectedAvatar={selectedAvatar}
        onSelectAvatar={(a) => setSelectedAvatar(a)}
        currentLesson={currentLesson}
        currentDayLesson={currentDayLesson}
        onResetProgress={() => {
          setCompletedLessons([]);
          setUnlockedLessons([1]);
          setCompletedDays({});
          setFoundObjectIds({});
          setAnsweredMap({});
          setNatureJournal({ seen: "", heard: "", praise: "" });
        }}
        onOpenVerificationSheet={() => {
          setIsParentPanelOpen(false);
          setIsVerificationOpen(true);
        }}
      />

      <MelodyPlayerModal
        isOpen={isMelodyPlayerOpen}
        onClose={() => setIsMelodyPlayerOpen(false)}
        memoryVerseText={currentLesson.memoryVerse.text}
      />

      {currentDayLesson.explorerColoring && (
        <ColoringCanvas
          isOpen={isColoringOpen}
          onClose={() => setIsColoringOpen(false)}
          palette={currentDayLesson.explorerColoring.palette}
        />
      )}

      <NatureJournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        initialEntries={natureJournal}
        onSave={(entries) => {
          setNatureJournal(entries);
        }}
      />

      <VerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
      />

      <SceneInteractivesModal
        type={sceneInteractiveType}
        payload={sceneInteractivePayload}
        onClose={() => {
          setSceneInteractiveType(null);
          setSceneInteractivePayload(null);
        }}
      />
    </div>
  );
}
