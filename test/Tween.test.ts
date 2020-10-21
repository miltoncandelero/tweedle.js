import TWEEN from "../src/Index";
import { Tween } from "../src/Tween";

test("Tween returns itself for chaining", () => {
	const t = new Tween({});

	// expect(t.to({}, 0)).toBeInstanceOf(Tween);

	expect(t.start()).toBeInstanceOf(Tween);

	expect(t.stop()).toBeInstanceOf(Tween);

	expect(t.delay(666)).toBeInstanceOf(Tween);

	expect(t.easing((k) => k)).toBeInstanceOf(Tween);

	expect(t.interpolation((v, k) => k)).toBeInstanceOf(Tween);

	expect(t.chain()).toBeInstanceOf(Tween);

	expect(t.onStart(() => null)).toBeInstanceOf(Tween);

	expect(t.onStop(() => null)).toBeInstanceOf(Tween);

	expect(t.onUpdate(() => null)).toBeInstanceOf(Tween);

	expect(t.onComplete(() => null)).toBeInstanceOf(Tween);

	expect(t.duration(1)).toBeInstanceOf(Tween);

	expect(t.group(TWEEN)).toBeInstanceOf(Tween);
});

test("Tween with complex properties", () => {
	const obj = { x: 0.0, y: 100, some: { value: 0.0, style: { opacity: 1.0 }, unused: 100 } };
	const t = new TWEEN.Tween(obj);

	t.to({ x: 1.0, y: 200, some: { value: 1.0, style: { opacity: 0.5 } } }, 1000);

	TWEEN.removeAll();

	expect(TWEEN.getAll()).toHaveLength(0);

	t.start(0);
	expect(TWEEN.getAll()).toHaveLength(1);

	expect(t.isPaused()).toBe(false);

	TWEEN.update(400);

	expect(obj.x).toBe(0.4);
	expect(obj.y).toBe(140);
	expect(obj.some.style.opacity).toBe(0.8);
	expect(obj.some.value).toBe(0.4);

	TWEEN.update(750);

	expect(obj.x).toBe(0.75);
	expect(obj.y).toBe(175);
	expect(obj.some.style.opacity).toBe(0.625);
	expect(obj.some.value).toBe(0.75);

	TWEEN.update(1000);

	expect(obj.x).toBe(1.0);
	expect(obj.y).toBe(200);
	expect(obj.some.style.opacity).toBe(0.5);
	expect(obj.some.value).toBe(1.0);

	// make sure we didn't break any other prop
	expect(obj.some.unused).toBe(100);
});
