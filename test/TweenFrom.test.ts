import { Easing } from "../src/Easing";
// import { Group } from "../src/Group";
// import { Interpolation } from "../src/Interpolation";
import { Tween } from "../src/Tween";

test("Tween from changes the start value", () => {
	const o = { simpleFrom: 0, noFrom: 0, complexFrom: { yes: 0, no: 0 } };
	const t = new Tween(o)
		.to({ simpleFrom: 1, noFrom: 1, complexFrom: { yes: 1, no: 1 } }, 100)
		.from({ simpleFrom: 2, complexFrom: { yes: 2 } })
		.start()
		.easing(Easing.Linear.None);

	t.update(0);

	expect(o.simpleFrom).toBe(2);
	expect(o.noFrom).toBe(0);
	expect(o.complexFrom.yes).toBe(2);
	expect(o.complexFrom.no).toBe(0);

	t.update(50);

	expect(o.simpleFrom).toBe(1.5);
	expect(o.noFrom).toBe(0.5);
	expect(o.complexFrom.yes).toBe(1.5);
	expect(o.complexFrom.no).toBe(0.5);

	t.update(50);

	expect(o.simpleFrom).toBe(1);
	expect(o.noFrom).toBe(1);
	expect(o.complexFrom.yes).toBe(1);
	expect(o.complexFrom.no).toBe(1);
});

test("Tween from changes the start values even after Start() was called", () => {
	const o = { simpleFrom: 0, noFrom: 0, complexFrom: { yes: 0, no: 0 } };
	const t = new Tween(o)
		.to({ simpleFrom: 1, noFrom: 1, complexFrom: { yes: 1, no: 1 } }, 100)
		.start()
		.from({ simpleFrom: 2, complexFrom: { yes: 2 } })
		.easing(Easing.Linear.None);

	t.update(0);

	expect(o.simpleFrom).toBe(2);
	expect(o.noFrom).toBe(0);
	expect(o.complexFrom.yes).toBe(2);
	expect(o.complexFrom.no).toBe(0);

	t.update(50);

	expect(o.simpleFrom).toBe(1.5);
	expect(o.noFrom).toBe(0.5);
	expect(o.complexFrom.yes).toBe(1.5);
	expect(o.complexFrom.no).toBe(0.5);

	t.update(50);

	expect(o.simpleFrom).toBe(1);
	expect(o.noFrom).toBe(1);
	expect(o.complexFrom.yes).toBe(1);
	expect(o.complexFrom.no).toBe(1);
});

test("Tween from plays nice with repeat", () => {
	const o = { simpleFrom: 0, noFrom: 0, complexFrom: { yes: 0, no: 0 } };
	const t = new Tween(o)
		.to({ simpleFrom: 1, noFrom: 1, complexFrom: { yes: 1, no: 1 } }, 100)
		.start()
		.from({ simpleFrom: 2, complexFrom: { yes: 2 } })
		.repeat(1)
		.easing(Easing.Linear.None);

	t.update(0);

	expect(o.simpleFrom).toBe(2);
	expect(o.noFrom).toBe(0);
	expect(o.complexFrom.yes).toBe(2);
	expect(o.complexFrom.no).toBe(0);

	t.update(50);

	expect(o.simpleFrom).toBe(1.5);
	expect(o.noFrom).toBe(0.5);
	expect(o.complexFrom.yes).toBe(1.5);
	expect(o.complexFrom.no).toBe(0.5);

	t.update(50);

	expect(o.simpleFrom).toBe(1);
	expect(o.noFrom).toBe(1);
	expect(o.complexFrom.yes).toBe(1);
	expect(o.complexFrom.no).toBe(1);

	t.update(50);

	expect(o.simpleFrom).toBe(1.5);
	expect(o.noFrom).toBe(0.5);
	expect(o.complexFrom.yes).toBe(1.5);
	expect(o.complexFrom.no).toBe(0.5);

	t.update(50);

	expect(o.simpleFrom).toBe(1);
	expect(o.noFrom).toBe(1);
	expect(o.complexFrom.yes).toBe(1);
	expect(o.complexFrom.no).toBe(1);
});

test("Tween from plays nice with yoyo repeat", () => {
	const o = { simpleFrom: 0, noFrom: 0, complexFrom: { yes: 0, no: 0 } };
	const t = new Tween(o)
		.to({ simpleFrom: 1, noFrom: 1, complexFrom: { yes: 1, no: 1 } }, 100)
		.start()
		.from({ simpleFrom: 2, complexFrom: { yes: 2 } })
		.repeat(1)
		.yoyo()
		.easing(Easing.Linear.None);

	t.update(0);

	expect(o.simpleFrom).toBe(2);
	expect(o.noFrom).toBe(0);
	expect(o.complexFrom.yes).toBe(2);
	expect(o.complexFrom.no).toBe(0);

	t.update(50);

	expect(o.simpleFrom).toBe(1.5);
	expect(o.noFrom).toBe(0.5);
	expect(o.complexFrom.yes).toBe(1.5);
	expect(o.complexFrom.no).toBe(0.5);

	t.update(50);

	expect(o.simpleFrom).toBe(1);
	expect(o.noFrom).toBe(1);
	expect(o.complexFrom.yes).toBe(1);
	expect(o.complexFrom.no).toBe(1);

	t.update(50);

	expect(o.simpleFrom).toBe(1.5);
	expect(o.noFrom).toBe(0.5);
	expect(o.complexFrom.yes).toBe(1.5);
	expect(o.complexFrom.no).toBe(0.5);

	t.update(50);

	expect(o.simpleFrom).toBe(2);
	expect(o.noFrom).toBe(0);
	expect(o.complexFrom.yes).toBe(2);
	expect(o.complexFrom.no).toBe(0);
});
