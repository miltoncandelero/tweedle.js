import { EasingFunction } from "./Easing";
import { InterpolationFunction } from "./Interpolation";
import { Group } from "./Group";
/**
 * A Tween is basically an animation command.
 * For example: _Go from here to there in this amount of time._
 *
 * Tweens won't start by themselves. **Remeber to call {@link Tween.start} when you want your tweens to start!**
 *
 * Most methods will return the same object to allow for daisy chaining.
 * @template Target of the tween
 */
export declare class Tween<Target> {
    private _isPaused;
    private _valuesStart;
    private _valuesEnd;
    private _valuesStartRepeat;
    private _duration;
    private _initialRepeat;
    private _repeat;
    private _repeatDelayTime?;
    private _yoyo;
    private _isPlaying;
    private _reversed;
    private _delayTime;
    private _startTime;
    private _elapsedTime;
    private _timeScale;
    private _easingFunction;
    private _interpolationFunction;
    private _chainedTweens;
    private _onStartCallback?;
    private _onStartCallbackFired;
    private _onUpdateCallback?;
    private _onRepeatCallback?;
    private _onCompleteCallback?;
    private _onStopCallback?;
    private _id;
    private _isChainStopped;
    private _object;
    private _groupRef;
    private get _group();
    private set _group(value);
    /**
     * Creates an instance of tween.
     * @param object - The target object which properties you want to animate
     * @param group - The {@link Group} this new Tween will belong to. If none is provided it will default to the static {@link Group.shared}
     */
    constructor(object: Target, group?: Group);
    /**
     * Gets the id for this tween. A tween id is a number that increases perpetually with each tween created. It is used inside {@link Group} to keep track of tweens
     * @returns returns the id for this tween.
     */
    getId(): number;
    /**
     * Gets {@link Group} that this tween belongs to.
     * @returns returns the {@link Group} for this tween.
     */
    getGroup(): Group;
    /**
     * A tween is playing when it has been started but hasn't ended yet. This has nothing to do with pausing. For that see {@link Tween.isPaused}.
     * @returns returns true if this tween is playing.
     */
    isPlaying(): boolean;
    /**
     * A tween can only be paused if it was playing.
     * @returns returns true if this tween is paused.
     */
    isPaused(): boolean;
    /**
     * @experimental
     * Writes the starting values of the tween.
     *
     * **Starting values generated from {@link Tween.start} will be overwritten.**
     * @param properties - Starting values for this tween.
     * @returns returns this tween for daisy chaining methods.
     */
    from(properties: RecursivePartial<Target>): this;
    from(properties: any): this;
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
    to(properties: RecursivePartial<Target>, duration?: number): this;
    to(properties: any, duration?: number): this;
    /**
     * Set the final values for the target object's properties by reference.
     * This will store a reference to the properties object allowing you to change the final values while the tween is running.
     * If you want the tween to make a copy of the final values use {@link Tween.to}.
     * @param properties - final values for the target object.
     * @param duration - if given it will be used as the duration in **miliseconds**. if not, a call to {@link Tween.duration} will be needed.
     * @returns returns this tween for daisy chaining methods.
     */
    dynamicTo(properties: RecursivePartial<Target>, duration?: number): this;
    dynamicTo(properties: any, duration?: number): this;
    /**
     * Sets the duration for this tween in **miliseconds**.
     * @param d - The duration for this tween in **miliseconds**.
     * @returns returns this tween for daisy chaining methods.
     */
    duration(d: number): this;
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
    start(delay?: number): this;
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
    restart(delay?: number): this;
    /**
     * @experimental
     * Clears the starting and loop starting values.
     *
     * **Starting values will be cleared!. This function will erase all values created from {@link Tween.from} and/or {@link Tween.start}**
     * @returns returns this tween for daisy chaining methods.
     */
    reset(): this;
    private _setupProperties;
    /**
     * Stops this tween
     * @returns returns this tween for daisy chaining methods.
     */
    stop(): this;
    /**
     * Fastforwards this tween to the end by triggering an update with an infinite value.
     * This will work even on paused tweens.
     * @returns returns this tween for daisy chaining methods.
     */
    end(): this;
    /**
     * Pauses this tween. Does nothing is if the tween was already paused or wasn't playing.
     * Paused tweens ignore all update calls.
     * @returns returns this tween for daisy chaining methods.
     */
    pause(): this;
    /**
     * Resumes this tween. Does nothing if the tween wasn't paused nor running.
     * @returns returns this tween for daisy chaining methods.
     */
    resume(): this;
    /**
     * Stops tweens chained to this tween. To chain a tween see {@link Tween.chain}.
     * @returns returns this tween for daisy chaining methods.
     */
    stopChainedTweens(): this;
    /**
     * Sets the {@link Group} for this tween.
     * @param group - the group for this tween. If undefined or null is given, the group will default to {@link Group.shared}.
     * @returns returns this tween for daisy chaining methods.
     */
    group(group: Group): this;
    /**
     * Sets the delay for this tween.
     *
     * This will only be applied at the start of the tween. For delaying the repeating of a tween, see {@link Tween.repeatDelay}
     * @param amount - the delay for this tween.
     * @returns returns this tween for daisy chaining methods.
     */
    delay(amount: number): this;
    /**
     * @experimental
     * Sets the timescale for this tween.
     * The deltaTime inside the update will be multiplied by this value allowing to speed up or slow down the flow of time.
     * @param multiplier - the timescale value for this tween.
     * @returns returns this tween for daisy chaining methods.
     */
    timescale(multiplier: number): this;
    /**
     * Sets the number of times this tween will loop
     * @param times - the number of loops. For endless loops use `Infinity`
     * @returns returns this tween for daisy chaining methods.
     */
    repeat(times?: number): this;
    /**
     * Sets the repeat delay for this tween.
     *
     * This will only be applied at the start of every repeat. For delaying only the start, see {@link Tween.delay}
     * @param amount - the repeat delay for this tween.
     * @returns returns this tween for daisy chaining methods.
     */
    repeatDelay(amount: number): this;
    /**
     * Sets if this tween should yoyo (reflect) itself when repeating.
     * @param yoyo - the yoyo value for this tween.
     * @returns returns this tween for daisy chaining methods.
     */
    yoyo(yoyo?: boolean): this;
    /**
     * Sets the easing function to interpolate the starting values with the final values.
     *
     * You can use the functions inside the {@link Easing} object.
     * @param easingFunction - a function that takes a number between 0 and 1 and returns another number between 0 and 1
     * @returns returns this tween for daisy chaining methods.
     */
    easing(easingFunction: EasingFunction): this;
    /**
     * Sets the easing function to interpolate the starting values with the final values when the final value is an array of objects.
     * Use this to create bezier curves or interpolate colors.
     *
     * You can use the functions inside the {@link Interpolation} object.
     * @param interpolationFunction
     * @returns returns this tween for daisy chaining methods.
     */
    interpolation(interpolationFunction: InterpolationFunction): this;
    /**
     * Adds tweens to be called when this tween ends.
     * The tweens here will be called all at the same time.
     * @param tweens - tweens to be started when this tween ends
     * @returns returns this tween for daisy chaining methods.
     */
    chain(...tweens: Array<Tween<any>>): this;
    /**
     * Sets the onStart callback
     * @param callback - the function to call on start. It will recieve the target object as a parameter.
     * @returns returns this tween for daisy chaining methods.
     */
    onStart(callback: (object: Target) => void): this;
    /**
     * Sets the onStart callback
     * @param callback - the function to call on start. It will recieve the target object as a parameter and a number between 0 and 1 determining the progress of the tween.
     * @returns returns this tween for daisy chaining methods.
     */
    onUpdate(callback: (object: Target, elapsed: number) => void): this;
    /**
     * Sets the onRepeat callback
     * @param callback - the function to call on repeat. It will recieve the target object as a parameter.
     * @returns returns this tween for daisy chaining methods.
     */
    onRepeat(callback: (object: Target) => void): this;
    /**
     * Sets the onComplete callback
     * @param callback - the function to call on complete. It will recieve the target object as a parameter.
     * @returns returns this tween for daisy chaining methods.
     */
    onComplete(callback: (object: Target) => void): this;
    /**
     * Sets the onStop callback
     * @param callback - the function to call on stop. It will recieve the target object as a parameter.
     * @returns returns this tween for daisy chaining methods.
     */
    onStop(callback: (object: Target) => void): this;
    /**
     * Updates this tween
     * @param deltaTime - the amount of time that passed since last update in **miliseconds**
     * @returns returns true if the tween hasn't finished yet.
     */
    update(deltaTime: number): boolean;
    private _updateProperties;
    private _handleRelativeValue;
    private _swapEndStartRepeatValues;
    private _moveForwardStartRepeatValues;
}
/**
 * A recursive version of Typescript's Partial<> decorator.
 */
declare type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : RecursivePartial<T[P]>;
};
export default Tween;
