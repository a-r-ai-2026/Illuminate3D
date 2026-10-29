# PS5-Quality Biblical Platformer: Block Grabbing, Vista Zoom & Atmospheric Immersion

Upgrade the 3D platformer into a high-fidelity PS5-quality adventure featuring an interactive Grab-to-Push/Pull block mechanic (via `[E]`), an expansive wide panoramic camera zoom revealing the entire connected landscape, and cinematic next-gen visual upgrades.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following new requirements from user feedback are incorporated into the plan:

- **Confirmed Decision 1 (Push & Pull Block Grabbing)**:
  - Players can approach any stone puzzle block and press/toggle `[E]` to **Grab onto the block**.
  - While grabbed, the Junior Archaeologist locks into a two-handed gripping stance.
  - Moving forward **pushes** the block; moving backward **pulls** the block backward with the player!
  - Block and player move as a locked kinematic pair along aligned axes.
  - Grating stone grinding sound plays during both pushing and pulling.
  - Pressing `[E]` again releases the block.
  - On-screen prompt: `[E] Grab Block (Push / Pull)` ➔ `[E] Release Block`.
- **Confirmed Decision 2 (Expansive Vista Zoom)**:
  - Base camera distance increased to `18.0`–`20.0` units with elevated viewing pitch (`0.44`) and wide FOV (`60°`), allowing the player to see the entire connected landscape: the Eden courtyard, cloud staircase, parted water basin, high mountain peak, and coastline.
  - Smooth mouse wheel or pinch-to-zoom option (`camDist` ranging from 12.0 to 26.0) for players who want to zoom in for close inspection or zoom all the way out for the panoramic whole-world view.
- **Confirmed Decision 3 (PS5-Grade Visual Fidelity)**:
  - High-resolution cascaded shadow maps (`4096` map size with `PCFSoftShadowMap` filtering and contact bias).
  - Studio three-point cinematic lighting: Key Sun Light with warm golden hue, Rim Light with sky cyan bounce, and Ground Hemisphere bounce.
  - Procedural PBR bump and roughness maps on ancient Hebrew columns, Eden stone arches, and cracked puzzle blocks.
  - Divine golden light motes / ambient dust particles drifting through sunbeams in the air.
  - Water caustic reflections and volumetric atmospheric dawn fog.

---

## 1. Overview & Core Concept

- **What It Does**: Provides a tactile, high-production 3rd-person platforming experience. Players grab, push, and pull monolithic stone blocks with full physical resistance, explore a panoramic wide-angle Eden vista with smooth corner-turning chase camera, collect keys and tools in their explorer backpack, and read illuminated scripture steles to the accompaniment of relaxing acoustic harp and warm synth pads.
- **Target Audience**: Students, parents, and homeschoolers engaging with *Illuminate Bible Series: God Our Savior*.
- **Key Value**: Delivers PS5-level visual polish, intuitive Mario-style tactile block grabbing (push + pull), and seamless camera tracking that never gets stuck or disorients the player.

---

