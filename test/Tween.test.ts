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

test("Tween with complex properties", () => {
	const obj = { x: 0.0, y: 100, some: { value: 0.0, style: { opacity: 1.0 }, unused: 100 } };
	const g = new Group();
	const t = new Tween(obj, g);

	t.to({ x: 1.0, y: 200, some: { value: 1.0, style: { opacity: 0.5 } } }, 1000);

	t.start();

	expect(t.isPaused()).toBe(false);

	g.update(400);

	expect(obj.x).toBe(0.4);
	expect(obj.y).toBe(140);
	expect(obj.some.style.opacity).toBe(0.8);
	expect(obj.some.value).toBe(0.4);

	g.update(350);

	expect(obj.x).toBe(0.75);
	expect(obj.y).toBe(175);
	expect(obj.some.style.opacity).toBe(0.625);
	expect(obj.some.value).toBe(0.75);

	g.update(250);

	expect(obj.x).toBe(1.0);
	expect(obj.y).toBe(200);
	expect(obj.some.style.opacity).toBe(0.5);
	expect(obj.some.value).toBe(1.0);

	// make sure we didn't break any other prop
	expect(obj.some.unused).toBe(100);
});
