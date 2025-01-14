/*
 * Starter code for creating a generative drawing using agents
 */

// parameters
let p = {
  // toggle filling screen or not
  fillScreen: false,

  // tile size
  tileSize: 32,
  tileSizeMin: 4,
  tileSizeMax: 64,

  // random seed and how random to make it
  seed: 1,
  randomness: 15,

  circleSize: 30,
  tileSize: 40,
};

// list of agents
let agents;

function setup() {
  createCanvas(600, 600);

  // add params to Settings GUI
  createSettingsGui(p, { callback: paramChanged, load: false });

  // setup the window and create the agents
  createAgents();
}

function draw() {
  background(240);

  // draw all the agents
  for (a of agents) {
    a.draw();
  }
}

// create the grid of agents, one agent per grid location
function createAgents() {
  // setup the canvas
  if (p.fillScreen) {
    resizeCanvas(windowWidth, windowHeight);
  } else {
    resizeCanvas(600, 600);
  }

  // denominator is size of tile
  let tiles = width / p.tileSize;

  agents = [];

  // step size between grid centres
  let step = width / tiles;
  // the length of an agent's line (diagonal line of tile)
  let length = sqrt(step * step + step * step);

  // create an Agent object and place it at centre of each tile
  for (x = step / 2; x < width; x += step)
    for (y = step / 2; y < height; y += step) {
      let a = new Agent(x, y, length);
      agents.push(a);
    }
}

function keyPressed() {
  if (key == " ") {
    // note how agent update is called here, not always in draw
    for (a of agents) {
      a.update();
    }
  }
}

function windowResized() {
  createAgents();
}

// global callback from the settings GUI
function paramChanged(name) {
  if (name == "tileSize" || name == "fillScreen") {
    createAgents();
  }
  if (name == "seed") {
    // generate random numbers starting from this "seed"
    randomSeed(p.seed);
  }
}
