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

function setup() {
    dusterImg.resize(64, 64);
    createCanvas(256, 256);
    ps = new DustParticleSystem(createVector(width / 2, 50));

    cursor("grabbing");
}

function draw() {
    background(255);

    mouseSpeed = dist(mouseX, mouseY, pmouseX, pmouseY);
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

    image(dusterImg, mouseX - dusterImg.width + 16, mouseY - 16);

    ps.origin.set(
        mouseX - dusterImg.width + 28,
        mouseY + dusterImg.height - 28,
        0
    );

    if (frameCount % 4 == 0) {
        ps.newParticle();
    }
    ps.execute();
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
        mouseX - dusterImg.width + 16,
        mouseY + dusterImg.height - 16,
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
