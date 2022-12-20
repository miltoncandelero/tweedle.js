# Tweedle.js
`npm i tweedle.js`  

## What is a tween?
A tween is an easy way to animate something. You tell a property to be at a certain value after so many seconds and look at it go!

## [API documentation](https://miltoncandelero.github.io/tweedle.js/)
## [Source code](https://github.com/miltoncandelero/tweedle.js)

## How do I use this?
If you are on the browser, use the `umd` package and use the global `TWEEDLE` to find what you need (or the `es` modules if you understand that kind of black magic). If you are using npm you can import just what you need (we also have typescript support out of the box).  
The overall syntax is this:
```js
const myObject = { x:0, y:0 };
new Tween(myObject).to({ x:100, y:100 }, 2500).start();
```

You can probably see that tweens are meant to be chain called and all functions return themselves so you can keep 

But that's only half the trouble as Tweedle won't move time forward on itself. See, every tween that you don't assign a group, it belongs to the shared group and you must remember to update that group for your tweens to work.

```js
const tweenLoop = () => {
	Group.shared.update();
	requestAnimationFrame(tweenLoop);
}
tweenLoop();
```

## Easings, Interpolations, Events, Chains, Deep objects, and more!
Tweedle supports all of [Robert Penner easing functions](http://robertpenner.com/easing/), has Interpolation for bezier curves, colors and rotations, fires events onStart, onUpdate, onLoop, onEnd, can chain tweens so they start right after the previous one ends, allows to modify deep properties of objects and many more features that I need to write demos and tests for.  
Feel free to dive the [API documentation](https://miltoncandelero.github.io/tweedle.js/) and read more there since all functions are documented.

## Helping Tweedle
Tweedle uses Jest for testing and I was considering using PixiJS to do some demos.  
I am releasing this right now as is since it is quite functional and stable even when I don't have the tests to prove so.  
Feel free to send me your demos or tests (even if the tests fail and you can't put the effort to make it pass, I still find that valuable!)  

---

Tweedle.js is my fork of [tween.js](https://github.com/tweenjs/tween.js) made with ♥ to fit my needs at Killabunnies.