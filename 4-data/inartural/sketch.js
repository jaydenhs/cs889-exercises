let img;
let imgOwner;
let imgDescription;
let bgImage;

let photosSearched = 0;
let maxViewCount = 0;
let perPage = 500;
let requestBatchSize = 25;

let maxDescriptionWords = 20;

// where the wall sits in gallery-bg.webp (fractions of its height): below the ceiling
// shadow and above the floor. The frame is kept inside this band.
const WALL_TOP = 159 / 857;
const WALL_BOTTOM = 735 / 857;

function preload() {
  bgImage = loadImage("gallery-bg.webp");
}

function setup() {
  noLoop();
  createCanvas(windowWidth, windowHeight);
  loadMultipleImagesFromFlickr();
}

function draw() {
  background(255);

  if (img) {
    // Scale background image to cover canvas
    let aspectRatio = bgImage.width / bgImage.height;
    let newWidth, newHeight, offsetX, offsetY;

    if (width / height > aspectRatio) {
      newWidth = width;
      newHeight = width / aspectRatio;
      offsetX = 0;
      offsetY = (newHeight - height) / 2;
    } else {
      newHeight = height;
      newWidth = height * aspectRatio;
      offsetX = (newWidth - width) / 2;
      offsetY = 0;
    }

    image(bgImage, -offsetX, -offsetY, newWidth, newHeight);

    if (img) {
      const compact = width < 600;

      // the wall as drawn on screen (the background is cover-scaled and cropped)
      const wallTop = -offsetY + WALL_TOP * newHeight;
      const wallBottom = -offsetY + WALL_BOTTOM * newHeight;
      const margin = 12;
      // on narrow screens the placard goes under the frame, so leave it room on the wall
      const placardRoom = compact ? 80 : 0;
      // if the window crops part of the wall, stay inside what's visible
      const areaTop = max(wallTop, 0) + margin;
      const areaBottom = min(wallBottom, height) - margin - placardRoom;
      const areaHeight = max(areaBottom - areaTop, 60);

      // shrink everything (image, black frame, white frame) so the frame fits the wall and the width
      const wr = img.width / max(img.width, img.height);
      const hr = img.height / max(img.width, img.height);
      const k = max(0.15, min(1, areaHeight / (400 * hr + 75), (width * 0.9) / (400 * wr + 75)));
      const maxSide = 400 * k;
      const tb = 75 * k; // black frame
      const tw = 60 * k; // white frame

      let scaleFactor = maxSide / max(img.width, img.height);
      const dw = img.width * scaleFactor;
      const dh = img.height * scaleFactor;

      let imgX = (width - dw) / 2;
      // centred on the wall (or on the part of it above the placard)
      let imgY = (areaTop + areaBottom) / 2 - dh / 2;

      // Draw a black frame around the image
      fill(25);
      noStroke();
      rect(imgX - tb / 2, imgY - tb / 2, dw + tb, dh + tb);

      // Draw a white frame around the image
      fill(252);
      rect(imgX - tw / 2, imgY - tw / 2, dw + tw, dh + tw);

      image(img, imgX, imgY, dw, dh);

      const placard = document.getElementById("placard");
      const frameBottom = imgY - tb / 2 + dh + tb;
      if (compact) {
        // centred under the frame
        placard.style.left = "50%";
        placard.style.transform = "translateX(-50%)";
        placard.style.top = `${frameBottom + 16}px`;
        placard.style.bottom = "auto";
      } else {
        // beside the frame, bottom aligned
        const imgRightEdge = imgX - tb / 2 + dw + tb;
        placard.style.left = `${(imgRightEdge / width) * 100 + 1}%`;
        placard.style.transform = "none";
        placard.style.top = "auto";
        placard.style.bottom = `${100 - (frameBottom / height) * 100}%`;
      }
      // on phones only the name is shown, so skip the placard if there is none
      placard.style.visibility = compact && !imgOwner ? "hidden" : "visible";
    }
  } else {
    // Display a loading message
    background(225);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(constrain(width / 18, 18, 32));
    rectMode(CENTER);
    text("you are the first person ever to see this", width / 2, height / 2 - 40, width * 0.85, 120);
    rectMode(CORNER);
  }

  noLoop();
}

