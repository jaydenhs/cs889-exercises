/*
 * Agents move around the canvas leaving a trail.
 */

// parameters
let p = {
  // toggle filling screen or not
  fillScreen: false,

  // number of agents
  agentNum: 1,
  agentNumMin: 1,
  agentNumMax: 500,

  // PLANTSc
  plantNum: 5,
  minPlantGrowSpeed: 1,
  maxPlantGrowSpeed: 2,

  // colour of agents
  baseHue: 0,
  baseHueMin: 0,
  baseHueMax: 360,

  // stroke width
  weight: 2,
  weightMin: 1,
  weightMax: 5,

  // controls if agents interact with each other
  // which creates other interesting effects
  interact: false,
};

// list of agents
let agents;

// two interactive parameters, see start of draw()
let maxStep = 0;
let probTurn = 0;

function setup() {
  createCanvas(600, 600);

  // add params to Settings GUI
  createSettingsGui(p, { callback: paramChanged, load: false });

  // setup the window and create the agents
  createAgents();
}

function draw() {
  // interactively adjust agent parameters
  maxStep = map(mouseX, 0, width, 0.1, 3);
  probTurn = map(mouseY, 0, height, 0.01, 0.1);

  colorMode(HSB, 360, 100, 100, 100);

  // update all agents
  agents.forEach((a) => a.update());

  if (p.interact) {
    // if two agents touch, then reset one and give
    // the weight to the other
    for (i = 0; i < agents.length; i++) {
      for (j = i + 1; j < agents.length; j++) {
        let a = agents[i];
        let b = agents[j];

        let threshold = a.weight / 2 + b.weight / 2;
        let d = dist(a.x, a.y, b.x, b.y);
        if (d < threshold) {
          if (a.weight > b.weight) {
            a.weight += b.weight;
            b.reset();
          } else {
            b.weight += b.weight;
            a.reset();
          }
        }
      }
    }
  }

  // draw all agents
  agents.forEach((a) => a.draw());
}

// create the grid of agents, one agent per grid location
function createAgents() {
  // setup the canvas
  if (p.fillScreen) {
    resizeCanvas(windowWidth, windowHeight);
  } else {
    resizeCanvas(600, 600);
  }

  background("#000000");

  agents = [];

  // create an Agent object and place it at centre of each tile
  for (i = 0; i < p.plantNum; i++) agents.push(new Agent());
}

function keyPressed() {
  if (key == " ") {
    createAgents();
  } else if (key == "x") {
    print(agents[0]);
  }
}

function windowResized() {
  createAgents();
}

// global callback from the settings GUI
function paramChanged(name) {
  if (name == "agentNum" || name == "fillScreen") {
    createAgents();
  }
}
