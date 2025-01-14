// parameters
let p = {
  // toggle filling screen or not
  fillScreen: false,

  // stroke weight
  weight: 1,
  weightMin: 0.5,
  weightMax: 32,

  // tile size
  tileSize: 32,
  tileSizeMin: 4,
  tileSizeMax: 64,
};

function setup() {
  createCanvas(600, 600);

  // add params to Settings GUI
  createSettingsGui(p, { callback: paramChanged, load: false });

  // setup the window and create the agents
  createAgents();
}

function draw() {
  background(250);

  // update and draw all the agents
  for (a of agents) {
    a.update();
    a.draw();
  }
}

let agents;

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
  for (let x = step / 2; x < width; x += step)
    for (let y = step / 2; y < height; y += step) {
      let a = new Agent(x, y, length);
      agents.push(a);
    }
}

function keyPressed() {
  if (key === " ") createAgents();
}

function windowResized() {
  createAgents();
}

// global callback from the settings GUI
function paramChanged(name) {
  print(name);
  if (name == "tileSize" || name == "fillScreen") {
    createAgents();
  }
}
