// IMPORTANT! set you frameNum
frameNum = 16;

images = [];
dusterImg = null;
isTickling = false;

function preload() {
  // change the directory or filename prefix as needed
  for (i = 0; i < frameNum; i++) {
    fn = "data/frame" + (i + 1) + ".png";
    print(fn);
    images.push(loadImage(fn));
  }

  dusterImg = loadImage("data/feather-duster.png");
}

function setup() {
  dusterImg.resize(64, 64);
  createCanvas(256, 256);

  cursor("grabbing");
}

function draw() {
  background(255);

  mouseSpeed = sqrt((mouseX - pmouseX) ** 2 + (mouseY - pmouseY) ** 2);

  isTickling = checkTickling(mouseSpeed);
  if (isTickling) {
    image(images[0], 0, 0);
  } else {
    image(images[7], 0, 0);
  }

  // debugPanel({ i, mouseSpeed, isTickling });

  image(dusterImg, mouseX - dusterImg.width, mouseY);
}

function debugPanel(vars) {
  y = 16;
  for (key in vars) {
    text(key + ": " + vars[key], 16, y);
    y += 16;
  }
}

function checkTickling(mouseSpeed) {
  // Calculate the distance between the tip (bottom left) of the duster and the nose
  dusterTipPos = [mouseX - dusterImg.width, mouseY + dusterImg.height];
  nosePos = [128, 128];
  tolerance = 32;
  distance = dist(dusterTipPos[0], dusterTipPos[1], nosePos[0], nosePos[1]);

  // Debug circles
  circle(nosePos[0], nosePos[1], tolerance * 2);
  push();
  fill("red");
  circle(dusterTipPos[0], dusterTipPos[1], 8);
  pop();

  if (distance < tolerance && mouseSpeed > 0.1) {
    return true;
  }
  return false;
}

// micro-reviews due 1pm sunday before seminars
// coding exercise demo
