class Agent {
  constructor(x, y) {
    // agent position to get pixel colour
    // (randomly move them slightly off the grid)
    let s = (p.randomness / 100) * 10;
    this.x = x + random(-s, s);
    s = (p.randomness / 100) * 10;
    this.y = y + random(-s, s);
    // get fill colour from image
    this.color = sourceImage.get(x / p.imageSize, y / p.imageSize);
    // reduce opacity
    this.color[3] = 10;
  }

  update() {
    // animate to a new random position
    let s = (p.randomness / 100) * 10;
    this.x += random(-s, s);
    s = (p.randomness / 100) * 10;
    this.y += random(-s, s);
  }

  draw() {
    // draw a line between last position
    // and current position
    fill(this.color);
    noStroke();
    circle(this.x, this.y, 10);
  }
}
