class Agent {
  // current position
  y = 150;

  constructor(offsets) {
    this.offsets = offsets;
    this.y = height;
  }

  update() {
    this.y -= p.speed / 100;
  }

  draw() {
    push();
    // translate(0, this.y);
    strokeWeight(1);
    stroke(0);
    noFill();
    this.drawBezierCurve(0, width, this.y, this.offsets);
    pop();
  }

  drawBezierCurve(startX, endX, baseY, offsets) {
    let spacing = (endX - startX) / (offsets.length - 1); // Equal spacing

    beginShape();
    for (let i = 0; i < offsets.length - 1; i++) {
      let x1 = startX + i * spacing;
      let y1 = baseY + offsets[i];

      let x2 = startX + (i + 1) * spacing;
      let y2 = baseY + offsets[i + 1];

      // Improved control points using adjacent offsets
      let prevY = i > 0 ? baseY + offsets[i - 1] : y1; // Use previous offset or self if first
      let nextY =
        i < offsets.length - 2 ? baseY + offsets[i + 2] : y2; // Use next offset or self if last

      let cx1 = x1 + spacing / 3;
      let cy1 = y1 + (y2 - prevY) / 3; // Control point considers previous segment

      let cx2 = x2 - spacing / 3;
      let cy2 = y2 - (nextY - y1) / 3; // Control point considers next segment

      bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2);
    }
  }
}
