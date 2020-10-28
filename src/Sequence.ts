/**
 * Utils
 */
export class Sequence {
	private static _nextId = 0;

	public static nextId(): number {
		return Sequence._nextId++;
	}
}
