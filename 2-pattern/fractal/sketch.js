let startWeight = 11;
let agents = [];
let frameCounter = 0;

function setup() {
  createCanvas(600, 600);
}

function draw() {
  background("#a1d0fc");
  fill(255);
  agents.forEach((a) => {
    a.update();
    if (a.alpha <= 0) {
      // print("Despawned agent :", agents.indexOf(a));
      agents.splice(agents.indexOf(a), 1);
    }
    a.draw();
  });
}

function mouseClicked() {
  createAgent();
}

function mouseDragged() {
  if (frameCounter % 5 === 0) {
    createAgent();
  }
  frameCounter++;
}

function createAgent() {
  // resizeCanvas(windowWidth, windowHeight);
  agents.push(new Agent(mouseX, mouseY));
}
