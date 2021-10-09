import * as THREE from "https://cdn.skypack.dev/three";
import { OrbitControls } from "https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://cdn.skypack.dev/three/examples/jsm/loaders/FBXLoader.js";
import { GUI } from "https://cdn.skypack.dev/three/examples/jsm/libs/dat.gui.module.js";
import Stats from "https://cdn.skypack.dev/three/examples/jsm/libs/stats.module.js";

let camera, scene, renderer, mixer, actions, stats;
let settings, settings1, spotLight, dirLight, spotLightHelper, dirLightHelper;

GUI.TEXT_CLOSED = "Свернуть панель";
GUI.TEXT_OPEN = "Развернуть панель";

init();
animate();
createPanel();

function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    2000
  );
  camera.position.set(0, 200, 300);
  rotateCamera();
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#1a1a1a");
  scene.fog = new THREE.Fog("#1a1a1a", 1000, 2000);
  // Поверхность
  // —-----------------------------------------------------------------------------------------------------------------—
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    new THREE.MeshPhongMaterial({ color: "#4a4a4a", depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const grid = new THREE.GridHelper(4000, 50, "#000000", "#000000");
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);
  // Освещение
  // —-----------------------------------------------------------------------------------------------------------------—
  console.log(scene);

  let t = new THREE.Object3D();
  t.translateX(0);
  t.translateY(170);
  t.translateZ(0);
  scene.add(t);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 300, 0);
  scene.add(hemiLight);

  dirLight = new THREE.DirectionalLight("#ffffff", 1);
  dirLight.position.set(50, 170, -100);
  dirLight.target = t;
  dirLight.target.updateMatrixWorld();
  dirLight.castShadow = true;
  dirLight.shadow.radius = 500;
  dirLight.shadow.camera.top = 25;
  dirLight.shadow.camera.bottom = -200;
  dirLight.shadow.camera.left = -120;
  dirLight.shadow.camera.right = 120;
  dirLight.shadow.camera.near = 0;
  dirLight.shadow.camera.far = 1000;
  dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 1, "#67c2ff");
  scene.add(dirLight);
  scene.add(dirLightHelper);

  spotLight = new THREE.SpotLight("#ffffff", 1.7);
  spotLight.position.set(0, 200, 200);
  spotLight.angle = Math.PI / 5;
  spotLight.penumbra = 0.5;
  spotLight.decay = 1.5;
  spotLight.distance = 1000;
  spotLight.target = t;
  spotLight.target.updateMatrixWorld();
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 512;
  spotLight.shadow.mapSize.height = 512;
  spotLight.shadow.camera.near = 10;
  spotLight.shadow.camera.far = 1000;
  spotLight.shadow.focus = 1;
  spotLightHelper = new THREE.SpotLightHelper(spotLight, "#ff6767");
  scene.add(spotLight);
  scene.add(spotLightHelper);

  // Renderer
  // —-----------------------------------------------------------------------------------------------------------------—

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 100, 0);
  controls.update();

  window.addEventListener("resize", onWindowResize);

  stats = new Stats();
  container.appendChild(stats.dom);
  // Модель
  // —-----------------------------------------------------------------------------------------------------------------—
  const loader = new FBXLoader();
  loader.load("models/Choosen One Ava Model.fbx", function (object) {
    object.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.flatshading = true;
      }
    });

    scene.add(object);
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function rotateCamera() {
  const rotations = [
    {
      name: "anfas left",
      rotate: { x: 0, y: 75, z: 0 },
    },
    {
      name: "fas",
      rotate: { x: 0, y: 0, z: 0 },
    },
    {
      name: "anfas right",
      rotate: { x: 0, y: -75, z: 0 },
    },
    {
      name: "profile left",
      rotate: { x: 0, y: 90, z: 0 },
    },
    {
      name: "profile right",
      rotate: { x: 0, y: -90, z: 0 },
    },
  ];
  const btns = document.querySelector(".btns");

  btns.addEventListener("click", (e) => {
    const rotation = rotations.find(
      (el) => el.name === e.target.textContent?.toLowerCase()
    );
    scene.rotation.y = (rotation.rotate.y * Math.PI) / 180;
  });
}

