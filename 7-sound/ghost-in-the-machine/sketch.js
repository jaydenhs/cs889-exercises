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
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // create an HTML video capture object
  // (flipped means the video is mirrored)
  video = createCapture(VIDEO, { flipped: true });
  video.size(width, height);
  // Hide the video element, and just show the canvas
  video.hide();

  // add params to Settings GUI
  // createSettingsGui(p, { callback: paramChanged, load: false });

  // set the detection callback
  model.detectStart(video, (results) => {
    // console.log(`✋ ${results.length} hands detected`);
    predictions = results;
  });
}

function draw() {
  background("black");
  // image(video, 0, 0, width, height);

  // draw different parts of the prediction
  predictions.forEach((hand, i) => {
    drawSkeleton(hand, i);
  });

  // debug info
  // drawFps();
}

// Draw lines between certain main keypoints
function drawSkeleton(hand, i) {
  stroke(255, 20);
  strokeWeight(50);
  noFill();

  // get lookup table for connections
  const connections = model.getConnections();

  connections.forEach((c) => {
    const [i, j] = c;
    const a = hand.keypoints[i];
    const b = hand.keypoints[j];
    line(a.x, a.y, b.x, b.y);
  });

  stroke(255, 100);
  strokeWeight(20);

  connections.forEach((c) => {
    const [i, j] = c;
    const a = hand.keypoints[i];
    const b = hand.keypoints[j];
    line(a.x, a.y, b.x, b.y);
  });

  // create a p5.Oscillator
  let osc = new p5.Oscillator("sine");
  osc.start();

  // map the x position of the hand to a frequency
  let freq = map(hand.keypoints[0].x, 0, width, 200, 1000, true);
  osc.freq(freq);

  // map the y position of the hand to an amplitude
  let amp = map(hand.keypoints[0].y, height, 0, 0, 1, true);
  osc.amp(amp);

  // display the binary value of the amplitude
  if (hand.handedness === "Left") {
    offset = -48;
  } else {
    offset = 48;
  }
  let ampBinary = amp.toString(2).slice(2, 16);
  fill("lime");
  textFont("monospace");
  noStroke();
  textSize(96);
  textAlign(CENTER, CENTER);
  text(ampBinary, width / 2, height / 2 + offset);

  // stop the oscillator after 300 ms
  let duration = map(hand.keypoints3D[0].z, -0.015, 0.02, 10, 700, true);
  print(hand.keypoints3D[0].z);
  // print(duration);
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

function keyPressed() {
  // dump the predictions to the console
  if (key == " ") {
    console.log(predictions);
  }
}

// global callback from the settings GUI
function paramChanged(name) {}
