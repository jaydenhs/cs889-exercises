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
}

// Log the error.
function handleError(event) {
  console.error("Oops!", event);
}

// source images scaled and cropped to fill the canvas, one per photo
let coverImages = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  createSettings();
  createAgents();
}

// floating settings panel over the top right of the canvas
let settings;

function createSettings() {
  settings = QuickSettings.create(width - 220, 56, "Settings");
  const slider = (label, key, step = 1) =>
    settings.addRange(label, p[key + "Min"], p[key + "Max"], p[key], step, (v) => {
      p[key] = v;
      paramChanged(key);
    });
  slider("Tile size", "tileSize");
  slider("Brush size", "brushSize");
  // duration is stored in frames (60 per second); alpha is stored as 0-255
  settings.addRange("Transition duration (s)", p.durationMin / 60, p.durationMax / 60, p.duration / 60, 0.5, (v) => {
    p.duration = round(v * 60);
  });
  settings.addRange("Brush opacity (%)", 0, 100, round((p.alpha / 255) * 100), 1, (v) => {
    p.alpha = round((v / 100) * 255);
  });
  // hidden by default; the 'H' key or the gear button shows and hides it
  settings.hide();
  settings.setKey("H");

  const gear = createButton("⚙");
  gear.attribute("title", "Settings (H)");
  gear.style("position", "fixed");
  gear.style("top", "10px");
  gear.style("right", "10px");
  gear.style("width", "36px");
  gear.style("height", "36px");
  gear.style("font-size", "18px");
  gear.style("cursor", "pointer");
  gear.style("border", "1px solid rgba(255,255,255,.4)");
  gear.style("border-radius", "50%");
  gear.style("color", "#fff");
  gear.style("background", "rgba(0,0,0,.45)");
  gear.mousePressed(() => settings.toggleVisibility());
}

function buildCoverImages() {
  coverImages = sourceImages.map((img) => {
    const g = createGraphics(width, height);
    g.pixelDensity(1);
    const s = max(width / img.width, height / img.height);
    g.image(img, (width - img.width * s) / 2, (height - img.height * s) / 2, img.width * s, img.height * s);
    return g;
  });
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
  buildCoverImages();

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
  resizeCanvas(windowWidth, windowHeight);
  settings.setPosition(width - 220, 56);
  createAgents();
}

// global callback from the settings GUI
function paramChanged(name) {
  if (name == "tileSize" || name == "imageSize") {
    createAgents();
  }
}
