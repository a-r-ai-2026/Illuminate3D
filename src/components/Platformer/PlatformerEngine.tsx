import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { soundEngine } from "../../services/soundEffects";
import { narrationEngine } from "../../services/narrationEngine";
import { VirtualInputState } from "./TouchControls";

export interface AdventurerInventory {
  templeKey: boolean;
  pickaxe: boolean;
  oilFlask: boolean;
  scriptureSeal: boolean;
}

export interface ScriptureRecitation {
  reference: string;
  text: string;
  doctrine?: string;
}

export interface PlatformerGameState {
  currentZone: 1 | 2 | 3;
  hasSpokenLight: boolean;
  hasPressedSkySwitch: boolean;
  blocksPushedCount: number;
  bridgeRaised: boolean;
  gateOpened: boolean;
  pressurePlatesPressed: [boolean, boolean, boolean];
  watersParted: boolean;
  seedsCollected: number;
  totalSeedsNeeded: number;
  forestSprouted: boolean;
  altarsActivated: boolean;
  creaturesFound: {
    whale: boolean;
    fish: boolean;
    robin: boolean;
    seagull: boolean;
  };
  coinsCollected: number;
  totalCoins: number;
  nearbyPrompt: string | null;
  lanternGlowMultiplier: number;
  hasPlayerMoved: boolean;
  inventory: AdventurerInventory;
  boulderShattered: boolean;
}

interface PlatformerEngineProps {
  virtualInput: VirtualInputState;
  onGameStateChange: (state: PlatformerGameState) => void;
  onOpenQuestionModal: (day: number) => void;
  onOpenMiniAquariumCard: () => void;
  onTriggerChristFocus: () => void;
  onReciteScripture?: (quote: ScriptureRecitation | null) => void;
  avatarName: string;
}


// -----------------------------------------------------------------
// PROCEDURAL HIGH-RESOLUTION TEXTURE GENERATORS (100% Offline)
// -----------------------------------------------------------------
function createCobblestoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#334155";
  ctx.fillRect(0, 0, 512, 512);

  const rows = 8;
  const cols = 8;
  const rw = 512 / cols;
  const rh = 512 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offsetX = (r % 2) * (rw * 0.5);
      const x = ((c * rw + offsetX) % 512) + 2;
      const y = r * rh + 2;
      const shade = 70 + Math.floor(Math.sin(r * 3 + c * 5) * 25);

      ctx.fillStyle = `rgb(${shade + 10}, ${shade + 15}, ${shade + 25})`;
      ctx.beginPath();
      ctx.roundRect(x, y, rw - 4, rh - 4, 8);
      ctx.fill();

      ctx.strokeStyle = "rgba(15, 23, 42, 0.75)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createLushGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#15803d";
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const g = 110 + Math.floor(Math.random() * 70);
    ctx.fillStyle = `rgb(22, ${g}, 45)`;
    ctx.fillRect(x, y, 2.5, 2.5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createGoldFoilTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, "#fbbf24");
  grad.addColorStop(0.3, "#fef08a");
  grad.addColorStop(0.6, "#d97706");
  grad.addColorStop(1, "#b45309");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// High-Resolution Parchment Scripture Tablet Texture
function createScriptureTabletTexture(
  title: string,
  reference: string,
  quote: string,
  verseSubtitle: string
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d")!;

  // Aged Parchment Base
  const grad = ctx.createLinearGradient(0, 0, 512, 768);
  grad.addColorStop(0, "#fef3c7");
  grad.addColorStop(0.5, "#fae8b6");
  grad.addColorStop(1, "#fde68a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 768);

  // Subtle Parchment Noise
  for (let i = 0; i < 2500; i++) {
    const px = Math.random() * 512;
    const py = Math.random() * 768;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(180, 83, 9, 0.05)" : "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(px, py, 2, 2);
  }

  // Ancient Inscribed Border
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 10;
  ctx.strokeRect(16, 16, 480, 736);

  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 3;
  ctx.strokeRect(26, 26, 460, 716);

  // Header Motif / Crest
  ctx.fillStyle = "#78350f";
  ctx.font = "bold 22px serif";
  ctx.textAlign = "center";
  ctx.fillText("✦ ILLUMINATE BIBLE SERIES ✦", 256, 70);

  // Title
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 32px serif";
  ctx.fillText(title, 256, 125);

  // Decorative Divider
  ctx.strokeStyle = "#b45309";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 145);
  ctx.lineTo(432, 145);
  ctx.stroke();

  // Reference Banner
  ctx.fillStyle = "#b45309";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(reference, 256, 195);

  // Verbatim Scripture Text (Word-wrapped)
  ctx.fillStyle = "#0f172a";
  ctx.font = "italic 24px serif";
  ctx.textAlign = "center";

  const words = quote.split(" ");
  let line = "";
  let y = 255;
  const maxWidth = 410;
  const lineHeight = 34;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, 256, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 256, y);

  // Subtitle / Reflection
  if (verseSubtitle) {
    y += 50;
    ctx.fillStyle = "#451a03";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("CHRIST FOCUS / DOCTRINE", 256, y);

    y += 30;
    ctx.fillStyle = "#334155";
    ctx.font = "19px serif";
    const subWords = verseSubtitle.split(" ");
    let sLine = "";
    for (let s = 0; s < subWords.length; s++) {
      const test = sLine + subWords[s] + " ";
      if (ctx.measureText(test).width > maxWidth && s > 0) {
        ctx.fillText(sLine, 256, y);
        sLine = subWords[s] + " ";
        y += 28;
      } else {
        sLine = test;
      }
    }
    ctx.fillText(sLine, 256, y);
  }

  // Footer Copyright & Legacy
  ctx.fillStyle = "#78350f";
  ctx.font = "14px sans-serif";
  ctx.fillText("LifeStone Ministries · Scripture: NKJV · Press [E] to Listen", 256, 715);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

interface SolidObstacle {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  bottomY: number;
  topY: number;
  isBouncy?: boolean;
}

