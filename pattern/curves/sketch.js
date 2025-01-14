/*
 * Starter code for creating a generative drawing using agents
 */

// parameters
let p = {
  // toggle filling screen or not
  fillScreen: false,

  // offsets
  randomness: 3,
  randomnessMin: 0,
  randomnessMax: 20,
  randomnessStep: 0.1,

  // how often to create a new agent
  newAgentInterval: 50,

  speed: 8,
};

// list of agents
let agents = [];

function setup() {
  createCanvas(600, 600);

  // add params to Settings GUI
  createSettingsGui(p, { callback: paramChanged, load: false });

  // setup the window and create the agents
  setupCanvas();
}

function draw() {
  background(255);

  // update and draw all the agents
  for (a of agents) {
    a.update();
    a.draw();
  }

  if (frameCount % p.newAgentInterval === 0) {
    createAgent();
  }
}

function setupCanvas() {
  agents = [];
  if (p.fillScreen) {
    resizeCanvas(windowWidth, windowHeight);
  } else {
    resizeCanvas(600, 600);
  }
}

function createAgent() {
  let offsets = [];
  if (agents.length === 0) {
    offsets = [0, 0, 0, 0];
  } else {
    offsets = [...agents[agents.length - 1].offsets];
  }
  for (let i = 0; i < offsets.length; i++) {
    offsets[i] += random(-p.randomness, p.randomness);
  }
  let a = new Agent(offsets);
  agents.push(a);
}

function keyPressed() {
  if (key == " ") {
    createAgent();
  }
}

function windowResized() {
  createAgents();
}

// global callback from the settings GUI
function paramChanged(name) {
  if (name == "fillScreen") {
    setupCanvas();
  }
}
