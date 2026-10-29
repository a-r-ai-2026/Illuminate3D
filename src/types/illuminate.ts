export type TrackType = "explorer" | "investigator";

export type AvatarId = "leo" | "maya" | "noah" | "chloe";

export interface AvatarInfo {
  id: AvatarId;
  name: string;
  description: string;
  accentColor: string;
  characterTrait: string;
}

export interface MemoryVerse {
  ref: string;
  text: string;
  phrases?: string[];
}

export interface Destination {
  id: string;
  label: string;
  geographicSetting?: string;
  scene?: string;
  cameras?: ("surface" | "underwater" | "garden" | "valley" | "detail")[];
  clueToNext?: string;
}

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ActivityCard {
  type: string;
  title: string;
  instructions: string;
}

export interface FocalPointCard {
  title: string;
  supplies: string[];
  steps: string[];
}

export interface ScriptureConnection {
  ref: string;
  summary: string;
  passageText?: string;
}

export interface StorySection {
  id: string;
  heading: string;
  text: string;
}

export interface ISpyItem {
  id: string;
  label: string;
  creationDay: number;
  camera: "surface" | "underwater";
  hint: string;
  found?: boolean;
}

export interface ReviewQuestion {
  number: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ApplyPrompt {
  title: string;
  instruction: string;
  fields: string[];
}

export interface DayLesson {
  day: number;
  badge: "Discover" | "Investigate" | "Connect" | "Focus" | "Illuminate";
  color: string;
  scripture: string;
  scriptureTitle: string;
  prayerPoint: string;
  christFocus: string;
  tracks: {
    explorer: {
      storyTitle: string;
      sections: StorySection[];
      questions: Question[];
      activityCard?: ActivityCard;
    };
    investigator: {
      sections: StorySection[];
      questions: Question[];
      focalPoint?: FocalPointCard;
      didYouKnow?: string;
      snowmanInteractive?: {
        prompt: string;
        explanation: string;
      };
      scriptureConnections?: ScriptureConnection[];
      speciesCallout?: string;
      orangeRiddle?: {
        riddle: string;
        answer: string;
      };
    };
  };
  ispy?: ISpyItem[];
  reviewQuiz?: ReviewQuestion[];
  applyPrompt?: ApplyPrompt;
  explorerColoring?: {
    title: string;
    palette: { name: string; hex: string }[];
  };
}

export interface Lesson {
  id: number;
  week: number;
  title: string;
  theme?: string;
  memoryVerse: MemoryVerse;
  destination: Destination;
  days?: DayLesson[];
  isLocked?: boolean;
}

export interface Unit {
  id: number;
  number: number;
  title: string;
  lessons: Lesson[];
}

export interface Semester {
  id: number;
  title: string;
  units: Unit[];
}

export interface VolumeCurriculum {
  volume: string;
  title: string;
  series: string;
  publisher: string;
  heritageNote: string;
  copyrightNotice: string;
  targetAges: string;
  semesters: Semester[];
}

export interface PlayerProgress {
  selectedTrack: TrackType;
  selectedAvatar: AvatarId;
  completedLessons: number[];
  unlockedLessons: number[];
  completedDays: Record<string, boolean>; // key: "l1-d1"
  foundObjects: Record<string, boolean>; // key: "l1-sun"
  answeredQuestions: Record<string, number>; // key: "exp-q1" -> chosenIndex
  reviewQuizAnswers: Record<string, number>; // key: "rev-1" -> chosenIndex
  lanternGlow: number; // 0 to 100
  natureJournal: {
    seen: string;
    heard: string;
    praise: string;
  };
}
