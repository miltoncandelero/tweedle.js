/**
 * An function that takes creates a value by interpolating the elements of the array given.
 */
export type InterpolationFunction = (v: number[], k: number) => number;

/**
 * Object containing common interpolation functions.
 * These functions can be passed in the {@link Tween.interpolation} argument and **will only affect fields where you gave an array as target value**
 */
export const Interpolation = {
	/**
	 * Geometric interpolation functions. Good for interpolating positions in space.
	 */
	Geom: {
		/**
		 * Linear interpolation is like drawing straight lines between the points.
		 */
		Linear(v: number[], k: number): number {
			const m = v.length - 1;
			const f = m * k;
			const i = Math.floor(f);
			const fn = Interpolation.Utils.Linear;

			if (k < 0) {
				return fn(v[0], v[1], f);
			}

			if (k > 1) {
				return fn(v[m], v[m - 1], m - f);
			}

			return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
		},

		/**
		 * A Bézier curve is defined by a set of control points P0 through Pn, where n is called its order.
		 * The first and last control points are always the end points of the curve; however, the intermediate control points (if any) generally do not lie on the curve.
		 *
		 * https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Explicit_definition
		 */
		Bezier(v: number[], k: number): number {
			let b = 0;
			const n = v.length - 1;
			const pw = Math.pow;
			const bn = Interpolation.Utils.Bernstein;

			for (let i = 0; i <= n; i++) {
				b += bn(n, i) * pw(1 - k, n - i) * pw(k, i) * v[i];
			}

			return b;
		},

		/**
		 * A Catmullrom spline is a curve where the original set of points is also used as control points.
		 * Usually Catmullrom splines need two extra elements at the beginning and the end of the point set. This function contemplates that and doesn't need them.
		 *
		 * https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull%E2%80%93Rom_spline
		 */
		CatmullRom(v: number[], k: number): number {
			const m = v.length - 1;
			let f = m * k;
			let i = Math.floor(f);
			const fn = Interpolation.Utils.CatmullRom;

			if (v[0] == v[m]) {
				if (k < 0) {
					i = Math.floor((f = m * (1 + k)));
				}

				return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
			}
			if (k < 0) {
				return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
			}

			if (k > 1) {
				return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
			}

			return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
		},
	},
	/**
	 * Given the spinny nature of angles, sometimes it's better to go back to get to the right place earlier.
	 * This functions help with that.
	 */
	Angle: {
		/**
		 * Normalizes angles between 0 and 2pi and then rotates the object in the shortest direction.
		 */
		Radians(v: number[], k: number): number {
			const m = v.length - 1;
			const f = m * k;
			const i = Math.floor(f);
			const fn = Interpolation.Utils.WrapLinear;

			if (k < 0) {
				return fn(v[0], v[1], f, 2 * Math.PI);
			}

			if (k > 1) {
				return fn(v[m], v[m - 1], m - f, 2 * Math.PI);
			}

			return fn(v[i], v[i + 1 > m ? m : i + 1], f - i, 2 * Math.PI);
		},

		/**
		 * Normalizes angles between 0 and 360 and then rotates the object in the shortest direction.
		 */
		Degrees(v: number[], k: number): number {
			const m = v.length - 1;
			const f = m * k;
			const i = Math.floor(f);
			const fn = Interpolation.Utils.WrapLinear;

			if (k < 0) {
				return fn(v[0], v[1], f, 360);
			}

			if (k > 1) {
				return fn(v[m], v[m - 1], m - f, 360);
			}

			return fn(v[i], v[i + 1 > m ? m : i + 1], f - i, 360);
		},
	},

	/**
	 * Even if colors are numbers, interpolating them can be tricky.
	 */
	Color: {
		/**
		 * Interpolates the color by their channels Red, Green, and Blue.
		 */
		RGB(v: number[], k: number): number {
			const m = v.length - 1;
			const f = m * k;
			const i = Math.floor(f);
			const fn = Interpolation.Utils.RGBLinear;

			if (k < 0) {
				return fn(v[0], v[1], f);
			}

			if (k > 1) {
				return fn(v[m], v[m - 1], m - f);
			}

			return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
		},

		/**
		 * Interpolates the color by their Hue, Saturation, and Value.
		 */
		HSV(v: number[], k: number): number {
			const m = v.length - 1;
			const f = m * k;
			const i = Math.floor(f);
			const fn = Interpolation.Utils.HSVLinear;

			if (k < 0) {
				return fn(v[0], v[1], f);
			}

			if (k > 1) {
				return fn(v[m], v[m - 1], m - f);
			}

			return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
		},

		/**
		 * Interpolates the color by their Hue, Chroma, and Lightness.
		 */
		HCL(v: number[], k: number): number {
			const m = v.length - 1;
			const f = m * k;
			const i = Math.floor(f);
			const fn = Interpolation.Utils.HCLLinear;

			if (k < 0) {
				return fn(v[0], v[1], f);
			}

			if (k > 1) {
				return fn(v[m], v[m - 1], m - f);
			}

			return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
		},
	},

	/**
	 * Helper functions used to calculate the different interpolations
	 */
	Utils: {
		RGBsplit(color: number): ARGB {
			// this gets named ARGB but it is actually meaningless. It will work with RGBA just the same.
			const a = (color >> 24) & 0xff;
			const r = (color >> 16) & 0xff;
			const g = (color >> 8) & 0xff;
			const b = color & 0xff;
			return { a, r, g, b };
		},
		HSVsplit(color: number): AHSV {
			const rgb = Interpolation.Utils.RGBsplit(color);

			(rgb.r /= 255), (rgb.g /= 255), (rgb.b /= 255);

			const max = Math.max(rgb.r, rgb.g, rgb.b);
			const min = Math.min(rgb.r, rgb.g, rgb.b);
			let h;
			const v = max;

			const d = max - min;
			const s = max == 0 ? 0 : d / max;

			if (max == min) {
				h = 0; // achromatic
			} else {
				switch (max) {
					case rgb.r:
						h = (rgb.g - rgb.b) / d + (rgb.g < rgb.b ? 6 : 0);
						break;
					case rgb.g:
						h = (rgb.b - rgb.r) / d + 2;
						break;
					case rgb.b:
						h = (rgb.r - rgb.g) / d + 4;
						break;
				}

				h /= 6;
			}

			return { a: rgb.a, h, s, v };
		},
		HSVJoin(color: AHSV): number {
			let r, g, b;

			const i = Math.floor(color.h * 6);
			const f = color.h * 6 - i;
			const p = color.v * (1 - color.s);
			const q = color.v * (1 - f * color.s);
			const t = color.v * (1 - (1 - f) * color.s);

			switch (i % 6) {
				case 0:
					(r = color.v), (g = t), (b = p);
					break;
				case 1:
					(r = q), (g = color.v), (b = p);
					break;
				case 2:
					(r = p), (g = color.v), (b = t);
					break;
				case 3:
					(r = p), (g = q), (b = color.v);
					break;
				case 4:
					(r = t), (g = p), (b = color.v);
					break;
				case 5:
					(r = color.v), (g = p), (b = q);
					break;
			}
			return (color.a << 24) | (r << 16) | (g << 8) | b;
		},

		HCLSplit(color: number): AHCL {
			/* https://www.chilliant.com/rgb2hsv.html */
			const HCLgamma = 3;
			const HCLy0 = 100;
			const HCLmaxL = 0.530454533953517; // == exp(HCLgamma / HCLy0) - 0.5

			const RGB = Interpolation.Utils.RGBsplit(color);
			const HCL: AHCL = { a: RGB.a, h: 0, c: 0, l: 0 };
			let H = 0;
			const U = Math.min(RGB.r, Math.min(RGB.g, RGB.b));
			const V = Math.max(RGB.r, Math.max(RGB.g, RGB.b));
			let Q = HCLgamma / HCLy0;
			HCL.c = V - U;
			if (HCL.c != 0) {
				H = Math.atan2(RGB.g - RGB.b, RGB.r - RGB.g) / Math.PI;
				Q *= U / V;
			}
			Q = Math.exp(Q);
			HCL.h = (H / 2 - Math.min(H % 1, -H % 1) / 6) % 1;
			HCL.c *= Q;
			HCL.l = Interpolation.Utils.Linear(-U, V, Q) / (HCLmaxL * 2);
			return HCL;
		},

		HCLJoin(HCL: AHCL): number {
			/* https://www.chilliant.com/rgb2hsv.html */
			const HCLgamma = 3;
			const HCLy0 = 100;
			const HCLmaxL = 0.530454533953517; // == exp(HCLgamma / HCLy0) - 0.5
			const RGB: ARGB = { a: HCL.a, r: 0, g: 0, b: 0 };

			if (HCL.l != 0) {
				let H = HCL.h;
				const C = HCL.c;
				const L = HCL.l * HCLmaxL;
				const Q = Math.exp((1 - C / (2 * L)) * (HCLgamma / HCLy0));
				const U = (2 * L - C) / (2 * Q - 1);
				const V = C / Q;
				const A = (H + Math.min(((2 * H) % 1) / 4, ((-2 * H) % 1) / 8)) * Math.PI * 2;
				let T;
				H *= 6;
				if (H <= 0.999) {
					T = Math.tan(A);
					RGB.r = 1;
					RGB.g = T / (1 + T);
				} else if (H <= 1.001) {
					RGB.r = 1;
					RGB.g = 1;
				} else if (H <= 2) {
					T = Math.tan(A);
					RGB.r = (1 + T) / T;
					RGB.g = 1;
				} else if (H <= 3) {
					T = Math.tan(A);
					RGB.g = 1;
					RGB.b = 1 + T;
				} else if (H <= 3.999) {
					T = Math.tan(A);
					RGB.g = 1 / (1 + T);
					RGB.b = 1;
				} else if (H <= 4.001) {
					RGB.g = 0;
					RGB.b = 1;
				} else if (H <= 5) {
					T = Math.tan(A);
					RGB.r = -1 / T;
					RGB.b = 1;
				} else {
					T = Math.tan(A);
					RGB.r = 1;
					RGB.b = -T;
				}
				RGB.r = RGB.r * V + U;
				RGB.g = RGB.g * V + U;
				RGB.b = RGB.b * V + U;
			}
			return (RGB.a << 24) | (RGB.r << 16) | (RGB.g << 8) | RGB.b;
		},

		WrapLinear(value1: number, value2: number, t: number, maxValue: number): number {
			let retval: number;

			// this fixes my values to be between 0 and maxvalue.
			value1 = (value1 + maxValue * Math.trunc(Math.abs(value1 / maxValue))) % maxValue;
			value2 = (value2 + maxValue * Math.trunc(Math.abs(value2 / maxValue))) % maxValue;

			if (Math.abs(value1 - value2) <= 0.5 * maxValue) {
				retval = Interpolation.Utils.Linear(value1, value2, t);
			} else {
				if (value1 < value2) {
					retval = Interpolation.Utils.Linear(value1 + maxValue, value2, t);
				} else {
					retval = Interpolation.Utils.Linear(value1, value2 + maxValue, t);
				}
				retval = retval % maxValue;
			}
			return retval;
		},

		RGBLinear(color1: number, color2: number, t: number): number {
			const argb1 = Interpolation.Utils.RGBsplit(color1);
			const argb2 = Interpolation.Utils.RGBsplit(color2);
			const a = Interpolation.Utils.Linear(argb1.a, argb2.a, t);
			const r = Interpolation.Utils.Linear(argb1.r, argb2.r, t);
			const g = Interpolation.Utils.Linear(argb1.g, argb2.g, t);
			const b = Interpolation.Utils.Linear(argb1.b, argb2.b, t);
			return (a << 24) | (r << 16) | (g << 8) | b;
		},
		HSVLinear(color1: number, color2: number, t: number): number {
			const ahsv1 = Interpolation.Utils.HSVsplit(color1);
			const ahsv2 = Interpolation.Utils.HSVsplit(color2);
			let h: number;
			if (Math.abs(ahsv1.h - ahsv2.h) <= 0.5) {
				h = Interpolation.Utils.Linear(ahsv1.h, ahsv2.h, t);
			} else {
				if (ahsv1.h < ahsv2.h) {
					h = Interpolation.Utils.Linear(ahsv1.h + 1, ahsv2.h, t);
				} else {
					h = Interpolation.Utils.Linear(ahsv1.h, ahsv2.h + 1, t);
				}
				h = h % 1;
			}
			const s = Interpolation.Utils.Linear(ahsv1.s, ahsv2.s, t);
			const v = Interpolation.Utils.Linear(ahsv1.v, ahsv2.v, t);
			const a = Interpolation.Utils.Linear(ahsv1.a, ahsv2.a, t); // alpha can't be done with hsv
			return Interpolation.Utils.HSVJoin({ a, h, s, v });
		},
		HCLLinear(color1: number, color2: number, t: number): number {
			const ahcl1 = Interpolation.Utils.HCLSplit(color1);
			const ahcl2 = Interpolation.Utils.HCLSplit(color2);
			let h: number;
			if (Math.abs(ahcl1.h - ahcl2.h) <= 0.5) {
				h = Interpolation.Utils.Linear(ahcl1.h, ahcl2.h, t);
			} else {
				if (ahcl1.h < ahcl2.h) {
					h = Interpolation.Utils.Linear(ahcl1.h + 1, ahcl2.h, t);
				} else {
					h = Interpolation.Utils.Linear(ahcl1.h, ahcl2.h + 1, t);
				}
				h = h % 1;
			}
			const s = Interpolation.Utils.Linear(ahcl1.c, ahcl2.c, t);
			const v = Interpolation.Utils.Linear(ahcl1.l, ahcl2.l, t);
			const a = Interpolation.Utils.Linear(ahcl1.a, ahcl2.a, t); // alpha can't be done with hsv
			return Interpolation.Utils.HSVJoin({ a, h, s, v });
		},

		Linear(p0: number, p1: number, t: number): number {
			return (p1 - p0) * t + p0;
		},
		Bernstein(n: number, i: number): number {
			const fc = Interpolation.Utils.Factorial;

			return fc(n) / fc(i) / fc(n - i);
		},
		Factorial: (function () {
			const a = [1];

			return function (n: number): number {
				let s = 1;

				if (a[n]) {
					return a[n];
				}

				for (let i = n; i > 1; i--) {
					s *= i;
				}

				a[n] = s;

				return s;
			};
		})(),

		CatmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
			const v0 = (p2 - p0) * 0.5;
			const v1 = (p3 - p1) * 0.5;
			const t2 = t * t;
			const t3 = t * t2;

			return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
		},
	},
};

interface ARGB {
	a: number;
	r: number;
	g: number;
	b: number;
}

interface AHSV {
	a: number;
	h: number;
	s: number;
	v: number;
}

interface AHCL {
	a: number;
	h: number;
	c: number;
	l: number;
}
