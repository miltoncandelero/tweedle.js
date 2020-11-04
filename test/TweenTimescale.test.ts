import { Easing } from "../src/Easing";
// import { Group } from "../src/Group";
// import { Interpolation } from "../src/Interpolation";
import { Tween } from "../src/Tween";
test("Tween positive timescale", () => {
	const fast = { a: 0 };
	const t1 = new Tween(fast).to({ a: 1 }, 200).timescale(2).start().easing(Easing.Linear.None);

	const slow = { a: 0 };
	const t2 = new Tween(slow).to({ a: 1 }, 200).timescale(0.5).start().easing(Easing.Linear.None);

	expect(fast.a).toBe(0);
	expect(slow.a).toBe(0);

	t1.update(50);
	t2.update(50);

	expect(fast.a).toBe(0.5);
	expect(slow.a).toBe(0.125);

	t1.update(50);
	t2.update(50);

	expect(fast.a).toBe(1);
	expect(slow.a).toBe(0.25);
});

test("Tween negative timescale", () => {
	const fast = { a: 0 };
	const t1 = new Tween(fast).to({ a: 1 }, 200).start().easing(Easing.Linear.None);

	const slow = { a: 0 };
	const t2 = new Tween(slow).to({ a: 1 }, 200).start().easing(Easing.Linear.None);

	expect(fast.a).toBe(0);
	expect(slow.a).toBe(0);

	t1.update(50);
	t2.update(50);

	expect(fast.a).toBe(0.25);
	expect(slow.a).toBe(0.25);

	t1.timescale(-1);
	t2.timescale(-0.5);

	t1.update(50);
	t2.update(50);

	expect(fast.a).toBe(0);
	expect(slow.a).toBe(0.125);
});
