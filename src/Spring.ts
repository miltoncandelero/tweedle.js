// TODO: Time based frequency setter
// TODO: Fix all comments
// TODO: Caffeine (AKA never sleep) flag
// TODO: Setters for the threshold and substep time
import { Group } from "./Group";
import { Sequence } from "./Sequence";
import { DEFAULTS } from "./Defaults";
import type { IUpdateable } from "./IUpdateable";
import type { RecursivePartial } from ".";

/**
 * A Tween is basically an animation command.
 * For example: _Go from here to there in this amount of time._
 *
 * Tweens won't start by themselves. **Remeber to call {@link Tween.start} when you want your tweens to start!**
 *
 * Most methods will return the same object to allow for daisy chaining.
 * @template Target of the tween
 */
export class Spring<Target> implements IUpdateable {
	private _isAwake = false;
	private _valuesChangeRate: unknown = {};
	private _valuesEnd: any = {};
	private _delayTime = 0;
	private _elapsedTime = 0;
	private _timescale = 1;
	private _angularFrequency = 1;
	private _damping = 1;
	private _safetyCheckFunction: (target: Target) => boolean = DEFAULTS.safetyCheckFunction;
	private _onAwakeCallback?: (object: Target, springRef: this) => void;
	private _onAwakeCallbackFired = false;
	private _onAfterDelayCallback?: (object: Target, springRef: this) => void;
	private _onAfterDelayCallbackFired = false;
	private _onUpdateCallback?: (object: Target, springRef: this) => void;
	private _onSleepCallback?: (object: Target, springRef: this) => void;
	private _onStopCallback?: (object: Target, springRef: this) => void;
	private _id = Sequence.nextId();
	private _object: Target;
	private _groupRef: Group;
	private _substepTime: number = 17; // substep slightly less than 60fps
	private _sleepThreshold: number = 0.01; // 10th of a pixel
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
	 * Creates an instance of sping.
	 * @param object - The target object which properties you want to animate
	 * @param group - The {@link Group} this new Spring will belong to. If none is provided it will default to the static {@link Group.shared}
	 */
	constructor(object: Target, group?: Group) {
		this._object = object;
		this._group = group;
	}

	/**
	 * Gets the id for this spring. A spring id is a number that increases perpetually with each updateable created. It is used inside {@link Group} to keep track of updateables
	 * @returns returns the id for this spring.
	 */
	public getId(): number {
		return this._id;
	}

	/**
	 * Gets {@link Group} that this spring belongs to.
	 * @returns returns the {@link Group} for this spring.
	 */
	public getGroup(): Group {
		return this._group;
	}

	/**
	 * Gets the timescale for this spring. The timescale is a factor by which each deltatime is multiplied, allowing to speed up or slow down the tween.
	 * @returns returns the timescale for this spring.
	 */
	public getTimescale(): number {
		return this._timescale;
	}

	public getAngularFrequency(): number {
		return this._angularFrequency;
	}

	public getDamping(): number {
		return this._damping;
	}

