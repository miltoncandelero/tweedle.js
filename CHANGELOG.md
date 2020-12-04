# 1.1.1
### Fixes
- Calling `end` on an infinite looping tween will not cause a recursive endless loop.
  - Added a test for this. Needs a better way to check for endless looping but will do for now.
- Calling `end` on a repeating tween will fast-forward it to the end of all the loops and call the `onComplete`.
  - Extended the test on really big delta times for this since `end` is an infinite delta time update.

# 1.1.0
### Features
- Event functions (`onStart`, `onUpdate`, `onRepeat`, `onComplete`, and `onStop`) now provide the current tween as a parameter to the callback function.

### Fixes
- Tweens added during a tween will not be updated until the next update window. This was a legacy behavior from tween.js and caused problems everywhere. Most notably, chained tweens.
  - Added a test for chained tweens.

# 1.0.0
- Initial release