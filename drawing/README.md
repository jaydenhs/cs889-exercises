# Drawing

In this workshop, we'll explore different algorithms and techniques to generate visual output. 

> In these notes, the acronym "GD" refers to the Generative Design book. Related book sections and [code examples from the book](http://www.generative-gestaltung.de/2/) are referenced using the same format used in the book (e.g. **P.2.1.2** for sections, `P_2_1_2_01` for code).

## Goals

- Further experiment with autonomous agents to generate emergent drawings
- Use physical systems like attraction and repulsion to generate visual form


## Sketch: **`pixels`**

Demonstrates how agent rules can come from pixel information. Here, each agent's colour is chosen as a pixel colour of an underlying image.

See also GD **P.4.3.1**, and these code examples:

- Compare to GD sketch [`P_4_3_1_01`](http://www.generative-gestaltung.de/2/sketches/?01_P/P_4_3_1_01) which doesn't separate behaviours into agents and uses mouse input to vary parameters.
- [`P_4_3_1_02`](http://www.generative-gestaltung.de/2/sketches/?01_P/P_4_3_1_02): pixel mapping; each pixel is translated into a new element



## Sketch: **`lines`**

Agents move around the canvas leaving a trail.

The agents follow a semi-random direction and step size: `maxStep` controls how far the agent can travel each step, and `probTurn` controls how much the agent rotates each step.

If the agent will exit the canvas after the update step, then its `reset` to a random location with a new colour, etc.

Setting `p.interact = true` turns on additional inter-agent behaviour. If the agents move within a close distance of each other, one agent gets reset and the other accumulates its stroke weight.

> **Question:** One problem with this agent is that eventually they go too fast and it's hard to slow them down again: what code could you add to keep the speed in check?

## Sketch: **`starter`**: Make your own drawing agent

Create your own drawing agent using the sketch `starter`. This code has the basic shell for an agent-based drawing program, but all agents currently are initialized at the centre of the canvas and they don't move (look carefully, there's a small black dot at the centre).

#### 1. Add code to to create kinematic drawing rules.

A simple drawing rule is to move to a random position nearby. Try adding the code below to `Agent.update()`:

```js
// pick a new position
this.x += random(-p.myParam, p.myParam);
this.y += random(-p.myParam, p.myParam);
```

#### 2. Run your code and adjust the _myParam_ slider in the Gui to see what happens.

Adjusting myParam slider changes how fast the agents move. You should change the myParam variable and slider name to be something meaningful, like "maxStepSize".

#### 3. Add a parameter to change a global drawing property.

For example, add a global parameter for the opacity of the stroke.

Add a new "opacity" parameter to your GUI by adding these properties to your `p` object (top of `sketch.js`), like this:

```js
let p = {

  ...

  // opacity of the agents
  opacity: 255,
  opacityMin: 0,
  opacityMax: 255,
}
```

Then use the variable in your agent code. In this case, in `Agent.draw()`:

```js
draw() {
    strokeWeight(1);
    stroke(0, p.opacity); // using global opacity variable
    line(this.px, this.py, this.x, this.y);
}
```

#### 4. To add variety to your drawing, add a parameter to your agent class so not all agents are the same.

For example, add a field to the Agent class to store the agent's shade (grey value). In the Agent constructor, pick a shade randomly between black or white:

```js
constructor() {
    ...

    // pick a random grey shade
    this.shade = random(255)
}
```

Then use this shade when you draw the agent:

```js
draw() {
    strokeWeight(1);
    stroke(this.shade, p.opacity); // using agent's shade variable
    line(this.px, this.py, this.x, this.y);
}
```

#### 5. To add even more variety with interactive control, add a parameter to control how each agent picks a local behaviour parameter.

We can go one step further and create a global parameter that controls a range to pick an agent parameter. For example, picking a random stroke weight to be assigned to each agent.

Create another GUI parameter called `maxWeight`. Think about a reasonable range for stroke weights in your drawing (thick lines can be interesting, even 100 looks great).

In the Agent constructor, initialize a new field called `weight` and assign a random stroke weight like this:

```js
// pick random stroke weight
this.weight = random(1, p.maxWeight);
```

Now each Agent can keep track of its own stroke weight, and use the chosen weight in draw():

```js
draw() {
    strokeWeight(this.weight); // using agent's weight variable
    stroke(this.shade, p.opacity);
    line(this.px, this.py, this.x, this.y);
}
```

#### 6. Add code to initialize agent positions.

So far, all agents start in the centre, the pattern of starting positions can have a huge effect on the drawing.

For example, the starting position could be decided randomly in the Agent constructor like this:

```js
constructor() {
  // random starting position
  let m = 100; // margin
  this.x = random(m, width - m);
  this.y = random(m, height - m);
}
```

Or by using an `Agent(x, y)` constructor like in the grid agent demos we saw earlier, agents could be initialized in a grid by changing the `createAgents` function. First change the Agent constructor to:

```js
constructor(x, y) {
    this.x = x; // width / 2;
    this.y = y; //height / 2;
    ...
```

Then in the createAgents function, change the main loop to:

```js
// create Agents
for (x = 100; x < width - 100; x += 5)
  for (y = 100; y < height - 100; y += 5) {
    let a = new Agent(x, y);
    agents.push(a);
  }
```

Or you could even spawn new agents as you draw a line. Comment out the main loop that creates Agents in `createAgents` and create a p5.js mouse dragged event function, like this:

```js
function mouseDragged() {
  agents.push(new Agent(mouseX, mouseY));
}
```

A good extension to this would be to "kill off" agents after a few seconds, otherwise you'll be running thousands of agents which may make your sketch really slow.

The ideas above are just a starting point. You could combine different initialization methods together, add more rules to control agent based on grid location, mouse speed, a noise function, what position the last agent had, etc.

#### 7. Experiment with more parameters or drawing rules.

Some ideas:

- add a rule that always pulls the agent in one direction (like all agents are pulled slowly downward)
- insert scale and rotate transforms, and make their arguments a global parameter or something different for each agent
- add a rule where agents track the mouse in some way (like `shapes` from the pattern workshop)
- add a rule that lets agents interact (like the code in `lines`)
- change how (or what) an agent draws, it could be bezier curves, ellipses, or multiple lines. Even 3D shapes or meshes.
- use an image, SVG shape, or mouse movement as a seed for agent movements. Give each agent access to the thing you want them to use as guidance, and they can (slightly) conform their movements to that shape, or their colour to the underlying pixel values, etc.
- create a family of Agent classes that work together to create a drawing. Some agents could make highlights, some could be rectangular and others curvy, some could even insert text.

# Extras

## Sketch: **`noise`**

Agents move around the canvas leaving a trail based on a noise generation function.

### Perlin noise

This sketch uses Perlin noise (`noise()`), which enables generation of "smooth" pseudo-random sequences at various spatial or temporal frequencies.

These are examples of what Perlin noise looks like at different scales:

![perlinnoise](img/perlinnoise.png)

This is the code used to generate the image above:

```js
// perlin noise samples
function setup() {
  createCanvas(400, 100);

  for (f of [0.01, 0.05, 0.1, 4]) {
    for (x = 0; x < 100; x++) {
      for (y = 0; y < 100; y++) {
        stroke(255 * noise(x * f, y * f));
        point(x, y);
      }
    }
    translate(100, 0);
  }
}
```

GD [`M_1_3_03`](http://www.generative-gestaltung.de/2/sketches/?02_M/M_1_3_03) is a simple demo to help visualize the noise function and see how it transforms.

## Using Agents in Physical Simulations

The general idea of agent behaviour can be extended well beyond random or noise based decisions.

### Springs and Force-Directed Layout

- nodes and attractors
- forces
- tuning

See GD **M.6.1**, p. 436, and these code examples:

- [`M_6_1_01`](http://www.generative-gestaltung.de/2/sketches/?02_M/M_6_1_01) 200 nodes repel each other
- [`M_6_1_03`](http://www.generative-gestaltung.de/2/sketches/?02_M/M_6_1_03) nodes connected by springs

### Other Generative Methods

Daniel Shiffman's excellent [Nature of Code Book](https://natureofcode.com/) explains in detail other generative methods like [particle systems](http://natureofcode.com/book/chapter-4-particle-systems/) and [genetic algorithms](http://natureofcode.com/book/chapter-9-the-evolution-of-code/). Unfortunately, the book is from 2012 so all code examples use Java Processing (the precursor to p5.js).

> **Update:** Shiffman is working on a [new version of the book](https://github.com/nature-of-code/noc-book-2) and [many of the demos are already translated into p5.js](https://github.com/nature-of-code/noc-examples-p5.js)! You can also watch videos demoing demo code from the book on his [Coding Train YouTube channel](https://youtu.be/70MQ-FugwbI).

# Exercise

Continue to iterate the drawing agent you started in the exercise above, and post three generated images (just static PNG images is fine) that demonstrate the range of forms possible using your rules and parameter settings. Describe the parameters and drawing rules that you added.

Be prepared to share your creation next class.
