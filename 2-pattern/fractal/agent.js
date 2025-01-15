class Agent {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.numBranches = p.numBranches;
    this.rotationIncrement = random(0, 0.02);
  }

  update() {
    this.rotation += this.rotationIncrement;
  }

  draw() {
    push();
    translate(this.x, this.y);
    scale(0.5);
    rotate(this.rotation);
    stroke("pink");
    this.branch(50, 10, 0);
    pop();
  }

  branch(lengthIn, weightIn, iter) {
    let weight = weightIn / 1.5;
    strokeWeight(weight);

    if (iter !== 0) {
      line(0, 0, 0, -lengthIn);
      translate(0, -lengthIn);
    }

    if (iter <= 2) {
      for (let i = 1; i <= this.numBranches; i++) {
        push();
        rotate((TWO_PI * i) / this.numBranches);
        this.branch(lengthIn * 0.9, weight, iter + 1);
        pop();
      }
    }
  }
}
