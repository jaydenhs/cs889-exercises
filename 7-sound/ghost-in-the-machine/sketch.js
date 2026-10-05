// IDEA: Ghost in the machine
// Map the position of the hand to a sound frequency
// Display binary of current frequency or amplitude on screen in mono green terminal text
// Control the envelope based on the z-position or pose of the hand

// // parameters
// let p = {
//   keyPoints: true,
//   skeleton: true,
//   info: false,
// };

// the HandPose model
// using https://docs.ml5js.org/#/reference/handpose
let model;
// latest model predictions
let predictions = [];
// video capture
let video;

// Overall output level. 1 = unchanged. Each hand starts a new oscillator every
// frame and lets it ring for up to 700 ms, so dozens overlap and add up; this
// scales the whole mix back.
const MASTER_VOLUME = 0.1;

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1;
}

// keypoints come back in the camera's own pixel size, which rarely matches the
// canvas, so scale them uniformly (no stretching) until the camera view covers
// the canvas, centred. Anything cropped off-screen just clamps to the edge.
function toCanvas(kp) {
  const vw = video.elt.videoWidth || 640;
  const vh = video.elt.videoHeight || 480;
  const s = max(width / vw, height / vh);
  return { x: kp.x * s + (width - vw * s) / 2, y: kp.y * s + (height - vh * s) / 2 };
}

// where the hand "is": the average of its keypoints that are on screen, so a
// wrist cropped off the bottom doesn't silence a hand that's clearly in view
function handCentre(hand) {
  const pts = hand.keypoints.map(toCanvas).filter((p) => p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height);
  if (pts.length === 0) return toCanvas(hand.keypoints[0]);
  return {
    x: pts.reduce((sum, p) => sum + p.x, 0) / pts.length,
    y: pts.reduce((sum, p) => sum + p.y, 0) / pts.length,
  };
}

// text and stroke sizes that shrink on small screens
function textPx() {
  return min(96, width / 9.5);
}

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
}

function setup() {
  outputVolume(MASTER_VOLUME);

  createCanvas(windowWidth, windowHeight);

  // create an HTML video capture object
  // (flipped means the video is mirrored)
  video = createCapture(VIDEO, { flipped: true });
  // Hide the video element, and just show the canvas
  video.hide();

  // add params to Settings GUI
  // createSettingsGui(p, { callback: paramChanged, load: false });

  // set the detection callback
  model.detectStart(video, (results) => {
    predictions = results;
  });
}

function draw() {
  background("black");
  // image(video, 0, 0, width, height);

  // both rows are always on screen; a row is dim until its hand is in frame
  ["Left", "Right"].forEach((side) => {
    if (!predictions.some((hand) => hand.handedness === side)) {
      fill(0, 255, 0, 60);
      textFont("monospace");
      noStroke();
      textSize(textPx());
      textAlign(CENTER, CENTER);
      text("0".repeat(14), width / 2, height / 2 + (side === "Left" ? -1 : 1) * textPx() * 0.5);
    }
  });

  // draw different parts of the prediction
  predictions.forEach((hand, i) => {
    drawSkeleton(hand, i);
  });

  // debug info
  // drawFps();

  drawTapHint();
}

// Draw lines between certain main keypoints
function drawSkeleton(hand, i) {
  const thick = constrain(min(width, height) / 16, 12, 50);
  stroke(255, 20);
  strokeWeight(thick);
  noFill();

  // get lookup table for connections
  const connections = model.getConnections();

  connections.forEach((c) => {
    const [i, j] = c;
    const a = toCanvas(hand.keypoints[i]);
    const b = toCanvas(hand.keypoints[j]);
    line(a.x, a.y, b.x, b.y);
  });

  stroke(255, 100);
  strokeWeight(thick * 0.4);

  connections.forEach((c) => {
    const [i, j] = c;
    const a = toCanvas(hand.keypoints[i]);
    const b = toCanvas(hand.keypoints[j]);
    line(a.x, a.y, b.x, b.y);
  });

  // create a p5.Oscillator
  let osc = new p5.Oscillator("sine");
  osc.start();

  // map the x position of the hand to a frequency
  const pos = handCentre(hand);
  let freq = map(pos.x, 0, width, 200, 1000, true);
  osc.freq(freq);

  // map the y position of the hand to an amplitude
  let amp = map(pos.y, height, 0, 0, 1, true);
  osc.amp(amp);

  // display the binary value of the amplitude
  if (hand.handedness === "Left") {
    offset = -textPx() * 0.5;
  } else {
    offset = textPx() * 0.5;
  }
  let ampBinary = amp.toString(2).slice(2, 16);
  fill("lime");
  textFont("monospace");
  noStroke();
  textSize(textPx());
  textAlign(CENTER, CENTER);
  text(ampBinary, width / 2, height / 2 + offset);

  // stop the oscillator after 300 ms
  let duration = map(hand.keypoints3D[0].z, -0.015, 0.02, 700, 10, true);
  setTimeout(() => {
    osc.stop();
  }, duration);

  // // map the z position of the hand to the envelope
  // let zPos = hand.keypoints[0].z;
  // let attack = map(zPos, 1, -1, 0.01, 1.0);
  // let decay = map(zPos, 1, -1, 0.1, 1.0);
  // let sustain = map(zPos, 1, -1, 0.5, 1.0);
  // let release = map(zPos, 1, -1, 0.1, 2.0);

  // // create a p5.Envelope
  // let env = new p5.Envelope(attack, decay, sustain, release);
  // osc.amp(env);

  // // trigger the envelope
  // env.play(osc);
}

// global callback from the settings GUI
function paramChanged(name) {}

// browsers keep audio locked until the first tap or click
function audioLocked() {
  return getAudioContext().state !== "running";
}

function drawTapHint() {
  if (!audioLocked()) return;
  fill(255, 150);
  noStroke();
  textFont("sans-serif");
  textSize(constrain(width / 22, 14, 22));
  textAlign(CENTER, BOTTOM);
  text("tap to enable sound", width / 2, height - 24);
}

function mousePressed() {
  userStartAudio();
}

function touchEnded() {
  userStartAudio();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