async function loadMultipleImagesFromFlickr() {
  let requests = [];
  for (let i = 0; i < requestBatchSize; i++) {
    requests.push(makeFlickrRequest());
  }

  try {
    // Wait for all requests to complete
    await Promise.all(requests);

    // If no zero-view image was found, retry the batch
    if (!img) {
      loadMultipleImagesFromFlickr();
    }
  } catch (error) {
    console.error("Error fetching photos:", error);
  }
}

function makeFlickrRequest() {
  return new Promise((resolve, reject) => {
    let { minUploadDate, maxUploadDate } = getRandomMonthRange();
    let url = `/api/flickr?per_page=${perPage}&min_upload_date=${minUploadDate}&max_upload_date=${maxUploadDate}`;

    loadJSON(url, (data) => {
      // Only process data if no zero-view image has been found yet
      if (!img) {
        photosSearched += data.photos.photo.length;
        document.getElementById("searched").textContent = `${photosSearched.toLocaleString()} photos searched`;
        gotData(data);
      }

      resolve();
    });
  });
}

function gotData(data) {
  let photos = data.photos.photo;
  let maxViewPhotos = photos.filter(
    (photo) => parseInt(photo.views) <= maxViewCount
  );

  if (maxViewPhotos.length > 0) {
    let photo = maxViewPhotos[0];
    img = "found"; // prevent overwriting the image with the next request

    let photoUrl = `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`;

    imgOwner = photo.ownername;
    imgDescription = photo.description._content;

    // Update placard content
    let ownerElement = document.getElementById("owner");
    let descriptionElement = document.getElementById("description");

    if (imgOwner) {
      ownerElement.textContent = imgOwner;
      ownerElement.style.display = "block";
    } else {
      ownerElement.style.display = "none";
    }

    if (imgDescription) {
      // Remove HTML tags using a temporary div
      let tempDiv = document.createElement("div");
      tempDiv.innerHTML = imgDescription;
      let plainTextDescription = tempDiv.textContent || tempDiv.innerText || "";

      // Remove Markdown formatting (e.g., *, _, ~, `, >, [, ], (, ), !)
      plainTextDescription = plainTextDescription.replace(
        /(\*|_|~|`|>|\[|\]|\(|\)|!)/g,
        ""
      );

      // Trim and limit the number of words
      plainTextDescription = plainTextDescription
        .split(" ")
        .slice(0, maxDescriptionWords)
        .join(" ");

      // Update the description element
      descriptionElement.textContent = plainTextDescription;
      descriptionElement.style.display = "block";
    } else {
      descriptionElement.style.display = "none";
    }

    loadImage(photoUrl, (loadedImg) => {
      img = loadedImg;
      document.getElementById("spinner").style.display = "none";
      document.getElementById("searched").style.display = "none";
      redraw();
    });
  }
}

function getRandomMonthRange() {
  let startYear = 2004;
  let endYear = new Date().getFullYear();

  let randomYear =
    Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  let randomMonth = Math.floor(Math.random() * 12);

  let startOfMonth = new Date(randomYear, randomMonth, 1);
  let endOfMonth = new Date(randomYear, randomMonth + 1, 0);

  let randomStartDate = new Date(
    startOfMonth.getTime() +
      Math.random() * (endOfMonth.getTime() - startOfMonth.getTime())
  );
  let randomEndDate = new Date(
    randomStartDate.getTime() +
      Math.random() * (endOfMonth.getTime() - randomStartDate.getTime())
  );

  return {
    minUploadDate: Math.floor(randomStartDate.getTime() / 1000),
    maxUploadDate: Math.floor(randomEndDate.getTime() / 1000),
  };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
