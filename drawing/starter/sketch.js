/*
 * Starter code for creating a generative drawing using agents
 */

// parameters
let p = {
  // toggle filling screen or not
  fillScreen: false,

  // number of agents
  agentNum: 20,
  agentNumMin: 1,
  agentNumMax: 500,

  // add more params here ...
  myParam: 1,
  myParamMin: 0.1,
  myParamMax: 10.0,
  myParamStep: 0.1,
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
  // update all the agents
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
  // setup the canvas
  if (p.fillScreen) {
    resizeCanvas(windowWidth, windowHeight);
  } else {
    resizeCanvas(600, 600);
  }

  // clear the background
  background(250);

  // clear agent list
  agents = [];

  // create Agents
  for (i = 0; i < p.agentNum; i++) {
    let a = new Agent();
    agents.push(a);
  }
}

function keyPressed() {
  // space to reset all agents
  if (key == " ") {
    createAgents();
  }
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
  if (name == "agentNum" || name == "fillScreen") {
    createAgents();
  }
}
