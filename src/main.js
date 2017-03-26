const THREE = require('three');
import Framework from './framework'

class Agent {
  constructor(x, y, idx, color) {
    this.pos = new THREE.Vector3(x, y, 1);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.size = new THREE.Vector3(0, 0, 0);
    this.radius = 5;
    this.markers = [];
    this.idx = idx;
    this.color = color;
  }
}

class Marker {
  constructor(x, y) {
    this.pos = new THREE.Vector3(x, y, 1);

    this.dist = Infinity;
    this.agent = null;
    this.color = new THREE.Color(0x000000);
    this.idx = -1;
  }
}

class Grid {
  constructor(scene, width, height) {
    this.width = width;
    this.height = height;
    this.markers = [];
    this.agentClasses = {};

    this.geom = new THREE.PlaneGeometry(width, height, 32);
    this.mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(this.geom, this.mat);

    this.scene = scene;

    this.scene.add(this.mesh);

    this.geomMarkers = null;
    this.meshMarkers = null;
    this.meshAgents = [];

    this.debug = true;
  }

  generateMarkers(n) {
    for (var i = 0; i < n; i++) {
      var x = THREE.Math.randInt(0, this.width - 1);
      var y = THREE.Math.randInt(0, this.height - 1);
      var idx = x + (y * this.width);

      this.markers[idx] = new Marker(x, y);
    }
  }

  renderMarkers() {
    var geom = new THREE.Geometry();

    for (var i = 0; i < this.markers.length; i++) {
      var marker = this.markers[i];

      if (marker) {
        var idx = geom.vertices.length;

        geom.vertices.push(marker.pos);
        geom.colors.push(marker.color);

        marker.idx = idx;
      }
    }

    var mat = new THREE.PointsMaterial({ vertexColors: THREE.VertexColors });
    var mesh = new THREE.Points(geom, mat);

    mesh.translateX(this.width / -2);
    mesh.translateY(this.height / -2);

    mesh.translateX(0.5);
    mesh.translateY(0.5);

    this.scene.add(mesh);

    this.geomMarkers = geom;
    this.meshMarkers = mesh;
  }

  generateAgentClass(id, n, goal, color) {
    var agents = [];

    for (var i = 0; i < n; i++) {
      var x = THREE.Math.randFloat(0, this.width - 1);
      var y = THREE.Math.randFloat(0, this.height - 1);
      var idx = i;
      var agent = new Agent(x, y, idx, color);

      agents.push(agent);
    }

    this.agentClasses[id] = {
      goal: goal,
      agents: agents,
      color: color
    };
  }

  renderAgents() {
    Object.keys(this.agentClasses).forEach(function(id) {
      var agentClass = this.agentClasses[id];
      var { goal, agents, color } = agentClass;
      var group = new THREE.Group();

      for (var i = 0; i < agents.length; i++) {
        var agent = agents[i];
        var mesh = this.createAgentMesh(agent, color);

        agent.mesh = mesh;
        group.add(mesh);
      }

      group.translateX(this.width / -2);
      group.translateY(this.height / -2);

      this.scene.add(group);

      this.meshAgents.push(group);

      this.renderGoal(goal, color);
    }, this);
  }

  createAgentMesh(agent, color) {
    var group = new THREE.Group();
    var { pos, radius } = agent;

    var geomA = new THREE.CylinderGeometry(1, 1, 2, 32);
    var matA = new THREE.MeshBasicMaterial({ color: color });
    var meshA = new THREE.Mesh(geomA, matA);

    meshA.rotateX(Math.PI / 2.0);

    var curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
    var path = new THREE.Path(curve.getPoints(20));
    var geomB = path.createPointsGeometry(20);
    var matB = new THREE.LineBasicMaterial({ color: color });
    var meshB = new THREE.Line(geomB, matB);

    group.add(meshA);
    group.add(meshB);

    group.translateX(pos.x);
    group.translateY(pos.y);

    return group;
  }

  renderGoal(goal, color) {
    var geom = new THREE.BoxGeometry(2, 2, 1);
    var mat = new THREE.MeshBasicMaterial({ color: color });
    var mesh = new THREE.Mesh(geom, mat);

    mesh.translateX(goal.x);
    mesh.translateY(goal.y);
    mesh.translateZ(goal.z);

    mesh.translateX(this.width / -2);
    mesh.translateY(this.height / -2);

    this.scene.add(mesh);
  }

  update() {
    this.clearMarkersAgents();
    this.updateAgentsMarkers();
    this.updateMarkersColors();
    this.updateAgentsVelocities();
    this.updateAgentsPositions();
    this.updateVisibility();
  }

  updateVisibility() {
    for (var i = 0; i < this.meshAgents.length; i++) {
      var meshAgentsClass = this.meshAgents[i];

      for (var j = 0; j < meshAgentsClass.children.length; j++) {
        var agent = meshAgentsClass.children[j];
        var radiusMesh = agent.children[1];

        radiusMesh.visible = this.debug;
      }
    }

    this.meshMarkers.visible = this.debug;
  }

  updateAgentsPositions() {
    Object.keys(this.agentClasses).forEach(function(id) {
      var agentClass = this.agentClasses[id];
      var { goal, agents, color } = agentClass;

      for (var i = 0; i < agents.length; i++) {
        var agent = agents[i];
        var { pos, vel, mesh } = agent;

        pos.add(vel);

        mesh.translateX(vel.x);
        mesh.translateY(vel.y);
      }
    }, this);
  }

