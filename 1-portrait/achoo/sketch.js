// IMPORTANT! set you frameNum
frameNum = 25;

images = [];
dusterImg = null;
isTickling = false;
sneezePlaying = false;

frame = 16;
fpsRatio = 4;
framesOnNose = 0;
postSneezeTime = 0;

function preload() {
    for (i = 0; i < frameNum; i++) {
        fn = "data/frame" + (i + 1) + ".png";
        images.push(loadImage(fn));
    }

    dusterImg = loadImage("data/feather-duster.png");
}

// The sketch is laid out in a 256x256 "picture space". The canvas is a square
// that fits the window, and the mouse is mapped back into picture space.
const PIC = 256;
const DUSTER = 64; // duster size in picture space (the PNG itself is higher resolution)
let k = 1; // window px per picture px
let ox = 0;
let oy = 0;
let mx = 0;
let my = 0;
let pmx = 0;
let pmy = 0;

function canvasSize() {
    return floor(min(min(windowWidth, windowHeight) * 0.9, 800));
}

function fitPicture() {
    k = width / PIC;
}

function windowResized() {
    resizeCanvas(canvasSize(), canvasSize());
    fitPicture();
}

function setup() {
    createCanvas(canvasSize(), canvasSize());
    fitPicture();

    // the duster PNG has a stray dot at the bottom left; erase it
    cleanDuster = createGraphics(dusterImg.width, dusterImg.height);
    cleanDuster.pixelDensity(1);
    cleanDuster.image(dusterImg, 0, 0);
    cleanDuster.erase();
    cleanDuster.rect(0, 380, 60, dusterImg.height - 380);
    cleanDuster.noErase();

    ps = new DustParticleSystem(createVector(PIC / 2, 50));

    cursor("grabbing");
}

function draw() {
    background(255);

    mx = (mouseX - ox) / k;
    my = (mouseY - oy) / k;
    pmx = (pmouseX - ox) / k;
    pmy = (pmouseY - oy) / k;

    push();
    translate(ox, oy);
    scale(k);

    mouseSpeed = dist(mx, my, pmx, pmy);
    isTickling = dusterOnNose();

    if (isTickling || sneezePlaying) {
        if ((framesOnNose > 60 && mouseSpeed > 10) || sneezePlaying) {
            // lock sneeze animation until complete
            sneezePlaying = true;
            if (frame < int(images.length * fpsRatio)) {
                // play sneeze animation at slower fps
                slowedFrame = int(frame / fpsRatio);
                image(images[slowedFrame], 0, 0);
                frame++;
            } else {
                // reset state
                frame = 16;
                framesOnNose = 0;
                sneezePlaying = false;
                image(images[0], 0, 0);
            }
        } else {
            // show pre-sneeze frame
            framesOnNose++;
            image(images[3], 0, 0);
        }
    } else {
        framesOnNose = 0;
        // base state
        if (frameCount % 120 < 112) {
            image(images[1], 0, 0);
        } else {
            image(images[2], 0, 0);
        }
    }

    image(cleanDuster, mx - DUSTER + 16, my - 16, DUSTER, DUSTER);

    ps.origin.set(mx - DUSTER + 28, my + DUSTER - 28, 0);

    if (frameCount % 4 == 0) {
        ps.newParticle();
    }
    ps.execute();
    pop();
}

function debugPanel(vars) {
    y = 16;
    for (key in vars) {
        text(key + ": " + vars[key], 16, y);
        y += 16;
    }
}

function dusterOnNose() {
    // Calculate the distance between the tip (bottom left) of the duster and the nose
    dusterTipPos = [
        mx - DUSTER + 16,
        my + DUSTER - 16,
    ];
    nosePos = [128, 128];
    tolerance = 48;
    distance = dist(dusterTipPos[0], dusterTipPos[1], nosePos[0], nosePos[1]);

    // Debug circles
    circle(nosePos[0], nosePos[1], tolerance * 2);
    push();
    fill("red");
    circle(dusterTipPos[0], dusterTipPos[1], 8);
    pop();

    if (distance < tolerance) {
        return true;
    }
    return false;
}
