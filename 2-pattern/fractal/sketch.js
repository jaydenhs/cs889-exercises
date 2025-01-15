let angle;
let angleSlider;
let startWeight = 11;
let agents = [];
let numAgents = 0;

// parameters
let p = {
  numBranches: 3,
};

function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(0);
  fill(255);
  text("Fractal branches: " + p.numBranches, 10, 20);
  agents.forEach((a) => a.update());
  agents.forEach((a) => a.draw());
}

function mouseClicked() {
  createAgent();
}

function mouseWheel(event) {
  if (event.delta > 0 && p.numBranches < 10) {
    p.numBranches++;
  } else if (event.delta < 0 && p.numBranches > 3) {
    p.numBranches--;
  }
  print("numBranches: " + p.numBranches);
}

function createAgent() {
  // resizeCanvas(windowWidth, windowHeight);
  agents.push(new Agent(mouseX, mouseY));
  numAgents++;
}
