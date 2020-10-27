/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

import type { EasingFunction } from "./Easing";
import type { InterpolationFunction } from "./Interpolation";
import { Group } from "./Group";
import TWEEN from "./Index";

export class Tween<T> {
	private _isPaused = false;
	private _pauseStart = 0;
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
	private _easingFunction: EasingFunction = TWEEN.Easing.Linear.None;
	private _interpolationFunction: InterpolationFunction = TWEEN.Interpolation.Linear;
	private _chainedTweens: Array<Tween<any>> = [];
	private _onStartCallback?: (object: T) => void;
	private _onStartCallbackFired = false;
	private _onUpdateCallback?: (object: T, elapsed: number) => void;
	private _onRepeatCallback?: (object: T) => void;
	private _onCompleteCallback?: (object: T) => void;
	private _onStopCallback?: (object: T) => void;
	private _id = TWEEN.nextId();
	private _isChainStopped = false;
	private _object: T;
	private _group: Group;

	constructor(object: T, group: Group = Group.shared) {
		this._object = object;
		this._group = group;
	}

	public getId(): number {
		return this._id;
	}

	public getElapsedTime(): number {
		return this._elapsedTime;
	}

	public getGroup(): Group {
		return this._group;
	}

	public isPlaying(): boolean {
		return this._isPlaying;
	}

	public isPaused(): boolean {
		return this._isPaused;
	}

	public from(properties: RecursivePartial<T>): this;
	public from(properties: any): this;
	public from(properties: any): this {
		this._setupProperties(properties, this._valuesStart, properties, this._valuesStartRepeat);
		return this;
	}
	public to(properties: RecursivePartial<T>, duration?: number): this;
	public to(properties: any, duration?: number): this;
	public to(properties: any, duration?: number): this {
		try {
			this._valuesEnd = JSON.parse(JSON.stringify(properties));
		} catch (e) {
			// recursive object. this gonna crash!
			console.warn("Your target object has a circular reference. It can't be cloned. Falling back to dynamic targeting");
			return this.dynamicTo(properties, duration);
		}

		if (duration !== undefined) {
			this._duration = duration;
		}

		return this;
	}

	public dynamicTo(properties: RecursivePartial<T>, duration?: number): this;
	public dynamicTo(properties: any, duration?: number): this;
	public dynamicTo(properties: any, duration?: number): this {
		this._valuesEnd = properties; // JSON.parse(JSON.stringify(properties));

		if (duration !== undefined) {
			this._duration = duration;
		}

		return this;
	}

	public duration(d: number): this {
		this._duration = d;

		return this;
	}

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

