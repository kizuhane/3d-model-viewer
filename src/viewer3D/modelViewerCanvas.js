import * as THREE from "three";

import modelLoader from "../loader/modelLoader";
import onWindowResize from "./onWindowResize";
import ViewerCamera from "./elements/camera";
import performanceOutput from "./dev/performanceOutput";
import RotationCamera from "./elements/RotationCamera";
import ViewerLight from "./elements/CreateLight";
import CreateRenderer from "./elements/CreateRenderer";
import CreateBackground from "./elements/CreateBackground";

const bgModel = {
  floor: "../models/background/floor/floor.gltf",
  pillars: "../models/background/pillars/pilar.gltf",
};

async function modelViewerCanvas(container, src, { width, height, ratio }, dev) {
  let stats;

  // fps for dev
  if (dev) {
    stats = performanceOutput();
    container.appendChild(stats.dom);
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // init renderer and add to DOM
  const renderer = CreateRenderer(width, height);
  container.appendChild(renderer.domElement);

  // init camera and attach to orbitViewer
  const camera = ViewerCamera(width, height);
  const rotationCameraControl = RotationCamera(camera, renderer.domElement, false);
  // add light
  const light = ViewerLight();
  light.map((l) => scene.add(l));

  // DEV: camera  helper
  light.forEach((l) => {
    if (l.type !== "AmbientLight") scene.add(new THREE.CameraHelper(l.shadow.camera));
  });

  const background = await CreateBackground(bgModel);
  background.map((bg) => scene.add(bg));

  const model = await modelLoader(src);
  model.scenes[0].scale.set(0.15, 0.15, 0.15);
  scene.add(model.scene);

  function render() {
    renderer.render(scene, camera);
  }

  function animate() {
    if (dev) stats.update();

    rotationCameraControl.update();
    requestAnimationFrame(animate);
    render();
  }

  window.addEventListener(
    "resize",
    () => onWindowResize(camera, renderer, render, ratio, container.offsetWidth),
    false
  );

  animate();
}

export default modelViewerCanvas;
