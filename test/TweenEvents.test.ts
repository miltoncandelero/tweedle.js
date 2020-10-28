import { Group } from "../src/Group";
import { Tween } from "../src/Tween";

test("Tween calls onComplete when finishes", () => {
	const g = new Group();
	const fn = jest.fn();
	new Tween({ a: 0 }, g).to({ a: 1 }, 100).start().onComplete(fn);

	g.update(50);

	expect(fn).not.toHaveBeenCalled(); // not yet

	g.update(50);

	expect(fn).toHaveBeenCalled(); // now!
});

test("Tween calls onUpdate when update is called", () => {
	const g = new Group();
	const fn = jest.fn();
	new Tween({ a: 0 }, g).to({ a: 1 }, 100).start().onUpdate(fn);

	g.update(50);

	expect(fn).toHaveBeenCalledTimes(1);

	g.update(50);

	expect(fn).toHaveBeenCalledTimes(2);
});

test("Tween calls onRepeat every times it repeats", () => {
	const g = new Group();
	const fn = jest.fn();
	new Tween({ a: 0 }, g).to({ a: 1 }, 100).repeat(3).start().onRepeat(fn);

	g.update(50);

	expect(fn).not.toHaveBeenCalled(); // not yet

	g.update(50);

	expect(fn).toHaveBeenCalledTimes(1);

	g.update(100);
	expect(fn).toHaveBeenCalledTimes(2);

	g.update(100);
	expect(fn).toHaveBeenCalledTimes(3);

	g.update(100);
	expect(fn).toHaveBeenCalledTimes(3);
});

test("Tween calls onStop only when manually stopped", () => {
	const g = new Group();
	const fn1 = jest.fn();
	new Tween({ a: 0 }, g).to({ a: 1 }, 100).start().onStop(fn1);

	g.update(50);

	expect(fn1).not.toHaveBeenCalled(); // not yet

	g.update(50);

	expect(fn1).not.toHaveBeenCalled(); // not yet

	g.update(100);
	expect(fn1).not.toHaveBeenCalled(); // not yet

	const fn2 = jest.fn();
	const t = new Tween({ a: 0 }, g).to({ a: 1 }, 100).start().onStop(fn2);
	t.stop();
	expect(fn2).toHaveBeenCalled(); // now!
});

test("Tween calls onStart when the first update is called", () => {
	const g = new Group();

	const fn1 = jest.fn();
	new Tween({ a: 0 }, g).to({ a: 1 }, 100).start().onStart(fn1);
	expect(fn1).not.toHaveBeenCalled(); // not yet
	g.update(1);
	expect(fn1).toHaveBeenCalled(); // now!
	g.update(1);
	expect(fn1).toHaveBeenCalledTimes(1); // but only once tho
});
