/**
 * Three.js stack-core — scroll + project state targets
 */
import { perf, registerTicker, unregisterTicker, setLoopPaused } from './perf.js';

const PROJECT_STATES = [
  { rotY: 0, rim: 0x22d3ee, camZ: 4.0 },
  { rotY: 1.1, rim: 0x818cf8, camZ: 4.15 },
  { rotY: 2.2, rim: 0xc084fc, camZ: 3.95 },
  { rotY: 3.3, rim: 0xa855f7, camZ: 4.1 },
  { rotY: 4.4, rim: 0x22d3ee, camZ: 4.0 },
  { rotY: 5.5, rim: 0x34d399, camZ: 3.9 },
  { rotY: 6.2, rim: 0x818cf8, camZ: 4.05 },
];

let renderer, scene, camera, meshGroup, rimLight;
let visible = true;
let ready = false;
let renderTicker = null;
let resizeHandler = null;
let mouseHandler = null;

const current = { rotY: 0, rotX: 0, camZ: 4, rim: 0x22d3ee };
const target = { rotY: 0, rotX: 0, camZ: 4, rim: 0x22d3ee };
const scrollTarget = { rotY: 0, rotX: 0 };
let mouseX = 0;
let mouseY = 0;

export function setScrollProgress(p) {
  if (perf.reducedMotion) return;
  scrollTarget.rotY = p * Math.PI * 6;
  scrollTarget.rotX = Math.sin(p * Math.PI) * 0.35;
}

export function setProjectState(index) {
  const s = PROJECT_STATES[index] ?? PROJECT_STATES[0];
  target.rotY = s.rotY;
  target.camZ = s.camZ;
  target.rim = s.rim;
}

export function isSceneReady() {
  return ready;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(cur, tgt, t) {
  const r1 = (cur >> 16) & 255, g1 = (cur >> 8) & 255, b1 = cur & 255;
  const r2 = (tgt >> 16) & 255, g2 = (tgt >> 8) & 255, b2 = tgt & 255;
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return (r << 16) | (g << 8) | b;
}

function contextIsLost() {
  if (!renderer) return true;
  const gl = renderer.getContext();
  return !gl || gl.isContextLost();
}

function disposeScene() {
  if (renderTicker) {
    unregisterTicker(renderTicker);
    renderTicker = null;
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  if (mouseHandler) {
    window.removeEventListener('mousemove', mouseHandler);
    mouseHandler = null;
  }
  if (renderer) {
    try {
      renderer.dispose();
    } catch (_) { /* ignore */ }
  }
  renderer = scene = camera = meshGroup = rimLight = null;
  ready = false;
}

async function initScene() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  if (ready && renderer && !contextIsLost()) {
    setLoopPaused(false);
    visible = true;
    return;
  }

  disposeScene();

  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');

    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: perf.tier === 'high',
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(perf.getDprCap());
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.2, 4);

    const ambient = new THREE.AmbientLight(0x111122, 0.6);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(3, 4, 5);
    scene.add(key);

    rimLight = new THREE.PointLight(0x22d3ee, 2.5, 20);
    rimLight.position.set(-2, 1, 3);
    scene.add(rimLight);

    meshGroup = new THREE.Group();
    const simple = perf.tier === 'low';

    if (simple) {
      const geo = new THREE.IcosahedronGeometry(1.1, 0);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x0a0a14,
        metalness: 0.9,
        roughness: 0.15,
        emissive: 0x22d3ee,
        emissiveIntensity: 0.08,
      });
      const core = new THREE.Mesh(geo, mat);
      meshGroup.add(core);
      const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.25 })
      );
      meshGroup.add(wire);
    } else {
      for (let i = 0; i < 5; i++) {
        const geo = new THREE.BoxGeometry(1.4 - i * 0.12, 0.22, 1.4 - i * 0.12);
        const mat = new THREE.MeshPhysicalMaterial({
          color: 0x080810,
          metalness: 0.85,
          roughness: 0.2,
          emissive: 0x111128,
          emissiveIntensity: 0.05,
        });
        const box = new THREE.Mesh(geo, mat);
        box.position.y = i * 0.28 - 0.55;
        meshGroup.add(box);
      }
    }

    scene.add(meshGroup);
    renderer.render(scene, camera);
    ready = true;

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        setLoopPaused(!visible);
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    if (!perf.coarsePointer && !perf.reducedMotion) {
      mouseHandler = (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 0.35;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 0.2;
      };
      window.addEventListener('mousemove', mouseHandler, { passive: true });
    }

    renderTicker = (dt) => {
      if (!visible || !renderer || !meshGroup || contextIsLost()) return;

      try {
        const blend = perf.reducedMotion ? 1 : Math.min(dt * 4, 1);

        if (!perf.reducedMotion) {
          target.rotY = scrollTarget.rotY;
          current.rotX = lerp(current.rotX, scrollTarget.rotX + mouseY * 0.15, blend);
        }

        current.rotY = lerp(current.rotY, target.rotY + mouseX * 0.2, blend);
        current.camZ = lerp(current.camZ, target.camZ, blend);
        current.rim = lerpColor(current.rim, target.rim, blend);

        meshGroup.rotation.y = current.rotY;
        meshGroup.rotation.x = current.rotX;
        camera.position.z = current.camZ;
        rimLight.color.setHex(current.rim);

        renderer.render(scene, camera);
      } catch (err) {
        console.warn('WebGL frame skipped', err);
        setLoopPaused(true);
      }
    };
    registerTicker(renderTicker);

    let resizeT;
    resizeHandler = () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        if (!renderer || contextIsLost()) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(perf.getDprCap());
        renderer.setSize(w, h, false);
      }, 150);
    };
    window.addEventListener('resize', resizeHandler);
  } catch (err) {
    console.warn('WebGL init failed', err);
    canvas.classList.add('webgl-canvas--fallback');
  }
}

function bootScene() {
  requestAnimationFrame(() => initScene());
}

window.addEventListener('portfolio:loader-done', bootScene);
window.addEventListener('pageshow', (e) => {
  if (e.persisted) bootScene();
});

window.__scene = { setScrollProgress, setProjectState, isSceneReady };
