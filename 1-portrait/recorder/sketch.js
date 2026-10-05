// adjust camera position and scale
let offsetX = -200;
let offsetY = -128;
let scaleXY = 1.0;

// adjust speed for capture and playback
// (frame per second, 1 to 60)
let fps = 10;

let cam;

function setup() {
    createCanvas(256, 256);

    // opens your camera
    cam = createCapture(VIDEO);
    // cam.hide();

    // slow down so you don't capture too many frames
    frameRate(fps);
}

// start in recording mode
let isRecording = false;
let isDownloading = false;

let frame = 0;
let downloadNum = 0;
let images = [];
let lastFrameImg = null;

function draw() {
    if (isRecording) {
        push();
        translate(offsetX, offsetY);
        scale(scaleXY, scaleXY);
        image(cam, 0, 0);
        pop();

        // buffer for saving
        lastFrameImg = get();

        renderFrame("#ff0000");
        printFrameNum(images.length);

        images.push(lastFrameImg);
    } else {
        // playback
        if (frame < images.length) {
            image(images[frame], 0, 0);
            printFrameNum(`${frame + 1}/${images.length}`);
        }

        if (isDownloading) {
            renderFrame("#00ffff");
            if (frame >= images.length) {
                isDownloading = false;
            }
        } else {
            renderFrame("#0000ff");
            frame++;
        }
    }
}

function keyPressed() {
    if (key === "?") {
    } else if (key === "r") {
        // r to clear and record
        isDownloading = false;
        isRecording = true;
        images = [];
    } else if (isRecording && key == " ") {
        images.push(lastFrameImg);
    } else if (key === "p") {
        // p to playback loop
        isDownloading = false;
        isRecording = false;
        frame = 0;
    } else if (key === "d") {
        // d to download
        isDownloading = true;
        isRecording = false;
        frame = 0;
        downloadNum = 0;
    } else if (key === "ArrowLeft") {
        frame--;
    } else if (key === "ArrowRight") {
        frame++;
    } else if (isDownloading && key == " ") {
        // download the image
        images[frame].save("frame" + (downloadNum + 1), "png");
        frame++;
        downloadNum++;
    }
}

// coloured frame to show state
function renderFrame(c) {
    noFill();
    stroke(c);
    strokeWeight(4);
    rect(0, 0, width - 1, height - 1);
}

// show frame number at bottom right
function printFrameNum(n) {
    fill(50);
    stroke(255);
    strokeWeight(1);
    textAlign(RIGHT, BOTTOM);
    text(n, width - 10, height - 10);
    textSize(20);
}
