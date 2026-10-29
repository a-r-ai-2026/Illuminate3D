import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { soundEngine } from "../../services/soundEffects";
import { ISpyItem } from "../../types/illuminate";

interface CreationShoreSceneProps {
  cameraMode: "surface" | "underwater";
  activeDay: number;
  foundObjectIds: Record<string, boolean>;
  onObjectFound: (item: ISpyItem) => void;
  onSnowmanTapped?: () => void;
  onOrbTapped?: (dayNumber: number) => void;
  onButterflyTapped?: () => void;
  allISpyItems: ISpyItem[];
}

export const CreationShoreScene: React.FC<CreationShoreSceneProps> = ({
  cameraMode,
  activeDay,
  foundObjectIds,
  onObjectFound,
  onSnowmanTapped,
  onOrbTapped,
  onButterflyTapped,
  allISpyItems,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    cameraMode,
    activeDay,
    foundObjectIds,
    allISpyItems,
    onObjectFound,
    onSnowmanTapped,
    onOrbTapped,
    onButterflyTapped,
  });

  stateRef.current = {
    cameraMode,
    activeDay,
    foundObjectIds,
    allISpyItems,
    onObjectFound,
    onSnowmanTapped,
    onOrbTapped,
    onButterflyTapped,
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
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
    scene.background = new THREE.Color(0x1a3b5c);
    const horizonFog = new THREE.FogExp2(0x234e70, 0.018);
    scene.fog = horizonFog;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 7, 24);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0x9bd8ff, 0x1d384e, 0.7);
    scene.add(hemiLight);

    const sunKeyLight = new THREE.DirectionalLight(0xfff1cc, 1.4);
    sunKeyLight.position.set(18, 22, 14);
    sunKeyLight.castShadow = !isSoftwareGl;
    scene.add(sunKeyLight);

    // Dynamic Lantern Light that changes color on Day 4 Focus
    const lanternPointLight = new THREE.PointLight(0xffd166, 1.5, 35);
    lanternPointLight.position.set(-6, 3, 10);
    scene.add(lanternPointLight);

    // Interactive clickable meshes registry
    const clickableObjects: { mesh: THREE.Object3D; id: string; type: "ispy" | "snowman" | "orb" | "butterfly"; payload?: any }[] = [];

    // 1. Water Plane (surface ocean)
    const waterGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x127ba5,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.82,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = 0;
    scene.add(waterMesh);

    // 2. Sandy Beach & Shoreline
    const sandGeo = new THREE.ConeGeometry(22, 5, 24);
    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xeed6aa,
      roughness: 0.9,
    });
    const sandDune = new THREE.Mesh(sandGeo, sandMat);
    sandDune.position.set(-8, -0.6, 6);
    sandDune.scale.set(1.4, 0.5, 1.8);
    sandDune.receiveShadow = !isSoftwareGl;
    scene.add(sandDune);
    clickableObjects.push({ mesh: sandDune, id: "dryland", type: "ispy" });

    // 3. Mountains in background
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x3d516b,
      roughness: 0.85,
    });
    const mtnGeo1 = new THREE.ConeGeometry(16, 26, 6);
    const mtn1 = new THREE.Mesh(mtnGeo1, mountainMat);
    mtn1.position.set(-28, 8, -45);
    scene.add(mtn1);

    const mtnGeo2 = new THREE.ConeGeometry(20, 34, 7);
    const mtn2 = new THREE.Mesh(mtnGeo2, mountainMat);
    mtn2.position.set(-8, 12, -55);
    scene.add(mtn2);

    const mtn3 = new THREE.Mesh(mtnGeo1, mountainMat);
    mtn3.position.set(18, 9, -48);
    scene.add(mtn3);
    clickableObjects.push({ mesh: mtn2, id: "mountains", type: "ispy" });

    // 4. Sun & Moon & Stars
    // Sun
    const sunGroup = new THREE.Group();
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(3.6, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xffd152 })
    );
    sunGroup.add(sunMesh);
    // Sun corona glow
    const coronaMesh = new THREE.Mesh(
      new THREE.SphereGeometry(4.8, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffea88, transparent: true, opacity: 0.35 })
    );
    sunGroup.add(coronaMesh);
    sunGroup.position.set(24, 25, -30);
    scene.add(sunGroup);
    clickableObjects.push({ mesh: sunGroup, id: "sun", type: "ispy" });

    // Crescent Moon
    const moonGroup = new THREE.Group();
    const moonBody = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xf4f1de })
    );
    moonGroup.add(moonBody);
    moonGroup.position.set(-22, 22, -26);
    scene.add(moonGroup);
    clickableObjects.push({ mesh: moonGroup, id: "moon", type: "ispy" });

    // Stars
    const starsGroup = new THREE.Group();
    const starGeo = new THREE.BufferGeometry();
    const starPositions: number[] = [];
    for (let i = 0; i < 90; i++) {
      starPositions.push(
        (Math.random() - 0.5) * 120,
        Math.random() * 30 + 15,
        -Math.random() * 50 - 20
      );
    }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, transparent: true, opacity: 0.85 });
    const starPoints = new THREE.Points(starGeo, starMat);
    starsGroup.add(starPoints);
    scene.add(starsGroup);
    clickableObjects.push({ mesh: starsGroup, id: "stars", type: "ispy" });

    // 5. Clouds (drifting low-poly clouds)
    const cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      transparent: true,
      opacity: 0.9,
    });
    for (let c = 0; c < 4; c++) {
      const cGroup = new THREE.Group();
      const p1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4, 1), cloudMat);
      const p2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 1), cloudMat);
      p2.position.set(2.2, -0.4, 0);
      const p3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.9, 1), cloudMat);
      p3.position.set(-2.0, -0.2, 0.4);
      cGroup.add(p1, p2, p3);
      cGroup.position.set(-25 + c * 18, 18 + (c % 2) * 3, -15 - c * 4);
      cloudsGroup.add(cGroup);
    }
    scene.add(cloudsGroup);
    clickableObjects.push({ mesh: cloudsGroup, id: "clouds", type: "ispy" });

    // 6. Tropical Palm Tree (multi-part procedural)
    const palmGroup = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.85 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.6, side: THREE.DoubleSide });

    // Curved segmented trunk
    for (let t = 0; t < 7; t++) {
      const trunkSeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55 - t * 0.04, 0.62 - t * 0.04, 1.2, 8),
        trunkMat
      );
      trunkSeg.position.set(Math.sin(t * 0.25) * 0.45, t * 1.1 + 0.6, 0);
      trunkSeg.rotation.z = -t * 0.05;
      palmGroup.add(trunkSeg);
    }

    // Fronds radiating out
    for (let f = 0; f < 6; f++) {
      const angle = (f / 6) * Math.PI * 2;
      const frond = new THREE.Mesh(
        new THREE.ConeGeometry(0.8, 4.2, 5),
        leafMat
      );
      frond.position.set(Math.sin(angle) * 1.6, 7.8, Math.cos(angle) * 1.6);
      frond.rotation.x = Math.cos(angle) * 0.9;
      frond.rotation.z = -Math.sin(angle) * 0.9;
      palmGroup.add(frond);
    }
    palmGroup.position.set(-9, 0.8, 5);
    scene.add(palmGroup);
    clickableObjects.push({ mesh: palmGroup, id: "palm", type: "ispy" });

    // 7. Dolphins (two leaping dolphins)
    const dolphinsGroup = new THREE.Group();
    const dolphinMat = new THREE.MeshStandardMaterial({ color: 0x4f7da8, roughness: 0.35 });
    const makeDolphin = () => {
      const d = new THREE.Group();
      // Body
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.7, 3.2, 8), dolphinMat);
      body.rotation.z = Math.PI / 2;
      // Snout
      const snout = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.8, 6), dolphinMat);
      snout.position.set(1.9, 0, 0);
      snout.rotation.z = -Math.PI / 2;
      // Fin
      const fin = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.9, 4), dolphinMat);
      fin.position.set(0.2, 0.7, 0);
      fin.rotation.z = -0.4;
      // Tail fluke
      const fluke = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 1.2), dolphinMat);
      fluke.position.set(-1.6, 0, 0);
      d.add(body, snout, fin, fluke);
      return d;
    };

    const dolphin1 = makeDolphin();
    dolphin1.position.set(6, 1.2, 4);
    const dolphin2 = makeDolphin();
    dolphin2.position.set(9, 0.8, 2);
    dolphin2.scale.set(0.85, 0.85, 0.85);
    dolphinsGroup.add(dolphin1, dolphin2);
    scene.add(dolphinsGroup);
    clickableObjects.push({ mesh: dolphinsGroup, id: "dolphins", type: "ispy" });

    // 8. Seabirds (two soaring seabirds)
    const birdsGroup = new THREE.Group();
    const birdMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.7 });
    const makeBird = () => {
      const b = new THREE.Group();
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.2, 6), birdMat);
      body.rotation.x = Math.PI / 2;
      const leftWing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.4), birdMat);
      leftWing.position.set(-0.8, 0, 0);
      leftWing.rotation.z = 0.2;
      const rightWing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.4), birdMat);
      rightWing.position.set(0.8, 0, 0);
      rightWing.rotation.z = -0.2;
      b.add(body, leftWing, rightWing);
      return b;
    };
    const bird1 = makeBird();
    bird1.position.set(-3, 14, 2);
    const bird2 = makeBird();
    bird2.position.set(3, 16, -2);
    birdsGroup.add(bird1, bird2);
    scene.add(birdsGroup);
    clickableObjects.push({ mesh: birdsGroup, id: "seabirds", type: "ispy" });

    // 9. Day 2 Snowman on the beach ("Did snowflakes build this by chance?")
    const snowmanGroup = new THREE.Group();
    const snowMat = new THREE.MeshStandardMaterial({ color: 0xfdfbf7, roughness: 0.9 });
    const bottomBall = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 12), snowMat);
    bottomBall.position.y = 0.8;
    const midBall = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), snowMat);
    midBall.position.y = 1.95;
    const headBall = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), snowMat);
    headBall.position.y = 2.85;
    const carrotNose = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, 0.4, 6),
      new THREE.MeshStandardMaterial({ color: 0xff7b00 })
    );
    carrotNose.position.set(0, 2.85, 0.55);
    carrotNose.rotation.x = Math.PI / 2;
    snowmanGroup.add(bottomBall, midBall, headBall, carrotNose);
    snowmanGroup.position.set(-5, 0.6, 8.5);
    scene.add(snowmanGroup);
    clickableObjects.push({ mesh: snowmanGroup, id: "snowman", type: "snowman" });

    // 10. Day 2 Floating Glowing Orbs (Five Days Infographic)
    const orbsGroup = new THREE.Group();
    const orbColors = [0xfde047, 0x38bdf8, 0x4ade80, 0xfb923c, 0xa855f7];
    const orbMeshes: THREE.Mesh[] = [];

    for (let day = 1; day <= 5; day++) {
      const orbMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 16, 16),
        new THREE.MeshStandardMaterial({
          color: orbColors[day - 1],
          emissive: orbColors[day - 1],
          emissiveIntensity: 0.4,
          roughness: 0.2,
        })
      );
      orbMesh.position.set(-7 + day * 2.8, 6.5 + Math.sin(day * 1.2) * 0.4, 0);
      orbsGroup.add(orbMesh);
      orbMeshes.push(orbMesh);
      clickableObjects.push({ mesh: orbMesh, id: `orb-${day}`, type: "orb", payload: day });
    }
    scene.add(orbsGroup);

    // 11. Day 3 Butterfly Swarm (8.7 million species callout)
    const butterflyGroup = new THREE.Group();
    const butterflyMat = new THREE.MeshStandardMaterial({ color: 0xffa07a, side: THREE.DoubleSide });
    for (let b = 0; b < 7; b++) {
      const bFly = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.3), butterflyMat);
      bFly.position.set(-9 + (Math.random() - 0.5) * 3, 4 + Math.random() * 2.5, 4 + (Math.random() - 0.5) * 3);
      butterflyGroup.add(bFly);
    }
    scene.add(butterflyGroup);
    clickableObjects.push({ mesh: butterflyGroup, id: "butterfly-swarm", type: "butterfly" });

    // -------------------------------------------------------------
    // UNDERWATER REALM (Y < 0): Reef, Sea Turtle, Jellyfish, Fish, etc.
    // -------------------------------------------------------------
    const underwaterGroup = new THREE.Group();

    // Ocean floor
    const oceanFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x1b4b66, roughness: 0.95 })
    );
    oceanFloor.rotateX(-Math.PI / 2);
    oceanFloor.position.y = -12;
    underwaterGroup.add(oceanFloor);

    // Coral Reef formations
    const coralMat1 = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.7 });
    const coralMat2 = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.7 });
    const coralGroup = new THREE.Group();
    for (let c = 0; c < 8; c++) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.7, 2.5 + (c % 3), 7),
        c % 2 === 0 ? coralMat1 : coralMat2
      );
      col.position.set(-8 + c * 2.2, -10.5, -4 + (c % 3) * 2);
      coralGroup.add(col);
    }
    underwaterGroup.add(coralGroup);
    clickableObjects.push({ mesh: coralGroup, id: "coral", type: "ispy" });

    // Seaweed
    const seaweedGroup = new THREE.Group();
    const seaweedMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 });
    for (let s = 0; s < 12; s++) {
      const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4 + (s % 3) * 1.5, 5), seaweedMat);
      blade.position.set(-12 + s * 2, -9.5, -2 + Math.sin(s) * 3);
      seaweedGroup.add(blade);
    }
    underwaterGroup.add(seaweedGroup);
    clickableObjects.push({ mesh: seaweedGroup, id: "seaweed", type: "ispy" });

    // Sea Turtle (multi-part procedural)
    const turtleGroup = new THREE.Group();
    const shellMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.5 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x81c784, roughness: 0.7 });
    const turtleShell = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 10), shellMat);
    turtleShell.scale.set(1.2, 0.5, 1.5);
    const turtleHead = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), skinMat);
    turtleHead.position.set(0, 0, 1.8);
    // Flippers
    const fLeft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.5), skinMat);
    fLeft.position.set(-1.4, -0.1, 0.8);
    fLeft.rotation.z = -0.3;
    const fRight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.5), skinMat);
    fRight.position.set(1.4, -0.1, 0.8);
    fRight.rotation.z = 0.3;
    turtleGroup.add(turtleShell, turtleHead, fLeft, fRight);
    turtleGroup.position.set(-4, -6, 2);
    underwaterGroup.add(turtleGroup);
    clickableObjects.push({ mesh: turtleGroup, id: "turtle", type: "ispy" });

    // Jellyfish (luminous bell + tentacles)
    const jellyGroup = new THREE.Group();
    const jellyMat = new THREE.MeshStandardMaterial({
      color: 0xe0aaff,
      emissive: 0x9d4edd,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.82,
      roughness: 0.2,
    });
    const jellyBell = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 10), jellyMat);
    jellyBell.scale.set(1, 0.75, 1);
    jellyGroup.add(jellyBell);
    for (let j = 0; j < 6; j++) {
      const tent = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.02, 2.2, 4),
        jellyMat
      );
      const jAng = (j / 6) * Math.PI * 2;
      tent.position.set(Math.sin(jAng) * 0.5, -1.2, Math.cos(jAng) * 0.5);
      jellyGroup.add(tent);
    }
    jellyGroup.position.set(5, -5, 4);
    underwaterGroup.add(jellyGroup);
    clickableObjects.push({ mesh: jellyGroup, id: "jellyfish", type: "ispy" });

    // Striped Reef Fish
    const stripedFish = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 })
    );
    stripedFish.scale.set(1.4, 0.9, 0.3);
    stripedFish.position.set(2, -7, -1);
    underwaterGroup.add(stripedFish);
    clickableObjects.push({ mesh: stripedFish, id: "stripedfish", type: "ispy" });

    // Round Spotted Fish
    const spottedFish = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.4 })
    );
    spottedFish.scale.set(1.1, 1.1, 0.4);
    spottedFish.position.set(-6, -8, 5);
    underwaterGroup.add(spottedFish);
    clickableObjects.push({ mesh: spottedFish, id: "spottedfish", type: "ispy" });

    // Two Golden Seahorses
    const seahorsesGroup = new THREE.Group();
    const seahorseMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
    const s1 = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.12, 8, 16, Math.PI * 1.5), seahorseMat);
    s1.position.set(7, -8, 1);
    const s2 = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 8, 16, Math.PI * 1.5), seahorseMat);
    s2.position.set(7.8, -8.3, 1.4);
    seahorsesGroup.add(s1, s2);
    underwaterGroup.add(seahorsesGroup);
    clickableObjects.push({ mesh: seahorsesGroup, id: "seahorses", type: "ispy" });

    // Starfish on ocean floor
    const starfishMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.65, 0.25, 5),
      new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.6 })
    );
    starfishMesh.position.set(-1, -11.8, 3);
    starfishMesh.rotation.x = Math.PI;
    underwaterGroup.add(starfishMesh);
    clickableObjects.push({ mesh: starfishMesh, id: "starfish", type: "ispy" });

    // Sea Shell
    const shellMesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.45),
      new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.4 })
    );
    shellMesh.position.set(3, -11.7, 5);
    underwaterGroup.add(shellMesh);
    clickableObjects.push({ mesh: shellMesh, id: "shell", type: "ispy" });

    scene.add(underwaterGroup);

    // Camera target positions
    const targetCamPos = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3();

    // Raycaster for click interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check all meshes
      const testMeshes: THREE.Object3D[] = [];
      clickableObjects.forEach((item) => {
        item.mesh.traverse((child) => {
          if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
            (child as any).__customItem = item;
            testMeshes.push(child);
          }
        });
      });

      const intersects = raycaster.intersectObjects(testMeshes, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object as any;
        const custom = hit.__customItem;
        if (!custom) return;

        if (custom.type === "ispy") {
          const ispyItem = stateRef.current.allISpyItems.find((i) => i.id === custom.id);
          if (ispyItem) {
            stateRef.current.onObjectFound(ispyItem);
            soundEngine.playObjectFoundChime();
          }
        } else if (custom.type === "snowman") {
          stateRef.current.onSnowmanTapped?.();
          soundEngine.playObjectFoundChime();
        } else if (custom.type === "orb") {
          stateRef.current.onOrbTapped?.(custom.payload);
          soundEngine.playObjectFoundChime();
        } else if (custom.type === "butterfly") {
          stateRef.current.onButterflyTapped?.();
          soundEngine.playObjectFoundChime();
        }
      }
    };

    renderer.domElement.addEventListener("click", handlePointerDown);

    // Animation Loop
    let clock = new THREE.Clock();
    let frameId = 0;

    const tick = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Camera transitions
      if (stateRef.current.cameraMode === "surface") {
        targetCamPos.set(0, 7, 24);
        targetLookAt.set(0, 4, 0);
        scene.fog = horizonFog;
      } else {
        targetCamPos.set(0, -6, 12);
        targetLookAt.set(0, -8, 0);
        scene.fog = new THREE.FogExp2(0x0e3654, 0.04);
      }

      camera.position.lerp(targetCamPos, 0.05);
      const currentLook = new THREE.Vector3();
      camera.getWorldDirection(currentLook);
      camera.lookAt(targetLookAt);

      // Animate jumping dolphins
      const dJump1 = Math.sin(time * 2.2);
      dolphin1.position.y = Math.max(-0.8, dJump1 * 2.2);
      dolphin1.rotation.z = -dJump1 * 0.5;

      const dJump2 = Math.sin(time * 2.2 + 0.8);
      dolphin2.position.y = Math.max(-0.6, dJump2 * 1.8);
      dolphin2.rotation.z = -dJump2 * 0.45;

      // Animate soaring seabirds
      bird1.position.x = Math.sin(time * 0.6) * 12;
      bird1.position.z = Math.cos(time * 0.6) * 8;
      bird2.position.x = -Math.sin(time * 0.5 + 1) * 10;
      bird2.position.z = Math.cos(time * 0.5 + 1) * 7;

      // Animate sea turtle gliding
      turtleGroup.position.x = Math.sin(time * 0.4) * 5 - 2;
      turtleGroup.position.y = -6 + Math.sin(time * 0.8) * 0.5;

      // Animate pulsing jellyfish
      const jPulse = 1 + Math.sin(time * 3.5) * 0.18;
      jellyBell.scale.set(jPulse, 0.75 / jPulse, jPulse);
      jellyGroup.position.y = -5 + Math.sin(time * 1.2) * 0.8;

      // Animate drifting clouds
      cloudsGroup.position.x = Math.sin(time * 0.08) * 4;

      // Day 4 Focus: Shift lantern light color to crystalline radiant white
      if (stateRef.current.activeDay === 4) {
        lanternPointLight.color.setHex(0xffffff);
        lanternPointLight.intensity = 2.4;
      } else {
        lanternPointLight.color.setHex(0xffd166);
        lanternPointLight.intensity = 1.4;
      }

      // Day 2 Infographic: Orbs gentle bounce
      orbMeshes.forEach((orb, idx) => {
        orb.position.y = 6.5 + Math.sin(time * 2 + idx * 0.8) * 0.3;
      });

      // Render
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    tick();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", handlePointerDown);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};
