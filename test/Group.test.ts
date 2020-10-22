import { Group } from "../src/Group";
import { Tween } from "../src/Tween";

test("Group.getAll returns an array", () => {
	// empty groups give empty array
	const g = new Group();
	expect(g.getAll()).toBeInstanceOf(Array);
	expect(g.getAll()).toHaveLength(0);
});

test("Group.getAll only gives running tweens", () => {
	const g = new Group();

	new Tween({}, g);
	new Tween({}, g).start().stop();
	new Tween({ a: 0 }, g).to({ a: 1 }, 100).start(0);

	g.update(200);

	expect(g.getAll()).toBeInstanceOf(Array);
	expect(g.getAll()).toHaveLength(0);
});
