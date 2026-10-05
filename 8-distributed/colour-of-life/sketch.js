// Single-player port of the multiplayer Game of Life (8-distributed/game-of-life).
// The simulation that used to run on the server now runs here.
const resolution = 14; // cell size in px; the grid grows to fill the window
const stepMs = 200;

let cols;
let rows;
let grid;
let lastStep = 0;
let currentHue = 265; // changes on every click
const brushSizes = [1, 3, 5]; // cells square, changed with the scroll wheel
let brushIndex = 1;
let brushSize = brushSizes[brushIndex];
let wheelAccum = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  fitGrid();
}

// resize the grid to the window, keeping any cells that still fit
function fitGrid() {
  const oldGrid = grid;
  cols = ceil(width / resolution);
  rows = ceil(height / resolution);
  grid = make2DArray(cols, rows, null);
  if (oldGrid) {
    for (let i = 0; i < min(cols, oldGrid.length); i++) {
      for (let j = 0; j < min(rows, oldGrid[0].length); j++) {
        grid[i][j] = oldGrid[i][j];
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  fitGrid();
}

function draw() {
  if (millis() - lastStep > stepMs) {
    grid = computeNextState(grid);
    lastStep = millis();
  }

  background(0);
  stroke(0);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] !== null) {
        fill(`hsl(${grid[i][j]}, 100%, 50%)`);
        rect(i * resolution, j * resolution, resolution - 1, resolution - 1);
      }
    }
  }

  // hover cursor: the block a click would paint
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    noFill();
    stroke(255, 80);
    const i = floor(mouseX / resolution);
    const j = floor(mouseY / resolution);
    const start = brushStart();
    rect((i + start) * resolution, (j + start) * resolution, resolution * brushSize - 1, resolution * brushSize - 1);
  }
}

// scroll to resize the brush; accumulate so trackpads don't change it too fast
function mouseWheel(event) {
  wheelAccum += event.delta;
  if (abs(wheelAccum) >= 40) {
    brushIndex = constrain(brushIndex + (wheelAccum < 0 ? 1 : -1), 0, brushSizes.length - 1);
    brushSize = brushSizes[brushIndex];
    wheelAccum = 0;
  }
  return false; // don't scroll the page
}

// offset from the cursor cell to the top-left cell of the brush
function brushStart() {
  return -floor((brushSize - 1) / 2);
}

// click paints a brushSize x brushSize block (wrapping at the edges)
function mousePressed() {
  // golden-angle step keeps successive colours well separated
  currentHue = Math.round((currentHue + 137.5) % 360);
  paint(floor(mouseX / resolution), floor(mouseY / resolution));
}

function mouseDragged() {
  paint(floor(mouseX / resolution), floor(mouseY / resolution));
}

function paint(i, j) {
  if (i < 0 || i >= cols || j < 0 || j >= rows) return;
  const start = brushStart();
  for (let x = start; x < start + brushSize; x++) {
    for (let y = start; y < start + brushSize; y++) {
      grid[(i + x + cols) % cols][(j + y + rows) % rows] = currentHue;
    }
  }
}

// Conway's rules on a wrapping grid; a newborn takes the dominant neighbour hue
function computeNextState(grid) {
  const next = make2DArray(cols, rows, null);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const hue = grid[i][j];
      const n = liveNeighbors(grid, i, j);
      if (hue !== null && (n.count < 2 || n.count > 3)) next[i][j] = null;
      else if (hue === null && n.count === 3) next[i][j] = n.dominantHue;
      else next[i][j] = hue;
    }
  }
  return next;
}

function liveNeighbors(grid, x, y) {
  const hueCounts = {};
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const hue = grid[(x + i + cols) % cols][(y + j + rows) % rows];
      if (hue !== null) {
        count++;
        hueCounts[hue] = (hueCounts[hue] || 0) + 1;
      }
    }
  }
  let dominantHue = null;
  let max = 0;
  for (const hue in hueCounts) {
    if (hueCounts[hue] > max) {
      max = hueCounts[hue];
      dominantHue = Number(hue);
    }
  }
  return { count, dominantHue };
}

function make2DArray(cols, rows, fillValue) {
  return Array.from({ length: cols }, () => Array(rows).fill(fillValue));
}
