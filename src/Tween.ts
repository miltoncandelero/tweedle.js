import type { Easing, EasingFunction } from "./Easing";
import type { Interpolation, InterpolationFunction } from "./Interpolation";
import { Group } from "./Group";
import { Sequence } from "./Sequence";
import { DEFAULTS } from "./Defaults";

/**
 * A Tween is basically an animation command.
 * For example: _Go from here to there in this amount of time._
 *
 * Tweens won't start by themselves. **Remeber to call {@link Tween.start} when you want your tweens to start!**
 *
 * Most methods will return the same object to allow for daisy chaining.
 * @template Target of the tween
 */
export class Tween<Target> {
	private _isPaused = false;
	private _valuesStart: any = {};
	private _valuesEnd: any = {};
	private _valuesStartRepeat: any = {};
	private _duration = 0;
	private _repeatCount = 0;
	private _repeat = 0;
	private _repeatDelayTime?: number;
	private _yoyo = false;
	private _isPlaying = false;
	private get _reversed(): boolean {
		return this.yoyo && this._repeatCount % 2 !== 0;
	}
	private _delayTime = 0;
	private _startTime = 0;
	private _elapsedTime = 0;
	private _timescale = 1;
	private _safetyCheckFunction: (target: Target, tweenRef: this) => boolean = DEFAULTS.safetyCheckFunction;
	private _easingFunction: EasingFunction = DEFAULTS.easingFunction;
	private _yoyoEasingFunction: EasingFunction = DEFAULTS.yoyoEasingFunction;
	private _interpolationFunction: InterpolationFunction = DEFAULTS.interpolationFunction;
	private _chainedTweens: Array<Tween<any>> = [];
	private _onStartCallback?: (object: Target, tweenRef: this) => void;
	private _onStartCallbackFired = false;
	private _onAfterDelayCallback?: (object: Target, tweenRef: this) => void;
	private _onAfterDelayCallbackFired = false;
	private _onUpdateCallback?: (object: Target, elapsed: number, tweenRef: this) => void;
	private _onRepeatCallback?: (object: Target, repeatCount: number, tweenRef: this) => void;
	private _onCompleteCallback?: (object: Target, tweenRef: this) => void;
	private _onStopCallback?: (object: Target, tweenRef: this) => void;
	private _onFinallyCallback?: (object: Target, tweenRef: this) => void;
	private _id = Sequence.nextId();
	private _isChainStopped = false;
	private _object: Target;
	private _groupRef: Group;
	private get _group(): Group {
		if (this._groupRef) {
			return this._groupRef;
		} else {
			return Group.shared;
		}
	}
	private set _group(value: Group) {
		this._groupRef = value;
	}

	/**
	 * Creates an instance of tween.
	 * @param object - The target object which properties you want to animate
	 * @param group - The {@link Group} this new Tween will belong to. If none is provided it will default to the static {@link Group.shared}
	 */
	constructor(object: Target, group?: Group) {
		this._object = object;
		this._group = group;
	}

	/**
	 * Gets the id for this tween. A tween id is a number that increases perpetually with each tween created. It is used inside {@link Group} to keep track of tweens
	 * @returns returns the id for this tween.
	 */
	public getId(): number {
		return this._id;
	}

	/**
	 * Gets {@link Group} that this tween belongs to.
	 * @returns returns the {@link Group} for this tween.
	 */
	public getGroup(): Group {
		return this._group;
	}

	/**
	 * Gets the timescale for this tween. The timescale is a factor by which each deltatime is multiplied, allowing to speed up or slow down the tween.
	 * @returns returns the timescale for this tween.
	 */
	public getTimescale(): number {
		return this._timescale;
	}

	/**
	 * A tween is playing when it has been started but hasn't ended yet. This has nothing to do with pausing. For that see {@link Tween.isPaused}.
	 * @returns returns true if this tween is playing.
	 */
	public isPlaying(): boolean {
		return this._isPlaying;
	}

	/**
	 * A tween can only be paused if it was playing.
	 * @returns returns true if this tween is paused.
	 */
	public isPaused(): boolean {
		return this._isPaused;
	}

