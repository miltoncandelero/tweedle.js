# 2.0.1
### Changes
- Updated deps
- Fixed #13 (it... fixed itself?)
- Fixed #14
  - Added tests for Beziers
- Updated readme

# 2.0.0
### Changes
- Migrated from Microbundle to Rollup
- Migrated from dts-gen to api-extractor
- Renamed iife to umd

### Features
- Added `onAfterDelay` #5
- Added `rewind` 
- `onRepeat` now reports the loop number. #4
- Added `skip`
- Added `startChainedTweens` #2
- `end` now allows to not end the chained tweens #2
- Added `Easing.Step.None` #7

### Fixes
- Rare case where overlooping (more than one repeat loop inside a single update call) would skip a loop.

# 1.1.3
### Fixes
- Zero duration tweens were ignoring it's delay due to a faulty `if` condition.
  - Added some tests for this.
- Improved documentation on `Tween.delay`. It has no effect after Start is called.
  - This is a won't fix for #6
- Removed the badge from the Readme.md
  - Service dieded.

# 1.1.2
### Fixes
- Tweens fast-forwarding many loops in a single update will call `onLoop` as many times as loops advanced.
  - Added a test for this.

# 1.1.1
### Fixes
- Calling `end` on an infinite repeat tween will not cause a recursive endless loop.
  - Added a test for this. Needs a better way to check for endless repeat but will do for now.
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