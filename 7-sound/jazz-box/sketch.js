// parameters
let p = {
  // fft smoothing
  smoothing: 0.9,
  smoothingMin: 0.01,
  smoothingMax: 0.99,
  smoothingStep: 0.01,

  // 2^bins bins (16 to 1024)
  bins: 4,
  binsMin: 2,
  binsMax: 10,
};

// my sound file
let sound;
let soundFFT;

// physics engine
let Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Events = Matter.Events,
  engine,
  world;

let balls = [];
let bars = []; // Store spectrogram bars
let boundaries = [];
let binCount;
let interacted;

// Tone.js Sound
let pianoSampler;

function preload() {
  // Load sound with Tone.js instead of p5.sound
  sound = new Tone.Player("data/drum-track-180bpm.mp3").toDestination();
}

function setup() {
  createCanvas(600, 600);

  // Add params to Settings GUI
  createSettingsGui(p, { callback: paramChanged, load: false });

  // Initialize physics engine
  engine = Engine.create();
  world = engine.world;

  // Run the engine
  Engine.run(engine);

  // Create the static bars for the spectrum visualization
  createBars();

  // Create walls and ceiling
  createBoundaries();

  // Initialize Tone.js Sampler with a piano sound (not connected to the FFT)
  pianoSampler = new Tone.Sampler({
    urls: {
      C4: "C4.mp3", // Middle C
    },
    release: 1,
    baseUrl: "https://tonejs.github.io/audio/salamander/",
  }).toDestination();

  Tone.loaded().then(() => {
    console.log("Tone.js loaded successfully!");

    // Now that Tone is loaded, initialize FFT and connect sound to it
    initializeAnalysis();
    sound.connect(soundFFT);
  });

  // Detect collisions
  Events.on(engine, "collisionStart", collisionHandler);
}

function initializeAnalysis() {
  binCount = 2 ** p.bins;
  print(`Creating FFT with ${binCount} bins`);
  soundFFT = new Tone.FFT(binCount);

  // Ensure soundFFT is connected to the drum loop sound (not the piano)
  sound.connect(soundFFT); // Connect the drum loop to the FFT for analysis
}

function createBars() {
  let barWidth = width / binCount + 1;

  // Remove old bars from world
  bars.forEach((bar) => World.remove(world, bar));
  bars = [];

  for (let i = 0; i < binCount; i++) {
    let x = map(i, 0, binCount, 0, width);
    let h = 10; // Start small

    let bar = Bodies.rectangle(x + barWidth / 2, height - h / 2, barWidth, h, {
      isStatic: true,
    });

    bars.push(bar);
    World.add(world, bar);
  }
}

function updateBars(spectrum) {
  let barWidth = width / binCount + 1;

  // Remove old bars and create new ones with updated height
  bars.forEach((bar) => World.remove(world, bar));
  bars = [];

  for (let i = 0; i < binCount; i++) {
    let x = map(i, 0, binCount, 0, width);
    let h = map(spectrum[i], 0, 255, 10, height);

    let bar = Bodies.rectangle(x + barWidth / 2, height - h / 2, barWidth, h, {
      isStatic: true,
    });

    bars.push(bar);
    World.add(world, bar);
  }
}

function createBoundaries() {
  let thickness = 10;

  let ceiling = Bodies.rectangle(width / 2, -thickness / 2, width, thickness, {
    isStatic: true,
    label: "ceiling", // Label for collision detection
  });

  boundaries = [ceiling];

  print({ boundaries });

  World.add(world, boundaries);
}

function draw() {
  background(250);

  if (sound.state === "started") {
    let spectrum = soundFFT.getValue();

    // Ensure spectrum is valid before updating bars
    if (spectrum && spectrum.length > 0) {
      updateBars(spectrum);

      noStroke();
      fill("red");
      for (let i = 0; i < bars.length; i++) {
        let x = map(i, 0, binCount, 0, width);
        let h = map(spectrum[i], 0, 255, 10, height);
        rect(x, height, width / binCount + 1, h);
      }
    }

    // Draw and update balls
    fill("black");
    for (let ball of balls) {
      ellipse(ball.position.x, ball.position.y, 8, 8);
    }

    // Draw boundaries
    fill("black");
    noStroke();
    for (let boundary of boundaries) {
      let x = boundary.bounds.min.x;
      let y = boundary.bounds.max.y;
      let w = boundary.bounds.max.x - boundary.bounds.min.x;
      let h = boundary.bounds.max.y - boundary.bounds.min.y;
      rect(x, y, w, h);
    }
  } else {
    fill("black");
    textAlign(CENTER, CENTER);
    text("Click to start", width / 2, height / 2);
  }
}

function mousePressed() {
  // Spawn a new ball at mouse position
  let ball = Bodies.circle(mouseX, mouseY, 8, { restitution: 2 }); // Add bounce
  World.add(world, ball);
  balls.push(ball);

  if (!interacted) {
    if (Tone.context.state !== "running") {
      Tone.start().then(() => console.log("Tone.js Audio Context Started"));
    }

    sound.start();
    interacted = true;
  }
}

// C Major Blues Scale Notes
const cMajorBluesScale = [
  "C4",
  "D4",
  "D#4",
  "E4",
  "F4",
  "F#4",
  "G4",
  "G#4",
  "A4",
  "B4",
];

// Function to map x position to the closest note in the scale
function getNoteFromX(x) {
  // Divide the width into the number of notes in the scale
  let noteIndex = Math.floor(map(x, 0, width, 0, cMajorBluesScale.length));
  return cMajorBluesScale[noteIndex];
}

function collisionHandler(event) {
  for (let pair of event.pairs) {
    let bodyA = pair.bodyA;
    let bodyB = pair.bodyB;

    if (bodyA.label === "ceiling" || bodyB.label === "ceiling") {
      // Get the x position of the ball that collided with the ceiling
      let ball = bodyA.label === "ceiling" ? bodyB : bodyA;
      let note = getNoteFromX(ball.position.x);

      // Play the note based on the ball's x position
      pianoSampler.triggerAttackRelease(note, "8n"); // 8th note duration
    }
  }
}

function paramChanged(name) {
  if (name == "bins" || name == "smoothing") {
    initializeAnalysis();
    createBars(); // Recreate bars when bins change
  }
}
