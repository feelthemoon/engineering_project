import * as THREE from "https://cdn.skypack.dev/three";

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

  scene = new THREE.Scene();
  scene.background = new THREE.Color("#1a1a1a");
  scene.fog = new THREE.Fog("#1a1a1a", 1000, 2000);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
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
