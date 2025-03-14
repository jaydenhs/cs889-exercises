const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
app.use(express.static("public"));
const server = createServer(app);
const io = new Server(server);

server.listen(3000, () => {
  console.log("webserver started: http://localhost:3000");
});

// Game state
const cols = 64;
const rows = 32;
let grid = make2DArray(cols, rows, null);
let clientColors = {}; // Track assigned hues for each client
let usedHues = new Set(); // Track used hues to avoid overlap
let clientCursors = {}; // Track client cursor positions

// Function to create a 2D array
function make2DArray(cols, rows, fillValue) {
  return Array.from({ length: cols }, () => Array(rows).fill(fillValue));
}

// Function to assign a unique hue to each client
function getNextHue(socketId) {
  let availableHue = null;

  // Iterate through hues in increments to ensure a full range
  for (let hue = 0; hue < 360; hue += 90) {
    if (!usedHues.has(hue)) {
      availableHue = hue;
      break;
    }
  }

  // If all hues are taken, cycle back
  if (availableHue === null) {
    availableHue = (Object.keys(clientColors).length * 90) % 360;
  }

  clientColors[socketId] = availableHue;
  usedHues.add(availableHue);
  return availableHue;
}

// Handle socket connections
io.on("connection", (socket) => {
  console.log(`👋 Client connected: ${socket.id}`);

  const hue = getNextHue(socket.id);
  socket.emit("assignColor", hue);
  socket.emit("state", grid);

  // Track cursor movement
  socket.on("cursor", (data) => {
    clientCursors[socket.id] = { ...data, hue };
    io.emit("updateCursors", clientCursors);
  });

  // Handle mouse input
  socket.on("mouse", (data) => {
    let { i, j } = data;
    if (i >= 0 && i < cols && j >= 0 && j < rows) {
      let clientHue = clientColors[socket.id] || 0;

      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          let col = (i + x + cols) % cols;
          let row = (j + y + rows) % rows;
          grid[col][row] = clientHue;
        }
      }
    }
    io.emit("state", grid);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);

    if (clientColors[socket.id] !== undefined) {
      usedHues.delete(clientColors[socket.id]); // Free up hue
      delete clientColors[socket.id];
    }

    delete clientCursors[socket.id]; // Remove cursor
    io.emit("updateCursors", clientCursors);
  });
});

// Function to compute the next state based on Conway's rules
function computeNextState() {
  let next = make2DArray(cols, rows, null);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let currentHue = grid[i][j]; // Could be null or a hue value
      let neighbors = getLiveNeighbors(grid, i, j);

      if (currentHue !== null && (neighbors.count < 2 || neighbors.count > 3)) {
        next[i][j] = null;
      } else if (currentHue === null && neighbors.count === 3) {
        next[i][j] = neighbors.dominantHue;
      } else {
        next[i][j] = currentHue;
      }
    }
  }
  grid = next;
}

// Count live neighbors and find the dominant hue
function getLiveNeighbors(grid, x, y) {
  let hueCounts = {};
  let liveCount = 0;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;

      let col = (x + i + cols) % cols;
      let row = (y + j + rows) % rows;
      let hue = grid[col][row];

      if (hue !== null) {
        liveCount++;
        hueCounts[hue] = (hueCounts[hue] || 0) + 1;
      }
    }
  }

  let dominantHue = null;
  let maxCount = 0;
  for (let hue in hueCounts) {
    if (hueCounts[hue] > maxCount) {
      maxCount = hueCounts[hue];
      dominantHue = hue;
    }
  }

  return { count: liveCount, dominantHue };
}

// Update game state every X ms
setInterval(() => {
  computeNextState();
  io.emit("state", grid);
}, 200);
