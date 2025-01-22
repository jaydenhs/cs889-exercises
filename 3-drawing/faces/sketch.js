// Ideas:
// 1. Have facial expressions paint over one another
// 2. Transition between facial expressions (static to chaos to static)

// parameters
let p = {
  // tile size
  tileSize: 8,
  tileSizeMin: 4,
  tileSizeMax: 64,

  // brush size
  brushSize: 10,
  brushSizeMin: 1,
  brushSizeMax: 40,

  duration: 240,
  durationMin: 120,
  durationMax: 480,

  alpha: 255,
  alphaMin: 0,
  alphaMax: 255,
};

// list of agents
let agents;

// image to use for randomness
let sourceImage;

function preload() {
  imagePaths = ["bird.jpg", "nemo.jpg", "parrot.jpg", "frog.jpg"];
  sourceImages = imagePaths.map((path) =>
    loadImage(`animals/${path}`, handleImage, handleError)
  );
  source;
}

function handleImage(img) {
  console.log("Loaded image", img);
  img.resize(512, 512);
}

// Log the error.
function handleError(event) {
  console.error("Oops!", event);
}

function setup() {
  createCanvas(sourceImages[0].width, sourceImages[0].height);
  createSettingsGui(p, { callback: paramChanged, load: false });
  createAgents();
}

function draw() {
  for (a of agents) {
    a.update();
  }
  for (a of agents) {
    a.draw();
  }
}

// start the agents in a grid, one agent per grid location
function createAgents() {
  resizeCanvas(sourceImages[0].width, sourceImages[0].height);

  // denominator is size of tile
  let tiles = width / p.tileSize;

  agents = [];

  // step size between grid centres
  let step = width / tiles;

  // create an Agent object and place it at centre of each tile
  for (x = step / 2; x < width; x += step)
    for (y = step / 2; y < height; y += step) {
      let a = new Agent(x, y);
      agents.push(a);
    }

  // // Single-agent demo code
  // let a = new Agent(256, 256);
  // agents.push(a);
}

function keyPressed() {
  if (key == " ") {
    createAgents();
  }
}

function windowResized() {
  createAgents();
}

// global callback from the settings GUI
function paramChanged(name) {
  if (name == "tileSize" || name == "imageSize") {
    createAgents();
  }
}
