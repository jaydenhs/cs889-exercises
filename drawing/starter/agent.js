class Agent {
  // current position
  x;
  y;
  // previous position
  px;
  py;

  constructor() {
    this.x = width / 2;
    this.y = height / 2;
  }

  update() {
    // save last position
    this.px = this.x;
    this.py = this.y;

    // pick a new position
  }

  draw() {
    // draw a line between last position
    // and current position
    strokeWeight(1);
    stroke(0, 20);
    line(this.px, this.py, this.x, this.y);
  }
}
