// parameters
let p = {
  keyPoints: false,
  skeleton: true,
  info: false,

  strokeWidth: 30,
  strokeWidthMin: 20,
  strokeWidthMax: 40,
};

// hand keypoints are in the camera's own pixel size, which differs between
// devices (and between portrait and landscape phones), so read it from the video
let lineScale = 1; // keeps stroke widths the same relative to the camera frame
function videoSize() {
  return {
    w: video.elt.videoWidth || 640,
    h: video.elt.videoHeight || 480,
  };
}

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1;
}

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
let soundUnlocked = false; // true once the browser has let us play
let soundProbed = false; // true once we know whether it will

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
      // the lighter model keeps up better on phones
      modelType: isMobile() ? "lite" : "full",
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
  probeSound();

  // create an HTML video capture object
  video = createCapture(VIDEO, { flipped: true });
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
    const { w: vw, h: vh } = videoSize();
    const s = min(width / vw, height / vh);
    lineScale = vh / 480;
    push();
    translate((width - vw * s) / 2, (height - vh * s) / 2);
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

  drawTapHint();
}

// Draw lines between certain main keypoints
function drawSkeleton(hand, i) {
  const c = "gray";
  stroke(c);
  strokeWeight(p.strokeWidth * lineScale);
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
  strokeWeight(15 * lineScale);
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
        soundUnlocked = true;
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


  lastBeatFrame = currentFrame;
}

// a click unlocks audio if the browser blocked autoplay, without starting the music
function mousePressed() {
  if (!audio.playing) {
    audio
      .play()
      .then(() => {
        audio.pause();
        soundUnlocked = true;
      })
      .catch(() => {});
  }
}

// browsers keep audio locked until the first tap or click. The only reliable test is to
// try playing; at volume 0 the attempt is silent, and it is rejected if audio is locked.
function probeSound() {
  audio.volume = 0;
  audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      soundUnlocked = true;
    })
    .catch(() => {})
    .finally(() => {
      audio.volume = 1;
      soundProbed = true;
    });
}

function soundLocked() {
  return soundProbed && !soundUnlocked;
}

function drawTapHint() {
  if (!soundLocked()) return;
  fill(255);
  stroke(0, 160);
  strokeWeight(4);
  textFont("sans-serif");
  textSize(constrain(width / 22, 14, 22));
  textAlign(CENTER, BOTTOM);
  text("tap to enable sound", width / 2, height - 24);
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// global callback from the settings GUI
function paramChanged(name) {}
