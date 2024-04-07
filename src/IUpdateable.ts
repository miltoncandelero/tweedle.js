/**
 * Interface for objects that can be updated.
 * (Tween and Spring and Group)
 */
export interface IUpdateable {
	/**
	 * Updates this object.
	 * @param deltaTime the time passed since the last update.
	 * @param preserve prevent the removal of stopped, paused, finished or non started updateables from their group.
	 * @returns true if this object was updated.
	 */
	update(deltaTime: number, preserve: boolean): boolean;

	/**
	 * Returns the id of this object.
	 * @returns the id of this object.
	 */
	getId(): number;
}
