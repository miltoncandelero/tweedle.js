import { Group } from "../src/Group";
import { Tween } from "../src/Tween";

test("Group.update uses deltaTime instead of absolute time", () => {
	// empty groups give empty array
	const g = new Group();
	expect(g.getElapsedTime()).toBe(0);
	g.update(16);
	expect(g.getElapsedTime()).toBe(16);
	g.update(16);
	expect(g.getElapsedTime()).toBe(32);
});

test("Group.update uses creates it's own deltatime if none provided", () => {
	// empty groups give empty array
	const g = new Group();
	expect(g.getElapsedTime()).toBe(0);
	g.update();
	expect(g.getElapsedTime()).toBe(0);

	// this is a bad test but I don't know how to make it better :(
	const retval = new Promise((resolve) => {
		setTimeout(() => {
			g.update();
			expect(g.getElapsedTime()).toBeGreaterThanOrEqual(1000);
			resolve();
		}, 1000);
	});
	return retval;
});

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

	expect(g.getElapsedTime()).toBe(1);

	expect(g.update(1)).toBe(true); // one passed
	expect(g.update(1)).toBe(false); // two passed, tween should start now, duration is zero so it ends immediately
});