export const PlatformerEngine: React.FC<PlatformerEngineProps> = ({
  virtualInput,
  onGameStateChange,
  onReciteScripture,
  avatarName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const virtualInputRef = useRef(virtualInput);
  virtualInputRef.current = virtualInput;

  const gameStateRef = useRef<PlatformerGameState>({
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software rendering
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement("canvas").getContext("webgl2");
        if (!gl) return true;
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1c36);
    const sceneFog = new THREE.FogExp2(0x0e1c36, 0.005);
    scene.fog = sceneFog;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Expanded wide-angle camera for panoramic landscape view
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1200);
    camera.position.set(0, 10, 24);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // -----------------------------------------------------------------
    // DIRECTIONAL LIGHT COMPONENT & PS5 4096 SHADOW RIG
    // -----------------------------------------------------------------
    const sunKeyLight = new THREE.DirectionalLight(0xfffaed, 0.65);
    sunKeyLight.position.set(45, 80, 40);
    sunKeyLight.castShadow = !isSoftwareGl;
    if (sunKeyLight.shadow) {
      sunKeyLight.shadow.mapSize.width = 4096;
      sunKeyLight.shadow.mapSize.height = 4096;
      sunKeyLight.shadow.camera.near = 0.5;
      sunKeyLight.shadow.camera.far = 260;
      sunKeyLight.shadow.camera.left = -70;
      sunKeyLight.shadow.camera.right = 70;
      sunKeyLight.shadow.camera.top = 70;
      sunKeyLight.shadow.camera.bottom = -70;
      sunKeyLight.shadow.bias = -0.0004;
      sunKeyLight.shadow.normalBias = 0.02;
    }
    scene.add(sunKeyLight);

    const rimFillLight = new THREE.DirectionalLight(0x7dd3fc, 0.4);
    rimFillLight.position.set(-35, 45, -45);
    scene.add(rimFillLight);

    const ambientLight = new THREE.AmbientLight(0x93c5fd, 0.65);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x1e293b, 0.5);
    scene.add(hemiLight);

    // -----------------------------------------------------------------
    // PROCEDURAL PBR MATERIALS
    // -----------------------------------------------------------------
    const cobblestoneTex = createCobblestoneTexture();
    cobblestoneTex.repeat.set(4, 4);

    const grassTex = createLushGrassTexture();
    grassTex.repeat.set(5, 5);

    const goldTex = createGoldFoilTexture();

    const pbrCobbleMat = new THREE.MeshStandardMaterial({
      map: cobblestoneTex,
      roughness: 0.8,
      metalness: 0.1,
    });

    const pbrGrassMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.9,
      metalness: 0.05,
    });

    const pbrSandMat = new THREE.MeshStandardMaterial({
      color: 0xe2c68a,
      roughness: 0.9,
      metalness: 0.02,
    });

    const pbrGoldMat = new THREE.MeshStandardMaterial({
      map: goldTex,
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.18,
    });

    const pbrBrassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.88,
      roughness: 0.25,
    });

    const pbrLimestoneMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.75,
      metalness: 0.08,
    });

    // -----------------------------------------------------------------
    // JUNIOR ARCHAEOLOGIST ADVENTURER HERO AVATAR
    // Spawns safely high and dry at (0, 0.8, 14)
    // -----------------------------------------------------------------
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0.8, 14);

    const charSkinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.5 });
    const charJacketMat = new THREE.MeshStandardMaterial({ color: 0xb48c4a, roughness: 0.7 }); // Khaki Explorer Safari Jacket
    const charPantsMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 }); // Earth Field Trousers
    const charShirtMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 }); // Cream Linen Shirt
    const charLeatherMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.45 }); // Dark Leather Gear
    const charHatMat = new THREE.MeshStandardMaterial({ color: 0x9a7b4f, roughness: 0.8 }); // Explorer Fedora

    // Torso with Explorer Field Jacket
    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.82, 0.48), charJacketMat);
    torsoMesh.position.y = 0.9;
    torsoMesh.castShadow = !isSoftwareGl;
    playerGroup.add(torsoMesh);

    // Inner linen shirt & buttons
    const innerShirt = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.65), charShirtMat);
    innerShirt.position.set(0, 0.92, 0.25);
    playerGroup.add(innerShirt);

    for (let b = 0; b < 3; b++) {
      const button = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 8), pbrBrassMat);
      button.rotation.x = Math.PI / 2;
      button.position.set(0, 1.1 - b * 0.16, 0.26);
      playerGroup.add(button);
    }

    // Dual chest utility pockets
    const leftPocket = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.04), charJacketMat);
    leftPocket.position.set(-0.22, 1.05, 0.26);
    const rightPocket = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.04), charJacketMat);
    rightPocket.position.set(0.22, 1.05, 0.26);
    playerGroup.add(leftPocket, rightPocket);

    // Utility Belt & Brass Buckle
    const beltMesh = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.12, 0.52), charLeatherMat);
    beltMesh.position.set(0, 0.52, 0);
    const beltBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.04), pbrBrassMat);
    beltBuckle.position.set(0, 0.52, 0.27);
    playerGroup.add(beltMesh, beltBuckle);

    // Field Satchel / Pouch on hip
    const satchel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.14), charLeatherMat);
    satchel.position.set(-0.42, 0.5, 0.05);
    playerGroup.add(satchel);

    // Expedition Backpack on Back
    const packGroup = new THREE.Group();
    packGroup.position.set(0, 0.95, -0.32);

    const mainPack = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.68, 0.34), charLeatherMat);
    mainPack.castShadow = !isSoftwareGl;
    packGroup.add(mainPack);

    // Rolled Bedroll atop backpack
    const bedroll = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.64, 12), charHatMat);
    bedroll.rotation.z = Math.PI / 2;
    bedroll.position.set(0, 0.44, 0);
    packGroup.add(bedroll);

    // Metal Canteen on side of pack
    const canteen = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.26, 8), pbrBrassMat);
    canteen.position.set(0.32, -0.05, 0);
    packGroup.add(canteen);

    playerGroup.add(packGroup);

    // Head
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), charSkinMat);
    headMesh.position.y = 1.62;
    headMesh.castShadow = !isSoftwareGl;
    playerGroup.add(headMesh);

    // Eyes
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x1e3a8a });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeWhiteMat);
    leftEye.scale.set(0.8, 1.2, 0.4);
    leftEye.position.set(-0.13, 1.68, 0.34);
    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyePupilMat);
    leftPupil.position.set(-0.13, 1.68, 0.38);

    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeWhiteMat);
    rightEye.scale.set(0.8, 1.2, 0.4);
    rightEye.position.set(0.13, 1.68, 0.34);
    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyePupilMat);
    rightPupil.position.set(0.13, 1.68, 0.38);
    playerGroup.add(leftEye, leftPupil, rightEye, rightPupil);

    // Explorer Safari Fedora Hat
    const hatGroup = new THREE.Group();
    hatGroup.position.set(0, 1.88, 0);

    const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.32, 16), charHatMat);
    hatCrown.position.y = 0.12;

    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.72, 0.05, 20), charHatMat);
    hatBrim.position.y = -0.02;

    const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.402, 0.402, 0.08, 16), charLeatherMat);
    hatBand.position.y = 0.04;

    const hatBandBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.02), pbrBrassMat);
    hatBandBuckle.position.set(0, 0.04, 0.41);

    hatGroup.add(hatCrown, hatBrim, hatBand, hatBandBuckle);
    playerGroup.add(hatGroup);

    // Legs / Pants & Sturdy Explorer Boots
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.5, 8), charPantsMat);
    leftLeg.position.set(-0.22, 0.32, 0);
    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.5, 8), charPantsMat);
    rightLeg.position.set(0.22, 0.32, 0);

    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.42), charLeatherMat);
    leftBoot.position.set(-0.22, 0.12, 0.06);
    leftBoot.castShadow = !isSoftwareGl;
    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.42), charLeatherMat);
    rightBoot.position.set(0.22, 0.12, 0.06);
    rightBoot.castShadow = !isSoftwareGl;

    playerGroup.add(leftLeg, rightLeg, leftBoot, rightBoot);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.62, 8);
    const leftArm = new THREE.Mesh(armGeo, charJacketMat);
    leftArm.position.set(-0.54, 0.95, 0);

    const rightArm = new THREE.Mesh(armGeo, charJacketMat);
    rightArm.position.set(0.54, 0.95, 0.22);
    rightArm.rotation.x = -Math.PI / 3.4;
    playerGroup.add(leftArm, rightArm);

    // Detailed Antique Bronze Expedition Lantern
    const lanternRig = new THREE.Group();
    lanternRig.position.set(0.54, 0.65, 0.65);

    const lanternRoof = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.24, 6), pbrBrassMat);
    lanternRoof.position.y = 0.22;
    const lanternCage = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.34, 6), pbrBrassMat);
    const lanternGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.14, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: 0xffedd5, transparent: true, opacity: 0.65, roughness: 0.1 })
    );
    const lanternCore = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffe066 }));
    const lanternHalo = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.35, depthWrite: false })
    );

    const lanternLight = new THREE.PointLight(0xffd166, 6.5, 55, 1.0);
    lanternLight.castShadow = !isSoftwareGl;
    lanternRig.add(lanternRoof, lanternCage, lanternGlass, lanternCore, lanternHalo, lanternLight);
    playerGroup.add(lanternRig);

    // Ground contact glow
    const groundGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 4.2),
      new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.25, depthWrite: false })
    );
    groundGlow.rotateX(-Math.PI / 2);
    groundGlow.position.y = 0.05;
    playerGroup.add(groundGlow);

    // -----------------------------------------------------------------
    // 3D FLOATING GOLDEN QUEST ARROW (Above Adventurer's Head)
    // -----------------------------------------------------------------
    const questArrowGroup = new THREE.Group();
    questArrowGroup.position.set(0, 2.5, 0);

    const arrowShaft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.55), pbrGoldMat);
    arrowShaft.position.z = -0.15;

    const arrowHead = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.45, 4), pbrGoldMat);
    arrowHead.rotation.x = -Math.PI / 2;
    arrowHead.position.z = 0.32;

    const arrowFins = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.04, 0.18), pbrGoldMat);
    arrowFins.position.z = -0.38;

    const arrowGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.1),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    arrowGem.position.z = 0;

    questArrowGroup.add(arrowShaft, arrowHead, arrowFins, arrowGem);
    playerGroup.add(questArrowGroup);

    scene.add(playerGroup);

    // -----------------------------------------------------------------
    // WORLD OBJECTIVE BEACON & ROTATING PULSE RINGS
    // -----------------------------------------------------------------
    const objectiveBeaconGroup = new THREE.Group();
    const beaconCol = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.8, 35, 16),
      new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    beaconCol.position.y = 17.5;

    const ring1 = new THREE.Mesh(
      new THREE.RingGeometry(1.2, 1.45, 24),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    ring1.rotateX(-Math.PI / 2);
    ring1.position.y = 0.2;

    const ring2 = new THREE.Mesh(
      new THREE.RingGeometry(2.0, 2.3, 24),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
    );
    ring2.rotateX(-Math.PI / 2);
    ring2.position.y = 0.2;

    objectiveBeaconGroup.add(beaconCol, ring1, ring2);
    scene.add(objectiveBeaconGroup);

    // -----------------------------------------------------------------
    // ENVIRONMENT COLLIDERS & SOLID IMPENETRABLE OBSTACLES
    // -----------------------------------------------------------------
    const solidObstacles: SolidObstacle[] = [];

    const addSolidBox = (
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      mat: THREE.Material,
      isBouncy = false
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = !isSoftwareGl;
      mesh.castShadow = !isSoftwareGl;
      scene.add(mesh);
      solidObstacles.push({
        minX: x - w / 2,
        maxX: x + w / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2,
        bottomY: y - h / 2,
        topY: y + h / 2,
        isBouncy,
      });
      return mesh;
    };

    // --- ZONE 1: Dry Elevated Stone Pavement & Perimeter Boundaries ---
    addSolidBox(0, -0.5, 0, 52, 1, 52, pbrCobbleMat);

    // Boundary Perimeter Cliffs
    addSolidBox(0, 3, 26, 54, 6, 2, pbrCobbleMat); // South wall
    addSolidBox(-26, 3, 0, 2, 6, 54, pbrCobbleMat); // West wall
    addSolidBox(0, 3, -26, 54, 6, 2, pbrCobbleMat); // North wall

    // Internal Solid Courtyard Walls
    addSolidBox(-11, 2, 7, 2.5, 4, 22, pbrCobbleMat);
    addSolidBox(11, 2, -4, 2.5, 4, 22, pbrCobbleMat);
    addSolidBox(0, 2, -12, 18, 4, 2.5, pbrCobbleMat);
    addSolidBox(-5, 2, 9, 12, 4, 2.5, pbrCobbleMat);

    // -----------------------------------------------------------------
    // ANCIENT EDEN STONE ARCHES & HEBREW PILLARS
    // -----------------------------------------------------------------
    const createEdenArch = (x: number, y: number, z: number, rotationY = 0) => {
      const archGroup = new THREE.Group();
      archGroup.position.set(x, y, z);
      archGroup.rotation.y = rotationY;

      // Twin fluted pillars
      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 7.5, 16), pbrLimestoneMat);
      p1.position.set(-3.5, 3.75, 0);
      p1.castShadow = !isSoftwareGl;

      const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 7.5, 16), pbrLimestoneMat);
      p2.position.set(3.5, 3.75, 0);
      p2.castShadow = !isSoftwareGl;

      // Decorative capitals
      const cap1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 1.8), pbrLimestoneMat);
      cap1.position.set(-3.5, 7.7, 0);
      const cap2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 1.8), pbrLimestoneMat);
      cap2.position.set(3.5, 7.7, 0);

      // Curved Lintel & Keystone
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(9.4, 1.2, 1.6), pbrLimestoneMat);
      lintel.position.set(0, 8.4, 0);

      const keystone = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 1.8), pbrGoldMat);
      keystone.position.set(0, 8.5, 0);

      archGroup.add(p1, p2, cap1, cap2, lintel, keystone);
      scene.add(archGroup);

      // Colliders for the two arch posts
      solidObstacles.push({ minX: x - 4.5, maxX: x - 2.5, minZ: z - 1, maxZ: z + 1, bottomY: y, topY: y + 8 });
      solidObstacles.push({ minX: x + 2.5, maxX: x + 4.5, minZ: z - 1, maxZ: z + 1, bottomY: y, topY: y + 8 });
    };

    // Arch 1: Grand Entrance Archway (Start Plaza)
    createEdenArch(0, 0, 18, 0);
    // Arch 2: Chasm Archway (Leading to Day 1 Beacon)
    createEdenArch(0, 0, -14, 0);
    // Arch 3: Solomonic Gateway to Zone 2
    createEdenArch(24.5, 0, 0, Math.PI / 2);

    // Decorative Fluted Hebrew Columns along courtyards
    const columnCoords = [
      { x: -14, z: 14 },
      { x: 14, z: 14 },
      { x: -14, z: 0 },
      { x: 14, z: -8 },
      { x: -6, z: -16 },
      { x: 6, z: -16 },
    ];
    columnCoords.forEach((c) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 6.0, 12), pbrLimestoneMat);
      col.position.set(c.x, 3.0, c.z);
      col.castShadow = !isSoftwareGl;
      const capital = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 1.5), pbrLimestoneMat);
      capital.position.set(c.x, 6.2, c.z);
      scene.add(col, capital);
      solidObstacles.push({
        minX: c.x - 0.8,
        maxX: c.x + 0.8,
        minZ: c.z - 0.8,
        maxZ: c.z + 0.8,
        bottomY: 0,
        topY: 6.5,
      });
    });

    // -----------------------------------------------------------------
    // 5 STANDING SCRIPTURE STELES WITH HIGH-RES PARCHMENT TABLETS
    // -----------------------------------------------------------------
    interface ScriptureStele {
      name: string;
      passageTitle: string;
      reference: string;
      text: string;
      doctrine: string;
      position: THREE.Vector3;
      rotationY: number;
    }

    const scriptureSteles: ScriptureStele[] = [
      {
        name: "Genesis 1:1 Stele",
        passageTitle: "DAY 1 · CREATION DAWN",
        reference: "Genesis 1:1 & 2 Corinthians 4:6",
        text: "In the beginning God created the heavens and the earth. For it is the God who commanded light to shine out of darkness, who has shone in our hearts to give the light of the knowledge of the glory of God in the face of Jesus Christ.",
        doctrine: "Jesus Christ, the eternal Word, was present at the beginning! He is the true Light who shines in our darkness.",
        position: new THREE.Vector3(4.5, 0, 15),
        rotationY: -Math.PI / 5,
      },
      {
        name: "Psalm 33 Stele",
        passageTitle: "DAY 1 · THE POWER OF HIS WORD",
        reference: "Psalm 33:6, 9",
        text: "By the word of the Lord the heavens were made, and all the host of them by the breath of His mouth... For He spoke, and it was done; He commanded, and it stood fast.",
        doctrine: "God created everything from nothing merely by speaking His powerful word. When Jesus commanded the winds and sea, they obeyed Him!",
        position: new THREE.Vector3(-4.5, 0, 0),
        rotationY: Math.PI / 4,
      },
      {
        name: "Psalm 104 Stele",
        passageTitle: "DAY 2 · THE FIRMAMENT & SKIES",
        reference: "Psalm 104:24, 30",
        text: "O Lord, how manifold are Your works! In wisdom You have made them all. The earth is full of Your possessions. You send forth Your Spirit, they are created; and You renew the face of the earth.",
        doctrine: "The sky wedged itself between the waters on earth and the clouds sailing on the wind, displaying God's infinite wisdom.",
        position: new THREE.Vector3(-4.0, 7.5, -28),
        rotationY: 0,
      },
      {
        name: "John 1 Stele",
        passageTitle: "DAYS 3 & 4 · LIFE & LIGHT REVEALED",
        reference: "John 1:1-3, 5",
        text: "In the beginning was the Word, and the Word was with God, and the Word was God. He was in the beginning with God. All things were made through Him, and without Him nothing was made that was made.",
        doctrine: "Jesus is the Word of God who created all things. The sun, moon, and stars testify to His eternal glory.",
        position: new THREE.Vector3(74, 18.2, -18),
        rotationY: -Math.PI / 4,
      },
      {
        name: "Psalm 148 Stele",
        passageTitle: "DAY 5 · PRAISE FROM THE LIVING CREATION",
        reference: "Psalm 148:1, 7",
        text: "Praise the Lord! Praise the Lord from the heavens; praise Him in the heights! Praise the Lord from the earth, you great sea creatures and all the depths!",
        doctrine: "Whales splash in the seas and robins chirp songs of praise to our Savior and King!",
        position: new THREE.Vector3(25, 0.8, 44),
        rotationY: Math.PI / 3,
      },
    ];

    scriptureSteles.forEach((stele) => {
      const sGroup = new THREE.Group();
      sGroup.position.copy(stele.position);
      sGroup.rotation.y = stele.rotationY;

      // Stone Pedestal
      const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 1.4), pbrCobbleMat);
      baseMesh.position.y = 0.3;
      baseMesh.castShadow = !isSoftwareGl;

      // Standing Stone Frame
      const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.2, 0.4), pbrLimestoneMat);
      frameMesh.position.y = 2.1;
      frameMesh.castShadow = !isSoftwareGl;

      // Inscribed Parchment Tablet Surface
      const tabletTex = createScriptureTabletTexture(
        stele.passageTitle,
        stele.reference,
        stele.text,
        stele.doctrine
      );
      const tabletMat = new THREE.MeshStandardMaterial({
        map: tabletTex,
        roughness: 0.7,
        metalness: 0.1,
      });

      const tabletMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.7), tabletMat);
      tabletMesh.position.set(0, 2.1, 0.21);

      // Golden Header Crest
      const crestMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.25), pbrGoldMat);
      crestMesh.position.set(0, 3.85, 0);

      sGroup.add(baseMesh, frameMesh, tabletMesh, crestMesh);
      scene.add(sGroup);

      // Solid collision for the stele
      solidObstacles.push({
        minX: stele.position.x - 1.2,
        maxX: stele.position.x + 1.2,
        minZ: stele.position.z - 0.8,
        maxZ: stele.position.z + 0.8,
        bottomY: stele.position.y,
        topY: stele.position.y + 3.8,
      });
    });

    // -----------------------------------------------------------------
    // PUZZLE 1: DUAL PUSH-BLOCKS (ZONE 1) WITH SOLID IMPENETRABLE PHYSICS
    // -----------------------------------------------------------------
    const block1Mesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 2.0), pbrCobbleMat);
    block1Mesh.position.set(-6, 1.0, 7);
    block1Mesh.castShadow = !isSoftwareGl;
    const block1Glyph = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, 0.8, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.6 })
    );
    block1Mesh.add(block1Glyph);
    scene.add(block1Mesh);

    const block2Mesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 2.0), pbrCobbleMat);
    block2Mesh.position.set(6, 1.0, 7);
    block2Mesh.castShadow = !isSoftwareGl;
    const block2Glyph = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, 0.8, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 0.6 })
    );
    block2Mesh.add(block2Glyph);
    scene.add(block2Mesh);

    // Floor Sockets for the blocks
    const socket1Mesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.15, 2.5),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.5 })
    );
    socket1Mesh.position.set(-6, 0.08, -1);
    scene.add(socket1Mesh);

    const socket2Mesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.15, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 0.5 })
    );
    socket2Mesh.position.set(6, 0.08, -1);
    scene.add(socket2Mesh);

    // Rising Stone Bridge (activates when both blocks are slotted)
    const bridgeMesh = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 6), pbrCobbleMat);
    bridgeMesh.position.set(0, -2.0, -18);
    scene.add(bridgeMesh);

    // Central ancient beacon ("Let There Be Light" trigger)
    const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.4, 1.4, 12), pbrCobbleMat);
    beaconBase.position.set(0, 0.7, 0);

    const beaconCrystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.2),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 1.6,
        roughness: 0.1,
      })
    );
    beaconCrystal.position.set(0, 2.2, 0);

    const beaconBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1.6, 45, 16),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    beaconBeam.position.set(0, 22.5, 0);

    const beaconLight = new THREE.PointLight(0x38bdf8, 5.0, 40, 1.0);
    beaconLight.position.set(0, 2.6, 0);
    scene.add(beaconBase, beaconCrystal, beaconBeam, beaconLight);

    // PUZZLE 2: Portcullis Gate to Zone 2
    const portcullisMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 8.0, 8.0),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
    );
    portcullisMesh.position.set(24.5, 3.5, 0);
    scene.add(portcullisMesh);
    const gateCollider = { minX: 23.8, maxX: 25.2, minZ: -4.2, maxZ: 4.2, bottomY: 0, topY: 8 };
    solidObstacles.push(gateCollider);

    // Physical Lever Rig
    const leverBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), pbrBrassMat);
    leverBase.position.set(22, 0.3, 3);
    const leverHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8), pbrGoldMat);
    leverHandle.position.set(22, 0.9, 3);
    leverHandle.rotation.z = 0.4;
    scene.add(leverBase, leverHandle);

    // -----------------------------------------------------------------
    // 3D ADVENTURER COLLECTIBLE PUZZLE ITEMS & CRACKED ORE BARRIER
    // -----------------------------------------------------------------
    // 1. Bronze Temple Key (on ancient pedestal in Zone 1)
    const keyGroup = new THREE.Group();
    keyGroup.position.set(-9, 1.2, 6);
    const keyPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.85, 1.2, 8), pbrLimestoneMat);
    keyPedestal.position.y = -0.6;
    keyPedestal.castShadow = !isSoftwareGl;
    keyGroup.add(keyPedestal);

    const keyBow = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.06, 8, 16), pbrGoldMat);
    keyBow.position.y = 0.45;
    const keyStem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.55, 8), pbrGoldMat);
    keyStem.position.y = 0.15;
    const keyBit = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.15), pbrGoldMat);
    keyBit.position.set(0, -0.05, 0.08);
    const keyHalo = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.35, depthWrite: false })
    );
    keyHalo.position.y = 0.3;
    keyGroup.add(keyBow, keyStem, keyBit, keyHalo);
    scene.add(keyGroup);

    // 2. Archaeologist's Pickaxe (in expedition cache near Zone 2 entrance)
    const pickaxeGroup = new THREE.Group();
    pickaxeGroup.position.set(36, 2.2, -8);
    const pickCrate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.2), pbrSandMat);
    pickCrate.position.y = -0.4;
    pickCrate.castShadow = !isSoftwareGl;
    pickaxeGroup.add(pickCrate);

    const pickHaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.1, 8), pbrBrassMat);
    pickHaft.rotation.z = Math.PI / 4;
    const pickHead = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.7, 4),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
    );
    pickHead.rotation.z = -Math.PI / 4;
    pickHead.position.set(0.35, 0.35, 0);
    pickaxeGroup.add(pickHaft, pickHead);
    scene.add(pickaxeGroup);

    // 3. Sacred Oil Flask (in ancient Eden olive grove)
    const oilFlaskGroup = new THREE.Group();
    oilFlaskGroup.position.set(52, 2.5, 12);
    const flaskPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 0.8, 8), pbrLimestoneMat);
    flaskPedestal.position.y = -0.4;
    oilFlaskGroup.add(flaskPedestal);

    const flaskBody = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.45 }));
    const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.32, 8), pbrBrassMat);
    flaskNeck.position.y = 0.32;
    oilFlaskGroup.add(flaskBody, flaskNeck);
    scene.add(oilFlaskGroup);

    // 4. Scripture Scroll Seal (at Eden stele podium)
    const scrollSealGroup = new THREE.Group();
    scrollSealGroup.position.set(10, 1.5, -10);
    const scrollPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 0.8, 8), pbrLimestoneMat);
    scrollPedestal.position.y = -0.4;
    scrollSealGroup.add(scrollPedestal);

    const scrollRoll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.65, 10),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.8 })
    );
    scrollRoll.rotation.z = Math.PI / 2;
    const waxSeal = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 8), new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 }));
    waxSeal.position.set(0, 0, 0.11);
    scrollSealGroup.add(scrollRoll, waxSeal);
    scene.add(scrollSealGroup);

    // 5. Cracked Ore Boulder (Blocking mountain summit path - requires Pickaxe)
    const boulderMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.85,
      metalness: 0.15,
    });
    const boulderMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1.85), boulderMat);
    boulderMesh.position.set(69, 2.8, -14);
    boulderMesh.castShadow = !isSoftwareGl;
    const crystalVein = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 2.2, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.5 })
    );
    boulderMesh.add(crystalVein);
    scene.add(boulderMesh);

    const boulderCollider = { minX: 67.2, maxX: 70.8, minZ: -15.8, maxZ: -12.2, bottomY: 0, topY: 5.5 };
    solidObstacles.push(boulderCollider);

    // 6. Ambient Divine Golden Dust Particles (PS5-Grade Atmosphere)
    const dustCount = 180;
    const dustGeo = new THREE.BufferGeometry();
    const dustCoords = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustCoords[i * 3] = (Math.random() - 0.5) * 55;
      dustCoords[i * 3 + 1] = Math.random() * 14 + 0.5;
      dustCoords[i * 3 + 2] = (Math.random() - 0.5) * 55;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustCoords, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.32,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);


    // PUZZLE 4: Bouncing Cloud Staircase to Day 2 Sky Switch
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      transparent: true,
      opacity: 0.94,
    });
    for (let c = 0; c < 7; c++) {
      const stepY = c * 1.5 + 1;
      const stepZ = -18 - c * 2.8;
      const stepX = Math.sin(c * 0.8) * 3;
      addSolidBox(stepX, stepY, stepZ, 4.2, 0.8, 3.6, cloudMat, true);
    }

    const skySwitchMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.1, 0.45, 16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 })
    );
    skySwitchMesh.position.set(Math.sin(6 * 0.8) * 3, 6 * 1.5 + 1.8, -18 - 6 * 2.8);
    scene.add(skySwitchMesh);

    // Atmosphere Firmament Wedge
    const skyWedgeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(280, 280),
      new THREE.MeshBasicMaterial({
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
      })
    );
    skyWedgeMesh.rotateX(-Math.PI / 2);
    skyWedgeMesh.position.set(0, 18, 0);
    scene.add(skyWedgeMesh);

    // --- ZONE 2: Confined Water Basin & Emergent Dry Land ---
    const waterBasinGeo = new THREE.PlaneGeometry(50, 55);
    waterBasinGeo.rotateX(-Math.PI / 2);
    const waterBasinMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.08,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const waterBasinMesh = new THREE.Mesh(waterBasinGeo, waterBasinMat);
    waterBasinMesh.position.set(55, 2.0, -2);
    scene.add(waterBasinMesh);

    const dryLandGroup = new THREE.Group();
    const mainLandMesh = new THREE.Mesh(new THREE.BoxGeometry(48, 3.5, 52), pbrSandMat);
    mainLandMesh.position.set(55, -1.8, -2);
    mainLandMesh.receiveShadow = !isSoftwareGl;
    dryLandGroup.add(mainLandMesh);
    scene.add(dryLandGroup);

    // PUZZLE 3: Color-Matched Pressure Plates (Zone 2)
    const plateCoords = [
      { name: "Ruby", color: 0xef4444, x: 38, y: 1.2, z: -12 },
      { name: "Emerald", color: 0x10b981, x: 55, y: 1.2, z: -15 },
      { name: "Sapphire", color: 0x3b82f6, x: 68, y: 1.2, z: 8 },
    ];
    const plateMeshes: THREE.Mesh[] = [];
    plateCoords.forEach((p) => {
      const pMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(1.3, 1.5, 0.4, 16),
        new THREE.MeshStandardMaterial({ color: p.color, emissive: p.color, emissiveIntensity: 0.7 })
      );
      pMesh.position.set(p.x, p.y, p.z);
      scene.add(pMesh);
      plateMeshes.push(pMesh);
    });

    // 3 Glowing Seeds
    const seedCoords = [
      { x: 42, z: 2 },
      { x: 62, z: 6 },
      { x: 50, z: -10 },
    ];
    const seedMeshes: THREE.Mesh[] = [];
    seedCoords.forEach((s) => {
      const sMesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.4),
        new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xf59e0b,
          emissiveIntensity: 1.2,
          roughness: 0.1,
        })
      );
      sMesh.position.set(s.x, 2.5, s.z);
      scene.add(sMesh);
      seedMeshes.push(sMesh);
    });

    // Fertile Garden Plot
    const fertilePlot = new THREE.Mesh(
      new THREE.CylinderGeometry(3.8, 4.2, 0.45, 16),
      new THREE.MeshStandardMaterial({ color: 0x3f2e18, roughness: 0.95 })
    );
    fertilePlot.position.set(65, 2.2, -4);
    scene.add(fertilePlot);

    // Forest Group
    const forestGroup = new THREE.Group();
    const treeMatTrunk = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    for (let t = 0; t < 10; t++) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 3.8, 8), treeMatTrunk);
      trunk.position.y = 1.9;
      trunk.castShadow = !isSoftwareGl;

      const canopyGroup = new THREE.Group();
      canopyGroup.position.y = 4.6;
      for (let s = 0; s < 4; s++) {
        const leafBall = new THREE.Mesh(new THREE.SphereGeometry(1.4, 10, 10), pbrGrassMat);
        const ang = (s / 4) * Math.PI * 2;
        leafBall.position.set(Math.cos(ang) * 0.7, (s % 2) * 0.5, Math.sin(ang) * 0.7);
        leafBall.castShadow = !isSoftwareGl;
        canopyGroup.add(leafBall);
      }
      tree.add(trunk, canopyGroup);

      const angle = (t / 10) * Math.PI * 2;
      tree.position.set(65 + Math.cos(angle) * 6, 2.2, -4 + Math.sin(angle) * 6);
      tree.scale.set(0.001, 0.001, 0.001);
      forestGroup.add(tree);
    }
    scene.add(forestGroup);

    // High Mountain Peak
    const peakMesh = new THREE.Mesh(new THREE.ConeGeometry(15, 24, 10), pbrCobbleMat);
    peakMesh.position.set(78, 10, -18);
    peakMesh.castShadow = !isSoftwareGl;
    peakMesh.receiveShadow = !isSoftwareGl;
    scene.add(peakMesh);
    solidObstacles.push({ minX: 70, maxX: 86, minZ: -26, maxZ: -10, bottomY: 0, topY: 18.2 });

    // Altars on Summit
    const altarCoords = [
      { name: "sun", color: 0xf59e0b, offset: -2 },
      { name: "moon", color: 0xf4f1de, offset: 0 },
      { name: "stars", color: 0x60a5fa, offset: 2 },
    ];
    altarCoords.forEach((a) => {
      const aMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.95, 1.4, 10),
        new THREE.MeshStandardMaterial({ color: a.color, emissive: a.color, emissiveIntensity: 0.6 })
      );
      aMesh.position.set(78 + a.offset * 1.9, 18.8, -18);
      aMesh.castShadow = !isSoftwareGl;
      scene.add(aMesh);
    });

    // Celestial Sky Group
    const celestialGroup = new THREE.Group();
    const celestialSun = new THREE.Mesh(new THREE.SphereGeometry(6.5, 20, 20), new THREE.MeshBasicMaterial({ color: 0xffd152 }));
    celestialSun.position.set(90, 52, -40);

    const celestialMoon = new THREE.Mesh(new THREE.SphereGeometry(3.8, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfdfaf0 }));
    celestialMoon.position.set(10, 48, -60);

    const starsBuffGeo = new THREE.BufferGeometry();
    const starCoords: number[] = [];
    for (let s = 0; s < 180; s++) {
      starCoords.push(
        (Math.random() - 0.5) * 300,
        Math.random() * 90 + 30,
        -Math.random() * 160 - 20
      );
    }
    starsBuffGeo.setAttribute("position", new THREE.Float32BufferAttribute(starCoords, 3));
    const starsPoints = new THREE.Points(
      starsBuffGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 1.1, transparent: true, opacity: 0.95 })
    );
    celestialGroup.add(celestialSun, celestialMoon, starsPoints);
    celestialGroup.visible = false;
    scene.add(celestialGroup);

    // --- ZONE 3: Coastal Biome & Living Creatures ---
    addSolidBox(50, -6, 52, 60, 10, 46, new THREE.MeshStandardMaterial({ color: 0x0f344d, roughness: 0.85 }));

    const coastalWater = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 46),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.08, transparent: true, opacity: 0.78 })
    );
    coastalWater.rotateX(-Math.PI / 2);
    coastalWater.position.set(50, 0, 52);
    scene.add(coastalWater);

    addSolidBox(25, 0.8, 52, 18, 2.6, 44, pbrSandMat);
    addSolidBox(45, 4, 70, 22, 8, 14, pbrCobbleMat);

    // Living Creatures
    const whaleGroup = new THREE.Group();
    const whaleBody = new THREE.Mesh(new THREE.ConeGeometry(2.4, 8.5, 12), new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.35 }));
    whaleBody.rotation.z = Math.PI / 2;
    const whaleFin = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.0, 1.4), new THREE.MeshStandardMaterial({ color: 0x1e3a5f }));
    whaleFin.position.set(0, 1.6, 0);
    whaleGroup.add(whaleBody, whaleFin);
    whaleGroup.position.set(60, -1.2, 52);
    scene.add(whaleGroup);

    const fishGroup = new THREE.Group();
    const fishMesh = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 10), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 }));
    fishMesh.scale.set(1.4, 0.85, 0.35);
    fishGroup.add(fishMesh);
    fishGroup.position.set(52, -3.5, 48);
    scene.add(fishGroup);

    const robinGroup = new THREE.Group();
    const robinBody = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 10), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 }));
    robinGroup.add(robinBody);
    robinGroup.position.set(45, 15.0, 70);
    scene.add(robinGroup);

    const seagullGroup = new THREE.Group();
    const gBody = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.0, 8), new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.5 }));
    gBody.rotation.x = Math.PI / 2;
    seagullGroup.add(gBody);
    seagullGroup.position.set(30, 2.2, 46);
    scene.add(seagullGroup);

    // Wonder Star Coins
    const coinLocations = [
      { x: -5, y: 1.5, z: 12 },
      { x: 5, y: 1.5, z: 12 },
      { x: 0, y: 1.5, z: 4 },
      { x: -8, y: 1.5, z: -5 },
      { x: 8, y: 1.5, z: -5 },
      { x: 0, y: 1.5, z: -10 },
      { x: 18, y: 1.5, z: 0 },
      { x: 38, y: 2.2, z: 0 },
      { x: 55, y: 2.5, z: 4 },
      { x: 72, y: 8.0, z: -14 },
      { x: 78, y: 19.5, z: -18 },
      { x: 30, y: 2.5, z: 40 },
    ];
    const coinMeshes: THREE.Mesh[] = [];
    coinLocations.forEach((c) => {
      const cMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 12), pbrGoldMat);
      cMesh.rotation.x = Math.PI / 2;
      cMesh.position.set(c.x, c.y, c.z);
      scene.add(cMesh);
      coinMeshes.push(cMesh);
    });

    // -----------------------------------------------------------------
    // INPUT HANDLING & VISTA CAMERA MOUSE / WHEEL CONTROLS
    // -----------------------------------------------------------------
    const keys: Record<string, boolean> = {};


    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key === " " || e.code === "Space") e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let isMouseDown = false;
    let prevMouseX = 0;
    let cameraYaw = Math.PI; // Face forward down the initial path
    let cameraPitch = 0.42; // Elevated angle for expansive PS5 vista
    let camDist = 18.5; // Zoomed-out panoramic vista

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDown = true;
        prevMouseX = e.clientX;
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseDown) {
        const deltaX = e.clientX - prevMouseX;
        prevMouseX = e.clientX;
        cameraYaw -= deltaX * 0.005;
      }
    };
    const handleMouseUp = () => {
      isMouseDown = false;
    };
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Smooth panoramic zoom: 12.0 (close) to 26.0 (entire landscape)
      camDist = THREE.MathUtils.clamp(camDist + e.deltaY * 0.015, 12.0, 26.0);
    };

    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    renderer.domElement.addEventListener("wheel", handleWheel, { passive: false });

    // -----------------------------------------------------------------
    // OBJECTIVE TARGET LOOKUP (Controls 3D Quest Arrow & Beacon)
    // -----------------------------------------------------------------
    const getActiveObjectiveTarget = (): { pos: THREE.Vector3; label: string } => {
      const s = gameStateRef.current;
      if (s.currentZone === 1) {
        if (!s.inventory.templeKey) {
          return { pos: new THREE.Vector3(-9, 1.2, 6), label: "Collect Bronze Temple Key" };
        }
        if (!s.bridgeRaised) {
          const b1In = block1Mesh.position.distanceTo(socket1Mesh.position) < 1.4;
          const targetBlock = b1In ? block2Mesh : block1Mesh;
          return { pos: targetBlock.position, label: "Grab & Push/Pull Stone Block to Socket" };
        }
        if (!s.hasSpokenLight) {
          return { pos: new THREE.Vector3(0, 1.2, 0), label: "Light Beacon (Day 1)" };
        }
        if (!s.gateOpened) {
          return { pos: new THREE.Vector3(24.5, 2.0, 0), label: "Unlock Ancient Portcullis" };
        }
        if (!s.hasPressedSkySwitch) {
          return {
            pos: new THREE.Vector3(Math.sin(6 * 0.8) * 3, 6 * 1.5 + 1.8, -18 - 6 * 2.8),
            label: "Day 2 Sky Switch",
          };
        }
        return { pos: new THREE.Vector3(24.5, 2.0, 0), label: "Zone 2 Gateway" };
      } else if (s.currentZone === 2) {
        if (!s.watersParted) {
          if (!s.pressurePlatesPressed[0]) return { pos: new THREE.Vector3(38, 1.2, -12), label: "Ruby Plate" };
          if (!s.pressurePlatesPressed[1]) return { pos: new THREE.Vector3(55, 1.2, -15), label: "Emerald Plate" };
          return { pos: new THREE.Vector3(68, 1.2, 8), label: "Sapphire Plate" };
        }
        if (!s.inventory.pickaxe) {
          return { pos: new THREE.Vector3(36, 2.2, -8), label: "Take Archaeologist's Pickaxe" };
        }
        if (!s.boulderShattered) {
          return { pos: new THREE.Vector3(69, 2.8, -14), label: "Shatter Ore Boulder with Pickaxe" };
        }
        if (!s.forestSprouted) {
          return { pos: new THREE.Vector3(65, 2.2, -4), label: "Plant Green Forest" };
        }
        if (!s.altarsActivated) {
          return { pos: new THREE.Vector3(78, 19.0, -18), label: "Summit Altars (Day 4)" };
        }
        return { pos: new THREE.Vector3(45, 2.0, 35), label: "Zone 3 Coastline" };
      } else {
        if (!s.creaturesFound.whale) return { pos: new THREE.Vector3(60, 0, 52), label: "Breaching Whale" };
        if (!s.creaturesFound.fish) return { pos: new THREE.Vector3(52, -2.0, 48), label: "Reef Fish" };
        if (!s.creaturesFound.robin) return { pos: new THREE.Vector3(45, 15.0, 70), label: "Chirping Robin" };
        return { pos: new THREE.Vector3(30, 2.2, 46), label: "Dancing Seagull" };
      }
    };

    // -----------------------------------------------------------------
    // PHYSICS LOOP: PUSH/PULL BLOCK GRAB, SOUNDS & AUTO-CHASE CAMERA
    // -----------------------------------------------------------------
    const playerVel = new THREE.Vector3(0, 0, 0);
    let isGrounded = false;
    let isSwimming = false;
    let playerFacing = 0;
    let walkAnimTime = 0;
    let squashY = 1.0;

    // Grab State
    let grabbedBlockIndex: number | null = null;
    let grabSide: "north" | "south" | "east" | "west" = "south";
    let wasInteractPressed = false;
    let stepCadenceTimer = 0;
    let isPushingRumble = false;

    const clock = new THREE.Clock();
    let frameId = 0;

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.08);
      const time = clock.getElapsedTime();

      // Rotate wonder star coins and collectibles
      coinMeshes.forEach((cm, idx) => {
        if (cm.visible) {
          cm.rotation.z += dt * 3.0;
          cm.position.y = coinLocations[idx].y + Math.sin(time * 3 + idx) * 0.15;
        }
      });

      if (keyGroup.visible) {
        keyBow.rotation.y = time * 2.5;
        keyStem.rotation.y = time * 2.5;
        keyBit.rotation.y = time * 2.5;
        keyGroup.position.y = 1.2 + Math.sin(time * 3) * 0.15;
      }

      if (pickaxeGroup.visible) {
        pickaxeGroup.rotation.y = Math.sin(time * 2) * 0.2;
      }

      if (oilFlaskGroup.visible) {
        oilFlaskGroup.position.y = 2.5 + Math.sin(time * 2.5) * 0.1;
      }

      if (scrollSealGroup.visible) {
        scrollSealGroup.position.y = 1.5 + Math.sin(time * 2.8) * 0.1;
      }

      // Update 3D Floating Quest Arrow & Objective Beacon
      const activeObj = getActiveObjectiveTarget();
      objectiveBeaconGroup.position.set(activeObj.pos.x, activeObj.pos.y, activeObj.pos.z);
      ring1.rotation.z = time * 1.5;
      ring2.rotation.z = -time * 1.0;

      // Calculate arrow angle towards active objective
      const arrowDx = activeObj.pos.x - playerGroup.position.x;
      const arrowDz = activeObj.pos.z - playerGroup.position.z;
      const targetYaw = Math.atan2(arrowDx, arrowDz) - playerGroup.rotation.y;

      questArrowGroup.rotation.y = THREE.MathUtils.damp(questArrowGroup.rotation.y, targetYaw, 12, dt);
      questArrowGroup.position.y = 2.4 + Math.sin(time * 4) * 0.12;

      // Combine Virtual Input & Keyboard
      let inputX = virtualInputRef.current.moveX;
      let inputZ = virtualInputRef.current.moveZ;
      const wantJump = virtualInputRef.current.isJumping || keys[" "] || keys["space"];
      const wantInteract = virtualInputRef.current.isInteracting || keys["e"] || keys["enter"];
      const interactJustPressed = wantInteract && !wasInteractPressed;
      wasInteractPressed = !!wantInteract;

      if (keys["w"] || keys["arrowup"]) inputZ -= 1;
      if (keys["s"] || keys["arrowdown"]) inputZ += 1;
      if (keys["a"] || keys["arrowleft"]) inputX -= 1;
      if (keys["d"] || keys["arrowright"]) inputX += 1;

      const inputLen = Math.sqrt(inputX * inputX + inputZ * inputZ);
      if (inputLen > 1) {
        inputX /= inputLen;
        inputZ /= inputLen;
      }

      if (inputLen > 0.05 && !gameStateRef.current.hasPlayerMoved) {
        gameStateRef.current.hasPlayerMoved = true;
      }

      // Check if swimming in coastal water trench (Zone 3 only)
      const isInZone3Water =
        playerGroup.position.x >= 25 &&
        playerGroup.position.x <= 75 &&
        playerGroup.position.z >= 30 &&
        playerGroup.position.z <= 70 &&
        playerGroup.position.y <= 0.6;

      isSwimming = isInZone3Water;

      // Camera-relative movement
      const forward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw)).normalize();
      const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw)).normalize();

      const moveDir = new THREE.Vector3()
        .addScaledVector(right, inputX)
        .addScaledVector(forward, -inputZ);

      const moveSpeed = isSwimming ? 6.2 : 9.8;

      if (moveDir.lengthSq() > 0.01) {
        playerVel.x = THREE.MathUtils.damp(playerVel.x, moveDir.x * moveSpeed, 12, dt);
        playerVel.z = THREE.MathUtils.damp(playerVel.z, moveDir.z * moveSpeed, 12, dt);
        if (grabbedBlockIndex === null) {
          playerFacing = Math.atan2(moveDir.x, moveDir.z);
          playerGroup.rotation.y = THREE.MathUtils.damp(playerGroup.rotation.y, playerFacing, 15, dt);
          leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0, 10, dt);
          rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, -Math.PI / 3.4, 10, dt);
        }
        walkAnimTime += dt * 11;
        playerGroup.rotation.z = THREE.MathUtils.damp(playerGroup.rotation.z, -inputX * 0.12, 10, dt);

        // Footstep audio cadence
        if (isGrounded) {
          stepCadenceTimer += dt;
          if (stepCadenceTimer > 0.32) {
            stepCadenceTimer = 0;
            const surface = playerGroup.position.y > 6 ? "cloud" : playerGroup.position.x > 30 ? "earth" : "stone";
            soundEngine.playFootstep(surface);
          }
        }
      } else {
        playerVel.x = THREE.MathUtils.damp(playerVel.x, 0, 15, dt);
        playerVel.z = THREE.MathUtils.damp(playerVel.z, 0, 15, dt);
        playerGroup.rotation.z = THREE.MathUtils.damp(playerGroup.rotation.z, 0, 10, dt);
        stepCadenceTimer = 0.28;
      }

      // Gravity & Jumping / Swimming
      if (isSwimming) {
        if (wantJump) {
          playerVel.y = 4.8;
        } else {
          playerVel.y = THREE.MathUtils.damp(playerVel.y, -0.6, 6, dt);
        }
      } else {
        playerVel.y -= 26 * dt;
        if (isGrounded && wantJump) {
          playerVel.y = 11.8;
          isGrounded = false;
          squashY = 1.25;
          soundEngine.playJumpSound();
          if (grabbedBlockIndex !== null) {
            grabbedBlockIndex = null;
            soundEngine.stopBlockPushRumble();
            isPushingRumble = false;
          }
        }
      }

      squashY = THREE.MathUtils.damp(squashY, 1.0, 10, dt);
      playerGroup.scale.set(1.0 / Math.sqrt(squashY), squashY, 1.0 / Math.sqrt(squashY));

      const playerRadius = 0.48;
      const playerHeight = 1.8;

      // -------------------------------------------------------------
      // INTERACTIVE GRAB-TO-PUSH-AND-PULL SOLID BLOCK MECHANIC
      // -------------------------------------------------------------
      const blocks = [
        { mesh: block1Mesh, socket: socket1Mesh, halfW: 1.0, halfD: 1.0 },
        { mesh: block2Mesh, socket: socket2Mesh, halfW: 1.0, halfD: 1.0 },
      ];

      let isMovingBlockThisFrame = false;

      // Check proximity to toggle grab
      for (let idx = 0; idx < blocks.length; idx++) {
        const b = blocks[idx];
        const inSocket = b.mesh.position.distanceTo(b.socket.position) < 1.4;
        const distToBlock = playerGroup.position.distanceTo(b.mesh.position);

        if (!inSocket && distToBlock < 2.5) {
          if (grabbedBlockIndex === null) {
            if (interactJustPressed) {
              grabbedBlockIndex = idx;
              const dx = playerGroup.position.x - b.mesh.position.x;
              const dz = playerGroup.position.z - b.mesh.position.z;
              if (Math.abs(dz) > Math.abs(dx)) {
                grabSide = dz > 0 ? "south" : "north";
              } else {
                grabSide = dx > 0 ? "east" : "west";
              }
              soundEngine.playItemCollectFanfare();
            }
          } else if (grabbedBlockIndex === idx) {
            if (interactJustPressed) {
              grabbedBlockIndex = null;
              soundEngine.stopBlockPushRumble();
              isPushingRumble = false;
            }
          }
        }
      }

      // Handle Grabbed Block Movement (Push & Pull)
      if (grabbedBlockIndex !== null) {
        const b = blocks[grabbedBlockIndex];
        const inSocket = b.mesh.position.distanceTo(b.socket.position) < 1.4;

        if (inSocket) {
          grabbedBlockIndex = null;
          soundEngine.stopBlockPushRumble();
          isPushingRumble = false;
          soundEngine.playCorrectSound();
        } else {
          // Pose explorer arms forward onto block
          leftArm.rotation.x = -Math.PI / 2.2;
          rightArm.rotation.x = -Math.PI / 2.2;

          const dragSpeed = 4.2;

          if (grabSide === "south") {
            playerFacing = Math.PI; // Face North towards block
            playerGroup.rotation.y = Math.PI;

            // Move along Z (push North, pull South)
            if (Math.abs(moveDir.z) > 0.15) {
              const deltaZ = moveDir.z * dragSpeed * dt;
              const nextBlockZ = THREE.MathUtils.clamp(b.mesh.position.z + deltaZ, -13.5, 17.5);
              b.mesh.position.z = nextBlockZ;
              playerGroup.position.z = nextBlockZ + (b.halfD + playerRadius);
              playerGroup.position.x = THREE.MathUtils.damp(playerGroup.position.x, b.mesh.position.x, 15, dt);
              isMovingBlockThisFrame = true;
            } else {
              playerGroup.position.z = b.mesh.position.z + (b.halfD + playerRadius);
            }
          } else if (grabSide === "north") {
            playerFacing = 0; // Face South towards block
            playerGroup.rotation.y = 0;

            if (Math.abs(moveDir.z) > 0.15) {
              const deltaZ = moveDir.z * dragSpeed * dt;
              const nextBlockZ = THREE.MathUtils.clamp(b.mesh.position.z + deltaZ, -13.5, 17.5);
              b.mesh.position.z = nextBlockZ;
              playerGroup.position.z = nextBlockZ - (b.halfD + playerRadius);
              playerGroup.position.x = THREE.MathUtils.damp(playerGroup.position.x, b.mesh.position.x, 15, dt);
              isMovingBlockThisFrame = true;
            } else {
              playerGroup.position.z = b.mesh.position.z - (b.halfD + playerRadius);
            }
          } else if (grabSide === "east") {
            playerFacing = -Math.PI / 2; // Face West towards block
            playerGroup.rotation.y = -Math.PI / 2;

            if (Math.abs(moveDir.x) > 0.15) {
              const deltaX = moveDir.x * dragSpeed * dt;
              const nextBlockX = THREE.MathUtils.clamp(b.mesh.position.x + deltaX, -13.5, 13.5);
              b.mesh.position.x = nextBlockX;
              playerGroup.position.x = nextBlockX + (b.halfW + playerRadius);
              playerGroup.position.z = THREE.MathUtils.damp(playerGroup.position.z, b.mesh.position.z, 15, dt);
              isMovingBlockThisFrame = true;
            } else {
              playerGroup.position.x = b.mesh.position.x + (b.halfW + playerRadius);
            }
          } else if (grabSide === "west") {
            playerFacing = Math.PI / 2; // Face East towards block
            playerGroup.rotation.y = Math.PI / 2;

            if (Math.abs(moveDir.x) > 0.15) {
              const deltaX = moveDir.x * dragSpeed * dt;
              const nextBlockX = THREE.MathUtils.clamp(b.mesh.position.x + deltaX, -13.5, 13.5);
              b.mesh.position.x = nextBlockX;
              playerGroup.position.x = nextBlockX - (b.halfW + playerRadius);
              playerGroup.position.z = THREE.MathUtils.damp(playerGroup.position.z, b.mesh.position.z, 15, dt);
              isMovingBlockThisFrame = true;
            } else {
              playerGroup.position.x = b.mesh.position.x - (b.halfW + playerRadius);
            }
          }
        }
      }

      // Impenetrable Box Separation on all blocks
      for (const b of blocks) {
        if (grabbedBlockIndex !== null && blocks[grabbedBlockIndex] === b) continue;

        const clampX = Math.max(b.mesh.position.x - b.halfW, Math.min(playerGroup.position.x, b.mesh.position.x + b.halfW));
        const clampZ = Math.max(b.mesh.position.z - b.halfD, Math.min(playerGroup.position.z, b.mesh.position.z + b.halfD));
        const dX = playerGroup.position.x - clampX;
        const dZ = playerGroup.position.z - clampZ;
        const distSq = dX * dX + dZ * dZ;

        if (distSq < playerRadius * playerRadius) {
          const dist = Math.sqrt(distSq);
          if (dist > 0.001) {
            const overlap = playerRadius - dist;
            playerGroup.position.x += (dX / dist) * overlap;
            playerGroup.position.z += (dZ / dist) * overlap;
          }
        }
      }

      // Grinding Sound Management
      if (isMovingBlockThisFrame && !isPushingRumble) {
        isPushingRumble = true;
        soundEngine.startBlockPushRumble();
      } else if (!isMovingBlockThisFrame && isPushingRumble) {
        isPushingRumble = false;
        soundEngine.stopBlockPushRumble();
      }

      // Check Sockets completion
      const b1SocketDist = block1Mesh.position.distanceTo(socket1Mesh.position);
      const b2SocketDist = block2Mesh.position.distanceTo(socket2Mesh.position);
      const b1InSocket = b1SocketDist < 1.4;
      const b2InSocket = b2SocketDist < 1.4;

      const pushedCount = (b1InSocket ? 1 : 0) + (b2InSocket ? 1 : 0);
      gameStateRef.current.blocksPushedCount = pushedCount;

      if (b1InSocket && b2InSocket && !gameStateRef.current.bridgeRaised) {
        gameStateRef.current.bridgeRaised = true;
        soundEngine.playCorrectSound();
        soundEngine.playBadgeLitSwell();
        bridgeMesh.position.y = 0.0;
        solidObstacles.push({ minX: -5, maxX: 5, minZ: -21, maxZ: -15, bottomY: -0.5, topY: 0.3 });
      }

      // -------------------------------------------------------------
      // HORIZONTAL (X/Z) IMPENETRABLE WALL COLLISION RESOLUTION
      // -------------------------------------------------------------
      if (grabbedBlockIndex === null) {
        const nextX = playerGroup.position.x + playerVel.x * dt;
        const nextZ = playerGroup.position.z + playerVel.z * dt;

        let resolvedX = nextX;
        let resolvedZ = nextZ;

        for (const obs of solidObstacles) {
          const isYOverlap = playerGroup.position.y < obs.topY && playerGroup.position.y + playerHeight > obs.bottomY;
          if (!isYOverlap) continue;

          const nearestX = Math.max(obs.minX, Math.min(resolvedX, obs.maxX));
          const nearestZ = Math.max(obs.minZ, Math.min(resolvedZ, obs.maxZ));

          const diffX = resolvedX - nearestX;
          const diffZ = resolvedZ - nearestZ;
          const distSq = diffX * diffX + diffZ * diffZ;

          if (distSq < playerRadius * playerRadius) {
            const dist = Math.sqrt(distSq);
            if (dist > 0.001) {
              const overlap = playerRadius - dist;
              resolvedX += (diffX / dist) * overlap;
              resolvedZ += (diffZ / dist) * overlap;
            }
          }
        }

        playerGroup.position.x = resolvedX;
        playerGroup.position.z = resolvedZ;
      }

      // -------------------------------------------------------------
      // VERTICAL (Y) GROUND SUPPORT & BOUNCING CLOUD PLATFORMS
      // -------------------------------------------------------------
      playerGroup.position.y += playerVel.y * dt;

      isGrounded = false;
      let highestFloorY = -20;
      let landedOnBouncy = false;

      for (const b of blocks) {
        if (
          playerGroup.position.x >= b.mesh.position.x - b.halfW &&
          playerGroup.position.x <= b.mesh.position.x + b.halfW &&
          playerGroup.position.z >= b.mesh.position.z - b.halfD &&
          playerGroup.position.z <= b.mesh.position.z + b.halfD
        ) {
          const topBlockY = b.mesh.position.y + b.halfW;
          if (playerGroup.position.y >= topBlockY - 0.7 && playerGroup.position.y <= topBlockY + 0.4) {
            if (topBlockY > highestFloorY) {
              highestFloorY = topBlockY;
            }
          }
        }
      }

      for (const obs of solidObstacles) {
        if (
          playerGroup.position.x >= obs.minX - playerRadius &&
          playerGroup.position.x <= obs.maxX + playerRadius &&
          playerGroup.position.z >= obs.minZ - playerRadius &&
          playerGroup.position.z <= obs.maxZ + playerRadius
        ) {
          if (playerGroup.position.y >= obs.topY - 0.7 && playerGroup.position.y <= obs.topY + 0.4) {
            if (obs.topY > highestFloorY) {
              highestFloorY = obs.topY;
              landedOnBouncy = !!obs.isBouncy;
            }
          }
        }
      }

      if (playerGroup.position.y <= highestFloorY) {
        if (!isGrounded && playerVel.y < -5) {
          squashY = 0.85;
        }
        playerGroup.position.y = highestFloorY;
        isGrounded = true;

        if (landedOnBouncy) {
          playerVel.y = 13.5;
          isGrounded = false;
          squashY = 1.35;
          soundEngine.playJumpSound();
        } else {
          playerVel.y = 0;
        }
      }

      // Safety Respawn Net
      if (playerGroup.position.y < -8.0) {
        playerGroup.position.set(0, 0.8, 14);
        playerVel.set(0, 0, 0);
        soundEngine.playCorrectSound();
      }

      // -------------------------------------------------------------
      // PUZZLE INTERACTION TRIGGERS & PROXIMITY DETECTION
      // -------------------------------------------------------------
      let currentPrompt: string | null = null;

      // Check if near a block for Grab prompt
      if (grabbedBlockIndex !== null) {
        currentPrompt = "Release Stone Block";
      } else {
        for (const b of blocks) {
          const inSocket = b.mesh.position.distanceTo(b.socket.position) < 1.4;
          if (!inSocket && playerGroup.position.distanceTo(b.mesh.position) < 2.5) {
            currentPrompt = "Grab Block (Push / Pull)";
          }
        }
      }

      // Item 1: Bronze Temple Key Collection
      if (keyGroup.visible) {
        const d = playerGroup.position.distanceTo(keyGroup.position);
        if (d < 2.4) {
          currentPrompt = "Collect Bronze Temple Key";
          if (wantInteract) {
            keyGroup.visible = false;
            gameStateRef.current.inventory.templeKey = true;
            soundEngine.playItemCollectFanfare();
          }
        }
      }

      // Item 2: Archaeologist's Pickaxe Collection
      if (pickaxeGroup.visible) {
        const d = playerGroup.position.distanceTo(pickaxeGroup.position);
        if (d < 2.4) {
          currentPrompt = "Take Archaeologist's Pickaxe";
          if (wantInteract) {
            pickaxeGroup.visible = false;
            gameStateRef.current.inventory.pickaxe = true;
            soundEngine.playItemCollectFanfare();
          }
        }
      }

      // Item 3: Sacred Oil Flask Collection
      if (oilFlaskGroup.visible) {
        const d = playerGroup.position.distanceTo(oilFlaskGroup.position);
        if (d < 2.4) {
          currentPrompt = "Collect Sacred Oil Flask";
          if (wantInteract) {
            oilFlaskGroup.visible = false;
            gameStateRef.current.inventory.oilFlask = true;
            soundEngine.playItemCollectFanfare();
          }
        }
      }

      // Item 4: Scripture Scroll Seal Collection
      if (scrollSealGroup.visible) {
        const d = playerGroup.position.distanceTo(scrollSealGroup.position);
        if (d < 2.4) {
          currentPrompt = "Collect Scripture Scroll Seal";
          if (wantInteract) {
            scrollSealGroup.visible = false;
            gameStateRef.current.inventory.scriptureSeal = true;
            soundEngine.playItemCollectFanfare();
          }
        }
      }

      // Obstacle 1: Locked Ancient Portcullis
      const distToGate = playerGroup.position.distanceTo(portcullisMesh.position);
      if (distToGate < 4.0 && !gameStateRef.current.gateOpened) {
        if (!gameStateRef.current.inventory.templeKey) {
          currentPrompt = "Locked Portcullis (Requires Bronze Temple Key)";
        } else {
          currentPrompt = "Unlock Ancient Portcullis with Temple Key";
          if (wantInteract) {
            gameStateRef.current.gateOpened = true;
            portcullisMesh.position.y = 10.0;
            gateCollider.topY = 0;
            leverHandle.rotation.z = -0.4;
            soundEngine.playGateUnlock();
          }
        }
      }

      // Obstacle 2: Cracked Ore Boulder (Blocking Mountain Ascent)
      if (boulderMesh.visible) {
        const d = playerGroup.position.distanceTo(boulderMesh.position);
        if (d < 3.8) {
          if (!gameStateRef.current.inventory.pickaxe) {
            currentPrompt = "Cracked Ore Boulder (Requires Archaeologist's Pickaxe)";
          } else {
            currentPrompt = "Shatter Ore Boulder with Pickaxe";
            if (wantInteract) {
              boulderMesh.visible = false;
              boulderCollider.topY = 0;
              gameStateRef.current.boulderShattered = true;
              soundEngine.playPickaxeStrike();
            }
          }
        }
      }

      // Scripture Steles Interaction
      scriptureSteles.forEach((stele) => {
        const d = playerGroup.position.distanceTo(stele.position);
        if (d < 3.2) {
          currentPrompt = `Read ${stele.name}`;
          if (wantInteract) {
            soundEngine.playChime();
            narrationEngine.playPhrase(`${stele.reference}: "${stele.text}"`);
            if (onReciteScripture) {
              onReciteScripture({
                reference: stele.reference,
                text: stele.text,
                doctrine: stele.doctrine,
              });
            }
          }
        }
      });

      // Day 1 Beacon ("Let there be light!")
      const distToBeacon = playerGroup.position.distanceTo(beaconBase.position);
      if (distToBeacon < 3.0 && !gameStateRef.current.hasSpokenLight) {
        currentPrompt = "Speak: 'Let there be light!'";
        if (wantInteract) {
          gameStateRef.current.hasSpokenLight = true;
          soundEngine.playLightFlashSwell();
          soundEngine.playBadgeLitSwell();
          beaconBeam.scale.set(3.5, 1, 3.5);
          (beaconCrystal.material as THREE.MeshStandardMaterial).emissiveIntensity = 4.0;
          beaconLight.intensity = 18.0;
          narrationEngine.playPhrase('Genesis 1:3: "Then God said, Let there be light; and there was light."');
          if (onReciteScripture) {
            onReciteScripture({
              reference: "Genesis 1:3",
              text: "Then God said, 'Let there be light'; and there was light.",
              doctrine: "Elohim: Infinite strength and power creating all things out of nothing.",
            });
          }
        }
      }

      // Day 2 Sky Switch
      const distToSkySwitch = playerGroup.position.distanceTo(skySwitchMesh.position);
      if (distToSkySwitch < 2.8 && !gameStateRef.current.hasPressedSkySwitch) {
        currentPrompt = "Press Day 2 Sky Switch";
        if (wantInteract) {
          gameStateRef.current.hasPressedSkySwitch = true;
          soundEngine.playBadgeLitSwell();
          skyWedgeMesh.scale.set(1.5, 1.5, 1.5);
          (skyWedgeMesh.material as THREE.MeshBasicMaterial).opacity = 0.45;
          skySwitchMesh.scale.set(1.2, 0.4, 1.2);
          narrationEngine.playPhrase('Genesis 1:6: "Then God said, Let there be a firmament in the midst of the waters."');
          if (onReciteScripture) {
            onReciteScripture({
              reference: "Genesis 1:6-8",
              text: "God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament.",
              doctrine: "God's Wisdom: Designing an atmosphere to sustain life on earth.",
            });
          }
        }
      }

      // Zone 2 Pressure Plates
      plateCoords.forEach((p, idx) => {
        const d = playerGroup.position.distanceTo(new THREE.Vector3(p.x, p.y, p.z));
        if (d < 1.8 && !gameStateRef.current.pressurePlatesPressed[idx]) {
          gameStateRef.current.pressurePlatesPressed[idx] = true;
          plateMeshes[idx].position.y = p.y - 0.25;
          (plateMeshes[idx].material as THREE.MeshStandardMaterial).emissiveIntensity = 1.8;
          soundEngine.playCorrectSound();

          const allPlates = gameStateRef.current.pressurePlatesPressed.every(Boolean);
          if (allPlates && !gameStateRef.current.watersParted) {
            gameStateRef.current.watersParted = true;
            soundEngine.playWaterWhoosh();
            waterBasinMesh.position.y = -1.5;
            mainLandMesh.position.y = 1.0;
            solidObstacles.push({ minX: 31, maxX: 79, minZ: -28, maxZ: 24, bottomY: 0, topY: 2.2 });
          }
        }
      });

      // Glowing Seeds Collection
      seedMeshes.forEach((sm, idx) => {
        if (sm.visible) {
          sm.rotation.y += dt * 3.5;
          sm.position.y = 2.5 + Math.sin(time * 4 + idx) * 0.2;
          const d = playerGroup.position.distanceTo(sm.position);
          if (d < 1.6) {
            sm.visible = false;
            gameStateRef.current.seedsCollected += 1;
            soundEngine.playCorrectSound();
          }
        }
      });

      // Fertile Garden Plot (Forest Sprout)
      const distToPlot = playerGroup.position.distanceTo(fertilePlot.position);
      if (
        distToPlot < 3.2 &&
        gameStateRef.current.seedsCollected >= gameStateRef.current.totalSeedsNeeded &&
        !gameStateRef.current.forestSprouted
      ) {
        currentPrompt = "Plant Glowing Seeds (Sprout Forest)";
        if (wantInteract) {
          gameStateRef.current.forestSprouted = true;
          soundEngine.playBadgeLitSwell();
          forestGroup.children.forEach((tr) => {
            tr.scale.set(1, 1, 1);
          });
          narrationEngine.playPhrase('Genesis 1:11: "Let the earth bring forth grass, the herb that yields seed, and the fruit tree."');
          if (onReciteScripture) {
            onReciteScripture({
              reference: "Genesis 1:11-12",
              text: "Let the earth bring forth grass, the herb that yields seed, and the fruit tree that yields fruit according to its kind.",
              doctrine: "God's Provision: Clothing the earth in beauty and sustained life.",
            });
          }
        }
      }

      // Summit Altars (Day 4 Lights in Sky)
      const distToAltars = playerGroup.position.distanceTo(new THREE.Vector3(78, 18.8, -18));
      if (distToAltars < 4.0 && !gameStateRef.current.altarsActivated) {
        currentPrompt = "Activate Sun, Moon & Star Altars";
        if (wantInteract) {
          gameStateRef.current.altarsActivated = true;
          soundEngine.playLightFlashSwell();
          soundEngine.playBadgeLitSwell();
          celestialGroup.visible = true;
          narrationEngine.playPhrase('Genesis 1:14: "Let there be lights in the firmament of the heavens to divide the day from the night."');
          if (onReciteScripture) {
            onReciteScripture({
              reference: "Genesis 1:14-16",
              text: "Then God said, 'Let there be lights in the firmament of the heavens to divide the day from the night; and let them be for signs and seasons.'",
              doctrine: "God's Sovereignty: He appointed the sun to rule by day and moon and stars by night.",
            });
          }
        }
      }

      // Living Creatures
      const distToWhale = playerGroup.position.distanceTo(whaleGroup.position);
      if (distToWhale < 5.0 && !gameStateRef.current.creaturesFound.whale) {
        currentPrompt = "Discover Breaching Whale";
        if (wantInteract) {
          gameStateRef.current.creaturesFound.whale = true;
          whaleGroup.position.y = 1.0;
          soundEngine.playWaterWhoosh();
          soundEngine.playBadgeLitSwell();
        }
      }

      const distToFish = playerGroup.position.distanceTo(fishGroup.position);
      if (distToFish < 4.0 && !gameStateRef.current.creaturesFound.fish) {
        currentPrompt = "Discover Wiggling Reef Fish";
        if (wantInteract) {
          gameStateRef.current.creaturesFound.fish = true;
          soundEngine.playCorrectSound();
        }
      }

      const distToRobin = playerGroup.position.distanceTo(robinGroup.position);
      if (distToRobin < 4.0 && !gameStateRef.current.creaturesFound.robin) {
        currentPrompt = "Hear Chirping Robin";
        if (wantInteract) {
          gameStateRef.current.creaturesFound.robin = true;
          soundEngine.playCorrectSound();
        }
      }

      const distToSeagull = playerGroup.position.distanceTo(seagullGroup.position);
      if (distToSeagull < 4.0 && !gameStateRef.current.creaturesFound.seagull) {
        currentPrompt = "Spot Dancing Seagull";
        if (wantInteract) {
          gameStateRef.current.creaturesFound.seagull = true;
          soundEngine.playCorrectSound();
        }
      }

      // Star Coins Collection
      coinMeshes.forEach((cm, idx) => {
        if (cm.visible) {
          const d = playerGroup.position.distanceTo(cm.position);
          if (d < 1.6) {
            cm.visible = false;
            gameStateRef.current.coinsCollected += 1;
            soundEngine.playCorrectSound();
          }
        }
      });

      // Update Zone Detection
      if (playerGroup.position.z >= 30) {
        gameStateRef.current.currentZone = 3;
      } else if (playerGroup.position.x >= 28) {
        gameStateRef.current.currentZone = 2;
      } else {
        gameStateRef.current.currentZone = 1;
      }

      gameStateRef.current.nearbyPrompt = currentPrompt;
      onGameStateChange({ ...gameStateRef.current });

      // -------------------------------------------------------------
      // AUTOMATIC CORNER-TURNING FOLLOW CAMERA (Mario 64 / Odyssey style)
      // -------------------------------------------------------------
      if (moveDir.lengthSq() > 0.04 && !isMouseDown) {
        const moveHeading = Math.atan2(moveDir.x, moveDir.z);
        const desiredYaw = moveHeading + Math.PI;

        // Shortest angular difference
        let deltaYaw = ((desiredYaw - cameraYaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        const turnRate = Math.abs(deltaYaw) > 0.8 ? 4.5 : 2.8;
        cameraYaw += deltaYaw * Math.min(1.0, dt * turnRate);
      }

      const camTargetHeight = playerGroup.position.y + 2.4;
      const targetCamX = playerGroup.position.x + Math.sin(cameraYaw) * Math.cos(cameraPitch) * camDist;
      const targetCamZ = playerGroup.position.z + Math.cos(cameraYaw) * Math.cos(cameraPitch) * camDist;
      const targetCamY = camTargetHeight + Math.sin(cameraPitch) * camDist;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 8.5, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 8.5, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 8.5, dt);

      camera.lookAt(playerGroup.position.x, camTargetHeight, playerGroup.position.z);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      renderer.domElement.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      renderer.domElement.removeEventListener("wheel", handleWheel);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [avatarName]);

  return <div ref={containerRef} className="w-full h-full relative outline-none select-none" />;
};

