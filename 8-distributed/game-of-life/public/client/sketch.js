let socket;
const cols = 64;
const rows = 32;
let resolution = 10;
let grid = [];
let myHue = 0; // Unique hue assigned by server
let clientCursors = {}; // Store cursor positions for all clients

function setup() {
  createCanvas(640, 320);

  grid = make2DArray(cols, rows, null);

  socket = io();

  // Receive assigned hue from the server
  socket.on("assignColor", (hue) => {
    myHue = hue;
  });

  // Listen for game state updates
  socket.on("state", (newGrid) => {
    grid = newGrid;
  });

  // Listen for cursor updates from other clients
  socket.on("updateCursors", (cursors) => {
    clientCursors = cursors;
  });
}

function draw() {
  background(0);

  // Draw grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * resolution;
      let y = j * resolution;
      let hueValue = grid[i][j];

      if (hueValue !== null) {
        fill(`hsl(${hueValue}, 100%, 50%)`);
        stroke(0);
        rect(x, y, resolution - 1, resolution - 1);
      }
    }
  }

  // Draw cursors as triangular mouse pointers
  for (let id in clientCursors) {
    let { i, j, hue } = clientCursors[id];
    let x = i * resolution;
    let y = j * resolution;

    drawCursor(x, y, hue, id);
  }

  // Send cursor position to the server
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    let i = floor(mouseX / resolution);
    let j = floor(mouseY / resolution);
    socket.emit("cursor", { i, j });
  }
}

// 🖱️ Function to draw a Figma-style cursor
function drawCursor(x, y, hue, id) {
  push();
  translate(x, y);

  // Cursor shape (triangle)
  stroke(255);
  strokeWeight(1);
  fill(`hsl(${hue}, 100%, 50%)`);
  beginShape();
  vertex(0, 0); // Tip of the cursor
  vertex(16, 20); // Bottom right corner
  vertex(6, 18); // Inner corner where the tail starts
  vertex(2, 24); // Reconnect to the main body
  endShape(CLOSE);

  pop();
}

function mousePressed() {
  let i = floor(mouseX / resolution);
  let j = floor(mouseY / resolution);
  socket.emit("mouse", { i, j });
}

// Helper function to create a 2D array
function make2DArray(cols, rows, fillValue) {
  return Array.from({ length: cols }, () => Array(rows).fill(fillValue));
}
