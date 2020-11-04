import { Easing, EasingFunction } from "./Easing";
import { Interpolation, InterpolationFunction } from "./Interpolation";
import { Group } from "./Group";
import { Sequence } from "./Sequence";

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
	private _initialRepeat = 0;
	private _repeat = 0;
	private _repeatDelayTime?: number;
	private _yoyo = false;
	private _isPlaying = false;
	private _reversed = false;
	private _delayTime = 0;
	private _startTime = 0;
	private _elapsedTime = 0;
	private _timescale = 1;
	private _easingFunction: EasingFunction = Easing.Linear.None;
	private _interpolationFunction: InterpolationFunction = Interpolation.Linear;
	private _chainedTweens: Array<Tween<any>> = [];
	private _onStartCallback?: (object: Target) => void;
	private _onStartCallbackFired = false;
	private _onUpdateCallback?: (object: Target, elapsed: number) => void;
	private _onRepeatCallback?: (object: Target) => void;
	private _onCompleteCallback?: (object: Target) => void;
	private _onStopCallback?: (object: Target) => void;
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
	 * To restart a tween and reset the starting values use {@link Tween.restart()}
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

		this._repeat = this._initialRepeat;

		if (this._reversed) {
			// If we were reversed (f.e. using the yoyo feature) then we need to
			// flip the tween direction back to forward.

			this._reversed = false;

			this._swapEndStartRepeatValues(this._valuesStartRepeat, this._valuesEnd);
			this._valuesStart = JSON.parse(JSON.stringify(this._valuesStartRepeat));
		}

		this._isPlaying = true;

		this._isPaused = false;

		this._onStartCallbackFired = false;

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

	private _setupProperties(_object: any, _valuesStart: any, _valuesEnd: any, _valuesStartRepeat: any, overwrite: boolean): void {
		for (const property in _valuesEnd) {
			const startValue = _object[property];
			const startValueIsArray = Array.isArray(startValue);
			const startValueIsNumber = !Number.isNaN(Number(startValue));
			const propType = startValueIsArray ? "array" : typeof startValue;
			const startValueIsObject = propType == "object";
			const endValueIsObject = typeof _valuesEnd[property] == "object";
			const isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property]);

			// If `to()` specifies a property that doesn't exist in the source object,
			// we should not set that property in the object
			if (propType == "undefined" || propType == "function" || _valuesEnd[property] == undefined || (!startValueIsArray && !startValueIsNumber && !startValueIsObject)) {
				continue;
			}

			// Check if an Array was provided as property value
			if (isInterpolationList) {
				let endValues: Array<number | string> = _valuesEnd[property];

				if (endValues.length == 0) {
					continue;
				}

				// handle an array of relative values
				endValues = endValues.map(this._handleRelativeValue.bind(this, startValue));

				// Create a local copy of the Array with the start value at the front
				_valuesEnd[property] = [startValue].concat(endValues);
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
						_valuesStartRepeat[property] = _valuesEnd[property].slice().reverse();
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
			this._onStopCallback(this._object);
		}

		return this;
	}

	/**
	 * Fastforwards this tween to the end by triggering an update with an infinite value.
	 * This will work even on paused tweens.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public end(): this {
		this.resume();
		this.update(Infinity);

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
	 * Stops tweens chained to this tween. To chain a tween see {@link Tween.chain}.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public stopChainedTweens(): this {
		for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
			this._chainedTweens[i].stop();
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
		this._initialRepeat = times;
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
	 * Sets the onStart callback
	 * @param callback - the function to call on start. It will recieve the target object as a parameter.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public onStart(callback: (object: Target) => void): this {
		this._onStartCallback = callback;

		return this;
	}

	/**
	 * Sets the onStart callback
	 * @param callback - the function to call on start. It will recieve the target object as a parameter and a number between 0 and 1 determining the progress of the tween.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public onUpdate(callback: (object: Target, elapsed: number) => void): this {
		this._onUpdateCallback = callback;

		return this;
	}

	/**
	 * Sets the onRepeat callback
	 * @param callback - the function to call on repeat. It will recieve the target object as a parameter.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public onRepeat(callback: (object: Target) => void): this {
		this._onRepeatCallback = callback;

		return this;
	}

	/**
	 * Sets the onComplete callback
	 * @param callback - the function to call on complete. It will recieve the target object as a parameter.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public onComplete(callback: (object: Target) => void): this {
		this._onCompleteCallback = callback;

		return this;
	}

	/**
	 * Sets the onStop callback
	 * @param callback - the function to call on stop. It will recieve the target object as a parameter.
	 * @returns returns this tween for daisy chaining methods.
	 */
	public onStop(callback: (object: Target) => void): this {
		this._onStopCallback = callback;

		return this;
	}

	/**
	 * Updates this tween
	 * @param deltaTime - the amount of time that passed since last update in **miliseconds**
	 * @returns returns true if the tween hasn't finished yet.
	 */
	public update(deltaTime: number): boolean {
		const retval = this._internalUpdate(deltaTime);
		if (!retval) {
			this._group.remove(this);
		}
		return retval;
	}

	/**
	 * @internal
	 */
	public _internalUpdate(deltaTime: number): boolean {
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
				this._onStartCallback(this._object);
			}

			this._onStartCallbackFired = true;
		}

		elapsed = currentTime / this._duration;
		// zero duration = instacomplete.
		elapsed = this._duration == 0 ? 1 : elapsed;
		// otherwise, clamp the result
		elapsed = Math.min(1, elapsed);
		elapsed = Math.max(0, elapsed);

		let leftOverTime = currentTime % this._duration; // leftover time
		if (Number.isNaN(leftOverTime)) {
			leftOverTime = 0;
		}
		const loopsMade = Math.round(currentTime / this._duration); // if we overloop, how many loops did we eat?

		const value = this._easingFunction(elapsed);

		// properties transformations
		this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value);

		// if there is absolutely no chance to loop, call update. we will be done.
		if (this._onUpdateCallback && (elapsed != 1 || this._repeat <= 0)) {
			this._onUpdateCallback(this._object, elapsed);
		}

		if (elapsed == 1) {
			if (this._repeat > 0) {
				// substract loops
				if (isFinite(this._repeat)) {
					this._repeat -= loopsMade;
				}

				if (this._onUpdateCallback && (this._repeat < 0 || leftOverTime <= 0)) {
					this._onUpdateCallback(this._object, elapsed);
				}

				// fix starting values for yoyo or relative
				if (this._yoyo) {
					this._swapEndStartRepeatValues(this._valuesStartRepeat, this._valuesEnd);
				} else {
					this._moveForwardStartRepeatValues(this._valuesStartRepeat, this._valuesEnd);
				}

				// Reassign starting values
				this._valuesStart = JSON.parse(JSON.stringify(this._valuesStartRepeat));

				// store yoyo state
				if (this._yoyo) {
					this._reversed = !this._reversed;
				}

				// restart start time
				if (this._repeatDelayTime !== undefined) {
					this._startTime = -this._repeatDelayTime;
				} else {
					this._startTime = 0;
				}

				if (this._onRepeatCallback) {
					this._onRepeatCallback(this._object);
				}

				this._elapsedTime = 0; // reset the elapsed time

				// if we have more loops to go, then go
				if (this._repeat >= 0) {
					// update with the leftover time
					if (leftOverTime > 0) {
						// only if it is greater than 0 and do not emit onupdate events...
						this._internalUpdate(leftOverTime);
					}
					return true;
				} else {
					return false;
				}
			}
			if (this._onCompleteCallback) {
				this._onCompleteCallback(this._object);
			}

			for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
				// Make the chained tweens start exactly at the time they should,
				// even if the `update()` method was called way past the duration of the tween
				this._chainedTweens[i].start(this._startTime + this._duration);
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
				_object[property] = this._interpolationFunction(end as Array<number>, value);
			} else if (typeof end == "object" && end) {
				this._updateProperties(_object[property], start, end, value);
			} else {
				// Parses relative end values with start as base (e.g.: +10, -3)
				end = this._handleRelativeValue(start, end as number | string);

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
			if (typeof _valuesStartRepeat[property] == "object") {
				this._swapEndStartRepeatValues(_valuesStartRepeat[property], _valuesEnd[property]);
			} else {
				const tmp = _valuesStartRepeat[property];
				if (typeof _valuesEnd[property] == "string") {
					_valuesStartRepeat[property] = Number(_valuesStartRepeat[property]) + Number(_valuesEnd[property]);
				} else {
					_valuesStartRepeat[property] = _valuesEnd[property];
				}

				_valuesEnd[property] = tmp;
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
type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : RecursivePartial<T[P]>;
};
export default Tween;