	/**
	 * Writes the starting values of the tween.
	 *
	 * **Starting values generated from {@link Tween.start} will be overwritten.**
	 * @param properties - Starting values for this tween.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public from(properties: RecursivePartial<Target>): this;
	public from(properties: any): this;
	public from(properties: any): this {
		try {
			JSON.stringify(properties);
		} catch (e) {
			throw new Error("The object you provided to the from() method has a circular reference!");
		}
		this._setupProperties(properties, this._valuesStart, properties, this._valuesStartRepeat, true);
		return this;
	}

	/**
	 * Set the final values for the target object's properties by copy.
	 * This will try to create a deep copy of the `properties` parameter.
	 * If you want the tween to keep a reference to the final values use {@link Tween.dynamicTo}.
	 *
	 * If an array value is provided for a value that originally wasn't an array, it will be interpreted as an interpolable curve and the values inside the array will be interpolated using the function provided in {@link Tween.interpolation}
	 *
	 * If a string value that starts with either `+` or `-`is provided it will be taken as a _relative value_ to the start value.
	 * @param properties - final values for the target object.
	 * @param duration - if given it will be used as the duration in **miliseconds**. if not, a call to {@link Tween.duration} will be needed.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public to(properties: RecursivePartial<Target>, duration?: number): this;
	public to(properties: any, duration?: number): this;
	public to(properties: any, duration?: number): this {
		try {
			this._valuesEnd = JSON.parse(JSON.stringify(properties));
		} catch (e) {
			// recursive object. this gonna crash!
			console.warn("The object you provided to the to() method has a circular reference!. It can't be cloned. Falling back to dynamic targeting");
			return this.dynamicTo(properties, duration);
		}

		if (duration !== undefined) {
			this._duration = duration;
		}

		return this;
	}

	/**
	 * Set the final values for the target object's properties by reference.
	 * This will store a reference to the properties object allowing you to change the final values while the tween is running.
	 * If you want the tween to make a copy of the final values use {@link Tween.to}.
	 * @param properties - final values for the target object.
	 * @param duration - if given it will be used as the duration in **miliseconds**. if not, a call to {@link Tween.duration} will be needed.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public dynamicTo(properties: RecursivePartial<Target>, duration?: number): this;
	public dynamicTo(properties: any, duration?: number): this;
	public dynamicTo(properties: any, duration?: number): this {
		this._valuesEnd = properties; // JSON.parse(JSON.stringify(properties));

		if (duration !== undefined) {
			this._duration = duration;
		}

		return this;
	}

	/**
	 * Sets the duration for this tween in **miliseconds**.
	 * @param d - The duration for this tween in **miliseconds**.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public duration(d: number): this {
		this._duration = d;

		return this;
	}

	/**
	 * Tweens won't start by themselves when created. Call this to start the tween.
	 * Starting values for the animation will be stored at this moment.
	 *
	 * **This function can't overwrite the starting values set by {@link Tween.from}**
	 *
	 * You can call this method on a finished tween to restart it without changing the starting values.
	 * To restart a tween and reset the starting values use {@link Tween.restart}
	 * @param delay - if given it will be used as the delay in **miliseconds**.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public start(delay?: number): this {
		if (this._isPlaying) {
			return this;
		}

		if (delay != undefined) {
			this._delayTime = delay;
		}

		this._group.add(this);

		if (this._reversed) {
			this._swapEndStartRepeatValues(this._valuesStartRepeat, this._valuesEnd);
			this._valuesStart = JSON.parse(JSON.stringify(this._valuesStartRepeat));
		}

		this._repeatCount = 0; // This must be after we check for the _reversed flag!!.

		this._isPlaying = true;

		this._isPaused = false;

		this._onStartCallbackFired = false;

		this._onAfterDelayCallbackFired = false;

		this._isChainStopped = false;

		this._startTime = -this._delayTime;

		this._elapsedTime = 0;

		this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat, false);

		return this;
	}

	/**
	 * @experimental
	 * Forces a tween to restart.
	 * Starting values for the animation will be stored at this moment.
	 * This literally calls {@link Tween.reset} and then {@link Tween.start}.
	 *
	 * **Starting values will be cleared!. This function will erase all values created from {@link Tween.from} and/or {@link Tween.start}**
	 * @param delay - if given it will be used as the delay in **miliseconds**.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public restart(delay?: number): this {
		this.reset();
		return this.start(delay);
	}

	/**
	 * @experimental
	 * Clears the starting and loop starting values.
	 *
	 * **Starting values will be cleared!. This function will erase all values created from {@link Tween.from} and/or {@link Tween.start}**
	 * @returns returns this tween for daisy chaining methods.
	 */
	public reset(): this {
		if (this._isPlaying) {
			this.stop();
		}
		this._valuesStart = {};
		this._valuesStartRepeat = {};
		return this;
	}

