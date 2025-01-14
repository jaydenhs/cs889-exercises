// parameters
let p = {
  // toggle filling screen or not
  fillScreen: false,

  // tile size
  tileSize: 64,
  tileSizeMin: 4,
  tileSizeMax: 64,

  // shape to use
  shapeNum: 1,
  shapeNumMin: 1,
  shapeNumMax: 8,

  // shape scale
  shapeScale: 0.5,
  shapeScaleMin: 0.1,
  shapeScaleMax: 3,
  shapeScaleStep: 0.01,

  // shape angle
  shapeAngle: 0,
  shapeAngleMin: -180,
  shapeAngleMax: 180,

  // distance scale
  distScale: 0.25,
  distScaleMin: 0.25,
  distScaleMax: 3,
  distScaleStep: 0.01,

  // shape offset
  shapeOffset: 0,
  shapeOffsetMin: -100,
  shapeOffsetMax: 100,
};

// list of agents
let agents;

// estimate maximum distance from an agent
let maxDist;

let shape;

function setup() {
  createCanvas(600, 600);

  // add params to Settings GUI
  createSettingsGui(p, { callback: paramChanged, load: false });

  // load the SVG shape
  shape = loadImage(`data/module_${p.shapeNum}.svg`);

  // setup everything and create the agents
  createAgents();
}

function draw() {
  background(250);

  // draw all the agents
  if (shape != null) {
    for (a of agents) {
      a.update();
      a.draw();
    }
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

  maxDist = sqrt(sq(width) + sq(height));

  agents = [];

  // denominator is size of tile
  let tiles = width / p.tileSize;
  // step size between grid centres
  let step = width / tiles;
  // the length of an agent's line (diagonal line of tile)
  let length = sqrt(step * step + step * step);

  // create an Agent object and place it at centre of each tile
  for (x = step / 2; x < width; x += step)
    for (y = step / 2; y < height; y += step) {
      let a = new Agent(x, y, shape);
      agents.push(a);
    }
}

function keyPressed() {
  // SHIFT-S saves the current canvas
  if (key == "S") {
    save("canvas.png");
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

  if (name == "shapeNum") {
    shape = loadImage(`data/module_${p.shapeNum}.svg`, function () {
      createAgents();
    });
  }
}
