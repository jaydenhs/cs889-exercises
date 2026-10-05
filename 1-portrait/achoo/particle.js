class DustParticle {
    constructor(x, y) {
        this.velocity = createVector(random(-1, 1), 0);
        this.acceleration = createVector(0, 0.02);
        this.position = createVector(x, y);
        this.lifespan = 200;
    }

    execute() {
        this.physics();
        this.render();
    }

    physics() {
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.lifespan -= 2;
    }

    remove() {
        return this.lifespan <= 0;
    }

    render() {
        noStroke();
        fill(200, this.lifespan); // Use lifespan to control the transparency
        ellipse(this.position.x, this.position.y, 5, 5); // Slightly larger particles
    }
}

class DustParticleSystem {
    constructor(x, y) {
        this.origin = createVector(x, y);
        this.particles = [];
    }

    newParticle() {
        this.particles.push(new DustParticle(this.origin.x, this.origin.y));
    }

    execute() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let particle = this.particles[i];
            particle.execute();
            if (particle.remove()) {
                this.particles.splice(i, 1);
            }
        }
    }
}
