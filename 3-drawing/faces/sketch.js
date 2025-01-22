// Ideas:
// 1. Have facial expressions paint over one another
// 2. Transition between facial expressions (static to chaos to static)

// parameters
let p = {
  // tile size
  tileSize: 3,
  tileSizeMin: 4,
  tileSizeMax: 64,

  // how random to make drawing path
  randomness: 20,

  // how large to make the image
  imageSize: 3,
  imageSizeMin: 1,
  imageSizeMax: 10,

  // brush size
  brushSize: 10,
  brushSizeMin: 1,
};

// list of agents
let agents;

// image to use for randomness
let sourceImage;

function preload() {
  // sourceImage = loadImage("data/flowers.png");
  imagePaths = ["grumpy.jpg", "happy.jpg", "sad.jpg", "surprised.jpg"];
  sourceImages = imagePaths.map((path) =>
    loadImage(`faces_data/${path}`, handleImage, handleError)
  );
  // sourceImage = loadImage("faces_data/grumpy.jpg", handleImage, handleError);
  // sourceImage = loadImage("data/mandrill.png");
  // sourceImage = loadImage("data/portrait.png");
}

function handleImage(img) {
  console.log("Loaded image", img);
  img.resize(128, 128);
}

// Log the error.
function handleError(event) {
  console.error("Oops!", event);
}

function setup() {
  createCanvas(
    sourceImages[0].width * p.imageSize,
    sourceImages[0].height * p.imageSize
  );

  // add params to Settings GUI
  createSettingsGui(p, { callback: paramChanged, load: false });

  // setup the window and create the agents
  createAgents();
}

function draw() {
  // background(240);

  // see the source image for testing
  // image(sourceImage, 0, 0, width, height);

  // update all agents first
  for (a of agents) {
    a.update();
  }

  // draw all the agents
  for (a of agents) {
    a.draw();
  }
}

// start the agents in a grid, one agent per grid location
function createAgents() {
  resizeCanvas(
    sourceImages[0].width * p.imageSize,
    sourceImages[0].height * p.imageSize
  );

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

  // Single-agent demo code
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
