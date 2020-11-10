import { NOW } from "./Now";
import type { Tween } from "./Tween";

/**
 * A group is a class that allows you to manage many tweens from one place.
 *
 * A tween will ALWAYS belong to a group. If no group is assigned it will default to the static shared group: `Group.shared`.
 */
export class Group {
	private _tweens: {
		[key: string]: Tween<any>;
	} = {};

	private _tweensAddedDuringUpdate: {
		[key: string]: Tween<any>;
	} = {};

	private static _shared: Group;

	/**
	 * A tween without an explicit group will default to this shared static one.
	 */
	public static get shared(): Group {
		if (!Group._shared) {
			Group._shared = new Group();
		}
		return Group._shared;
	}

	private _paused: boolean = false;

	/**
	 * A paused group will skip updating all the asociated tweens.
	 * _To control all tweens, use {@link Group.getAll} to get an array with all tweens._
	 * @returns returns true if this group is paused.
	 */
	public isPaused(): boolean {
		return this._paused;
	}

	/**
	 * Pauses this group. If a group was already paused, this has no effect.
	 * A paused group will skip updating all the asociated tweens.
	 * _To control all tweens, use {@link Group.getAll} to get an array with all tweens._
	 */
	public pause(): void {
		this._paused = true;
	}

	/**
	 * Resumes this group. If a group was not paused, this has no effect.
	 * A paused group will skip updating all the asociated tweens.
	 * _To control all tweens, use {@link Group.getAll} to get an array with all tweens._
	 */
	public resume(): void {
		this._paused = false;
	}

	private _lastUpdateTime: number = undefined;

	/**
	 * Function used by the group to know what time is it.
	 * Used to calculate the deltaTime in case you call update without the parameter.
	 */
	public now: () => number = NOW; // used to calculate deltatime in case you stop providing one

	/**
	 * Returns all the tweens in this group.
	 *
	 * _note: only **running** tweens are in a group._
	 * @returns all the running tweens.
	 */
	public getAll(): Array<Tween<any>> {
		return Object.keys(this._tweens).map((tweenId) => this._tweens[tweenId]);
	}

	/**
	 * Removes all the tweens in this group.
	 *
	 * _note: this will not modify the group reference inside the tween object_
	 */
	public removeAll(): void {
		this._tweens = {};
	}

	/**
	 * Adds a tween to this group.
	 *
	 * _note: this will not modify the group reference inside the tween object_
	 * @param tween Tween to add.
	 */
	public add(tween: Tween<any>): void {
		this._tweens[tween.getId()] = tween;
		this._tweensAddedDuringUpdate[tween.getId()] = tween;
	}

	/**
	 * Removes a tween from this group.
	 *
	 * _note: this will not modify the group reference inside the tween object_
	 * @param tween
	 */
	public remove(tween: Tween<any>): void {
		delete this._tweens[tween.getId()];
		delete this._tweensAddedDuringUpdate[tween.getId()];
	}

	/**
	 * Updates all the tweens in this group.
	 *
	 * If a tween is stopped, paused, finished or non started it will be removed from the group.
	 *
	 *  Tweens are updated in "batches". If you add a new tween during an
	 *  update, then the new tween will be updated in the next batch.
	 *  If you remove a tween during an update, it may or may not be updated.
	 *  However, if the removed tween was added during the current batch,
	 *  then it will not be updated.
	 * @param deltaTime - Amount of **miliseconds** that have passed since last excecution. If not provided it will be calculated using the {@link Group.now} function
	 * @param preserve - Prevent the removal of stopped, paused, finished or non started tweens.
	 * @returns returns true if the group is not empty and it is not paused.
	 */
	public update(deltaTime?: number, preserve: boolean = false): boolean {
		// move forward the automatic dt if needed
		if (deltaTime == undefined) {
			// now varies from line to line, that's why I manually use 0 as dt
			if (this._lastUpdateTime == undefined) {
				this._lastUpdateTime = this.now();
				deltaTime = 0;
			} else {
				deltaTime = this.now() - this._lastUpdateTime;
			}
		}
		this._lastUpdateTime = this.now();

		// exit early if the entire group is paused
		if (this._paused) {
			return false;
		}

		let tweenIds = Object.keys(this._tweens);
		if (tweenIds.length == 0) {
			return false;
		}

		// Tweens are updated in "batches". If you add a new tween during an
		// update, then the new tween will be updated in the next batch.
		// If you remove a tween during an update, it may or may not be updated.
		// However, if the removed tween was added during the current batch,
		// then it will not be updated.
		while (tweenIds.length > 0) {
			this._tweensAddedDuringUpdate = {};

			for (let i = 0; i < tweenIds.length; i++) {
				const tween = this._tweens[tweenIds[i]];

				// groups call the preserve with true because they like to delete themselves in a different way.
				if (tween && tween.update(deltaTime, true) == false && !preserve) {
					delete this._tweens[tweenIds[i]];
				}
			}

			tweenIds = Object.keys(this._tweensAddedDuringUpdate);
		}

		return true;
	}
}
