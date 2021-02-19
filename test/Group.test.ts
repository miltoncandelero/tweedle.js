import { Group } from "../src/Group";
import { Tween } from "../src/Tween";

test("Group.getAll returns an array", () => {
	// empty groups give empty array
	const g = new Group();
	expect(g.getAll()).toBeInstanceOf(Array);
	expect(g.getAll()).toHaveLength(0);
	const t = new Tween({}, g).start();
	expect(g.getAll()).toBeInstanceOf(Array);
	expect(g.getAll()).toHaveLength(1);
	expect(g.getAll()).toContain(t);
});

test("Group.update removes finished tweens", () => {
	const g = new Group();

	const t = new Tween({ a: 0 }, g).to({ a: 1 }, 100).start();

	expect(g.getAll()).toBeInstanceOf(Array);
	expect(g.getAll()).toHaveLength(1);
	expect(g.getAll()).toContain(t);

	g.update(200);

	expect(g.getAll()).toBeInstanceOf(Array);
	expect(g.getAll()).toHaveLength(0);
});

test("Group.update doesn't remove finished tweens if the preserve flag is used", () => {
	const g = new Group();

	const t = new Tween({ a: 0 }, g).to({ a: 1 }, 100).start(0);

	expect(g.getAll()).toBeInstanceOf(Array);
	expect(g.getAll()).toHaveLength(1);
	expect(g.getAll()).toContain(t);

	g.update(200, true);

	expect(g.getAll()).toBeInstanceOf(Array);
	expect(g.getAll()).toHaveLength(1);
	expect(g.getAll()).toContain(t);
});

test("Group.update can rewind tweens if the preserve flag is used", () => {
	const g = new Group();
	const o = { a: 0 };
	new Tween(o, g).to({ a: 1 }, 100).start(0);

	expect(o.a).toBe(0);

	g.update(200, true);

	expect(o.a).toBe(1);

	g.update(-200, true);

	expect(o.a).toBe(0);
});

test("Group.add & Group.remove", () => {
	const g = new Group();

	const t1 = new Tween({}, g);

	g.add(t1);

	expect(g.getAll()).toBeInstanceOf(Array);
	expect(g.getAll()).toHaveLength(1);
	expect(g.getAll()).toContain(t1);

	const t2 = new Tween({}, g);
	g.add(t2);
	expect(g.getAll()).toBeInstanceOf(Array);
	expect(g.getAll()).toHaveLength(2);
	expect(g.getAll()).toContain(t2);

	g.remove(t1);
	expect(g.getAll()).toBeInstanceOf(Array);
	expect(g.getAll()).toHaveLength(1);
	expect(g.getAll()).not.toContain(t1);
	expect(g.getAll()).toContain(t2);

	g.remove(t2);
	expect(g.getAll()).toBeInstanceOf(Array);
	expect(g.getAll()).toHaveLength(0);
	expect(g.getAll()).not.toContain(t2);
});

test("Group.update() returns true while tweens are running and false when done", () => {
	const g = new Group();

	expect(g.update(1)).toBe(false);

	new Tween({}, g).start(2); // will start in 2

	expect(g.update(1)).toBe(true); // one passed
	expect(g.update(1)).toBe(true); // two passed, tween should start now, duration is zero so it ends immediately however, it updated so it says true.
	expect(g.update(1)).toBe(false); // now there are no longer any tweens running
});

test("Tween with no group will use Group.shared", () => {
	const t = new Tween({});
	expect(t.getGroup()).toBe(Group.shared);
});

test("Tween.start adds the tween to its group", () => {
	const g = new Group();
	const t = new Tween({}, g);
	t.start();
	expect(g.getAll()).toHaveLength(1);
});

test("Tween.update removes itself from its Group when complete", () => {
	const g = new Group();

	const t = new Tween({ a: 0 }, g).to({ a: 1 }, 300).start();

	expect(g.getAll()).toBeInstanceOf(Array);
	expect(g.getAll()).toHaveLength(1);
	expect(g.getAll()).toContain(t);

	t.update(400);

	expect(g.getAll()).toBeInstanceOf(Array);
	expect(g.getAll()).toHaveLength(0);
});
