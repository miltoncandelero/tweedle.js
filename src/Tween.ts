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

	public start(extraDelay: number = 0): this {
		if (this._isPlaying) {
			return this;
		}

		this._group.add(this);

		this._repeat = this._initialRepeat;

		if (this._reversed) {
			// If we were reversed (f.e. using the yoyo feature) then we need to
			// flip the tween direction back to forward.

			this._reversed = false;

			for (const property in this._valuesStartRepeat) {
				this._swapEndStartRepeatValues(property);
				this._valuesStart[property] = this._valuesStartRepeat[property];
			}
		}

		this._isPlaying = true;

		this._isPaused = false;

		this._onStartCallbackFired = false;

		this._isChainStopped = false;

		this._startTime = -extraDelay; // extra delay is a delay that doesn't come back on repeats

		this._startTime -= this._delayTime;

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

				for (const prop in startValue as object) {
					_valuesStart[property][prop] = startValue[prop];
				}

				_valuesStartRepeat[property] = startValueIsArray ? [] : {}; // TODO? repeat nested values? And yoyo? And array values?

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
		let property;
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

		elapsed = this._elapsedTime / this._duration;
		// zero duration = instacomplete.
		elapsed = this._duration === 0 ? 1 : elapsed;
		// otherwise, clamp the result
		elapsed = Math.min(1, elapsed);
		elapsed = Math.max(0, elapsed);

		const leftOverTime = this._elapsedTime % this._duration; // leftover time
		const loopsMade = Math.round(this._elapsedTime / this._duration); // if we overloop, how many loops did we eat?

		const value = this._easingFunction(elapsed);

		// properties transformations
		this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value);

		if (this._onUpdateCallback) {
			this._onUpdateCallback(this._object, elapsed);
		}

		if (elapsed === 1) {
			if (this._repeat > 0) {
				if (isFinite(this._repeat)) {
					this._repeat -= loopsMade;
				}
				// Reassign starting values, restart by making startTime = now
				for (property in this._valuesStartRepeat) {
					if (!this._yoyo && typeof this._valuesEnd[property] === "string") {
						this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + Number(this._valuesEnd[property]);
					}

					if (this._yoyo) {
						this._swapEndStartRepeatValues(property);
					}

					this._valuesStart[property] = this._valuesStartRepeat[property];
				}

				if (this._yoyo) {
					this._reversed = !this._reversed;
				}

				if (this._repeatDelayTime !== undefined) {
					this._startTime = -this._repeatDelayTime;
				} else {
					this._startTime = -this._delayTime;
				}

				if (this._onRepeatCallback) {
					this._onRepeatCallback(this._object);
				}

				this._elapsedTime = 0; // reset the elapsed time

				// if we have more loops to go, then go
				if (this._repeat > 0) {
					return this.internalUpdate(leftOverTime); // update with the leftover time
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

	private _swapEndStartRepeatValues(property: string): void {
		const tmp = this._valuesStartRepeat[property];

		if (typeof this._valuesEnd[property] === "string") {
			this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + Number(this._valuesEnd[property]);
		} else {
			this._valuesStartRepeat[property] = this._valuesEnd[property];
		}

		this._valuesEnd[property] = tmp;
	}
}

type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : RecursivePartial<T[P]>;
};
export default Tween;
