import { Easing } from "../src/Easing";
import { Group } from "../src/Group";
import { Tween } from "../src/Tween";

test("Tween with complex properties with yoyo repeat", () => {
	const o = { x: 0.0, y: 100, some: { value: 0.0, style: { opacity: 1.0 }, unused: 100 } };
	const g = new Group();
	const t = new Tween(o, g);
	const fn = jest.fn();

	t.to({ x: 1.0, y: 200, some: { value: 1.0, style: { opacity: 0.5 } } }, 1000)
		.yoyo(true)
		.repeat(1)
		.onUpdate(fn);

	t.start();

	expect(t.isPaused()).toBe(false);

	g.update(400);

	expect(o.x).toBe(0.4);
	expect(o.y).toBe(140);
	expect(o.some.style.opacity).toBe(0.8);
	expect(o.some.value).toBe(0.4);

	g.update(350);

	expect(o.x).toBe(0.75);
	expect(o.y).toBe(175);
	expect(o.some.style.opacity).toBe(0.625);
	expect(o.some.value).toBe(0.75);

	g.update(250);

	expect(o.x).toBe(1.0);
	expect(o.y).toBe(200);
	expect(o.some.style.opacity).toBe(0.5);
	expect(o.some.value).toBe(1.0);

	g.update(500);
	expect(fn).toHaveBeenCalledTimes(4);

	expect(o.x).toBe(0.5);
	expect(o.y).toBe(150);
	expect(o.some.style.opacity).toBe(0.75);
	expect(o.some.value).toBe(0.5);

	// make sure we didn't break any other prop
	expect(o.some.unused).toBe(100);
});

test("Tween with complex properties with regular repeat", () => {
	const o = { x: 0.0, y: 100, some: { value: 0.0, style: { opacity: 1.0 }, unused: 100 } };
	const g = new Group();
	const t = new Tween(o, g);

	t.to({ x: 1.0, y: 200, some: { value: 1.0, style: { opacity: 0.5 } } }, 1000).repeat(1);

	t.start();

	expect(t.isPaused()).toBe(false);

	g.update(400);

	expect(o.x).toBe(0.4);
	expect(o.y).toBe(140);
	expect(o.some.style.opacity).toBe(0.8);
	expect(o.some.value).toBe(0.4);

	g.update(350);

	expect(o.x).toBe(0.75);
	expect(o.y).toBe(175);
	expect(o.some.style.opacity).toBe(0.625);
	expect(o.some.value).toBe(0.75);

	g.update(250);

	expect(o.x).toBe(1.0);
	expect(o.y).toBe(200);
	expect(o.some.style.opacity).toBe(0.5);
	expect(o.some.value).toBe(1.0);

	g.update(500);

	expect(o.x).toBe(0.5);
	expect(o.y).toBe(150);
	expect(o.some.style.opacity).toBe(0.75);
	expect(o.some.value).toBe(0.5);

	// make sure we didn't break any other prop
	expect(o.some.unused).toBe(100);
});

test("Tween with yoyo repeat", () => {
	const o = { a: 0 };
	const t = new Tween(o).to({ a: 1 }, 100).start().repeat(1).yoyo(true).easing(Easing.Linear.None);

	expect(o.a).toBe(0);

	t.update(25);

	expect(o.a).toBe(0.25);

	t.update(75);

	expect(o.a).toBe(1);

	t.update(25);

	expect(o.a).toBe(0.75);

	t.update(75);

	expect(o.a).toBe(0);
});

test("Skipping Tweens with yoyo repeat", () => {
	const o = { a: 0 };
	const t = new Tween(o).to({ a: 1 }, 100).start().repeat(2).yoyo(true).easing(Easing.Linear.None);

	expect(o.a).toBe(0);

	t.update(25);

	expect(o.a).toBe(0.25);

	t.update(75);

	expect(o.a).toBe(1);

	t.skip(1);

	t.update(25);

	expect(o.a).toBe(0.25);

	t.update(75);

	expect(o.a).toBe(1);
});

