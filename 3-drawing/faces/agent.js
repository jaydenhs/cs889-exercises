class Agent {
  constructor(x, y) {
    // agent position to get pixel colour
    this.x = x;
    this.y = y;
    this.hx = x;
    this.hy = y;

    this.dur = 120;
    this.reset();

    alpha = 100;
    this.color;
    this.startColor = sourceImages[0].get(x / p.imageSize, y / p.imageSize);
    this.startColor[3] = alpha;
    this.endColor = sourceImages[1].get(x / p.imageSize, y / p.imageSize);
    this.endColor[3] = alpha;
  }

  update() {
    this.framesActive++;

    this.lastX = this.x;
    this.lastY = this.y;

    this.color = lerpColor(
      this.startColor,
      this.endColor,
      this.framesActive / this.dur
    );

    if (this.framesActive <= this.dur / 2) {
      this.step += 0.01;
      this.direction += 0.05;
      this.x += this.step * cos(this.direction);
      this.y += this.step * sin(this.direction);
    } else if (this.framesActive <= this.dur) {
      this.step -= 0.01;
      this.direction -= 0.05;
      this.x -= this.step * cos(this.direction);
      this.y -= this.step * sin(this.direction);
    } else {
      // this.x = this.hx;
      // this.y = this.hy;
      this.framesActive = 0;
      this.updateColors();
      // this.step = 0;
    }
  }

  updateColors() {
    this.tempColor = this.startColor;
    this.startColor = this.endColor;
    this.endColor = this.tempColor;
  }

  draw() {
    // draw a line between last position
    // and current position
    stroke(this.color);
    strokeWeight(p.brushSize);
    noFill();
    line(this.lastX, this.lastY, this.x, this.y);
  }

  reset() {
    this.direction = random(TWO_PI);
    this.step = 0;
    this.framesActive = 0;
  }
}
