import Easing from "../src/Easing";
import { Group } from "../src/Group";
import Interpolation from "../src/Interpolation";
import { Tween } from "../src/Tween";

test("Tween returns itself for chaining", () => {
	const g = new Group();
	const t = new Tween({}, g);

	expect(t.to({}, 0)).toBeInstanceOf(Tween);

	expect(t.start()).toBeInstanceOf(Tween);

	expect(t.stop()).toBeInstanceOf(Tween);

	expect(t.delay(666)).toBeInstanceOf(Tween);

	expect(t.easing((k) => k)).toBeInstanceOf(Tween);

	expect(t.interpolation((_, k) => k)).toBeInstanceOf(Tween);

	expect(t.chain()).toBeInstanceOf(Tween);

	expect(t.onStart(() => null)).toBeInstanceOf(Tween);

	expect(t.onStop(() => null)).toBeInstanceOf(Tween);

	expect(t.onUpdate(() => null)).toBeInstanceOf(Tween);

	expect(t.onComplete(() => null)).toBeInstanceOf(Tween);

	expect(t.duration(1)).toBeInstanceOf(Tween);

	expect(t.group(g)).toBeInstanceOf(Tween);
});

test("Tween existing number property", () => {
	const o = { a: 0 };
	const t = new Tween(o).to({ a: 1 }, 100).start().easing(Easing.Linear.None);

	expect(o.a).toBe(0);

	t.update(50);

	expect(o.a).toBe(0.5);

	t.update(50);

	expect(o.a).toBe(1);
});

test("Tween non-existing property", () => {
	const o: any = { a: 0 };
	const target: any = { b: 1 }; // if written inline, typescript gets angry
	const t = new Tween(o).to(target, 100).start();

	expect(o.a).toBe(0);
	expect(o.b).toBeUndefined();

	t.update(100);

	expect(o.a).toBe(0);
	expect(o.b).toBeUndefined();
});

test("Tween string property if Number() returns not NaN", () => {
	const o = { a: "0" };
	const t = new Tween(o).to({ a: "1" }, 100).start().easing(Easing.Linear.None);

	expect(o.a).toBe("0");

	t.update(50);

	expect(o.a).toBe("0.5");

	t.update(50);

	expect(o.a).toBe("1");
});

test("Don't tween string property if Number() is NaN", () => {
	const o = { a: "taco" };
	const t = new Tween(o).to({ a: 1 }, 100).start().easing(Easing.Linear.None);

	expect(o.a).toBe("taco");

	t.update(50);

	expect(o.a).toBe("taco");

	t.update(50);

	expect(o.a).toBe("taco");
});

test("Don't tween boolean properties", () => {
	const o = { a: false };
	const t = new Tween(o).to({ a: true }, 100).start().easing(Easing.Linear.None);

	expect(o.a).toBe(false);

	t.update(50);

	expect(o.a).toBe(false);

	t.update(50);

	expect(o.a).toBe(false);
});

test("Don't tween undefined properties", () => {
	const o: any = { a: undefined };
	const t = new Tween(o).to({ a: 1 }, 100).start().easing(Easing.Linear.None);

	expect(o.a).toBeUndefined();

	t.update(50);

	expect(o.a).toBeUndefined();

	t.update(50);

	expect(o.a).toBeUndefined();
});

test("Don't tween null properties", () => {
	const o: any = { a: null };
	const t = new Tween(o).to({ a: 1 }, 100).start().easing(Easing.Linear.None);

	expect(o.a).toBeNull();

	t.update(50);

	expect(o.a).toBeNull();

	t.update(50);

	expect(o.a).toBeNull();
});

test("Tween array properties", () => {
	const o = [0, 1000, 1000];
	const t = new Tween(o);

	t.to([1000, "-2000", "+2000"], 1000);
	t.start(0);

	t.update(250);
	expect(o[0]).toBe(250);
	expect(o[1]).toBe(500);
	expect(o[2]).toBe(1500);
	t.update(250);
	expect(o[0]).toBe(500);
	expect(o[1]).toBe(0);
	expect(o[2]).toBe(2000);
	t.update(250);
	expect(o[0]).toBe(750);
	expect(o[1]).toBe(-500);
	expect(o[2]).toBe(2500);
	t.update(250);
	expect(o[0]).toBe(1000);
	expect(o[1]).toBe(-1000);
	expect(o[2]).toBe(3000);
});

test("Tween with complex properties", () => {
	const o = { x: 0.0, y: 100, some: { value: 0.0, style: { opacity: 1.0 }, unused: 100 } };
	const g = new Group();
	const t = new Tween(o, g);

	t.to({ x: 1.0, y: 200, some: { value: 1.0, style: { opacity: 0.5 } } }, 1000);

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

	// make sure we didn't break any other prop
	expect(o.some.unused).toBe(100);
});

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

test("Tween with complex properties arrays", () => {
	const o = { a: [0, 1000, 1000] };
	const t = new Tween(o);

	t.to({ a: [1000, "-2000", "+2000"] }, 1000);
	t.start(0);

	t.update(250);
	expect(o.a[0]).toBe(250);
	expect(o.a[1]).toBe(500);
	expect(o.a[2]).toBe(1500);
	t.update(250);
	expect(o.a[0]).toBe(500);
	expect(o.a[1]).toBe(0);
	expect(o.a[2]).toBe(2000);
	t.update(250);
	expect(o.a[0]).toBe(750);
	expect(o.a[1]).toBe(-500);
	expect(o.a[2]).toBe(2500);
	t.update(250);
	expect(o.a[0]).toBe(1000);
	expect(o.a[1]).toBe(-1000);
	expect(o.a[2]).toBe(3000);
});