function createPanel() {
  const gui = new GUI({ width: 400 });

  const animControl = gui.addFolder("Управление анимацией");

  settings = {
    Скорость: 1.0,
    "Пауза/Продолжить": pauseContinue,
    X: spotLight.position.x,
    Y: spotLight.position.y,
    Z: spotLight.position.z,
    Цвет: spotLight.color.getHex(),
    Интенсивность: spotLight.intensity,
    Дистанция: spotLight.distance,
    Угол: spotLight.angle,
    Полутень: spotLight.penumbra,
    Упадок: spotLight.decay,
  };

  settings1 = {
    X: dirLight.position.x,
    Y: dirLight.position.y,
    Z: dirLight.position.z,
    Цвет: dirLight.color.getHex(),
    Интенсивность: dirLight.intensity,
  };

  animControl
    .add(settings, "Скорость", 0.0, 2.0, 0.01)
    .onChange(animationSpeed);
  animControl.add(settings, "Пауза/Продолжить");

  animControl.close();

  const dirLightControl = gui.addFolder("Освещение (dirLight)");

  dirLightControl.add(settings1, "X", 0, 300).onChange(function (val) {
    dirLight.position.x = val;
    dirLightHelper.update();
  });

  dirLightControl.add(settings1, "Y", 0, 300).onChange(function (val) {
    dirLight.position.y = val;
    dirLightHelper.update();
  });

  dirLightControl.add(settings1, "Z", -300, 0).onChange(function (val) {
    dirLight.position.z = val;
    dirLightHelper.update();
  });

  dirLightControl.addColor(settings1, "Цвет").onChange(function (val) {
    dirLight.color.setHex(val);
  });

  dirLightControl
    .add(settings1, "Интенсивность", 0, 3)
    .onChange(function (val) {
      dirLight.intensity = val;
      dirLightHelper.dispose();
    });

  dirLightControl.open();

  const spotLightControl = gui.addFolder("Освещение (spotLight)");

  spotLightControl.add(settings, "X", -150, 150).onChange(function (val) {
    spotLight.position.x = val;
    spotLightHelper.update();
  });

  spotLightControl.add(settings, "Y", 50, 350).onChange(function (val) {
    spotLight.position.y = val;
    spotLightHelper.update();
  });

  spotLightControl.add(settings, "Z", 50, 350).onChange(function (val) {
    spotLight.position.z = val;
    spotLightHelper.update();
  });

  spotLightControl.addColor(settings, "Цвет").onChange(function (val) {
    spotLight.color.setHex(val);
  });

  spotLightControl
    .add(settings, "Интенсивность", 0, 3)
    .onChange(function (val) {
      spotLight.intensity = val;
    });

  spotLightControl
    .add(settings, "Дистанция", 200, 1500)
    .onChange(function (val) {
      spotLight.distance = val;
      spotLightHelper.update();
    });

  spotLightControl
    .add(settings, "Угол", 0, Math.PI / 2)
    .onChange(function (val) {
      spotLight.angle = val;
      spotLightHelper.update();
    });

  spotLightControl.add(settings, "Полутень", 0, 1).onChange(function (val) {
    spotLight.penumbra = val;
  });

  spotLightControl.add(settings, "Упадок", 1, 2).onChange(function (val) {
    spotLight.decay = val;
  });

  spotLightControl.open();

  function animationSpeed(speed) {
    mixer.timeScale = speed;
  }

  function pauseContinue() {
    actions.forEach(function (action) {
      if (action.paused == false) {
        action.paused = true;
      } else {
        action.paused = false;
      }
    });
  }
}

function animate() {
  requestAnimationFrame(animate);
  camera.updateMatrixWorld();
  renderer.render(scene, camera);
  stats.update();
}