		this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat);

		return this;
	}

	private _setupProperties(_object: any, _valuesStart: any, _valuesEnd: any, _valuesStartRepeat: any): void {
		for (const property in _valuesEnd) {
			const startValue = _object[property];
			const startValueIsArray = Array.isArray(startValue);
			const startValueIsNumber = !Number.isNaN(Number(startValue));
			const propType = startValueIsArray ? "array" : typeof startValue;
			const startValueIsObject = propType === "object";
			const isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property]);

			// If `to()` specifies a property that doesn't exist in the source object,
			// we should not set that property in the object
			if (propType === "undefined" || propType === "function" || _valuesEnd[property] == undefined || (!startValueIsArray && !startValueIsNumber && !startValueIsObject)) {
				continue;
			}

			// Check if an Array was provided as property value
			if (isInterpolationList) {
				let endValues: Array<number | string> = _valuesEnd[property];

				if (endValues.length === 0) {
					continue;
				}

				// handle an array of relative values
				endValues = endValues.map(this._handleRelativeValue.bind(this, startValue));

				// Create a local copy of the Array with the start value at the front
				_valuesEnd[property] = [startValue].concat(endValues);
			}

			// handle the deepness of the values
			if ((startValueIsObject || startValueIsArray) && startValue && !isInterpolationList) {
				_valuesStart[property] = startValueIsArray ? [] : {};
				_valuesStartRepeat[property] = startValueIsArray ? [] : {};

				this._setupProperties(startValue, _valuesStart[property], _valuesEnd[property], _valuesStartRepeat[property]);
			} else {
				// Save the starting value, but only once.
				if (typeof _valuesStart[property] === "undefined") {
					_valuesStart[property] = startValue;
				}

				if (isInterpolationList) {
					_valuesStartRepeat[property] = _valuesEnd[property].slice().reverse();
				} else {
					_valuesStartRepeat[property] = _valuesStart[property] || 0;
				}
			}
		}
	}

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

	public end(): this {
		this.update(Infinity);

		return this;
	}

	public pause(time: number): this {
		if (this._isPaused || !this._isPlaying) {
			return this;
		}

		this._isPaused = true;

		this._pauseStart = time === undefined ? TWEEN.now() : time;

		this._group.remove(this);

		return this;
	}

	public resume(time: number): this {
		if (!this._isPaused || !this._isPlaying) {
			return this;
		}

		this._isPaused = false;

		this._startTime += (time === undefined ? TWEEN.now() : time) - this._pauseStart;

		this._pauseStart = 0;

		this._group.add(this);

		return this;
	}

	public stopChainedTweens(): this {
		for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
			this._chainedTweens[i].stop();
		}

		return this;
	}

	public group(group: Group): this {
		this._group = group;

		return this;
	}

	public delay(amount: number): this {
		this._delayTime = amount;

		return this;
	}

	public repeat(times: number = Infinity): this {
		this._initialRepeat = times;
		this._repeat = times;

		return this;
	}

	public repeatDelay(amount: number): this {
		this._repeatDelayTime = amount;

		return this;
	}

	public yoyo(yoyo: boolean = true): this {
		this._yoyo = yoyo;

		return this;
	}

	public easing(easingFunction: EasingFunction): this {
		this._easingFunction = easingFunction;

		return this;
	}

	public interpolation(interpolationFunction: InterpolationFunction): this {
		this._interpolationFunction = interpolationFunction;

		return this;
	}

	public chain(...tweens: Array<Tween<any>>): this {
		this._chainedTweens = tweens;

		return this;
	}

	public onStart(callback: (object: T) => void): this {
		this._onStartCallback = callback;

		return this;
	}

	public onUpdate(callback: (object: T, elapsed: number) => void): this {
		this._onUpdateCallback = callback;

		return this;
	}

	public onRepeat(callback: (object: T) => void): this {
		this._onRepeatCallback = callback;

		return this;
	}

	public onComplete(callback: (object: T) => void): this {
		this._onCompleteCallback = callback;

		return this;
	}

	public onStop(callback: (object: T) => void): this {
		this._onStopCallback = callback;

		return this;
	}

	public update(deltaTime: number): boolean {
		const retval = this.internalUpdate(deltaTime);
		if (!retval) {
			this._group.remove(this);
		}
		return retval;
	}

	/**
	 * Internals update
	 * @internal
	 * @param [deltaTime]
	 * @returns true if update
	 */
	public internalUpdate(deltaTime: number): boolean {
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

		if (this._onStartCallbackFired === false) {
			if (this._onStartCallback) {
				this._onStartCallback(this._object);
			}

			this._onStartCallbackFired = true;
		}

		elapsed = currentTime / this._duration;
		// zero duration = instacomplete.
		elapsed = this._duration === 0 ? 1 : elapsed;
		// otherwise, clamp the result
		elapsed = Math.min(1, elapsed);
		elapsed = Math.max(0, elapsed);

		const leftOverTime = currentTime % this._duration; // leftover time
		const loopsMade = Math.round(currentTime / this._duration); // if we overloop, how many loops did we eat?

		const value = this._easingFunction(elapsed);

		// properties transformations
		this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value);

		// if there is absolutely no chance to loop, call update. we will be done.
		if (this._onUpdateCallback && (elapsed != 1 || this._repeat <= 0)) {
			this._onUpdateCallback(this._object, elapsed);
		}

		if (elapsed === 1) {
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
						this.internalUpdate(leftOverTime);
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
			if (_valuesStart[property] === undefined) {
				continue;
			}

			const start = _valuesStart[property];
			let end = _valuesEnd[property];
			const startIsArray = Array.isArray(_object[property]);
			const endIsArray = Array.isArray(end);
			const isInterpolationList = !startIsArray && endIsArray;

			if (isInterpolationList) {
				_object[property] = this._interpolationFunction(end as Array<number>, value);
			} else if (typeof end === "object" && end) {
				this._updateProperties(_object[property], start, end, value);
			} else {
				// Parses relative end values with start as base (e.g.: +10, -3)
				end = this._handleRelativeValue(start, end as number | string);

				// Protect against non numeric properties.
				if (typeof end === "number" && (typeof start === "number" || typeof start === "string")) {
					// I am certain that start here won't anser NaN or it would have been filtrated on the setupProperties
					_object[property] = Number(start) + (end - Number(start)) * value;

					// if it was originally a string, we make it back to string. keep it tidy
					if (typeof start === "string") {
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

		if (end.charAt(0) === "+" || end.charAt(0) === "-") {
			return start + Number(end);
		}

		return Number(end);
	}

	private _swapEndStartRepeatValues(_valuesStartRepeat: any, _valuesEnd: any): void {
		for (const property in _valuesStartRepeat) {
			if (typeof _valuesStartRepeat[property] === "object") {
				this._swapEndStartRepeatValues(_valuesStartRepeat[property], _valuesEnd[property]);
			} else {
				const tmp = _valuesStartRepeat[property];
				if (typeof _valuesEnd[property] === "string") {
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
			if (typeof _valuesEnd[property] === "object") {
				this._moveForwardStartRepeatValues(_valuesStartRepeat[property], _valuesEnd[property]);
			} else {
				if (typeof _valuesEnd[property] === "string") {
					_valuesStartRepeat[property] = Number(_valuesStartRepeat[property]) + Number(_valuesEnd[property]);
				}
			}
		}
	}
}

type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : RecursivePartial<T[P]>;
};
export default Tween;