## 2. User Experience & Visual Design

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP BAR: LifeStone Logo | BGM Music Toggle [🎵] | Zoom [🔍 -/+]        │
├────────────────────────────────────────────────────────────────────────┤
│ 3D WORLD (PS5-Tier Panoramic View):                                    │
│                                                                        │
│               [Full Landscape Visible: Courtyard ➔ Mountain ➔ Sea]     │
│                                   │                                    │
│                    [▲ Floating Golden Quest Arrow]                     │
│                                   │                                    │
│                 [Junior Archaeologist Explorer]                        │
│                           │                                            │
│                 [Hands Gripped on Block] ◄── [Press 'E' to Grab]       │
│                 [▲ Push Forward / ▼ Pull Backward]                     │
│                           │                                            │
│                 [Heavy Stone Grinding Audio Loop]                      │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 📜 CENTERED ILLUMINATED SCRIPTURE BANNER:                        │  │
│  │ "In the beginning God created the heavens and the earth."        │  │
│  │ — Genesis 1:1 · Elohim: Infinite Strength and Power              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│ HUD: Objectives | 🎒 [Key][Pickaxe][Oil][Seal] | ⭐ Coins | [E] Prompt │
└────────────────────────────────────────────────────────────────────────┘
```

### Visual Identity & Graphic Enhancements
- **PS5-Grade Lighting & Shading**:
  - `DirectionalLight` with 4096 shadow map, soft PCF shadows, and tuned normal bias to prevent shadow acne.
  - Physically Based Materials (PBR) with micro-surface bump variations on stone, marble, and bronze.
  - Dynamic particles: 150 glowing golden divine motes gently swirling in the Eden courtyard.
  - Crystalline water shader with reflective surface and deep gradient.
- **Tactile Grab Mechanic**:
  - Approaching block: HUD displays `[E] Grab Stone Block`.
  - Pressing `E`: Character hands reach forward, locking onto the block surface.
  - Player can push forward or walk backward to pull the block into position!
  - Immediate audio feedback: stone scrape loop starts while moving and stops on halt.
- **Panoramic Vista Camera**:
  - Distance increased to `18.5` units; camera height elevated to `player.y + 3.2`.
  - Buttery-smooth corner-turning follow cam that orbits behind the player as they navigate turns.
  - Scroll wheel or zoom button support to zoom between 12.0 and 26.0 units.

---

## 3. Key Technical Decisions & Physics Strategy

### Decision 1: Two-Way Grab Constraint (Push & Pull)
- **Chosen Approach**:
  - State: `grabbedBlockIndex: number | null` (0 for block 1, 1 for block 2, null when free).
  - When near a block face and pressing `E`, lock grab:
    - Determine grab axis (X or Z) and grab side (+1 or -1).
    - As player moves, calculate displacement `deltaPos`.
    - Move block by `deltaPos`, clamped to puzzle room boundary.
    - Keep player strictly attached to the exterior face of the block (`player.pos = block.pos + offset`).
    - Both pushing forward and pulling backward seamlessly move the block!
  - Release grab when pressing `E`, jumping, or if block reaches socket.
- **Why**: Allows players to correct mistakes easily by pulling blocks away from corners or walls instead of getting blocks stuck.

### Decision 2: Expansive Landscape Vista & Zoom Controls
- **Chosen Approach**:
  - Default `camDist` set to `18.5` with camera FOV `60` and pitch `0.44`.
  - Add optional mouse wheel listener:
    ```typescript
    camDist = THREE.MathUtils.clamp(camDist + e.deltaY * 0.015, 12.0, 26.0);
    ```
- **Why**: Fulfills the "zoom out overall to see the whole thing" request while letting players zoom in anytime.

---

## 4. Technical Architecture & Component Execution

```
                     ┌───────────────────────────────┐
                     │            App.tsx            │
                     │  - LifeStone Brand Header     │
                     │  - Active Scripture Quote     │
                     │  - Inventory State (4 items)  │
                     │  - BGM Audio Controller       │
                     └───────────────┬───────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│      PlatformerEngine.tsx       │             │           ZoneHUD.tsx           │
│ - PS5 Lighting (4096 Shadows)   │             │ - Backpack Inventory Quickbar   │
│ - [E] Grab / Push / Pull Physics│             │ - Active Waypoint Distance      │
│ - Panoramic Vista Chase Cam     │             │ - Scripture Speech Banner       │
│ - Ambient Dust Motes Particles  │             │ - [E] Grab / Release Prompt     │
│ - Footstep / Jump / Grind Audio │             │ - BGM Mute / Unmute Button      │
└────────────────┬────────────────┘             └─────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│        soundEffects.ts          │
│ - startAmbientBGM() (Harp/Pad)  │
│ - startBlockPushRumble()        │
│ - playFootstep() / playJump()   │
│ - playGateUnlock() / Pickaxe()  │
└─────────────────────────────────┘
```

### Planned File Edits:
1. `src/services/soundEffects.ts`:
   - [Already updated with procedural harp/pad BGM, movement audio, and item fanfares].
2. `src/components/Platformer/PlatformerEngine.tsx`:
   - Implement `isGrabbingBlock` state with forward/backward push and pull kinematic binding.
   - Adjust camera defaults to wide panorama (`camDist = 18.5`, pitch `0.44`, FOV `60`) with auto-corner follow and wheel zoom.
   - Upgrade lighting to PS5 caliber: 4096 shadow map with soft bias, ambient divine golden dust particles, and enhanced PBR textures.
   - Add 3D items: Bronze Temple Key, Archaeologist's Pickaxe, Sacred Oil Flask, and Scripture Scroll Seal.
   - Add locked gate, ore boulder obstacle, and scripture stele callbacks.
3. `src/components/Platformer/ZoneHUD.tsx`:
   - Display backpack inventory slots (Key, Pickaxe, Oil, Seal).
   - Display dynamic `[E] Grab Block (Push / Pull)` and `[E] Release Block` prompts.
   - Display Centered Scripture Banner with illuminated parchment styling and auto-dismiss.
   - Add BGM toggle button in top-right HUD.
4. `src/App.tsx`:
   - Connect LifeStone Illuminate logo branding in header.
   - Wire BGM start/stop with game mode.
   - Connect scripture recitation modal/banner state.