test("Tween to a dynamic object", () => {
	const rabbit = { x: 1000, y: 0 };
	const tr = new Tween(rabbit);
	tr.to({ y: 1000 }, 1000);
	tr.start(0);

	const fox = { x: 0, y: 0 };
	const tf = new Tween(fox);
	tf.dynamicTo(rabbit, 1000); // fox chase rabbit!
	tf.start(0);

	tr.update(200);
	tf.update(200);
	expect(rabbit.x).toBe(1000);
	expect(rabbit.y).toBe(200);
	expect(fox.x).toBe(200);
	expect(fox.y).toBe(40);
	tr.update(300);
	tf.update(300);
	expect(rabbit.x).toBe(1000);
	expect(rabbit.y).toBe(500);
	expect(fox.x).toBe(500);
	expect(fox.y).toBe(250);
	tr.update(300);
	tf.update(300);
	expect(rabbit.x).toBe(1000);
	expect(rabbit.y).toBe(800);
	expect(fox.x).toBe(800);
	expect(fox.y).toBe(640);
	tr.update(200);
	tf.update(200);
	expect(rabbit.x).toBe(1000);
	expect(rabbit.y).toBe(1000);
	expect(fox.x).toBe(1000);
	expect(fox.y).toBe(1000);
});

test("Tween to a circular object shouldn't throw", () => {
	const a = { b: {} };
	const b = { a: {} };
	a.b = b;
	b.a = a;
	expect(() => new Tween({}).to(a, 100).start()).not.toThrow();
});

test("Tween with string values (relatives and absolutes)", () => {
	const o = { plus: 1, minus: 1, absolute: 0 };
	const t = new Tween(o).to({ plus: "+1", minus: "-1", absolute: "1" }, 100).start().easing(Easing.Linear.None);

	expect(o.plus).toBe(1);
	expect(o.minus).toBe(1);
	expect(o.absolute).toBe(0);

	t.update(50);

	expect(o.plus).toBe(1.5);
	expect(o.minus).toBe(0.5);
	expect(o.absolute).toBe(0.5);

	t.update(50);

	expect(o.plus).toBe(2);
	expect(o.minus).toBe(0);
	expect(o.absolute).toBe(1);
});

test("Tween with yoyo repeat", () => {
	const o = { a: 0 };
	const t = new Tween(o).to({ a: 1 }, 100).start().repeat(1).yoyo(true).easing(Easing.Linear.None);

	expect(o.a).toBe(0);

	t.update(50);

	expect(o.a).toBe(0.5);

	t.update(50);

	expect(o.a).toBe(1);

	t.update(50);

	expect(o.a).toBe(0.5);

	t.update(50);

	expect(o.a).toBe(0);
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

test("Tween with array interpolation values", () => {
	const o = { a: 0 };
	const t = new Tween(o)
		.to({ a: [1, 3, 5, 7] }, 1000)
		.start()
		.repeat(1)
		.yoyo(true)
		.easing(Easing.Linear.None)
		.interpolation(Interpolation.Linear);

	expect(o.a).toBe(0);

	t.update(125);

	expect(o.a).toBe(0.5);

	t.update(125);

	expect(o.a).toBe(1);

	t.update(125);

	expect(o.a).toBe(2);

	t.update(125);

	expect(o.a).toBe(3);

	t.update(125);

	expect(o.a).toBe(4);

	t.update(125);

	expect(o.a).toBe(5);

	t.update(125);

	expect(o.a).toBe(6);

	t.update(125);

	expect(o.a).toBe(7);
});

test("Tween with really big delta time will loop arround correctly", () => {
	const o = { a: 0 };
	const g = new Group();
	new Tween(o, g).to({ a: 1 }, 100).repeat(10).start().easing(Easing.Linear.None);

	expect(o.a).toBe(0);

	g.update(50);

	expect(o.a).toBe(0.5);

	g.update(600);

	expect(o.a).toBe(0.5);

	g.update(400); // total 1050 but should have capped at 1000

	expect(o.a).toBe(1);
	expect(g.getAll()).toHaveLength(0);
});

test("Tween delay doesn't break the easing", () => {
	const o = { a: 0 };
	const t = new Tween(o).to({ a: 1 }, 100).start(100).easing(Easing.Linear.None);
	expect(o.a).toBe(0);

	t.update(50);

	expect(o.a).toBe(0);

	t.update(50);

	expect(o.a).toBe(0);

	t.update(50);

	expect(o.a).toBe(0.5);

	t.update(50);

	expect(o.a).toBe(1);
});

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

test("Tween.update can rewind", () => {
	const g = new Group();
	const o = { a: 0 };
	const t = new Tween(o, g).to({ a: 1 }, 100).start();

	expect(o.a).toBe(0);

	t.update(200);

	expect(o.a).toBe(1);

	t.update(-200);

	expect(o.a).toBe(0);
});
