# Pattern

In this workshop, we'll explore different algorithms and techniques to generate visual patterns. Some content and demos are inspired by the excellent book [**Generative Design: Visualize, Program, and Create with JavaScript in p5.js**](http://www.generative-gestaltung.de/2/) by Benedikt Groß, Hartmut Bohnacker, Julia Laub, and Claudius Lazzeroni.

> In these notes, the acronym "GD" refers to the Generative Design book. Related book sections and [code examples from the book](http://www.generative-gestaltung.de/2/) are referenced using the same format used in the book (e.g. **P.2.1.2** for sections, `P_2_1_2_01` for code).

## Goals

- Learn about the "agent" approach to programming generative systems
- Use generative rules to create compositions 
- Add animation to enhance a dynamic pattern

## Recommended Reading and Viewing

The first chapter from Matt Pearson's book, _Generative Art_, **Generative Art: In Theory and Practice (1st edition)** [available through the school library online](https://ocul-wtl.primo.exlibrisgroup.com/discovery/fulldisplay?docid=alma999986580959905162&context=L&vid=01OCUL_WTL:WTL_DEFAULT&lang=en&search_scope=OCULDiscoveryNetwork&adaptor=Local%20Search%20Engine&tab=OCULDiscoveryNetwork&query=any,contains,Generative%20Art:%20In%20Theory%20and%20Practice&offset=0) 

Watch [this 6-minute video about Casey Reas](https://www.youtube.com/embed/_8DMEHxOLQE) (Reas is pronounced like "Reese").

[![Casey Reas Creators Project](https://img.youtube.com/vi/_8DMEHxOLQE/0.jpg)](https://www.youtube.com/embed/_8DMEHxOLQE)

(If you liked that video, you should watch more from the _Creators Project_ series.)

<!-- # Set-Up

Several libraries and code need to be downloaded in preparation for the workshop.

#### 1. Install required libraries

* [**Ani**](http://www.looksgood.de/libraries/Ani/), a lightweight library for creating animations and transitions ([easing style cheat sheet](http://www.looksgood.de/libraries/Ani/Ani_Cheat_Sheet.pdf))
* [**ControlP5**](http://www.sojamo.de/libraries/controlP5/), a GUI library to build custom user interfaces

> Use the menu `Sketch/Import Library.../Add Library...`, in the dialogue that opens, search for the library name and click "Install".


#### 2. Download code from the Generative Design book

* [Generative Design Code Package for Processing 3.x](https://github.com/generative-design/Code-Package-Processing-3.x/releases/tag/latest)

> Post to Teams if you have trouble with setup. Please provide details so we can diagnose (e.g. operating system, error messages, steps to reproduce the error)  -->

# Agents and Rules

A flexible way to create generative output is to encode behaviour in an _Agent_. An Agent is simply an encapsulation class that maintains and updates its own state based on some rules, and then draws part of an image. The usual approach is to create many Agents so they work collectively to generate semi-autonomous output.

## Sketch: **`flip`**

This is a **grid of Agents**, each is a short line that can be tilted in one of two directions. Use the Settings dialog to adjust parameters and SPACE to pick a new random layout.

### Agent Class

Have a look at the `Agent` class in `agent.js`. It's made up of:

- constructor: sets up its properties
  - The constructor is using `random(1)` and a threshold between 0 and 1 to make weighted pseudo-random decisions. For example `random(1) > 0.5` will be true about half the time, whereas `random(1) > 0.75` will be true about a quarter of the time.
- `update()`: This is used to *update* agent properties (e.g. position, speed, colour). In this initial sketch it's called every frame, but the agent isn't updating anything yet. 
- `draw()`: Using the current properties of the agent, this draws the agent using Processing drawing commands

> The agent is using transformation functions `translate()` and `rotate()` to position and orient itself. There's a short review about this in this [resources repo](https://git.uwaterloo.ca/csfine383/resources/-/blob/master/guides/transformations/README.md).

### Settings GUI

An important part of generative coding is to interactively tweak key parameters used in your code while it runs. For this reason, many of the workshop demos use the [p5.gui library](https://github.com/bitcraftlab/p5.gui) (which extends and wraps the [quicksettings library](https://github.com/bit101/quicksettings)).

A generic setup function is included in `_common/util/utilities.js`. 

> 👉 The sketch demos in this workshop all load libraries and common utilities in `index.html` from a "common" root folder called `_/common`. You can copy this common folder to your own coding exercise folder, and setup your folders like the workshop with the same style of `index.html`. This might be easier/better than using the p5.vscode command.  

The Settings GUI is used as follows. In your main js file, create a JavaScript object to hold your settings, for example:

```js
// my parameters
let p = {
  // fillscreen param as a checkbox
  fillScreen: false,

  // weight param as a slider
  weight: 1,
  weightMin: 0.5,
  weightMax: 32,
};
```

I tend to use a single letter variable name (like `p` for "parameters") to make it easy to access in my code like `p.weight`.

In `setup()`, call this function to create a settings GUI with your param object:

```js
// add params to the settings GUI
createSettingsGui(p);
```

**That's it!** Now you'll have a simple GUI to adjust your params when your program is running. All you need to do is reference them in your code like this:

```js
stroke(p.weight);
```

The GUI can be hidden or shown using the 'H' key (SHIFT + h).

#### Parameter changed callback

There are often cases when you need to run some code every time a parameter changes. For this reason, you can call the settings GUI function with an optional callback.

```js
// add params to a GUI
createSettingsGui(p, { callback: paramChanged });
```

This example will call the function `paramChanged` every time a param is changed in the GUI. It passes the name of the param that changed as a string.

```js
// global callback from the settings GUI
function paramChanged(name) {
  if (name == "tileSize" || name == "fillScreen") {
    createAgents();
  }
}
```

#### Saving settings

The settings GUI has a "Save" button. Clicking this saves the current parameter settings to your browser's local store. The next time you run your code, the saved settings will be used instead of the default ones if `load: true` is passed to settings GUI creation function. By default, the saved settings aren't loaded, i.e. `load: false` is passed instead.  

### Full Screen Mode

The code can easily switch between a smaller testing window and **full screen mode** for presentation. Just enter full screen mode on your browser like normal (e.g. CTRL-COMMAND-F on MacOS Chrome) and click on 'fillScreen' in the GUI. The code uses the p5.js `windowResized()` event callback function to update or reset the Agents to fill the screen when this happens.

### Experiments

#### 1. Make the agents randomly "flip".

Create a new parameter that represents the chance that an Agent flips their angle _each second_. In the params object `p`, add a `flipChance` parameter and specify the min and max slider values for the GUI:

```js
// flip chance
  flipChance: 0.01,
  flipChanceMin: 0,
  flipChanceMax: 1,
  flipChanceStep: 0.001,
```

Add code to `Agent.update()` to flip the angle randomly according on `p.flipChance`.

```js
if (random(1) < p.flipChance / frameRate()) {
  let a = -45;
  if (this.angle < 0) {
    a = 45;
  }
  this.angle = a;
}
```

> Why do you think `p.flipChance` is divided by `frameRate()`?

Run your code and adjust the flipChance slider to see the effect.

#### 2. Bring Agents to life with animation.

The flipping behaviour is instantaneous, adding some animation can really bring agents to life. Try inserting this code into `Agent.update()`:

```js
// this.angle = a;
gsap.to(this, { angle: a, duration: 1 });
```

This uses the [GreenSock animation library](https://gsap.com/) to change the value of the Agent field `angle` to the new target value in `a` over a duration of 1 second. 

> The GreenSock library must be loaded so you can use it. By default all these demos load `/_common/lib/gsap.min.js` in index.html.


This kind of animation is called "tweening" or "keyframing". GreenSock will make this change in the background, and because we render Agents with those intermediate angle values at 60 FPS, we get an animation. Most GreenSock operations are triggered and configured using [the `gsap` object](https://greensock.com/docs/v3/GSAP). For example, try changing the `gsap.to` call to this:

```js
gsap.to(this, { angle: a, duration: 3, ease: "elastic.out(1.3, 0.3)" });
```

The [ease property](https://greensock.com/docs/v3/Eases) configures the timing and behaviour for tweening. Try experimenting with different `ease` types.

## Sketch: **`shape`**

Another grid of Agents, this time each is a small SVG image that turns towards the mouse and scales based on the distance from the mouse.

SVG files are images loaded using `loadImage()`, here's how the first shape is loaded in setup():

```js
// load the SVG shape
shape = loadImage(`data/module_${p.shapeNum}.svg`);
```

and each agent draws it in `Agent.draw()` using the `image()` function:

```js
image(shape, 0, 0);
```

### Loading an image with a "callback"

Here's how a new shape is loaded in paramChanged() (i.e. when a param is changed using the GUI):

```js
if (name == "shapeNum") {
  shape = loadImage(`data/module_${p.shapeNum}.svg`, function () {
    createAgents();
  });
}
```

The loadImage function has a second optional parameter for a "callback function". This is a function that's called after the image is completely loaded. In the code above, I create an "anonymous" function (note is has no name) as my callback, and the anonymous function only does one simple thing: call createAgents(). This means that createAgents is only called _after_ the new shape is loaded and ready to be used.

### What's `atan2`?

`atan2(y, x)` computes angles between things. It's similar to `atan(y/x)`, but has the benefit of also producing the correct angle even when x is less than or equal to zero.

`Agent.update()` uses `atan2()` to find the angle from the agent to the mouse:

```js
// calculate angle between mouse position and actual position of the shape
this.angle = degrees(atan2(mouseY - this.y, mouseX - this.x));
```

In general, to find the angle in degrees between two points `(ax, ay)` and `(bx, by)`, do:

```js
degrees(atan2(by - ay, bx - ax));
```

`Agent.update()` also uses the convenient `dist()` function to find the distance between the mouse and the agent:

```js
let d = dist(mouseX, mouseY, this.x, this.y);
```

### Experiments

#### 1. Use the parameters to generate a static compositional form

Choose a shape and adjust the parameters (or the code itself) to create a form you like. Press 'S' to save your final form to disk. If you like, you may include this image in your Public Digital Sketchbook entry.

Here's the code to save the canvas to an image (which you download from the browser):

```js
function keyPressed() {
  // SHIFT-S saves the current canvas
  if (key == "S") {
    save("canvas.png");
  }
}
```

#### 2. Create your own SVG shape to use for an agent

Use an online tool like [Method Draw](http://editor.method.ac/) or your favourite vector drawing program. The SVG should be _about_ 100 by 100 pixels and have a completely transparent background. Simple shapes work great. You can offset them from the centre of the SVG image area to produce interesting effects (some of the SVG shapes in the data directory do this). Try some alpha transparency for the fill and pick different colours too. Add your SVG to your data directory, and save a composition. If you like, you may include this image in your Public Digital Sketchbook entry.

#### Related

See also GD **P.2.1.1**, and these code examples:

- [`P_2_1_1_01`](http://www.generative-gestaltung.de/2/sketches/?01_P/P_2_1_1_01) changing strokeweight and strokecaps on diagonals in a grid
- [`P_2_1_1_04`](http://www.generative-gestaltung.de/2/sketches/?01_P/P_2_1_1_04): shapes in a grid, that are always facing the mouse

## Sketch: **`move`**

This animates the change in position of circle Agents in a grid using controlled random generators.

This sketch calls `Agent.update()` from an event function other than `draw()`: `draw()` is called each frame to enable the circles to animate, but `Agent.update()` is called when SPACE is pressed, updating the positions for the agents to animate to using GreenSock animation library.

This sketch uses `randomSeed()` to seed the random number generator; this means that each time the code is run, the results of the `random()` calls (and the resulting compositions) will be the same.

> Using a _random seed_ is a great way to recreate a composition later.

See also GD **P.2.1.2**, and these code examples:

- [`P_2_1_2_01`](http://www.generative-gestaltung.de/2/sketches/?01_P/P_2_1_2_01): changing size and position of circles in a grid

## Sketch: **`curves`**

Generates a pattern other than a grid. 
* Agents are "manually" animated in draw by changing each line's y-value
* uses `bezier` function with `beginShape`

# Exercise

Extend any of the sketches from this workshop. Your goal is to create a new kind of pattern. It can be grid-like or less structured. You can use colour or not. It should have the feeling of some repetition and regularity. 

Be prepared to share your creation next class.
