/**
 * Silly class to have a shared number that goes up.
 */
export class Sequence {
	private static _nextId = 0;

	public static nextId(): number {
		return Sequence._nextId++;
	}
}
