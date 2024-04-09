// TODO: Remove preserve from groups
// TODO: Allow groups to have groups
// TODO: Add preserve so a group can preserve itself
// TODO: Add destroy method
// TODO: Add IsDestroyed and OnDestroy
import type { IUpdateable } from "./IUpdateable";
import { NOW } from "./Now";
import { Sequence } from "./Sequence";

/**
 * A group is a class that allows you to manage unknown updateables from one place.
 *
 * An updateable will ALWAYS belong to a group. If no group is assigned it will default to the static shared group: `Group.shared`.
 */
export class Group implements IUpdateable {
	private _updateables: {
		[key: string]: IUpdateable;
	} = {};

	private static _shared: Group;

	/**
	 * An updateable without an explicit group will default to this shared static one.
	 */
	public static get shared(): Group {
		if (!Group._shared) {
			Group._shared = new Group();
		}
		return Group._shared;
	}
	private _id = Sequence.nextId();

	public getId(): number {
		return this._id;
	}

	private _paused: boolean = false;

	/**
	 * A paused group will skip updating all the asociated updateables.
	 * _To control all updateables, use {@link Group.getAll} to get an array with all updateables._
	 * @returns returns true if this group is paused.
	 */
	public isPaused(): boolean {
		return this._paused;
	}

	/**
	 * Pauses this group. If a group was already paused, this has no effect.
	 * A paused group will skip updating all the asociated updateables.
	 * _To control all updateables, use {@link Group.getAll} to get an array with all updateables._
	 */
	public pause(): void {
		this._paused = true;
	}

	/**
	 * Resumes this group. If a group was not paused, this has no effect.
	 * A paused group will skip updating all the asociated updateables.
	 * _To control all updateables, use {@link Group.getAll} to get an array with all updateables._
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
	 * Returns all the updateables in this group.
	 *
	 * _note: only **running** updateables are in a group._
	 * @returns all the running updateables.
	 */
	public getAll(): Array<IUpdateable> {
		return Object.values(this._updateables);
	}

	/**
	 * Removes all the updateables in this group.
	 *
	 * _note: this will not modify the group reference inside the updateable object_
	 */
	public removeAll(): void {
		this._updateables = {};
	}

	/**
	 * Adds an updateable to this group.
	 *
	 * _note: this will not modify the group reference inside the updateable object_
	 * @param updateable updateable to add.
	 */
	public add(updateable: IUpdateable): void {
		this._updateables[updateable.getId()] = updateable;
	}

	/**
	 * Removes an updateable from this group.
	 *
	 * _note: this will not modify the group reference inside the updateable object_
	 * @param updateable
	 */
	public remove(updateable: IUpdateable): void {
		delete this._updateables[updateable.getId()];
	}

	/**
	 * Updates all the updateables in this group.
	 *
	 * If an updateable is stopped, paused, finished or non started it will be removed from the group.
	 *
	 *  updateables are updated in "batches". If you add a new updateable during an
	 *  update, then the new updateable will be updated in the next batch.
	 *  If you remove an updateable during an update, it may or may not be updated.
	 *  However, if the removed updateable was added during the current batch,
	 *  then it will not be updated.
	 * @param deltaTime - Amount of **miliseconds** that have passed since last excecution. If not provided it will be calculated using the {@link Group.now} function
	 * @param preserve - Prevent the removal of stopped, paused, finished or non started updateables.
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

		let retval = false;

		for (const key in this._updateables) {
			this._updateables[key].update(deltaTime, preserve);
			retval = true;
		}

		return retval;
	}
}
