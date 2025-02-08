let activeImg;
let caption =
  "FURIOUS CORGI UNLEASHES RAGE, DESTROYS ENTIRE TOWN IN EPIC FRENZY";
let data;
let uploadButton;
let generating = false;

function preload() {
  bgImage = loadImage("news-background.jpg");
  reporterImage = loadImage("reporter.png");
  reporterMouthImage = loadImage("reporter-mouth.png");
  activeImg = loadImage("default-image.jpg");

  uploadButton = createFileInput(handleFile);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);

  noLoop(); // Draw will only be called once or when redraw() is called
}

function draw() {
  // BACKGROUND
  // Scale background image to cover canvas, aligning to the right horizontally and center vertically
  image(
    bgImage,
    0,
    0,
    width,
    height,
    0,
    0,
    bgImage.width,
    bgImage.height,
    COVER,
    RIGHT,
    CENTER
  );

  // NEWS IMAGE
  let scaleFactor = 450 / max(activeImg.width, activeImg.height);
  activeImg.resize(
    activeImg.width * scaleFactor,
    activeImg.height * scaleFactor
  );

  let imgX = width - activeImg.width - 50;
  let imgY = (height - 140) / 2 - activeImg.height / 2;

  image(activeImg, imgX, imgY);

  // UPLOAD BUTTON
  uploadButton.position(imgX, imgY + activeImg.height + 10);

  // REPORTER
  push();

  translate(0, height - 140);
  let h = 475;
  let ratio = reporterImage.width / reporterImage.height;
  image(reporterImage, 50, -h + 40, ratio * h, h);

  pop();

  // CAPTION
  push();

  translate(0, height - 140);

  fill("white");
  rect(0, 0, width, 110);

  fill("black");
  textSize(32);
  textStyle(BOLD);
  text(caption, 50, 20, width - 100, 80);

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function handleFile(file) {
  if (file.type === "image") {
    activeImg = loadImage(file.data, () => {
      describeImageOllama(file.data);
    });
  } else {
    print("Not an image file!");
  }
}

function describeImageOllama(imageData) {
  imageData = imageData.replace(/^data:image\/\w+;base64,/, "");

  const prompt =
    "You are in charge of the headlines for breaking news images. You want to be as sensationalized as possible, so exaggerate the amount of violence and anger. Write a very short headline for the image below.";

  const url = "http://localhost:11434/api/generate";
  generating = true;
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llava",
      prompt: prompt,
      images: [imageData],
      stream: false,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // print(data.response);
      caption = data.response;
      caption = caption.replace(/"/g, "");
      caption = caption.toUpperCase();
      generating = false;
      redraw();
    })
    .catch((error) => console.error("Error:", error));
}
