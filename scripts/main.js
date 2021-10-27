import * as THREE from "https://cdn.skypack.dev/three";
import { OrbitControls } from "https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://cdn.skypack.dev/three/examples/jsm/loaders/FBXLoader.js";
import Stats from "https://cdn.skypack.dev/three/examples/jsm/libs/stats.module.js";

let camera, scene, renderer, stats, mesh;
let spotLight, dirLight, spotLightHelper, dirLightHelper;

let clock = new THREE.Clock();
let angle = 0; // текущий угол
let angularSpeed = THREE.Math.degToRad(45); // угловая скорость - градусов в секунду
let delta = 12;


let horizontalRadius = 120;
let verticalRadius = 200;
document.addEventListener('keyup', (e) => {
  if (e.code === 'Escape') {
    document.querySelector('.modal').classList.remove('active');
    document.querySelector('.overlay').classList.remove('active');
  }
})
document.getElementById('start_animation').addEventListener('click', () => {
  document.querySelector('.modal').classList.add('active');
  document.querySelector('.overlay').classList.add('active');
})
document.getElementById('submit').addEventListener('click', () => {
  document.querySelector('.modal').classList.remove('active');
  document.querySelector('.overlay').classList.remove('active');

  horizontalRadius = +document.getElementById('horizontal').value;
  verticalRadius = +document.getElementById('vertical').value;

})
document.querySelector('.overlay').addEventListener('click', () => {
  document.querySelector('.modal').classList.remove('active');
  document.querySelector('.overlay').classList.remove('active');
});
init();
animate();

function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
      0.5,
    2000
  );
  camera.position.set(0, 25, 0);
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#1a1a1a");
  scene.fog = new THREE.Fog("#1a1a1a", 1000, 2000);
  // Поверхность
  // —-----------------------------------------------------------------------------------------------------------------—
   mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    new THREE.MeshPhongMaterial({ color: "#4a4a4a", depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;

  // const camera_pivot = new THREE.Object3D();
  // scene.add(camera_pivot);
  // camera_pivot.add(camera);
  // camera.lookAt(camera_pivot.position);
  // rotateCamera(camera_pivot);
  // moveCameraByEllipse(camera_pivot)

  scene.add(mesh);

  // const grid = new THREE.GridHelper(4000, 50, "#000000", "#000000");
  // grid.material.opacity = 0.2;
  // grid.material.transparent = true;
  // scene.add(grid);
  // Освещение
  // —-----------------------------------------------------------------------------------------------------------------—

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
  // spotLightHelper = new THREE.SpotLightHelper(spotLight, "#ff6767");
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
  loader.load("models/engine.fbx", function (object) {
    object.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.flatshading = true;
      }
    });
    object.position.set(20, 5, 30);
    scene.add(object);
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function rotateCamera(camera_pivot) {
  const rotations = [
    {
      name: "3/4 left",
      rotateY: 75,
    },
    {
      name: "fas",
      rotateY: 0,
    },
    {
      name: "3/4 right",
      rotateY: -75,
    },
    {
      name: "profile left",
      rotateY: 90,
    },
    {
      name: "profile right",
      rotateY: -90,
    },
  ];
  const btns = document.querySelector(".btns");
  const Y_AXIS = new THREE.Vector3(0, 1, 0);
  let lastAngle = 0;
  btns.addEventListener("click", (e) => {
    const rotation = rotations.find(
      (el) => el.name === e.target.textContent?.toLowerCase()
    );

    camera_pivot.rotateOnAxis(Y_AXIS, lastAngle);
    const angle = (rotation.rotateY * Math.PI) / 180;
    lastAngle = -angle;
    camera_pivot.rotateOnAxis(Y_AXIS, angle);
  });
}


function animate() {
  requestAnimationFrame(animate);
  camera.position.x = Math.cos(angle * Math.PI / 180) * horizontalRadius;
  camera.position.z = Math.sin(angle * Math.PI / 180) * verticalRadius;

  angle += (Math.PI / 180) * angularSpeed * delta + 2; // приращение угла
  camera.lookAt(mesh.position);
  renderer.render(scene, camera);
  stats.update();
}
