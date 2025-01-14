class Agent {
  // current position
  x;
  y;
  // home position
  hx;
  hy;

  constructor(x, y) {
    this.hx = x;
    this.hy = y;
  }

  update() {
    // animate to a new random position
    gsap.to(this, { x: random(-p.randomness, p.randomness), duration: 0.5 });
    gsap.to(this, { y: random(-p.randomness, p.randomness), duration: 0.5 });
  }

  draw() {
    push();
    translate(this.x, this.y);
    translate(this.hx, this.hy);
    strokeWeight(5);
    stroke(0);
    noFill();
    ellipse(0, 0, p.circleSize, p.circleSize);
    pop();
  }
}
