class Agent {
  constructor(x, y) {
    // agent position to get pixel colour
    this.x = x;
    this.y = y;
    this.hx = x;
    this.hy = y;

    this.pause = 60;
    this.colors = sourceImages.map((img) => img.get(x, y));

    this.active = 0;

    this.reset();
  }

  reset() {
    this.dur = p.duration;
    this.radius = random(10, 150);
    this.startAngle = random(TWO_PI);
    this.framesActive = 0;

    this.startColor = this.colors[this.active];
    this.endColor = this.colors[(this.active + 1) % this.colors.length];
    this.startColor[3] = p.alpha;
    this.endColor[3] = p.alpha;

    this.active = (this.active + 1) % this.colors.length;
  }

  update() {
    this.framesActive++;

    this.lastX = this.x;
    this.lastY = this.y;

    let t = this.framesActive / this.dur;
    let progress = easeInOut(t);
    this.color = lerpColor(this.startColor, this.endColor, progress);

    if (this.framesActive <= this.dur) {
      let angle = this.startAngle + TWO_PI * progress;
      this.x =
        this.hx + this.radius * cos(angle) - this.radius * cos(this.startAngle);
      this.y =
        this.hy + this.radius * sin(angle) - this.radius * sin(this.startAngle);
    } else if (this.framesActive > this.dur + this.pause) {
      this.updateColors();
      this.reset();
    }
  }

  draw() {
    // draw a line between last position
    // and current position
    stroke(this.color);
    strokeWeight(p.brushSize);
    noFill();
    line(this.lastX, this.lastY, this.x, this.y);
  }

  updateColors() {
    this.tempColor = this.startColor;
    this.startColor = this.endColor;
    this.endColor = this.tempColor;
  }
}

function easeInOut(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
