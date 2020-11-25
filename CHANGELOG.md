# 1.1.0
### Features
- Event functions (`onStart`, `onUpdate`, `onRepeat`, `onComplete`, and `onStop`) now provide the current tween as a parameter to the callback function.

### Fixes
- Tweens added during a tween will not be updated until the next update window. This was a legacy behavior from tween.js and caused problems everywhere. Most notably, chained tweens.
  - Added a test for chained tweens.

# 1.0.0
- Initial release