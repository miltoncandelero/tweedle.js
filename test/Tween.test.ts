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

test("Tween.start adds the tween to its group", () => {
	// if tween isn't ruinning yet, group is still empty
	const g = new Group();
	const t = new Tween({}, g);
	t.start();
	expect(g.getAll()).toHaveLength(1);
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
