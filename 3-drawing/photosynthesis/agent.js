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

    this.y -= random(p.minPlantGrowSpeed, p.maxPlantGrowSpeed);
  }

  draw() {
    // draw the line
    strokeWeight(1);
    stroke("green");
    line(this.px, this.py, this.x, this.y);
  }

  reset() {
    let m = 0.02 * height; // margin
    this.x = this.px = random(m, width - m);
    this.y = this.py = height;
  }
}
