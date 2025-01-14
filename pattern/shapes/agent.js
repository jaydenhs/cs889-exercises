class Agent {
  // agent centre and shape
  x;
  y;
  shape;

  // local shape transforms
  sscale = 1.0;
  angle = 0.0;

  constructor(x, y, shape) {
    this.x = x;
    this.y = y;
    this.shape = shape;
  }

  update() {
    // calculate angle between mouse position and actual position of the shape
    this.angle = degrees(atan2(mouseY - this.y, mouseX - this.x));

    // calculate distance from mouse to shape and use it to adjust scale
    let d = dist(mouseX, mouseY, this.x, this.y);
    this._scale = map(d, 0, p.maxDist, 1, p.distScale);
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(radians(p.shapeAngle + this.angle));
    noStroke();
    noFill();
    imageMode(CENTER);
    let s = this.sscale * p.shapeScale;
    scale(s);
    translate(p.shapeOffset, p.shapeOffset);
    image(this.shape, 0, 0);
    pop();
  }
}
