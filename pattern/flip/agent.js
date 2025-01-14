class Agent {
  // agent centre and line length
  x;
  y;
  length;

  // line angle (-45 or 45)
  angle;

  constructor(x, y, length) {
    this.x = x;
    this.y = y;
    this.length = length;

    // set initial angle
    if (random(1) > 0.5) {
      this.angle = -45;
    } else {
      this.angle = 45;
    }
  }

  update() {}

  draw() {
    push();
    translate(this.x, this.y);
    rotate(radians(this.angle));
    stroke(0);
    strokeWeight(p.weight);
    line(0, -this.length / 2, 0, this.length / 2);
    pop();
  }
}