	/**
	 * A tween is playing when it has been started but hasn't ended yet. This has nothing to do with pausing. For that see {@link Tween.isPaused}.
	 * @returns returns true if this spring is playing.
	 */
	public isAwake(): boolean {
		return this._isAwake;
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
	 * @returns returns this spring for daisy chaining methods.
	 */
	public to(properties: RecursivePartial<Target>, angularFrequency?: number, damping?: number): this;
	public to(properties: any, angularFrequency?: number, damping?: number): this;
	public to(properties: any, angularFrequency?: number, damping?: number): this {
		try {
			this._valuesEnd = JSON.parse(JSON.stringify(properties));
		} catch (e) {
			// recursive object. this gonna crash!
			console.warn("The object you provided to the to() method has a circular reference!. It can't be cloned. Falling back to dynamic targeting");
			return this.dynamicTo(properties, angularFrequency, damping);
		}

		if (angularFrequency !== undefined) {
			this._angularFrequency = angularFrequency;
		}

		if (damping !== undefined) {
			this._damping = damping;
		}

		return this;
	}

	/**
	 * Set the final values for the target object's properties by reference.
	 * This will store a reference to the properties object allowing you to change the final values while the tween is running.
	 * If you want the tween to make a copy of the final values use {@link Tween.to}.
	 * @param properties - final values for the target object.
	 * @param duration - if given it will be used as the duration in **miliseconds**. if not, a call to {@link Tween.duration} will be needed.
	 * @returns returns this spring for daisy chaining methods.
	 */
	public dynamicTo(properties: RecursivePartial<Target>, angularFrequency?: number, damping?: number): this;
	public dynamicTo(properties: any, angularFrequency?: number, damping?: number): this;
	public dynamicTo(properties: any, angularFrequency?: number, damping?: number): this {
		this._valuesEnd = properties; // JSON.parse(JSON.stringify(properties));

		if (angularFrequency !== undefined) {
			this._angularFrequency = angularFrequency;
		}

		if (damping !== undefined) {
			this._damping = damping;
		}

		return this;
	}

	public angularFrequency(angularFrequency: number): this {
		this._angularFrequency = angularFrequency;

		return this;
	}

	public damping(damping: number): this {
		this._damping = damping;

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
	 * @returns returns this spring for daisy chaining methods.
	 */
	public awake(delay?: number): this {
		if (this._isAwake) {
			return this;
		}

		if (delay != undefined) {
			this._delayTime = delay;
		}

		this._group.add(this);

		this._isAwake = true;

		this._onAwakeCallbackFired = false;

		this._onAfterDelayCallbackFired = false;

		this._elapsedTime = 0;

		return this;
	}

	/**
	 * Stops this spring
	 * @returns returns this spring for daisy chaining methods.
	 */
	public stop(): this {
		if (!this._isAwake) {
			return this;
		}

		this._group.remove(this);

		this._isAwake = false;

		if (this._onStopCallback) {
			this._onStopCallback(this._object, this);
		}

		return this;
	}

	/**
	 * Forces the object to adopt the target values and sets all velocities to zero.
	 * You can also optionally set the object to keep awake after the spring ends.
	 * Keep in mind, that during the next update, if the object is still within the sleep threshold, it will be put to sleep.
	 * This will even work on fully undamped springs.
	 * @param keepAwake - if true, the spring will stay awake.
	 * @returns returns this spring for daisy chaining methods.
	 */
	public end(keepAwake?: boolean): this {
		this._setToEnd(this._object, this._valuesEnd, this._valuesChangeRate);
		this._isAwake = keepAwake && this._isAwake;
		return this;
	}

	/**
	 * Sets the {@link Group} for this spring.
	 * @param group - the group for this spring. If undefined or null is given, the group will default to {@link Group.shared}.
	 * @returns returns this spring for daisy chaining methods.
	 */
	public group(group: Group): this {
		this._group = group;

		return this;
	}

	/**
	 * Sets the delay for this spring.
	 *
	 * This will only be applied at the start of the tween. For delaying the repeating of a tween, see {@link Tween.repeatDelay}
	 *
	 * **This will only work before calling {@link Tween.start}.**
	 * @param amount - the delay for this spring.
	 * @returns returns this spring for daisy chaining methods.
	 */
	public delay(amount: number): this {
		this._delayTime = amount;

		return this;
	}

	/**
	 * Sets the timescale for this spring.
	 * The deltaTime inside the update will be multiplied by this value allowing to speed up or slow down the flow of time.
	 * @param multiplier - the timescale value for this spring.
	 * @returns returns this spring for daisy chaining methods.
	 */
	public timescale(multiplier: number): this {
		this._timescale = multiplier;

		return this;
	}

	/**
	 * Sets the safety check function to test if the tweening object is still valid.
	 * If the function returns a non-truthy value, the tween will skip the update loop.
	 * @param safetyCheckFunction - a function that takes the target object for this spring and returns true if the object is still valid.
	 * @returns returns this spring for daisy chaining methods.
	 */
	public safetyCheck(safetyCheckFunction: (target: Target) => boolean): this {
		this._safetyCheckFunction = safetyCheckFunction;

		return this;
	}

	/**
	 * Sets the onStart callback. This will be called as soon as you call {@link Tween.start}.
	 * @param callback - the function to call on start. It will recieve the target object and this spring as a parameter.
	 * @returns returns this spring for daisy chaining methods.
	 */
	public onAwake(callback: (object: Target, tween: this) => void): this {
		this._onAwakeCallback = callback;

		return this;
	}

	/**
	 * Sets the onAfterDelay callback. This will be called when the delay is over.
	 * @param callback - the function to call on start. It will recieve the target object and this spring as a parameter.
	 * @returns returns this spring for daisy chaining methods.
	 */
	public onAfterDelay(callback: (object: Target, tween: this) => void): this {
		this._onAfterDelayCallback = callback;

		return this;
	}

	/**
	 * Sets the onStart callback
	 * @param callback - the function to call on start. It will recieve the target object, this spring, and a number between 0 and 1 determining the progress as a parameter.
	 * @returns returns this spring for daisy chaining methods.
	 */
	public onUpdate(callback: (object: Target, spring: this) => void): this {
		this._onUpdateCallback = callback;

		return this;
	}

	/**
	 * Sets the onComplete callback
	 * @param callback - the function to call on complete. It will recieve the target object and this spring as a parameter.
	 * @returns returns this spring for daisy chaining methods.
	 */
	public onSleep(callback: (object: Target, tween: this) => void): this {
		this._onSleepCallback = callback;

		return this;
	}

	/**
	 * Sets the onStop callback
	 * @param callback - the function to call on stop. It will recieve the target object and this spring as a parameter.
	 * @returns returns this spring for daisy chaining methods.
	 */
	public onStop(callback: (object: Target, tween: this) => void): this {
		this._onStopCallback = callback;

		return this;
	}

	/**
	 * Updates this spring
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
		if (!this._safetyCheckFunction(this._object)) {
			return false;
		}

		if (!this._isAwake) {
			return false;
		}

		deltaTime *= this._timescale;

		this._elapsedTime += deltaTime;

		if (this._onAwakeCallbackFired == false) {
			if (this._onAwakeCallback) {
				this._onAwakeCallback(this._object, this);
			}

			this._onAwakeCallbackFired = true;
		}

		if (this._onAfterDelayCallbackFired == false && this._elapsedTime >= this._delayTime) {
			if (this._onAfterDelayCallback) {
				this._onAfterDelayCallback(this._object, this);
			}

			this._onAfterDelayCallbackFired = true;
		}

		let didUpdate = false;
		do {
			const dt = Math.min(deltaTime, this._substepTime);

			didUpdate = this._updateProperties(this._object, this._valuesEnd, this._valuesChangeRate, dt) || didUpdate;

			deltaTime -= dt;
		} while (deltaTime > 0);

		if (this._onUpdateCallback) {
			this._onUpdateCallback(this._object, this);
		}

		if (!didUpdate) {
			if (this._onSleepCallback) {
				this._onSleepCallback(this._object, this);
			}

			this._isAwake = false;

			return false;
		}

		return true;
	}

	private static _auxSpringValues = { value: 0, rate: 0 };

	private _springStep(inOut: { value: number; rate: number }, target: number, deltaTime: number): boolean {
		// If we are close enough to the target and we are almost still, we can sleep.
		if (Math.abs(inOut.value - target) < this._sleepThreshold && Math.abs(inOut.rate) < this._sleepThreshold) {
			inOut.value = target;
			inOut.rate = 0;
			return false;
		}

		const w = this._angularFrequency * 2 * Math.PI;

		// No strenght means no spring. Just follow the last velocity forever.
		if (w < Number.EPSILON) {
			inOut.value += inOut.rate * deltaTime;
			return true;
		}

		// Zero damping, endless oscilation.
		if (this._damping < Number.EPSILON) {
			const err = inOut.value - target;
			const b = inOut.rate / w;
			const sin = Math.sin(w * deltaTime);
			const cos = Math.cos(w * deltaTime);
			inOut.value = target + err * cos + b * sin;
			inOut.rate = inOut.rate * cos - err * (w * sin);
			return true; // Zero damping oscilates forever!.
		}

		// float UndampedFrequency = 1.0f / (UE_PI * InSmoothingTime); // ! Magic code to turn time into frequency!
		const err = inOut.value - target;
		if (this._damping > 1) {
			const wd = w * Math.sqrt(this._damping * this._damping - 1);
			const c2 = -(inOut.rate + (w * this._damping - wd) * err) / (2 * wd);
			const c1 = err - c2;
			const a1 = wd - this._damping * w;
			const a2 = -(wd + this._damping * w);
			const e1 = Math.exp(a1 * deltaTime);
			const e2 = Math.exp(a2 * deltaTime);
			inOut.value = target + e1 * c1 + e2 * c2;
			inOut.rate = e1 * c1 * a1 + e2 * c2 * a2;
		} else if (this._damping < 1) {
			const wd = w * Math.sqrt(this._damping * this._damping - 1);
			const a = err;
			const b = (inOut.rate + err * (this._damping * w)) / wd;
			const s = Math.sin(wd * deltaTime);
			const c = Math.cos(wd * deltaTime);
			const e = Math.exp(-deltaTime * this._damping * w);
			inOut.value = e * (a * c + b * s);
			inOut.rate = -inOut.value * this._damping * w;
			inOut.rate += e * (b * wd * c - a * wd * s);
			inOut.value += target;
		} else {
			const c1 = err;
			const c2 = inOut.rate + err * w;
			const e0 = w * deltaTime;
			const e = Math.exp(-e0);
			inOut.value = target + (c1 + c2 * deltaTime) * e;
			inOut.rate = (c2 - c1 * w - c2 * (w * deltaTime)) * e;
		}

		return true;
	}

	private _updateProperties(_object: any, _valuesEnd: any, _valuesRate: any, deltaTime: number): boolean {
		let retval = false;
		for (const property in _valuesEnd) {
			// Don't update properties that do not exist in the source object
			if (_object[property] == undefined) {
				continue;
			}

			const end = _valuesEnd[property];

			if (typeof end == "object" && end) {
				// Fill rate in case it's not a thing
				if (_valuesRate[property] == undefined) {
					_valuesRate[property] = {};
				}
				const rate = _valuesRate[property];
				retval = this._updateProperties(_object[property], end, rate, deltaTime) || retval;
			} else {
				const current = _object[property];

				if (_valuesRate[property] == undefined) {
					_valuesRate[property] = 0;
				}

				const rate = _valuesRate[property];

				if (typeof end == "number" && (typeof current == "number" || typeof current == "string")) {
					Spring._auxSpringValues.value = Number(current);
					Spring._auxSpringValues.rate = Number(rate);
					retval = this._springStep(Spring._auxSpringValues, end, deltaTime) || retval;

					_object[property] = Spring._auxSpringValues.value;
					_valuesRate[property] = Spring._auxSpringValues.rate;

					// if it was originally a string, we make it back to string. keep it tidy
					if (typeof current == "string") {
						_object[property] = String(_object[property]);
					}
				}
			}
		}
		return retval;
	}

	// Pretty much, a deep assign.
	private _setToEnd(_object: any, _valuesEnd: any, _valuesRate: any): void {
		for (const property in _valuesEnd) {
			// Don't update properties that do not exist in the source object
			if (_object[property] == undefined) {
				continue;
			}

			const end = _valuesEnd[property];

			if (typeof end == "object" && end) {
				// Fill rate in case it's not a thing
				if (_valuesRate[property] == undefined) {
					_valuesRate[property] = {};
				}
				this._setToEnd(_object[property], end, _valuesRate[property]);
			} else {
				const current = _object[property];

				if (typeof end == "number" && (typeof current == "number" || typeof current == "string")) {
					_object[property] = end;
					_valuesRate[property] = 0;

					// if it was originally a string, we make it back to string. keep it tidy
					if (typeof current == "string") {
						_object[property] = String(_object[property]);
					}
				}
			}
		}
	}
}
