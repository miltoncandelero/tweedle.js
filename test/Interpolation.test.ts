import { Interpolation } from "../src/Interpolation";

test("Geom interpolations with k=0 should return the first value", () => {
	expect(Interpolation.Geom.Bezier([1, 2, 3, 4, 5, 6, 7], 0)).toBe(1);
	expect(Interpolation.Geom.CatmullRom([1, 2, 3, 4, 5, 6, 7], 0)).toBe(1);
	expect(Interpolation.Geom.Linear([1, 2, 3, 4, 5, 6, 7], 0)).toBe(1);
	expect(Interpolation.Geom.QuadraticBezier([1, 2, 3, 4, 5, 6, 7], 0)).toBe(1);
	expect(Interpolation.Geom.CubicBezier([1, 2, 3, 4, 5, 6, 7], 0)).toBe(1);
});

test("Geom interpolations with k=1 should return the last value", () => {
	expect(Interpolation.Geom.Bezier([1, 2, 3, 4, 5, 6, 7], 1)).toBe(7);
	expect(Interpolation.Geom.CatmullRom([1, 2, 3, 4, 5, 6, 7], 1)).toBe(7);
	expect(Interpolation.Geom.Linear([1, 2, 3, 4, 5, 6, 7], 1)).toBe(7);
	expect(Interpolation.Geom.QuadraticBezier([1, 2, 3, 4, 5, 6, 7], 1)).toBe(7);
	expect(Interpolation.Geom.CubicBezier([1, 2, 3, 4, 5, 6, 7], 1)).toBe(7);
});

test("Specific bezier interpolations should return the same as the generic one", () => {
	for (let i = 0; i <= 100; i++) {
		const k = i / 100;
		// point, control, point
		expect(Interpolation.Geom.Bezier([1, 2, 3], k)).toBeCloseTo(Interpolation.Geom.QuadraticBezier([1, 2, 3], k));

		// point, control, control, point
		expect(Interpolation.Geom.Bezier([1, 2, 3, 4], k)).toBeCloseTo(Interpolation.Geom.CubicBezier([1, 2, 3, 4], k));
	}
});
