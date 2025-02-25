// parameters
let p = {
  keyPoints: false,
  skeleton: true,
  info: false,

  strokeWidth: 30,
  strokeWidthMin: 20,
  strokeWidthMax: 40,
};

// the HandPose model
// using https://docs.ml5js.org/#/reference/handpose
let model;
let predictions = [];
let video;

// Conductor variables
let direction = "";
let beat = 0;
let pBeat = 0;

// BPM calculation
let lastBeatFrame = 0;
let originalBPM = 150;
let bpm = originalBPM;
const previousBPMs = Array(3).fill(bpm); // Store the last N BPMs for smoothing
let smoothedBPM = bpm;

// Audio
let symphony;
let clicked = false;
let audioContext;
let source;
let buffer;
let gainNode;
let speed = 1.0; // Default playback speed

// include the p5.js sound library
function preload() {
  // initialize the model
  model = ml5.handPose(
    // model options
    {
      flipped: true, // mirror the predictions to match video
      maxHands: 2,
      modelType: "full",
    },
    // callback when loaded
    () => {
      console.log("🚀 model loaded");
    }
  );
  // Create an audio element
  audio = new Audio("symphony-iv.mp3");
  audio.preservesPitch = true; // Ensure pitch correction when speed changes
}

function setup() {
  createCanvas(640, 480);

  // create an HTML video capture object
  video = createCapture(VIDEO, { flipped: true });
  video.size(width, height);
  video.hide();

  createSettingsGui(p, { callback: paramChanged, load: false });
  model.detectStart(video, (results) => {
    predictions = results;
  });
}

function draw() {
  background("#f5f5f5");

  if (clicked) {
    // draw different parts of the prediction
    predictions.forEach((hand, i) => {
      // if (p.keyPoints) drawKeypoints(hand, i);
      if (p.skeleton) drawSkeleton(hand, i);
      // if (p.info) drawInfo(hand, i);
      if (hand.handedness === "Right") {
        drawIndexFingerSkeleton(hand, i);
      }
    });

    if (pBeat !== beat) {
      calculateBPM();
      print(beat);
      pBeat = beat;
      previousBPMs.shift();
      previousBPMs.push(bpm);
      smoothedBPM =
        previousBPMs.reduce((a, b) => a + b, 0) / previousBPMs.length;
      gsap.to(audio, {
        playbackRate: smoothedBPM / originalBPM,
        duration: 0.2,
      });
    }

    // debug info
    debugInfo();
    drawFps();
  }
}

// Draw lines between certain main keypoints
function drawSkeleton(hand, i) {
  const c = "Black";
  stroke(c);
  strokeWeight(p.strokeWidth);
  noFill();

  // get lookup table for connections
  const connections = model.getConnections();

  connections.forEach((c) => {
    const [i, j] = c;
    const a = hand.keypoints[i];
    const b = hand.keypoints[j];
    line(a.x, a.y, b.x, b.y);
  });
}

function drawIndexFingerSkeleton(hand, i) {
  const c = "white";
  stroke(c);
  strokeWeight(15);
  noFill();

  const indexFingerConnections = [
    ["index_finger_mcp", "index_finger_pip"],
    ["index_finger_pip", "index_finger_dip"],
    ["index_finger_dip", "index_finger_tip"],
  ];

  indexFingerConnections.forEach(([start, end]) => {
    const startPoint = hand.keypoints.find((kp) => kp.name === start);
    const endPoint = hand.keypoints.find((kp) => kp.name === end);
    if (startPoint && endPoint) {
      line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
    }
  });

  // Determine the direction of the index finger tip
  const tip = hand.keypoints3D.find((kp) => kp.name === "index_finger_tip");
  const pip = hand.keypoints3D.find((kp) => kp.name === "index_finger_pip");

  if (tip && pip) {
    const dx = tip.x - pip.x + 0.03;
    const dy = tip.y - pip.y;
    const dz = tip.z - pip.z;

    // Only change the beat if it's been at least X frames since the last beat change
    if (frameCount - lastBeatFrame >= 18) {
      // Force the start on the first beat
      if (
        Math.abs(dz) > Math.abs(dx) &&
        Math.abs(dz) > Math.abs(dy) &&
        dz < 0 &&
        (beat === 0 || beat === 4 || beat === 1)
      ) {
        direction = "Towards Camera";
        beat = 1;
        startAudio();
      } else if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && (beat === 2 || beat === 3)) {
          direction = "Right";
          beat = 3;
        } else if (beat === 1 || beat === 2) {
          direction = "Left";
          beat = 2;
        }
      } else {
        if (dy < 0 && (beat === 3 || beat === 4)) {
          direction = "Up";
          beat = 4;
        } else if (beat === 0 || beat === 4 || beat === 1) {
          direction = "Towards Camera";
          beat = 1;
          startAudio();
        }
      }
    }
  }
}

function startAudio() {
  if (!audio.playing) {
    frameCount = 0;
    audio.play();
    audio.playing = true;
  }
}

function calculateBPM() {
  const currentFrame = frameCount;
  const framesSinceLastBeat = currentFrame - lastBeatFrame;

  if (framesSinceLastBeat > 0) {
    bpm = 60 / (framesSinceLastBeat / 60);
  }

  print(currentFrame);

  lastBeatFrame = currentFrame;
}

function debugInfo() {
  // Display the direction at the top right of the screen
  fill("black");
  noStroke();
  textSize(16);
  textAlign(RIGHT, TOP);
  text(`Index Direction: ${direction}`, width - 10, 10);
  text(`Beat: ${beat}`, width - 10, 30);
  text(`BPM: ${bpm.toFixed(0)}`, width - 10, 50);
  text(`Smoothed BPM: ${smoothedBPM.toFixed(0)}`, width - 10, 70);
}

function mousePressed() {
  clicked = true;
}
// global callback from the settings GUI
function paramChanged(name) {}
