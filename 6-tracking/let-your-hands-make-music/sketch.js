// parameters
let p = {
  keyPoints: false,
  skeleton: true,
  info: false,

  strokeWidth: 30,
  strokeWidthMin: 20,
  strokeWidthMax: 40,
};

// size of the video the model sees; hand keypoints are in these coordinates
const VIDEO_W = 640;
const VIDEO_H = 480;

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
const previousBPMs = Array(2).fill(bpm); // Store the last N BPMs for smoothing

// keep playback within the range where the browser's time-stretch sounds OK
const minRate = 0.6;
const maxRate = 1.5;
let smoothedBPM = bpm;

// Fade the music out when no hand has been seen for a while, and back in when one returns
const handLostFrameLimit = 45; // about 0.75s at 60 fps
const fadeDuration = 1.5; // seconds
let handLostFrames = 0;
let fadedOut = false;

// Audio
let symphony;
let bgImg = null;
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

  // optional background; falls back to plain colour if the file is missing
  bgImg = loadImage("orchestra.png", undefined, () => (bgImg = null));
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // create an HTML video capture object
  video = createCapture(VIDEO, { flipped: true });
  video.size(VIDEO_W, VIDEO_H);
  video.hide();

  model.detectStart(video, (results) => {
    predictions = results;
  });
}

function draw() {
  background("#f5f5f5");
  if (bgImg) drawCover(bgImg);

  {
    // fit the video space into the window, centred, so hands are never cropped
    const s = min(width / VIDEO_W, height / VIDEO_H);
    push();
    translate((width - VIDEO_W * s) / 2, (height - VIDEO_H * s) / 2);
    scale(s);
    // draw different parts of the prediction
    predictions.forEach((hand, i) => {
      // if (p.keyPoints) drawKeypoints(hand, i);
      if (p.skeleton) drawSkeleton(hand, i);
      // if (p.info) drawInfo(hand, i);
      if (hand.handedness === "Right") {
        drawIndexFingerSkeleton(hand, i);
      }
    });

    updateFade();

    if (pBeat !== beat) {
      calculateBPM();
      print(beat);
      pBeat = beat;
      previousBPMs.shift();
      previousBPMs.push(constrain(bpm, originalBPM * minRate, originalBPM * maxRate));
      smoothedBPM =
        previousBPMs.reduce((a, b) => a + b, 0) / previousBPMs.length;
      gsap.to(audio, {
        playbackRate: smoothedBPM / originalBPM,
        duration: 0.15,
      });
    }

    pop();
  }
}

// Draw lines between certain main keypoints
function drawSkeleton(hand, i) {
  const c = "gray";
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

// scale and crop an image to fill the canvas
function drawCover(img) {
  const s = Math.max(width / img.width, height / img.height);
  image(img, (width - img.width * s) / 2, (height - img.height * s) / 2, img.width * s, img.height * s);
}

function updateFade() {
  if (predictions.length > 0) {
    handLostFrames = 0;
    if (fadedOut) fadeIn();
  } else {
    handLostFrames++;
    if (handLostFrames === handLostFrameLimit && audio.playing) fadeOut();
  }
}

function fadeOut() {
  fadedOut = true;
  gsap.killTweensOf(audio, "volume");
  gsap.to(audio, {
    volume: 0,
    duration: fadeDuration,
    onComplete: () => {
      if (fadedOut) audio.pause();
    },
  });
}

// resume from where it paused
function fadeIn() {
  fadedOut = false;
  gsap.killTweensOf(audio, "volume");
  audio.play().catch(() => {});
  gsap.to(audio, { volume: 1, duration: fadeDuration });
}

function startAudio() {
  if (!audio.playing) {
    // browsers may block playback until the page has had a click/keypress;
    // if so, retry on the next beat (or the first click)
    audio
      .play()
      .then(() => {
        frameCount = 0;
        audio.playing = true;
      })
      .catch(() => {});
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

// a click unlocks audio if the browser blocked autoplay, without starting the music
function mousePressed() {
  if (!audio.playing) {
    audio.play().then(() => audio.pause()).catch(() => {});
  }
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// global callback from the settings GUI
function paramChanged(name) {}
