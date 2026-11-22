import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  detectSoftwareWebGL,
  disposeSceneObjects,
  scheduleAfterSoftwareDraw,
} from './threeEnv';

export interface PauseVerifySceneController {
  setPointer: (nx: number, ny: number, active: boolean) => void;
  setScrollProgress: (progress: number) => void;
  setMobileMode: (isMobile: boolean) => void;
  setInView: (inView: boolean) => void;
  setTabVisible: (visible: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  resize: () => void;
  dispose: () => void;
}

export interface PauseVerifySceneCallbacks {
  onStateChange?: (state: { paused: boolean; frameCount: number; mobile: boolean }) => void;
}

function createShieldShape(width: number, height: number): THREE.Shape {
  const w = width / 2;
  const h = height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(0, h);
  shape.lineTo(w, h * 0.62);
  shape.bezierCurveTo(w, -h * 0.15, w * 0.62, -h * 0.72, 0, -h);
  shape.bezierCurveTo(-w * 0.62, -h * 0.72, -w, -h * 0.15, -w, h * 0.62);
  shape.closePath();
  return shape;
}

function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  shape.closePath();
  return shape;
}

function createCheckmarkShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-0.34, 0.02);
  s.lineTo(-0.1, -0.22);
  s.lineTo(0.36, 0.28);
  s.lineTo(0.27, 0.36);
  s.lineTo(-0.1, -0.05);
  s.lineTo(-0.26, 0.11);
  s.closePath();
  return s;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
    grad.addColorStop(0, 'rgba(24, 58, 50, 0.24)');
    grad.addColorStop(0.55, 'rgba(24, 58, 50, 0.09)');
    grad.addColorStop(1, 'rgba(24, 58, 50, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface ClueNodeMeta {
  mesh: THREE.Mesh;
  baseX: number;
  baseY: number;
  baseZ: number;
  scrollTargetX: number;
  scrollTargetY: number;
  scrollTargetZ: number;
  phase: number;
}

interface ParticleMeta {
  mesh: THREE.Mesh;
  baseX: number;
  baseY: number;
  baseZ: number;
  speed: number;
  phase: number;
  orbitRadius: number;
  desktopOnly: boolean;
}

/**
 * Hero "Verification Lens" Three.js scene:
 * - Optical convex glass lens & machined warm-brass bezel with 4-clue compass ticks
 * - Layered beveled evergreen shield & embossed check emblem
 * - Floating warm paper message card refracted behind the lens
 * - Grounded soft radial shadow + restrained orbital particles
 * - Scroll handoff smoothly spreads the 4 clue nodes toward the Four-Clue Motif
 * - Static lightweight render on mobile (<640px) and prefers-reduced-motion
 */
