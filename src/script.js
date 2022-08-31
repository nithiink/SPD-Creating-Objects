import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

import * as dat from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

// Helper Grid
scene.add(new THREE.GridHelper(1000, 10, 0x888888, 0x444444));

const addShape = {
  box: addBox,
  cone: addCone,
};

function addBox() {
  let box = new THREE.Mesh(
    new THREE.BoxBufferGeometry(75, 75, 75),
    new THREE.MeshStandardMaterial({ color: "#ffffff" })
  );
  scene.add(box);
}

function addCone() {
  let cone = new THREE.Mesh(
    new THREE.ConeBufferGeometry(5, 75, 75),
    new THREE.MeshStandardMaterial({ color: "#ffffff" })
  );
  scene.add(cone);
}

gui.add(addShape, "box").name("Add box");
gui.add(addShape, "cone").name("Add cone");

// Box

let box = new THREE.Mesh(
  new THREE.BoxBufferGeometry(75, 75, 75),
  new THREE.MeshStandardMaterial({ color: "#ffffff" })
);
gui.add(box.scale, "x").min(0.01).max(10).step(0.01).name("width");
gui.add(box.scale, "y").min(0.01).max(10).step(0.01).name("height");
gui.add(box.scale, "z").min(0.01).max(10).step(0.01).name("depth");
gui.add(box.position, "x").min(0.01).max(10).step(0.01).name("box x");
gui.add(box.position, "y").min(0.01).max(10).step(0.01).name("box y");
gui.add(box.position, "z").min(0.01).max(10).step(0.01).name("box z");
scene.add(box);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
// gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight("#ffffff", 0.5);
moonLight.position.set(4, 5, -2);
gui.add(moonLight, "intensity").min(0).max(1).step(0.001);
gui.add(moonLight.position, "x").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "y").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "z").min(-5).max(5).step(0.001);
scene.add(moonLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const aspect = window.innerWidth / window.innerHeight;
let cameraPersp = new THREE.PerspectiveCamera(20, aspect, 0.01, 30000);
let cameraOrtho = new THREE.OrthographicCamera(
  -600 * aspect,
  600 * aspect,
  600,
  -600,
  0.01,
  30000
);

// Base camera
let camera = cameraPersp;
camera.position.set(1000, 500, 1000);
camera.lookAt(0, 200, 0);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const transformControls = new TransformControls(camera, canvas);
// transformControls.enableDamping = true;

transformControls.addEventListener("dragging-changed", function (event) {
  controls.enabled = !event.value;
});

transformControls.attach(box);
scene.add(transformControls);

window.addEventListener("keydown", function (event) {
  switch (event.keyCode) {
    case 81: // Q
      transformControls.setSpace(
        transformControls.space === "local" ? "world" : "local"
      );
      break;

    case 16: // Shift
      transformControls.setTranslationSnap(100);
      transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));
      transformControls.setScaleSnap(0.25);
      break;

    case 87: // W
      transformControls.setMode("translate");
      break;

    case 69: // E
      transformControls.setMode("rotate");
      break;

    case 82: // R
      transformControls.setMode("scale");
      break;

    case 67: // C
      const position = camera.position.clone();

      camera = camera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
      camera.position.copy(position);

      controls.object = camera;
      transformControls.camera = camera;

      camera.lookAt(controls.target.x, controls.target.y, controls.target.z);
      onWindowResize();
      break;

    case 86: // V
      const randomFoV = Math.random() + 0.1;
      const randomZoom = Math.random() + 0.1;

      cameraPersp.fov = randomFoV * 160;
      cameraOrtho.bottom = -randomFoV * 500;
      cameraOrtho.top = randomFoV * 500;

      cameraPersp.zoom = randomZoom * 5;
      cameraOrtho.zoom = randomZoom * 5;
      onWindowResize();
      break;

    case 187:
    case 107: // +, =, num+
      transformControls.setSize(transformControls.size + 0.1);
      break;

    case 189:
    case 109: // -, _, num-
      transformControls.setSize(Math.max(transformControls.size - 0.1, 0.1));
      break;

    case 88: // X
      transformControls.showX = !transformControls.showX;
      break;

    case 89: // Y
      transformControls.showY = !transformControls.showY;
      break;

    case 90: // Z
      transformControls.showZ = !transformControls.showZ;
      break;

    case 32: // Spacebar
      transformControls.enabled = !transformControls.enabled;
      break;

    case 27: // Esc
      transformControls.reset();
      break;
  }
});

window.addEventListener("keyup", function (event) {
  switch (event.keyCode) {
    case 16: // Shift
      transformControls.setTranslationSnap(null);
      transformControls.setRotationSnap(null);
      transformControls.setScaleSnap(null);
      break;
  }
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;

  cameraPersp.aspect = aspect;
  cameraPersp.updateProjectionMatrix();

  cameraOrtho.left = cameraOrtho.bottom * aspect;
  cameraOrtho.right = cameraOrtho.top * aspect;
  cameraOrtho.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.render(scene, camera);
}
