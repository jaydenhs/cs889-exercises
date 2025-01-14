class Agent {
  // current and previous position
  x;
  y;
  px;
  py;

  // curve parameters
  l;
  t;

  // stroke weight and shade
  weight;
  shade;
  hue;

  constructor() {
    this.reset();
  }

  update() {
    this.px = this.x;
    this.py = this.y;

    this.l += random(-maxStep, maxStep);
    this.x += this.l * cos(this.t);
    this.y += this.l * sin(this.t);

    this.t += probTurn;

    // reset the agent if it will leave the canvas
    if (this.x < 0 || this.x > width - 1 || this.y < 0 || this.y > height - 1) {
      this.reset();
    }

    // reset the agent if it got too big
    if (this.weight > 0.1 * height) {
      this.reset();
    }
  }

  draw() {
    // draw the line
    strokeWeight(this.weight);
    stroke(this.hue, 100, this.shade, 33);
    line(this.px, this.py, this.x, this.y);
  }

  reset() {
    let m = 0.02 * height; // margin
    this.x = this.px = random(m, width - m);
    this.y = this.py = random(m, height - m);
    this.t = random(TWO_PI);
    this.shade = random(0, 255);
    this.weight = 1;
    this.l = 0;

    // pick a hue
    this.hue = (p.baseHue + random(0, 60)) % 360;
  }
}
