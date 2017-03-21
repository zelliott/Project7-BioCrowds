
const THREE = require('three');
import Framework from './framework'

// Stuff I need to be global

var velocities = [];
var targets = [];

var NUM_PARTICLES = 10000;
var DIM = 100;
var SETTINGS = {
  FORMSHAPE: false
};

function onLoad(framework) {
  var { scene, camera, renderer, gui, stats } = framework;

  var torusGeo = new THREE.TorusKnotGeometry(20, 10, 100, 16);
  // var torusGeo = new THREE.BoxGeometry(20, 20, 20);
  var torusMat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.0
  });
  var torusMesh = new THREE.Mesh(torusGeo, torusMat);

  torusMesh.name = 'torus';
  torusMesh.translateX(DIM / 2);
  torusMesh.translateY(DIM / 2);
  torusMesh.translateZ(DIM / 2);

  scene.add(torusMesh);

  // Particles

  var particlesGeo = new THREE.Geometry();

  for (var i = 0; i < NUM_PARTICLES; i++) {
    var p = new THREE.Vector3();
    var vel = new THREE.Vector3();

    p.x = THREE.Math.randFloat(0, DIM);
    p.y = THREE.Math.randFloat(0, DIM);
    p.z = THREE.Math.randFloat(0, DIM);

    vel.x = THREE.Math.randFloat(0, 0.1);
    vel.y = THREE.Math.randFloat(0, 0.1);
    vel.z = THREE.Math.randFloat(0, 0.1);

    particlesGeo.vertices.push(p);
    velocities.push(vel);
  }

  var particlesMat = new THREE.PointsMaterial({ color: 0xffffff });
  var particlesMesh = new THREE.Points(particlesGeo, particlesMat);

  particlesMesh.name = 'particles';

  scene.add(particlesMesh);

  camera.position.set(1, 200, 200);
  camera.lookAt(new THREE.Vector3(0,0,0));

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  gui.add(SETTINGS, 'FORMSHAPE').name('Form a shape').onChange(function(newVal) {
    targets = [];
  });
}

function onUpdate(framework) {
  var { scene, camera, renderer, gui, stats } = framework;
  var particlesMesh = scene.getObjectByName('particles');
  var torusMesh = scene.getObjectByName('torus');

  if (!particlesMesh) return;

  var vertices = particlesMesh.geometry.vertices;


  if (SETTINGS.FORMSHAPE) {

    if (!torusMesh) return;

    var torusVertices = torusMesh.geometry.vertices;

    vertices.forEach(function(vert, i) {

      if (!targets[i]) {
        var index = THREE.Math.randInt(0, torusVertices.length - 1);
        targets[i] = torusVertices[index];
      }

      var target = targets[i];
      var dir = target.clone();

      dir.sub(vert);
      dir.divideScalar(100);

      if (dir.length() < 0.001) return;

      var vel = dir.clone();

      vert.add(vel);
    });

    particlesMesh.geometry.verticesNeedUpdate = true;

  } else {

    vertices.forEach(function(vert, i) {
      var vel = velocities[i];

      vert.add(vel);

      if (vert.x >= DIM || vert.y >= DIM || vert.z >= DIM ||
          vert.x <= 0 || vert.y <= 0 || vert.z <= 0) {
        vel.multiplyScalar(-1);
        vert.add(vel);
      }

      velocities[i] = vel;
    });

    particlesMesh.geometry.verticesNeedUpdate = true;

  }
}

Framework.init(onLoad, onUpdate);