test("Tween with relative + yoyo repeat", () => {
	const o = { plus: 1, minus: 1 };
	const t = new Tween(o).to({ plus: "+1", minus: "-1" }, 100).start().repeat(1).yoyo(true).easing(Easing.Linear.None);

	expect(o.plus).toBe(1);
	expect(o.minus).toBe(1);

	t.update(50);

	expect(o.plus).toBe(1.5);
	expect(o.minus).toBe(0.5);

	t.update(50);

	expect(o.plus).toBe(2);
	expect(o.minus).toBe(0);

	t.update(50);

	expect(o.plus).toBe(1.5);
	expect(o.minus).toBe(0.5);

	t.update(50);

	expect(o.plus).toBe(1);
	expect(o.minus).toBe(1);
});

test("Tween with relative + regular repeat", () => {
	const o = { plus: 1, minus: 1 };
	const t = new Tween(o).to({ plus: "+1", minus: "-1" }, 100).start().repeat(1).easing(Easing.Linear.None);

	expect(o.plus).toBe(1);
	expect(o.minus).toBe(1);

	t.update(50);

	expect(o.plus).toBe(1.5);
	expect(o.minus).toBe(0.5);

	t.update(50);

	expect(o.plus).toBe(2);
	expect(o.minus).toBe(0);

	t.update(50);

	expect(o.plus).toBe(2.5);
	expect(o.minus).toBe(-0.5);

	t.update(50);

	expect(o.plus).toBe(3);
	expect(o.minus).toBe(-1);
});

test("Tween with really big delta time will loop arround correctly", () => {
	const o = { a: 0 };
	const g = new Group();
	const fn = jest.fn();
	new Tween(o, g).to({ a: 1 }, 100).repeat(10).start().easing(Easing.Linear.None).onComplete(fn);

	expect(o.a).toBe(0);

	g.update(50);

	expect(o.a).toBe(0.5);

	g.update(600);

	expect(o.a).toBe(0.5);

	expect(fn).not.toHaveBeenCalled(); // not yet

	g.update(500); // total 1150 but should have capped at 1100

	expect(o.a).toBe(1);

	expect(fn).toHaveBeenCalled(); // now!

	expect(g.getAll()).toHaveLength(0);
});

test("Tween.end in a neverending repeat shouldn't endless loop", () => {
	const o = { a: 0 };
	const g = new Group();
	const t = new Tween(o, g).to({ a: 1 }, 100).repeat(Infinity).start().easing(Easing.Linear.None);
	t.end();

	// Silly test but I am not sure how to test for infinite loops
	expect(1).toBe(1);
});

test("Tween.end in a repeating tween should call all the onRepeat", () => {
	const o = { a: 0 };
	const g = new Group();
	const complete = jest.fn();
	const repeat = jest.fn();
	const t = new Tween(o, g).to({ a: 1 }, 100).repeat(10).start().onComplete(complete).onRepeat(repeat);
	t.end();

	expect(complete).toHaveBeenCalledTimes(1);
	expect(repeat).toHaveBeenCalledTimes(10);
});

test("Tween with interpolated properties with regular repeat", () => {
	const o = { x: 0.0 };
	const g = new Group();
	const t = new Tween(o, g);

	t.to({ x: [1, 2, 3] }, 1000).repeat(2);

	t.start();

	expect(t.isPaused()).toBe(false);

	g.update(500);

	expect(o.x).toBe(1.5);

	g.update(500);

	expect(o.x).toBe(3);

	g.update(500);

	expect(o.x).toBe(2.5);

	g.update(500);

	expect(o.x).toBe(3);

	g.update(500);

	expect(o.x).toBe(1.5);

	g.update(500);

	expect(o.x).toBe(3);

	g.update(500);

	expect(o.x).toBe(3);
});
