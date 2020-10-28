import type { Tween } from "./Tween";
/**
 * A group is a class that allows you to manage many tweens from one place.
 *
 * A tween will ALWAYS belong to a group. If no group is assigned it will default to the static shared group: `Group.shared`.
 */
export declare class Group {
    private _tweens;
    private _tweensAddedDuringUpdate;
    private static _shared;
    /**
     * A tween without an explicit group will default to this shared static one.
     */
    static get shared(): Group;
    private _lastUpdateTime;
    /**
     * Function used by the group to know what time is it.
     * Used to calculate the deltaTime in case you call update without the parameter.
     */
    now: () => number;
    /**
     * Returns all the tweens in this group.
     *
     * _note: only **running** tweens are in a group._
     * @returns all the running tweens.
     */
    getAll(): Array<Tween<any>>;
    /**
     * Removes all the tweens in this group.
     *
     * _note: this will not modify the group reference inside the tween object_
     */
    removeAll(): void;
    /**
     * Adds a tween to this group.
     *
     * _note: this will not modify the group reference inside the tween object_
     * @param tween Tween to add.
     */
    add(tween: Tween<any>): void;
    /**
     * Removes a tween from this group.
     *
     * _note: this will not modify the group reference inside the tween object_
     * @param tween
     */
    remove(tween: Tween<any>): void;
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
     * @returns returns true if the group is not empty.
     */
    update(deltaTime?: number, preserve?: boolean): boolean;
}