export function createPauseVerifyScene(
  container: HTMLElement,
  initialMobile: boolean,
  initialReducedMotion: boolean,
  callbacks: PauseVerifySceneCallbacks = {}
): PauseVerifySceneController {
  const isSoftwareGl = detectSoftwareWebGL();
  const width = Math.max(container.clientWidth, 160);
  const height = Math.max(container.clientHeight, 120);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = !isSoftwareGl;
  if (!isSoftwareGl) {
    renderer.shadowMap.type = THREE.PCFShadowMap;
    }

  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  // Studio environment reflections for optical glass lens & brass bezel
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment();
  const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
  scene.environment = envTarget.texture;
  roomEnv.dispose();
  pmremGenerator.dispose();

  const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 40);
  camera.position.set(0, 0.08, initialMobile ? 6.2 : 5.75);

  // Calibrated Warm Paper + Evergreen Studio 3-Point Lighting
  const hemiLight = new THREE.HemisphereLight(0xf7f5ee, 0x214d41, 0.92);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff6e7, 1.65);
  keyLight.position.set(3.2, 4.4, 4.8);
  if (!isSoftwareGl) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(512, 512);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 14;
    keyLight.shadow.camera.left = -2.6;
    keyLight.shadow.camera.right = 2.6;
    keyLight.shadow.camera.top = 2.6;
    keyLight.shadow.camera.bottom = -2.6;
    keyLight.shadow.bias = -0.0005;
  }
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x9bc4ac, 0.95);
  rimLight.position.set(-3.6, 1.9, -2.4);
  scene.add(rimLight);

  const rootRig = new THREE.Group();
  rootRig.rotation.set(0.06, -0.16, 0);
  scene.add(rootRig);

  // Grounded soft contact shadow
  const shadowTex = createContactShadowTexture();
  const shadowGeo = new THREE.PlaneGeometry(3.4, 1.35);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.set(0, -1.48, -0.1);
  scene.add(shadowPlane);

  // 1. COMPOSITE EVERGREEN SHIELD (Back Architectural Layer)
  const shieldGroup = new THREE.Group();
  shieldGroup.position.set(-0.18, 0.06, -0.12);
  rootRig.add(shieldGroup);

  const outerShieldGeo = new THREE.ExtrudeGeometry(createShieldShape(1.9, 2.25), {
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.045,
    bevelSize: 0.04,
    bevelSegments: 3,
    curveSegments: 18,
  });
  outerShieldGeo.center();
  const outerShieldMat = new THREE.MeshStandardMaterial({
    color: 0x183a32,
    roughness: 0.56,
    metalness: 0.14,
  });
  const outerShieldMesh = new THREE.Mesh(outerShieldGeo, outerShieldMat);
  outerShieldMesh.castShadow = !isSoftwareGl;
  outerShieldMesh.receiveShadow = !isSoftwareGl;
  shieldGroup.add(outerShieldMesh);

  const innerShieldGeo = new THREE.ExtrudeGeometry(createShieldShape(1.62, 1.92), {
    depth: 0.075,
    bevelEnabled: true,
    bevelThickness: 0.022,
    bevelSize: 0.022,
    bevelSegments: 2,
    curveSegments: 16,
  });
  innerShieldGeo.center();
  const innerShieldMat = new THREE.MeshStandardMaterial({
    color: 0x214d41,
    roughness: 0.36,
    metalness: 0.18,
  });
  const innerShieldMesh = new THREE.Mesh(innerShieldGeo, innerShieldMat);
  innerShieldMesh.position.z = 0.1;
  innerShieldMesh.receiveShadow = !isSoftwareGl;
  shieldGroup.add(innerShieldMesh);

  const mintTrimMat = new THREE.MeshStandardMaterial({
    color: 0x9bc4ac,
    roughness: 0.28,
    metalness: 0.42,
  });
  const crestRingMesh = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 12, 36), mintTrimMat);
  crestRingMesh.position.set(0.32, 0.36, 0.16);
  shieldGroup.add(crestRingMesh);

  const checkGeo = new THREE.ExtrudeGeometry(createCheckmarkShape(), {
    depth: 0.038,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
  checkGeo.center();
  const checkMat = new THREE.MeshStandardMaterial({
    color: 0xd8ebdf,
    roughness: 0.24,
    metalness: 0.25,
  });
  const checkMesh = new THREE.Mesh(checkGeo, checkMat);
  checkMesh.scale.setScalar(0.64);
  checkMesh.position.set(0.32, 0.36, 0.17);
  shieldGroup.add(checkMesh);

  // 2. FLOATING WARM-PAPER MESSAGE CARD (Mid-Foreground Depth Layer)
  const cardGroup = new THREE.Group();
  cardGroup.position.set(-0.42, -0.06, 0.46);
  cardGroup.rotation.set(0.04, 0.12, -0.06);
  rootRig.add(cardGroup);

  const cardBodyGeo = new THREE.ExtrudeGeometry(createRoundedRectShape(1.18, 1.42, 0.1), {
    depth: 0.055,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.018,
    bevelSegments: 2,
  });
  cardBodyGeo.center();
  const cardBodyMat = new THREE.MeshStandardMaterial({
    color: 0xfffefa,
    roughness: 0.72,
    metalness: 0.02,
  });
  const cardBodyMesh = new THREE.Mesh(cardBodyGeo, cardBodyMat);
  cardBodyMesh.castShadow = !isSoftwareGl;
  cardBodyMesh.receiveShadow = !isSoftwareGl;
  cardGroup.add(cardBodyMesh);

  const cardLineMat = new THREE.MeshStandardMaterial({
    color: 0xc9c2b4,
    roughness: 0.52,
    metalness: 0.08,
  });
  const headerBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.072, 0.026),
    new THREE.MeshStandardMaterial({ color: 0x214d41, roughness: 0.4, metalness: 0.1 })
  );
  headerBar.position.set(-0.16, 0.44, 0.045);
  cardGroup.add(headerBar);

  [0.82, 0.68, 0.76, 0.5].forEach((len, idx) => {
    const lineMesh = new THREE.Mesh(new THREE.BoxGeometry(len, 0.052, 0.02), cardLineMat);
    lineMesh.position.set(-0.42 + len / 2, 0.22 - idx * 0.165, 0.044);
    cardGroup.add(lineMesh);
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xdba14b,
    roughness: 0.22,
    metalness: 0.82,
  });
  const sealDot = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.032, 20), brassMat);
  sealDot.rotation.x = Math.PI / 2;
  sealDot.position.set(0.3, -0.5, 0.046);
  cardGroup.add(sealDot);

  // 3. OPTICAL VERIFICATION LENS ASSEMBLY (Signature Focal Sphere/Lens + Brass Reticle)
  const lensGroup = new THREE.Group();
  lensGroup.position.set(0.5, -0.14, 0.98);
  lensGroup.rotation.set(0.06, -0.14, -0.12);
  rootRig.add(lensGroup);

  // Machined brass bezel torus
  const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.058, 18, 48), brassMat);
  rimMesh.castShadow = !isSoftwareGl;
  lensGroup.add(rimMesh);

  // Precision dark evergreen inner optical collar
  const collarMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.515, 0.018, 12, 44),
    outerShieldMat
  );
  collarMesh.position.z = 0.022;
  lensGroup.add(collarMesh);

  // 4 cardinal compass ticks around the lens representing the 4 verification clues
  for (let i = 0; i < 4; i += 1) {
    const angle = (i * Math.PI) / 2;
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.1, 0.045), brassMat);
    tick.position.set(Math.cos(angle) * 0.65, Math.sin(angle) * 0.65, 0.01);
    tick.rotation.z = angle - Math.PI / 2;
    lensGroup.add(tick);
  }

  // Biconvex optical glass lens dome (compressed sphere for genuine optical lens curvature)
  const opticalLensGeo = new THREE.SphereGeometry(0.505, 36, 24);
  opticalLensGeo.scale(1, 1, 0.24);
  const opticalLensMat = new THREE.MeshPhysicalMaterial({
    color: 0xebf5ef,
    roughness: 0.05,
    metalness: 0.02,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    ior: 1.52,
    transparent: true,
    opacity: isSoftwareGl ? 0.34 : 0.94,
    transmission: isSoftwareGl ? 0 : 0.9,
    thickness: 0.45,
    depthWrite: false,
  });
  const opticalLensMesh = new THREE.Mesh(opticalLensGeo, opticalLensMat);
  opticalLensMesh.renderOrder = 5;
  lensGroup.add(opticalLensMesh);

  // Tactile handle & brass ferrule
  const ferruleMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.054, 0.064, 0.14, 16),
    brassMat
  );
  ferruleMesh.position.set(0.46, -0.46, 0);
  ferruleMesh.rotation.z = Math.PI / 4;
  lensGroup.add(ferruleMesh);

  const handleMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.058, 0.074, 0.56, 18),
    outerShieldMat
  );
  handleMesh.position.set(0.68, -0.68, 0);
  handleMesh.rotation.z = Math.PI / 4;
  handleMesh.castShadow = !isSoftwareGl;
  lensGroup.add(handleMesh);

  const pommelMesh = new THREE.Mesh(new THREE.SphereGeometry(0.076, 16, 12), brassMat);
  pommelMesh.position.set(0.88, -0.88, 0);
  lensGroup.add(pommelMesh);

  // 4. FOUR DIMENSIONAL CLUE NODES (Transition outward during scroll toward the 4-clue motif)
  const clueNodeSpecs = [
    { x: -1.38, y: 0.88, z: 0.22, sx: -1.65, sy: 0.65, sz: 0.55, color: 0xfffefa, phase: 0.4 },
    { x: 1.44, y: 0.86, z: 0.25, sx: -0.55, sy: 0.65, sz: 0.55, color: 0xd8ebdf, phase: 1.6 },
    { x: -1.42, y: -0.78, z: 0.32, sx: 0.55, sy: 0.65, sz: 0.55, color: 0x9bc4ac, phase: 2.8 },
    { x: 1.42, y: -0.82, z: 0.38, sx: 1.65, sy: 0.65, sz: 0.55, color: 0xdba14b, phase: 4.1 },
  ];

  const clueNodes: ClueNodeMeta[] = clueNodeSpecs.map((spec) => {
    const geo = new THREE.OctahedronGeometry(0.115, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: spec.color,
      roughness: 0.26,
      metalness: spec.color === 0xdba14b ? 0.72 : 0.22,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(spec.x, spec.y, spec.z);
    rootRig.add(mesh);
    return {
      mesh,
      baseX: spec.x,
      baseY: spec.y,
      baseZ: spec.z,
      scrollTargetX: spec.sx,
      scrollTargetY: spec.sy,
      scrollTargetZ: spec.sz,
      phase: spec.phase,
    };
  });

  // 5. RESTRAINED ORBITAL ACCENT RINGS & MOTES
  const backRingA = new THREE.Mesh(
    new THREE.TorusGeometry(1.58, 0.011, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x9bc4ac, transparent: true, opacity: 0.3 })
  );
  backRingA.position.set(0, 0, -0.55);
  rootRig.add(backRingA);

  const backRingB = new THREE.Mesh(
    new THREE.TorusGeometry(1.16, 0.008, 8, 56),
    new THREE.MeshBasicMaterial({ color: 0xc9c2b4, transparent: true, opacity: 0.42 })
  );
  backRingB.position.set(0, 0, -0.44);
  rootRig.add(backRingB);

  const particleSpecs = [
    { x: -1.78, y: 0.24, z: -0.35, size: 0.038, color: 0x9bc4ac, speed: 0.48, phase: 0.8, orbitRadius: 0.07, desktopOnly: true },
    { x: 1.82, y: 0.16, z: -0.28, size: 0.04, color: 0xdba14b, speed: 0.54, phase: 2.4, orbitRadius: 0.075, desktopOnly: true },
    { x: -0.82, y: 1.28, z: 0.32, size: 0.036, color: 0xd8ebdf, speed: 0.58, phase: 3.7, orbitRadius: 0.06, desktopOnly: true },
    { x: 0.88, y: 1.22, z: -0.36, size: 0.034, color: 0x214d41, speed: 0.44, phase: 1.7, orbitRadius: 0.06, desktopOnly: true },
    { x: -0.96, y: -1.16, z: 0.18, size: 0.036, color: 0xc9c2b4, speed: 0.52, phase: 4.9, orbitRadius: 0.06, desktopOnly: false },
    { x: 0.94, y: -1.12, z: -0.22, size: 0.036, color: 0x9bc4ac, speed: 0.46, phase: 5.5, orbitRadius: 0.06, desktopOnly: false },
  ];

  const particles: ParticleMeta[] = particleSpecs.map((spec) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(spec.size, 10, 8),
      new THREE.MeshStandardMaterial({
        color: spec.color,
        roughness: 0.35,
        metalness: spec.color === 0xdba14b ? 0.65 : 0.18,
        transparent: true,
        opacity: 0.82,
      })
    );
    mesh.position.set(spec.x, spec.y, spec.z);
    rootRig.add(mesh);
    return {
      mesh,
      baseX: spec.x,
      baseY: spec.y,
      baseZ: spec.z,
      speed: spec.speed,
      phase: spec.phase,
      orbitRadius: spec.orbitRadius,
      desktopOnly: spec.desktopOnly,
    };
  });

  if (!isSoftwareGl) {
    renderer.compile(scene, camera);
  }

  let isMobile = initialMobile;
  let isInView = true;
  let isTabVisible = true;
  let isReducedMotion = initialReducedMotion;
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerCurrentX = 0;
  let pointerCurrentY = 0;
  let pointerActive = false;
  let scrollTarget = 0;
  let scrollCurrent = 0;

  let elapsedSeconds = 0;
  let lastTimestamp = performance.now();
  let frameId = 0;
  let timerId = 0;
  let isDisposed = false;
  let frameCount = 0;

  // Mobile uses a clean static lightweight render; continuous loop runs only on desktop when visible & motion allowed
  const shouldAnimate = () =>
    !isDisposed && !isMobile && isInView && isTabVisible && !isReducedMotion;

  const applyMobileMode = () => {
    particles.forEach((p) => {
      p.mesh.visible = !isMobile || !p.desktopOnly;
    });
    backRingA.visible = !isMobile;
    camera.position.z = isMobile ? 6.2 : 5.75;
  };
  applyMobileMode();

  const updateTransforms = (dt: number) => {
    const animateScale = isMobile || isReducedMotion ? 0 : 1;
    if (animateScale > 0) {
      elapsedSeconds += dt;
    }

    const pxTarget = isMobile || isReducedMotion || !pointerActive ? 0 : pointerTargetX;
    const pyTarget = isMobile || isReducedMotion || !pointerActive ? 0 : pointerTargetY;
    pointerCurrentX = THREE.MathUtils.damp(pointerCurrentX, pxTarget, 7.2, Math.max(dt, 0.001));
    pointerCurrentY = THREE.MathUtils.damp(pointerCurrentY, pyTarget, 7.2, Math.max(dt, 0.001));

    const st = isReducedMotion || isMobile ? 0 : scrollTarget;
    scrollCurrent = THREE.MathUtils.damp(scrollCurrent, st, 6.5, Math.max(dt, 0.001));

    const t = elapsedSeconds;
    const swayY = Math.sin(t * 0.8) * 0.06 * animateScale;
    const swayRotY = Math.sin(t * 0.52) * 0.11 * animateScale;
    const swayRotX = Math.cos(t * 0.44) * 0.04 * animateScale;

    rootRig.position.y = swayY + scrollCurrent * -0.14;
    rootRig.rotation.y =
      THREE.MathUtils.lerp(-0.16, 0, scrollCurrent * 0.65) + swayRotY + pointerCurrentX * 0.24;
    rootRig.rotation.x =
      THREE.MathUtils.lerp(0.06, 0.12, scrollCurrent) + swayRotX - pointerCurrentY * 0.18;

    cardGroup.position.x =
      THREE.MathUtils.lerp(-0.42, -0.58, scrollCurrent) +
      pointerCurrentX * 0.13 +
      Math.sin(t * 0.68 + 0.5) * 0.025 * animateScale;
    cardGroup.position.y =
      -0.06 + pointerCurrentY * 0.1 + Math.cos(t * 0.85) * 0.035 * animateScale;
    cardGroup.rotation.z = -0.06 + Math.sin(t * 0.55) * 0.02 * animateScale;

    lensGroup.position.x =
      THREE.MathUtils.lerp(0.5, 0.08, scrollCurrent) +
      pointerCurrentX * 0.24 +
      Math.cos(t * 0.78) * 0.045 * animateScale;
    lensGroup.position.y =
      THREE.MathUtils.lerp(-0.14, 0.02, scrollCurrent) +
      pointerCurrentY * 0.18 +
      Math.sin(t * 0.96 + 0.8) * 0.05 * animateScale;
    lensGroup.rotation.z =
      THREE.MathUtils.lerp(-0.12, 0, scrollCurrent * 0.7) +
      Math.sin(t * 0.66) * 0.04 * animateScale;

    backRingA.rotation.z = t * 0.12 + scrollCurrent * 0.65;
    backRingB.rotation.z = -t * 0.16 - scrollCurrent * 0.45;
    const ringScale = 1 + scrollCurrent * 0.14;
    backRingA.scale.setScalar(ringScale);

    clueNodes.forEach((node) => {
      const floatX = Math.cos(t * 0.65 + node.phase) * 0.06 * animateScale;
      const floatY = Math.sin(t * 0.85 + node.phase) * 0.07 * animateScale;
      node.mesh.position.x =
        THREE.MathUtils.lerp(node.baseX, node.scrollTargetX, scrollCurrent) +
        floatX +
        pointerCurrentX * 0.12;
      node.mesh.position.y =
        THREE.MathUtils.lerp(node.baseY, node.scrollTargetY, scrollCurrent) +
        floatY +
        pointerCurrentY * 0.1;
      node.mesh.position.z = THREE.MathUtils.lerp(node.baseZ, node.scrollTargetZ, scrollCurrent);
      node.mesh.rotation.x = t * 0.55 + node.phase + scrollCurrent * 0.9;
      node.mesh.rotation.y = t * 0.7 + node.phase;
    });

    particles.forEach((p) => {
      if (!p.mesh.visible) return;
      const angle = t * p.speed + p.phase;
      p.mesh.position.x =
        p.baseX +
        Math.cos(angle) * p.orbitRadius * animateScale +
        pointerCurrentX * (p.baseZ * 0.15);
      p.mesh.position.y =
        p.baseY +
        Math.sin(angle * 1.12) * p.orbitRadius * animateScale +
        pointerCurrentY * (p.baseZ * 0.12);
    });
  };

  const renderSingleFrame = () => {
    if (isDisposed) return;
    renderer.render(scene, camera);
    frameCount += 1;
    callbacks.onStateChange?.({
      paused: !shouldAnimate(),
      frameCount,
      mobile: isMobile,
    });
  };

  const cancelPending = () => {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
    if (timerId) {
      window.clearTimeout(timerId);
      timerId = 0;
    }
  };

  const tick = () => {
    if (!shouldAnimate()) {
      callbacks.onStateChange?.({
        paused: true,
        frameCount,
        mobile: isMobile,
      });
      return;
    }
    const now = performance.now();
    const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
    lastTimestamp = now;

    updateTransforms(dt);
    renderSingleFrame();

    if (!shouldAnimate()) return;
    if (isSoftwareGl) {
      scheduleAfterSoftwareDraw(renderer, tick, (id) => {
        timerId = id;
      });
    } else {
      frameId = window.requestAnimationFrame(tick);
    }
  };

  const ensureRunningOrRest = () => {
    cancelPending();
    lastTimestamp = performance.now();
    if (shouldAnimate()) {
      frameId = window.requestAnimationFrame(tick);
    } else {
      updateTransforms(0);
      renderSingleFrame();
    }
  };

  updateTransforms(0);
  renderSingleFrame();
  if (shouldAnimate()) {
    frameId = window.requestAnimationFrame(tick);
  }

  return {
    setPointer(nx: number, ny: number, active: boolean) {
      pointerTargetX = THREE.MathUtils.clamp(nx, -1, 1);
      pointerTargetY = THREE.MathUtils.clamp(ny, -1, 1);
      pointerActive = active;
    },
    setScrollProgress(progress: number) {
      scrollTarget = THREE.MathUtils.clamp(progress, 0, 1);
    },
    setMobileMode(mobile: boolean) {
      if (isMobile === mobile) return;
      isMobile = mobile;
      if (mobile) {
        pointerTargetX = 0;
        pointerTargetY = 0;
        pointerCurrentX = 0;
        pointerCurrentY = 0;
        pointerActive = false;
        scrollTarget = 0;
        scrollCurrent = 0;
      }
      applyMobileMode();
      ensureRunningOrRest();
    },
    setInView(inView: boolean) {
      if (isInView === inView) return;
      isInView = inView;
      ensureRunningOrRest();
    },
    setTabVisible(visible: boolean) {
      if (isTabVisible === visible) return;
      isTabVisible = visible;
      ensureRunningOrRest();
    },
    setReducedMotion(reduced: boolean) {
      if (isReducedMotion === reduced) return;
      isReducedMotion = reduced;
      if (reduced) {
        pointerTargetX = 0;
        pointerTargetY = 0;
        pointerCurrentX = 0;
        pointerCurrentY = 0;
        pointerActive = false;
        scrollTarget = 0;
        scrollCurrent = 0;
      }
      ensureRunningOrRest();
    },
    resize() {
      if (isDisposed) return;
      const w = Math.max(container.clientWidth, 160);
      const h = Math.max(container.clientHeight, 120);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      renderSingleFrame();
    },
    dispose() {
      isDisposed = true;
      cancelPending();
      disposeSceneObjects(scene);
      shadowTex.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
