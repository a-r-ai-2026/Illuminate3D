# Illuminate Bible Series — Volume 1: "God Our Savior"
### LifeStone Ministries Homeschool Bible Curriculum (1st–6th Grade)

An interactive, game-like 3D audiobook and explorer application built for **LifeStone Ministries** (with a publishing legacy dating to 1902, formerly Union Gospel Press).

---

## Overview

The Illuminate Bible Series combines an audio storybook with an exploratory 3D world:
- **Two Age Tracks, One World**:
  - **Explorer Track (1st–2nd Grade)**: Sourced from *Student Workbook 1st–2nd, Volume 1*. Simplified narration with synchronized word-by-word highlighting, picture-choice questions, memory-verse phrase repetition, and "Do This Together" family activity cards.
  - **Investigator Track (3rd–6th Grade)**: Sourced from *1st–6th Grade Guide Book, Volume 1*. Full daily narrative, Scripture Connections (NKJV), scientific "Did You Know" facts, theological doctrine boxes, Review Q&A, and hands-on "Focal Point" experiments.
- **The Lantern Metaphor**:
  - The student carries an Explorer's Lantern. Every discovered wonder (I Spy), answered question, and memorized verse adds light to the lantern.
  - Completing a day's lessons lights that day's badge (Discover, Investigate, Connect, Focus, Illuminate).
  - Completing Day 5 lights the destination on the world map and reveals the clue to Lesson 2!
- **Lesson 1 Destination: "Creation Shore"**:
  - Full 3D low-poly diorama rendered with Three.js.
  - Surface Camera: Golden sun, crescent moon, twinkling stars, drifting clouds, swaying tropical palm, craggy mountains, sandy dry land, two jumping dolphins, and two soaring seabirds.
  - Underwater Camera: Gliding sea turtle, luminous jellyfish, striped reef fish, round spotted fish, two golden seahorses, starfish, spiral shell, coral reef, and swaying seaweed.
  - Day 2 Interactive Infographic: Floating glowing orbs marking the five creation days.
  - Day 2 Snowman Designer illustration ("Did the snowflakes build this by chance?").
  - Day 3 Butterfly Swarm (8.7 million species wonder).
  - Day 4 Focus: Lantern light shifts from warm golden yellow to radiant crystalline white ("In Him was life, and the life was the light of men").
  - Day 5 Illuminate: 12-Question Review Quiz ("Light the Lantern"), "Take a Walk Outside" nature journal, and Explorer tap-to-color canvas.

---

## 100% Offline & COPPA Compliance

- Designed for children and family homeschool environments.
- **Zero third-party scripts, zero analytics, zero external network calls at runtime.**
- Progress (unlocked lessons, lit badges, found items, answers, nature journal) is saved privately in `localStorage` only.
- Audio synthesis and sound effects use the browser's native Web Audio API and SpeechSynthesis API for zero-latency, private, offline performance.

---

## Project Structure

```
├── /content/
│   ├── volume-1.json               # Full curriculum JSON with verbatim Lesson 1 & 32-lesson skeleton
│   ├── verification-sheet.json     # Side-by-side mapping of PDF page to JSON fields
│   ├── scene-briefs.md             # 3D diorama scene briefs for all 32 destinations
│   └── content-entry-guide.md      # Editorial guide for LifeStone Ministries content team
├── /scripts/
│   └── generate_lessons_skeleton.js # Automated stub generator for Lessons 2–32
├── /src/
│   ├── components/
│   │   ├── Scene3D/                # Three.js 3D diorama (Creation Shore)
│   │   ├── HUD/                    # Glowing Lantern HUD, Day Badge Bar, Collapsible I Spy Tray
│   │   ├── Audiobook/              # Read-aloud player with synchronized text highlighting
│   │   ├── Questions/              # Daily discussion & 12-question review quiz modal
│   │   ├── WorldMap/               # 32-destination Carmen Sandiego style travel map
│   │   ├── ParentPanel/            # Track switcher, avatar picker, printable activity cards, Guide text
│   │   ├── MelodyPlayer/           # Day 3 Sing Memory Verse melody player (Twinkle & London Bridge)
│   │   ├── Coloring/               # Day 5 Tap-to-color canvas with child-safe palette
│   │   ├── NatureJournal/          # Day 5 Apply walk journal modal
│   │   └── Verification/           # In-app PDF verification sheet inspector
│   ├── services/
│   │   ├── soundEffects.ts         # Procedural Web Audio API sound generator
│   │   └── narrationEngine.ts      # Synchronized speech engine with sentence/word callbacks
│   └── types/
│       └── illuminate.ts           # Complete TypeScript curriculum & player interfaces
├── /test/
│   └── illuminate.test.mjs         # Unit test suite verifying curriculum structure & integrity
└── README.md
```

---

## Running and Building

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Tests
```bash
node --test test/illuminate.test.mjs
```

### Production Build
```bash
npm run build
```

---

## Copyright & Legacy Notice

- **LifeStone Ministries** — with a publishing legacy dating to 1902, formerly Union Gospel Press.
- **NKJV Copyright**: Scripture taken from the New King James Version®. Copyright © 1982 by Thomas Nelson. Used by permission. All rights reserved.