	/**
	 * @experimental
	 * Stops the tween and sets the values to the starting ones.
	 *
	 * @returns returns this tween for daisy chaining methods.
	 */
	public rewind(): this {
		if (this._isPlaying) {
			this.stop();
		}

		if (this._reversed) {
			// if you rewind from a reversed position, we unreverse.
			this._swapEndStartRepeatValues(this._valuesStartRepeat, this._valuesEnd);
		}

		const value = this._easingFunction(0);

		// properties transformations
		this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value);

		return this;
	}

	private _setupProperties(_object: any, _valuesStart: any, _valuesEnd: any, _valuesStartRepeat: any, overwrite: boolean): void {
		for (const property in _valuesEnd) {
			const startValue = _object[property];
			const startValueIsArray = Array.isArray(startValue);
			const startValueIsNumber = !Number.isNaN(Number(startValue));
			const propType = startValueIsArray ? "array" : typeof startValue;
			const startValueIsObject = propType == "object";
			const endValueIsObject = typeof _valuesEnd[property] == "object";
			const isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property]);

			// If to() specifies a property that doesn't exist in the source object,
			// we should not set that property in the object
			if (propType == "undefined" || propType == "function" || _valuesEnd[property] == undefined || (!startValueIsArray && !startValueIsNumber && !startValueIsObject)) {
				continue;
			}

			// handle the deepness of the values
			if ((startValueIsObject || startValueIsArray || endValueIsObject) && startValue && !isInterpolationList) {
				if (typeof _valuesStart[property] == "undefined") {
					_valuesStart[property] = startValueIsArray ? [] : {};
				}
				if (typeof _valuesStartRepeat[property] == "undefined") {
					_valuesStartRepeat[property] = startValueIsArray ? [] : {};
				}

				this._setupProperties(startValue, _valuesStart[property], _valuesEnd[property], _valuesStartRepeat[property], overwrite);
			} else {
				// Save the starting value, but only once.
				if (typeof _valuesStart[property] == "undefined" || overwrite) {
					_valuesStart[property] = startValue;
				}

				if (typeof _valuesStartRepeat[property] == "undefined" || overwrite) {
					if (isInterpolationList) {
						_valuesStartRepeat[property] = _valuesEnd[property].slice().reverse()[0];
					} else {
						_valuesStartRepeat[property] = _valuesStart[property] || 0;
					}
				}
			}
		}
	}

	/**
	 * Stops this tween
	 * @returns returns this tween for daisy chaining methods.
	 */
	public stop(): this {
		if (!this._isChainStopped) {
			this._isChainStopped = true;
			this.stopChainedTweens();
		}

		if (!this._isPlaying) {
			return this;
		}

		this._group.remove(this);

		this._isPlaying = false;

		this._isPaused = false;

		if (this._onStopCallback) {
			this._onStopCallback(this._object, this);
		}

		if (this._onFinallyCallback) {
			this._onFinallyCallback(this._object, this);
		}

		return this;
	}

	/**
	 * Fastforwards this tween to the end by triggering an update with an infinite value.
	 * This will work even on paused tweens.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public end(endChainedTweens: boolean = false): this {
		let protectedChainedTweens: Tween<any>[] = [];

		if (!endChainedTweens) {
			protectedChainedTweens = this._chainedTweens;
			this._chainedTweens = [];
		}

		this.resume();
		this.update(Infinity);

		if (!endChainedTweens) {
			this._chainedTweens = protectedChainedTweens;
			for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
				this._chainedTweens[i].start();
			}
		}

		return this;
	}

	/**
	 * @experimental
	 * Skips forward the in the repeats of this tween by triggering a biiiiig update.
	 * Think of this as a less agressive {@link Tween.end}.
	 *
	 * @param amount - The amount of repeats to skip.
	 * @param resetCurrentLoop - If true, the time will become zero and the object will return to the initial value in the next update.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public skip(amount: number, resetCurrentLoop: boolean = false): this {
		this.resume();

		this.update(amount * this._duration - (resetCurrentLoop ? this._elapsedTime : 0));

		return this;
	}

	/**
	 * Pauses this tween. Does nothing is if the tween was already paused or wasn't playing.
	 * Paused tweens ignore all update calls.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public pause(): this {
		if (this._isPaused || !this._isPlaying) {
			return this;
		}

		this._isPaused = true;

		this._group.remove(this);

		return this;
	}

	/**
	 * Resumes this tween. Does nothing if the tween wasn't paused nor running.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public resume(): this {
		if (!this._isPaused || !this._isPlaying) {
			return this;
		}

		this._isPaused = false;

		this._group.add(this);

		return this;
	}

	/**
	 * @experimental
	 * Stops tweens chained to this tween. To chain a tween see {@link Tween.chain}.
	 *
	 * @returns returns this tween for daisy chaining methods.
	 */
	public stopChainedTweens(): this {
		for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
			this._chainedTweens[i].stop();
		}

		return this;
	}

	/**
	 * @experimental
	 * Starts all tweens chained to this tween. To chain a tween see {@link Tween.chain}.
	 *
	 * @param stopThis - If true, this tween will be stopped before it starts the chained tweens.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public startChainedTweens(stopThis: boolean = false): this {
		if (stopThis) {
			this.stop();
		}

		for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
			this._chainedTweens[i].start();
		}

		return this;
	}

	/**
	 * Sets the {@link Group} for this tween.
	 * @param group - the group for this tween. If undefined or null is given, the group will default to {@link Group.shared}.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public group(group: Group): this {
		this._group = group;

		return this;
	}

	/**
	 * Sets the delay for this tween.
	 *
	 * This will only be applied at the start of the tween. For delaying the repeating of a tween, see {@link Tween.repeatDelay}
	 *
	 * **This will only work before calling {@link Tween.start}.**
	 * @param amount - the delay for this tween.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public delay(amount: number): this {
		this._delayTime = amount;

		return this;
	}

	/**
	 * Sets the timescale for this tween.
	 * The deltaTime inside the update will be multiplied by this value allowing to speed up or slow down the flow of time.
	 * @param multiplier - the timescale value for this tween.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public timescale(multiplier: number): this {
		this._timescale = multiplier;

		return this;
	}

	/**
	 * Sets the number of times this tween will loop
	 * @param times - the number of loops. For endless loops use `Infinity`
	 * @returns returns this tween for daisy chaining methods.
	 */
	public repeat(times: number = Infinity): this {
		this._repeat = times;

		return this;
	}

	/**
	 * Sets the repeat delay for this tween.
	 *
	 * This will only be applied at the start of every repeat. For delaying only the start, see {@link Tween.delay}
	 * @param amount - the repeat delay for this tween.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public repeatDelay(amount: number): this {
		this._repeatDelayTime = amount;

		return this;
	}

	/**
	 * Sets if this tween should yoyo (reflect) itself when repeating.
	 * @param yoyo - the yoyo value for this tween.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public yoyo(yoyo: boolean = true): this {
		this._yoyo = yoyo;

		return this;
	}

	/**
	 * Sets the easing function to interpolate the starting values with the final values.
	 *
	 * You can use the functions inside the {@link Easing} object.
	 * @param easingFunction - a function that takes a number between 0 and 1 and returns another number between 0 and 1
	 * @returns returns this tween for daisy chaining methods.
	 */
	public easing(easingFunction: EasingFunction): this {
		this._easingFunction = easingFunction;

		return this;
	}

	/**
	 * @experimental
	 * Sets the safety check function to test if the tweening object is still valid.
	 * If the function returns a non-truthy value, the tween will skip the update loop.
	 * @param safetyCheckFunction - a function that takes the target object and this tween as a parameter and returns true if the object is still valid.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public safetyCheck(safetyCheckFunction: (target: Target, tween: this) => boolean): this {
		this._safetyCheckFunction = safetyCheckFunction;

		return this;
	}

	/**
	 * @experimental
	 * Sets the easing function to interpolate the starting values with the final values on the way back due to a yoyo tween.
	 *
	 * You can use the functions inside the {@link Easing} object.
	 * @param easingFunction - a function that takes a number between 0 and 1 and returns another number between 0 and 1
	 * @returns returns this tween for daisy chaining methods.
	 */
	public yoyoEasing(easingFunction: EasingFunction): this {
		this._yoyoEasingFunction = easingFunction;

		return this;
	}

	/**
	 * Sets the easing function to interpolate the starting values with the final values when the final value is an array of objects.
	 * Use this to create bezier curves or interpolate colors.
	 *
	 * You can use the functions inside the {@link Interpolation} object.
	 * @param interpolationFunction
	 * @returns returns this tween for daisy chaining methods.
	 */
	public interpolation(interpolationFunction: InterpolationFunction): this {
		this._interpolationFunction = interpolationFunction;

		return this;
	}

	/**
	 * Adds tweens to be called when this tween ends.
	 * The tweens here will be called all at the same time.
	 * @param tweens - tweens to be started when this tween ends
	 * @returns returns this tween for daisy chaining methods.
	 */
	public chain(...tweens: Array<Tween<any>>): this {
		this._chainedTweens = tweens;

		return this;
	}

	/**
	 * Sets the onStart callback. This will be called as soon as you call {@link Tween.start}.
	 * @param callback - the function to call on start. It will recieve the target object and this tween as a parameter.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public onStart(callback: (object: Target, tween: this) => void): this {
		this._onStartCallback = callback;

		return this;
	}

	/**
	 * Sets the onAfterDelay callback. This will be called when the delay is over.
	 * @param callback - the function to call on start. It will recieve the target object and this tween as a parameter.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public onAfterDelay(callback: (object: Target, tween: this) => void): this {
		this._onAfterDelayCallback = callback;

		return this;
	}

	/**
	 * Sets the onStart callback
	 * @param callback - the function to call on start. It will recieve the target object, this tween, and a number between 0 and 1 determining the progress as a parameter.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public onUpdate(callback: (object: Target, elapsed: number, tween: this) => void): this {
		this._onUpdateCallback = callback;

		return this;
	}

	/**
	 * Sets the onRepeat callback
	 * @param callback - the function to call on repeat. It will recieve the target object and this tween as a parameter.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public onRepeat(callback: (object: Target, repeatCount: number, tweenRef: this) => void): this {
		this._onRepeatCallback = callback;

		return this;
	}

	/**
	 * Sets the onComplete callback
	 * @param callback - the function to call on complete. It will recieve the target object and this tween as a parameter.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public onComplete(callback: (object: Target, tween: this) => void): this {
		this._onCompleteCallback = callback;

		return this;
	}

	/**
	 * Sets the onStop callback
	 * @param callback - the function to call on stop. It will recieve the target object and this tween as a parameter.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public onStop(callback: (object: Target, tween: this) => void): this {
		this._onStopCallback = callback;

		return this;
	}

	/**
	 * Sets the onFinally callback
	 * @param callback - the function to call on stop, complete or after safety check failed. It will recieve the target object and this tween as a parameter.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public onFinally(callback: (object: Target, tween: this) => void): this {
		this._onFinallyCallback = callback;

		return this;
	}

	/**
	 * Updates this tween
	 * @param deltaTime - the amount of time that passed since last update in **miliseconds**
	 * @param preserve - Prevent the removal of stopped, paused, finished or non started tweens from their group.
	 * @returns returns true if the tween hasn't finished yet.
	 */
	public update(deltaTime: number, preserve: boolean = false): boolean {
		const retval = this._internalUpdate(deltaTime);
		if (!retval && !preserve) {
			this._group.remove(this);
		}
		return retval;
	}

	private _internalUpdate(deltaTime: number): boolean {
		if (!this._safetyCheckFunction(this._object, this)) {
			if (this._onFinallyCallback) {
				this._onFinallyCallback(this._object, this);
			}

			return false;
		}

		if (this._isPaused) {
			return false;
		}

		deltaTime *= this._timescale;

		let elapsed;

		this._elapsedTime += deltaTime;

		const endTime = this._duration;
		const currentTime = this._startTime + this._elapsedTime;

		if (currentTime > endTime && !this._isPlaying) {
			return false;
		}

		// If the tween was already finished,
		if (!this.isPlaying) {
			this.start();
		}

		if (this._onStartCallbackFired == false) {
			if (this._onStartCallback) {
				this._onStartCallback(this._object, this);
			}

			this._onStartCallbackFired = true;
		}

		if (this._onAfterDelayCallbackFired == false && currentTime >= 0) {
			if (this._onAfterDelayCallback) {
				this._onAfterDelayCallback(this._object, this);
			}

			this._onAfterDelayCallbackFired = true;
		}

		elapsed = currentTime / this._duration;
		// zero duration makes elapsed a NaN. We need to fix this!
		if (this._duration == 0) {
			// positive currentTime means we have no delay to wait for!
			if (currentTime >= 0) {
				elapsed = 1;
			} else {
				elapsed = 0;
			}
		}
		// otherwise, clamp the result
		elapsed = Math.min(1, elapsed);
		elapsed = Math.max(0, elapsed);

		let leftOverTime = Number.isFinite(currentTime) ? currentTime % this._duration : currentTime; // leftover time
		if (Number.isNaN(leftOverTime)) {
			leftOverTime = 0;
		}
		const loopsMade = Math.floor(currentTime / this._duration); // if we overloop, how many loops did we eat?

		// check which easing to use...
		let value: number;
		if (this._reversed && this._yoyoEasingFunction) {
			value = this._yoyoEasingFunction(elapsed);
		} else {
			value = this._easingFunction(elapsed);
		}

		// properties transformations
		this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value);

		// if there is absolutely no chance to loop, call update. we will be done.
		if (this._onUpdateCallback && (elapsed != 1 || this._repeat - this._repeatCount <= 0)) {
			this._onUpdateCallback(this._object, elapsed, this);
		}

		if (elapsed == 1) {
			if (this._repeat - this._repeatCount > 0) {
				// increase loops
				const oldCount = this._repeatCount;
				this._repeatCount = Math.min(this._repeat + 1, this._repeatCount + loopsMade);

				if (this._onUpdateCallback && (this._repeat - this._repeatCount < 0 || leftOverTime <= 0)) {
					this._onUpdateCallback(this._object, elapsed, this);
				}

				// fix starting values for yoyo or relative
				if (this._yoyo) {
					this._swapEndStartRepeatValues(this._valuesStartRepeat, this._valuesEnd);
				} else {
					this._moveForwardStartRepeatValues(this._valuesStartRepeat, this._valuesEnd);
				}

				// Reassign starting values
				this._valuesStart = JSON.parse(JSON.stringify(this._valuesStartRepeat));

				// restart start time
				if (this._repeatDelayTime !== undefined) {
					this._startTime = -this._repeatDelayTime;
				} else {
					this._startTime = 0;
				}

				if (this._onRepeatCallback) {
					// We fallback to only one call.
					let callbackCount: number = 1;

					if (Number.isFinite(loopsMade)) {
						// if we have a logical number of loops, we trigger the callback that many times
						callbackCount = this._repeatCount - oldCount;
					} else if (Number.isFinite(this._repeat)) {
						// if the amount of loops is infinite, we trigger the callback the amount of loops remaining
						callbackCount = this._repeat - oldCount;
					}

					for (let i = 0; i < callbackCount; i++) {
						this._onRepeatCallback(this._object, oldCount + 1 + i, this);
					}
				}

				this._elapsedTime = 0; // reset the elapsed time

				// if we have more loops to go, then go
				if (this._repeat - this._repeatCount >= 0) {
					// update with the leftover time
					if (leftOverTime > 0 && Number.isFinite(this._repeat)) {
						// only if it is greater than 0 and do not emit onupdate events...
						this._internalUpdate(leftOverTime);
					}
					return true;
				}
			}

			// If we are here, either we are not a looping boi or we are a finished looping boi
			if (this._onCompleteCallback) {
				this._onCompleteCallback(this._object, this);
			}

			if (this._onFinallyCallback) {
				this._onFinallyCallback(this._object, this);
			}

			for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
				// Make the chained tweens start exactly at the time they should,
				// even if the update method was called way past the duration of the tween
				this._chainedTweens[i].start();
				if (leftOverTime > 0) {
					this._chainedTweens[i].update(leftOverTime);
				}
			}

			this._isPlaying = false;

			return false;
		}

		return true;
	}

	private _updateProperties(_object: any, _valuesStart: any, _valuesEnd: any, value: number): void {
		for (const property in _valuesEnd) {
			// Don't update properties that do not exist in the source object
			if (_valuesStart[property] == undefined) {
				continue;
			}

			const start = _valuesStart[property];
			let end = _valuesEnd[property];
			const startIsArray = Array.isArray(_object[property]);
			const endIsArray = Array.isArray(end);
			const isInterpolationList = !startIsArray && endIsArray;

			if (isInterpolationList) {
				if (this._reversed) {
					_object[property] = this._interpolationFunction(end.concat([start]) as Array<number>, value);
				} else {
					_object[property] = this._interpolationFunction([start].concat(end) as Array<number>, value);
				}
			} else if (typeof end == "object" && end) {
				this._updateProperties(_object[property], start, end, value);
			} else {
				// Parses relative end values with start as base (e.g.: +10, -3)
				end = this._handleRelativeValue(start as number, end as number | string);

				// Protect against non numeric properties.
				if (typeof end == "number" && (typeof start == "number" || typeof start == "string")) {
					// I am certain that start here won't anser NaN or it would have been filtrated on the setupProperties
					_object[property] = Number(start) + (end - Number(start)) * value;

					// if it was originally a string, we make it back to string. keep it tidy
					if (typeof start == "string") {
						_object[property] = String(_object[property]);
					}
				}
			}
		}
	}

	private _handleRelativeValue(start: number, end: number | string): number {
		if (typeof end !== "string") {
			return end;
		}

		if (end.charAt(0) == "+" || end.charAt(0) == "-") {
			return start + Number(end);
		}

		return Number(end);
	}

	private _swapEndStartRepeatValues(_valuesStartRepeat: any, _valuesEnd: any): void {
		for (const property in _valuesStartRepeat) {
			const isInterpolationList = !Array.isArray(_valuesStartRepeat[property]) && Array.isArray(_valuesEnd[property]);

			if (typeof _valuesStartRepeat[property] == "object") {
				this._swapEndStartRepeatValues(_valuesStartRepeat[property], _valuesEnd[property]);
			} else {
				const tmp = _valuesStartRepeat[property];
				if (typeof _valuesEnd[property] == "string") {
					_valuesStartRepeat[property] = Number(_valuesStartRepeat[property]) + Number(_valuesEnd[property]);
					_valuesEnd[property] = tmp;
				} else if (isInterpolationList) {
					const aux = _valuesEnd[property].slice().reverse();
					_valuesStartRepeat[property] = aux[0];
					_valuesEnd[property] = aux;
				} else {
					_valuesStartRepeat[property] = _valuesEnd[property];
					_valuesEnd[property] = tmp;
				}
			}
		}
	}

	private _moveForwardStartRepeatValues(_valuesStartRepeat: any, _valuesEnd: any): void {
		for (const property in _valuesStartRepeat) {
			if (typeof _valuesEnd[property] == "object") {
				this._moveForwardStartRepeatValues(_valuesStartRepeat[property], _valuesEnd[property]);
			} else {
				if (typeof _valuesEnd[property] == "string") {
					_valuesStartRepeat[property] = Number(_valuesStartRepeat[property]) + Number(_valuesEnd[property]);
				}
			}
		}
	}
}

/**
 * A recursive version of Typescript's Partial<> decorator.
 */
export type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : RecursivePartial<T[P]>;
};
export default Tween;