  updateAgentsVelocities() {
    Object.keys(this.agentClasses).forEach(function(id) {
      var agentClass = this.agentClasses[id];
      var { goal, agents, color } = agentClass;

      for (var i = 0; i < agents.length; i++) {
        var agent = agents[i];
        var { pos, markers } = agent;
        var goalVec = goal.clone().sub(pos);
        var wSum = 0;
        var vSum = new THREE.Vector3(0, 0, 0);

        for (var j = 0; j < markers.length; j++) {
          var marker = markers[j];
          var markerVec = marker.pos.clone().sub(pos);
          var markerMag = markerVec.length();

          var theta = goalVec.angleTo(markerVec);
          var w = (1 + Math.cos(theta)) / (1 + markerMag);
          var v = markerVec.clone().multiplyScalar(w);

          wSum += w;
          vSum.add(v);
        }

        vSum.divideScalar(wSum);
        vSum.divideScalar(10);
        vSum.clampLength(0.01, 1);
        agent.vel = vSum;
      }
    }, this);
  }

  updateMarkersColors() {
    for (var i = 0; i < this.markers.length; i++) {
      var marker = this.markers[i];

      if (marker) {
        var { agent, idx } = marker;
        var color = (agent) ? new THREE.Color(agent.color) : new THREE.Color(0x000000);

        this.geomMarkers.colors[idx].set(color);
      }
    }

    this.geomMarkers.colorsNeedUpdate = true;
  }

  updateAgentsMarkers() {
    Object.keys(this.agentClasses).forEach(function(id) {
      var agentClass = this.agentClasses[id];
      var { goal, agents, color } = agentClass;

      for (var i = 0; i < agents.length; i++) {
        var agent = agents[i];
        var { pos, radius } = agent;

        agent.markers = [];

        for (var dx = -5; dx <= 5; dx++) {
          for (var dy = -5; dy <= 5; dy++) {

            var x = Math.floor(agent.pos.x);
            var y = Math.floor(agent.pos.y);

            x += dx;
            y += dy;

            THREE.Math.clamp(x, 0, this.width - 1);
            THREE.Math.clamp(y, 0, this.height - 1);

            var idx = x + (y * this.width);
            var marker = this.markers[idx];

            if (!marker) continue;

            var dist = pos.distanceTo(marker.pos);

            if (dist < marker.dist && dist <= radius) {
              marker.dist = dist;
              marker.agent = agent;
            }
          }
        }
      }

      for (var i = 0; i < this.markers.length; i++) {
        var marker = this.markers[i];

        if (marker) {

          var agent = marker.agent;

          if (agent) agent.markers.push(marker);
        }
      }
    }, this);
  }

  clearMarkersAgents() {
    for (var i = 0; i < this.markers.length; i++) {
      var marker = this.markers[i];

      if (marker) {
        marker.dist = Infinity;
        marker.agent = null;
      }
    }
  }

  clearAll() {
    for (var i = this.scene.children.length - 1; i >= 0; i--) {
      this.scene.remove(this.scene.children[i]);
    }
  }
}

function setupFourCorners(scene) {
  var grid = new Grid(scene, 100, 100);

  grid.generateMarkers(5000);
  grid.renderMarkers();

  var goal0 = new THREE.Vector3(0, 0, 1);
  var goal1 = new THREE.Vector3(100, 100, 1);
  var goal2 = new THREE.Vector3(0, 100, 1);
  var goal3 = new THREE.Vector3(100, 0, 1);
  var color0 = 0xd8548c;
  var color1 = 0x49d5d0;
  var color2 = 0xfe7448
  var color3 = 0x1b91f2;

  grid.generateAgentClass(0, 20, goal0, color0);
  grid.generateAgentClass(1, 20, goal1, color1);
  grid.generateAgentClass(2, 20, goal2, color2);
  grid.generateAgentClass(3, 20, goal3, color3);
  grid.renderAgents();

  return grid;
}

function setupSingleCenter(scene) {
  var grid = new Grid(scene, 100, 100);

  grid.generateMarkers(5000);
  grid.renderMarkers();

  var goal0 = new THREE.Vector3(52, 52, 1);
  var goal1 = new THREE.Vector3(48, 48, 1);
  var color0 = 0xd8548c;
  var color1 = 0x49d5d0;

  grid.generateAgentClass(0, 20, goal0, color0);
  grid.generateAgentClass(1, 20, goal1, color1);
  grid.renderAgents();

  return grid;
}

function onLoad(framework) {
  var { scene, camera, renderer, gui, stats } = framework;

  var options = {
    scenario: 'Four corners',
    debug: true
  };

  var grid = setupFourCorners(scene);

  framework.grid = grid;

  camera.position.set(0, 0, 100);
  camera.lookAt(new THREE.Vector3(0,0,0));

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  gui.add(options, 'scenario', ['Four corners', 'Single center']).name('Scenario').onChange(function(newVal) {
    framework.grid.clearAll();

    var grid;

    if (newVal === 'Four corners') {
      grid = setupFourCorners(scene);
    } else {
      grid = setupSingleCenter(scene);
    }

    framework.grid = grid;
    grid.debug = options.debug;
  });

  gui.add(options, 'debug').name('Debug').onChange(function(newVal) {
    framework.grid.debug = newVal;
  });
}

function onUpdate(framework) {
  var { scene, camera, renderer, gui, stats, grid } = framework;

  if (grid) {
    grid.update();
  }
}

Framework.init(onLoad, onUpdate);