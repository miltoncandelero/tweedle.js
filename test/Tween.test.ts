import Easing from "../src/Easing";
import { Group } from "../src/Group";
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

test("Tween existing property", () => {
	const o = { a: 0 };
	const t = new Tween(o).to({ a: 1 }, 100).start(0).easing(Easing.Linear.None);

	expect(o.a).toBe(0);

	t.update(50);

	expect(o.a).toBe(0.5);

	t.update(100);

	expect(o.a).toBe(1);
});

test("Tween non-existing property", () => {
	const o: any = { a: 0 };
	const target: any = { b: 1 }; // if written inline, typescript gets angry
	const t = new Tween(o).to(target, 100).start(0);

	expect(o.a).toBe(0);
	expect(o.b).toBeUndefined();

	t.update(100);

	expect(o.a).toBe(0);
	expect(o.b).toBeUndefined();
});

test("Tween string property if Number() returns not NaN", () => {
	const o = { a: "0" };
	const t = new Tween(o).to({ a: "1" }, 100).start(0).easing(Easing.Linear.None);

	expect(o.a).toBe("0");

	t.update(50);

	expect(o.a).toBe("0.5");

	t.update(100);

	expect(o.a).toBe("1");
});

test("Don't tween string property if Number() is NaN", () => {
	const o = { a: "taco" };
	const t = new Tween(o).to({ a: 1 }, 100).start(0).easing(Easing.Linear.None);

	expect(o.a).toBe("taco");

	t.update(50);

	expect(o.a).toBe("taco");

	t.update(100);

	expect(o.a).toBe("taco");
});

test("Don't tween boolean properties", () => {
	const o = { a: false };
	const t = new Tween(o).to({ a: true }, 100).start(0).easing(Easing.Linear.None);

	expect(o.a).toBe(false);

	t.update(50);

	expect(o.a).toBe(false);

	t.update(100);

	expect(o.a).toBe(false);
});

test("Don't tween undefined properties", () => {
	const o: any = { a: undefined };
	const t = new Tween(o).to({ a: 1 }, 100).start(0).easing(Easing.Linear.None);

	expect(o.a).toBeUndefined();

	t.update(50);

	expect(o.a).toBeUndefined();

	t.update(100);

	expect(o.a).toBeUndefined();
});

test("Don't tween null properties", () => {
	const o: any = { a: null };
	const t = new Tween(o).to({ a: 1 }, 100).start(0).easing(Easing.Linear.None);

	expect(o.a).toBeNull();

	t.update(50);

	expect(o.a).toBeNull();

	t.update(100);

	expect(o.a).toBeNull();
});

// to continue: relative tweens

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

	const t = new Tween({ a: 0 }, g).to({ a: 1 }, 300).start(0);

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
	const t = new Tween(o, g).to({ a: 1 }, 100).start(0);

	expect(o.a).toBe(0);

	t.update(200);

	expect(o.a).toBe(1);

	t.update(0);

	expect(o.a).toBe(0);
});

test("Tween with complex properties", () => {
	const obj = { x: 0.0, y: 100, some: { value: 0.0, style: { opacity: 1.0 }, unused: 100 } };
	const g = new Group();
	const t = new Tween(obj, g);

	t.to({ x: 1.0, y: 200, some: { value: 1.0, style: { opacity: 0.5 } } }, 1000);

	t.start(0);

	expect(t.isPaused()).toBe(false);

	g.update(400);

	expect(obj.x).toBe(0.4);
	expect(obj.y).toBe(140);
	expect(obj.some.style.opacity).toBe(0.8);
	expect(obj.some.value).toBe(0.4);

	g.update(750);

	expect(obj.x).toBe(0.75);
	expect(obj.y).toBe(175);
	expect(obj.some.style.opacity).toBe(0.625);
	expect(obj.some.value).toBe(0.75);

	g.update(1000);

	expect(obj.x).toBe(1.0);
	expect(obj.y).toBe(200);
	expect(obj.some.style.opacity).toBe(0.5);
	expect(obj.some.value).toBe(1.0);

	// make sure we didn't break any other prop
	expect(obj.some.unused).toBe(100);
});
