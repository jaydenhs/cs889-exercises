let img;
let imgOwner;
let imgDescription;
let bgImage;

let maxViewCount = 0;
let perPage = 500;
let requestBatchSize = 25;

let maxDescriptionWords = 20;

function preload() {
  bgImage = loadImage("gallery-bg.webp");

  loadJSON("../../_private/auth.json", (auth) => {
    API_KEY = auth.FLICKR_API_KEY;
  });
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
      let scaleFactor = 400 / max(img.width, img.height);
      img.resize(img.width * scaleFactor, img.height * scaleFactor);

      let imgX = (width - img.width) / 2;
      let imgY = (height - img.height) / 2;

      // Draw a black frame around the image
      fill(25);
      noStroke();
      tb = 75;
      rect(imgX - tb / 2, imgY - tb / 2, img.width + tb, img.height + tb);

      // Draw a white frame around the image
      fill(252);
      tw = 60;
      rect(imgX - tw / 2, imgY - tw / 2, img.width + tw, img.height + tw);

      image(img, imgX, imgY);

      let imgRightEdge = imgX - tb / 2 + img.width + tb;
      let percentage = (imgRightEdge / width) * 100;
      document.getElementById("placard").style.left = `${percentage + 1}%`;

      let imgBottomEdge = imgY - tb / 2 + img.height + tb;
      percentage = (imgBottomEdge / height) * 100;
      document.getElementById("placard").style.bottom = `${100 - percentage}%`;

      document.getElementById("placard").style.visibility = "visible";
    }
  } else {
    // Display a loading message
    background(225);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("you are the first person ever to see this", width / 2, height / 2);
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
      console.log(
        "No zero-view images found in this request batch. Retrying..."
      );
      loadMultipleImagesFromFlickr();
    }
  } catch (error) {
    console.error("Error fetching photos:", error);
  }
}

function makeFlickrRequest() {
  return new Promise((resolve, reject) => {
    let { minUploadDate, maxUploadDate } = getRandomMonthRange();
    let url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${API_KEY}&format=json&nojsoncallback=1&per_page=${perPage}&text=photography&min_upload_date=${minUploadDate}&max_upload_date=${maxUploadDate}&extras=views,owner_name,description&safe_search=1&content_types=0`;

    loadJSON(url, (data) => {
      // Only process data if no zero-view image has been found yet
      if (!img) {
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
      redraw();
    });
  } else {
    console.log(
      `No images with less than ${maxViewCount} views found in these photos.`
    );
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
