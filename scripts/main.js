import * as THREE from "https://cdn.skypack.dev/three";
import { OrbitControls } from "https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://cdn.skypack.dev/three/examples/jsm/loaders/FBXLoader.js";
import Stats from "https://cdn.skypack.dev/three/examples/jsm/libs/stats.module.js";
import { GUI } from "https://cdn.skypack.dev/three/examples/jsm/libs/dat.gui.module.js";

let camera, scene, renderer, stats, mesh;
let spotLight, dirLight, spotLightHelper, dirLightHelper;

let angle = 0; // текущий угол
let horizontalRadius = 120;
let verticalRadius = 300;
let startAnimation = false;

document.querySelector('input[type="checkbox"]').checked = true;
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

document.querySelector('.overlay').addEventListener('click', () => {
  document.querySelector('.modal').classList.remove('active');
  document.querySelector('.overlay').classList.remove('active');
});
init();
animate();
createPanel();
function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
      0.5,
    2000
  );
  camera.position.set(200, 155, 20);

  scene = new THREE.Scene();
  scene.background = new THREE.Color("#1a1a1a");
  scene.fog = new THREE.Fog("#1a1a1a", 1000, 2000);
  // Поверхность
  // —-----------------------------------------------------------------------------------------------------------------—

   mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    new THREE.MeshPhongMaterial({ color: "#4a4a4a", depthWrite: false })
  );
   mesh.position.set(20, 145, 30)
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;

  const camera_pivot = new THREE.Object3D();
  scene.add(camera_pivot);
  camera_pivot.add(camera);
  camera.lookAt(camera_pivot.position);
  if (!startAnimation) {
      rotateCamera(camera_pivot);
  }
  scene.add(mesh);


  const grid = new THREE.GridHelper(4000, 50, "#000000", "#000000");
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);

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
  scene.add(dirLight);
  scene.add(dirLightHelper);

  spotLight = new THREE.SpotLight("#ffffff", 1.7);
  spotLight.position.set(-400, 200, 200);
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
    object.position.set(20, 145, 30);
    scene.add(object);
  });
}
function createEllipse(a, b) {
    const curve = new THREE.EllipseCurve(
        0,  0,            // ax, aY
        a, b,           // xRadius, yRadius
        0,  2 * Math.PI,  // aStartAngle, aEndAngle
        false,            // aClockwise
        0                 // aRotation
    );

    const points = curve.getPoints( 150 );

    points.forEach(p => {p.z = p.y; p.y = 145}); // z = -y; y = 0

    let g = new THREE.BufferGeometry().setFromPoints(points);
    let m = new THREE.LineBasicMaterial({color: "red"});
    let l = new THREE.Line(g, m);
    scene.add(l);
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function rotateCamera(camera_pivot) {
  const rotations = [
    {
      name: "3/4 слева",
      rotateY: 75,
    },
    {
      name: "Фас",
      rotateY: 0,
    },
    {
      name: "3/4 справа",
      rotateY: -75,
    },
    {
      name: "Левый профиль",
      rotateY: 90,
    },
    {
      name: "Правый профиль",
      rotateY: -90,
    },
  ];
  const btns = document.querySelector(".btns");
  const Y_AXIS = new THREE.Vector3(0, 1, 0);
  let lastAngle = 0;
  btns.addEventListener("click", (e) => {
    const rotation = rotations.find(
      (el) => el.name.toLowerCase() === e.target.textContent?.toLowerCase()
    );

    camera_pivot.rotateOnAxis(Y_AXIS, lastAngle);
    const angle = (rotation.rotateY * Math.PI) / 180;
    lastAngle = -angle;
    camera_pivot.rotateOnAxis(Y_AXIS, angle);
  });
}
function createPanel() {
  const gui = new GUI({width: 400});


 const settings = {

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

  const settings1 = {
    X: dirLight.position.x,
    Y: dirLight.position.y,
    Z: dirLight.position.z,
    Цвет: dirLight.color.getHex(),
    Интенсивность: dirLight.intensity,
  };



  const dirLightControl = gui.addFolder("Освещение (dirLight)");

  dirLightControl.add(settings1, "X", 0, 300).onChange(function (val) {
    dirLight.position.x = val;
  });

  dirLightControl.add(settings1, "Y", 0, 300).onChange(function (val) {
    dirLight.position.y = val;
  });

  dirLightControl.add(settings1, "Z", -300, 0).onChange(function (val) {
    dirLight.position.z = val;
  });

  dirLightControl.addColor(settings1, "Цвет").onChange(function (val) {
    dirLight.color.setHex(val);
  });

  dirLightControl
      .add(settings1, "Интенсивность", 0, 3)
      .onChange(function (val) {
        dirLight.intensity = val;
      });

  dirLightControl.open();

  const spotLightControl = gui.addFolder("Освещение (spotLight)");

  spotLightControl.add(settings, "X", -150, 150).onChange(function (val) {
    spotLight.position.x = val;
  });

  spotLightControl.add(settings, "Y", 50, 350).onChange(function (val) {
    spotLight.position.y = val;
  });

  spotLightControl.add(settings, "Z", 50, 350).onChange(function (val) {
    spotLight.position.z = val;
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
      });

  spotLightControl
      .add(settings, "Угол", 0, Math.PI / 2)
      .onChange(function (val) {
        spotLight.angle = val;
      });

  spotLightControl.add(settings, "Полутень", 0, 1).onChange(function (val) {
    spotLight.penumbra = val;
  });

  spotLightControl.add(settings, "Упадок", 1, 2).onChange(function (val) {
    spotLight.decay = val;
  });

  spotLightControl.open();
}

document.querySelector('#stop_animation').addEventListener("click", (e) => {
    startAnimation = false;
    document.querySelectorAll('.btn:not(#stop_animation)').forEach(btn => btn.classList.remove('hide'));
    e.currentTarget.classList.remove('show');
})


let motionOptions = {};
let type = 'none';
let speed = 0;

function getSpeed(type, options) {
    let speed = options.startSpeed;

    return () => {
        if (type === 'linear' && speed < options.endSpeed) {
            speed += options.step;
            return (options.k || 1) * speed + 5;
        }else if(type === 'exponential' && speed < options.endSpeed){
            speed += options.step;
            return Math.exp(speed);
        }else if(type === 'quadratic' && speed < options.endSpeed){
            speed += options.step;
            return (options.a || 1) * speed ** 2 + (options.b || 1) * speed + 15;
        }else if(type === 'root' && speed < options.endSpeed){
            speed += options.step;
            return Math.sqrt(speed);
        }

        switch (type) {
            case 'linear':
                return (options.k || 1) * speed + 5;
            case 'exponential':
                return Math.exp(speed);
            case 'quadratic':
                return (options.a || 1) * speed ** 2 + (options.b || 1) * speed + 15;
            case 'root':
                return Math.sqrt(speed);
            default:
                return 20;
        }
    };
}
document.getElementById('submit').addEventListener('click', (e) => {

      horizontalRadius = +document.getElementById('horizontal').value;
      verticalRadius = +document.getElementById('vertical').value;

      if (!!document.querySelector('input[type="checkbox"]').checked)
          createEllipse(horizontalRadius, verticalRadius);

    if (horizontalRadius <= 0 || verticalRadius <= 0) {
          if (horizontalRadius <= 0) {
              document.querySelector('.hor').classList.add('show');
          }
          if (verticalRadius <= 0) {
              document.querySelector('.vert').classList.add('show');
          }
          return;
      }
    document.querySelectorAll('.error').forEach(it => it.classList.remove('show'))
    document.querySelector('.modal').classList.remove('active');
    document.querySelector('.overlay').classList.remove('active');
    document.querySelectorAll('.btn:not(#stop_animation)').forEach(btn => btn.classList.add('hide'));
    document.querySelector('#stop_animation').classList.add('show');

    const typeSpeed = document.querySelector('.select').name;

    switch (typeSpeed){
        case 'quad':
            motionOptions = {
                a: +document.getElementById('val_a').value,
                b: +document.getElementById('val_b').value,
                startSpeed: +document.getElementById('min').value,
                endSpeed: +document.getElementById('max').value,
                step: 0.05
            };
            break;
        case 'lin':
            motionOptions = {
                k: +document.getElementById('val_k').value,
                startSpeed: +document.getElementById('min').value,
                endSpeed: +document.getElementById('max').value,
                step: 0.05
            };
            break;
        case 'exp':
            motionOptions = {
                startSpeed: +document.getElementById('min').value,
                endSpeed: +document.getElementById('max').value,
                step: 0.05
            };
            break;
        case 'root':
            motionOptions = {
                startSpeed: +document.getElementById('min').value,
                endSpeed: +document.getElementById('max').value,
                step: 0.05
            };
            break;
        default:
            motionOptions = {};
            break;
    }

    speed = getSpeed(type, motionOptions);
    startAnimation = true;

})

let angularSpeed = THREE.Math.degToRad(45); // угловая скорость - градусов в секунду



document.querySelector('.modal__btns').addEventListener('click', (e) => {
    document.querySelectorAll('.modal__btn').forEach(btn => btn.classList.remove('select'));
    e.target.classList.add('select')
    switch (e.target.name) {
        case 'quad':
            document.querySelector('.linear').classList.remove('active');
            document.querySelector('.quadratic').classList.add('active');
            document.querySelector('.modal__range').classList.add('active');
            type = 'quadratic';
            break;
        case 'lin':
            document.querySelector('.linear').classList.add('active');
            document.querySelector('.quadratic').classList.remove('active');
            document.querySelector('.modal__range').classList.add('active');
            type = 'linear';
            break;
        case 'exp':
            document.querySelector('.linear').classList.remove('active');
            document.querySelector('.quadratic').classList.remove('active');
            document.querySelector('.modal__range').classList.add('active');
            type = 'exponential';
            break;
        case 'root':
            document.querySelector('.linear').classList.remove('active');
            document.querySelector('.quadratic').classList.remove('active');
            document.querySelector('.modal__range').classList.add('active');
            type = 'root';
            break;
        default:
            document.querySelector('.linear').classList.remove('active');
            document.querySelector('.quadratic').classList.remove('active');
            document.querySelector('.modal__range').classList.remove('active');
            type = 'none';
    }
})

function animate() {
    if (startAnimation) {
    camera.position.x = Math.cos(angle * Math.PI / 180) * horizontalRadius;
    camera.position.z = Math.sin(angle * Math.PI / 180) * verticalRadius;
    angle += (Math.PI / 180) * angularSpeed * Math.abs(speed());   // Приращение угла
    camera.lookAt(mesh.position);
  }
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();
}
