import { Spring } from "../src/Spring";

test("Tween existing number property", () => {
	const o = { a: 0 };
	const t = new Spring(o).to({ a: 500 }, 100).awake();

	expect(o.a).toBe(0);

	t.update(100);

	expect(o.a).toBe(500);
});
