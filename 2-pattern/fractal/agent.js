class Agent {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.numBranches = getRandomInt(3, 4) * 2;
    this.rotationIncrement = random(0.01, 0.03);
    this.rotationDirection = random(0, 1) > 0.5 ? 1 : -1;
    this.scale = random(1, 2);
    this.alpha = 255;
    this.alphaDecrement = random(1, 2);
    this.weightIn = random(10, 20);
    this.lengthScaling = random(0.2, 0.5);
  }

  update() {
    this.rotation += this.rotationIncrement * this.rotationDirection;
    this.y += this.scale;
    this.alpha -= this.alphaDecrement;
  }

  draw() {
    push();
    translate(this.x, this.y);
    scale(this.scale);
    rotate(this.rotation);
    stroke(255, this.alpha);
    this.branch(30, this.weightIn, 0);
    pop();
  }

  branch(lengthIn, weightIn, iter) {
    let weight = weightIn / 2;
    strokeWeight(weight);

    if (iter !== 0) {
      line(0, 0, 0, -lengthIn);
      translate(0, -lengthIn);
    }

    if (iter <= 1) {
      for (let i = 1; i <= this.numBranches; i++) {
        push();
        rotate((TWO_PI * i) / this.numBranches);
        this.branch(lengthIn * this.lengthScaling, weight, iter + 1);
        pop();
      }
    }
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
