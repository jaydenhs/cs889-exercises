/*
 * Starter code for creating a generative drawing using agents
 */

// parameters
let p = {
  // tile size
  tileSize: 15,
  tileSizeMin: 4,
  tileSizeMax: 64,

  // how random to make it
  randomness: 10,

  // how large to make the image
  imageSize: 3,
  imageSizeMin: 1,
  imageSizeMax: 10,
};

// list of agents
let agents;

// image to use for randomness
let sourceImage;

function preload() {
  sourceImage = loadImage("data/flowers.png");
  // sourceImage = loadImage("data/portrait.png")
}

function setup() {
  createCanvas(
    sourceImage.width * p.imageSize,
    sourceImage.height * p.imageSize
  );

  // add params to Settings GUI
  createSettingsGui(p, { callback: paramChanged, load: false });

  // setup the window and create the agents
  createAgents();
}

function draw() {
  // background(240);

  // image(sourceImage, 0, 0, width, height)

  // update all agents first
  for (a of agents) {
    a.update();
  }

  // draw all the agents
  for (a of agents) {
    a.draw();
  }
}

// create the grid of agents, one agent per grid location
function createAgents() {
  resizeCanvas(
    sourceImage.width * p.imageSize,
    sourceImage.height * p.imageSize
  );

  background(0);

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
