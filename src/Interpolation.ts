/**
 *
 */
export type InterpolationFunction = (v: number[], k: number) => number;

/**
 *
 */
export const Interpolation = {
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

	Bezier(v: number[], k: number): number {
		let b = 0;
		const n = v.length - 1;
		const pw = Math.pow;
		const bn = Interpolation.Utils.Bernstein;

		for (let i = 0; i <= n; i++) {
			b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
		}

		return b;
	},

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

	Color: {
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
	},

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
			const a = (color >> 24) & 0xff;
			let r = (color >> 16) & 0xff;
			let g = (color >> 8) & 0xff;
			let b = color & 0xff;

			(r /= 255), (g /= 255), (b /= 255);

			const max = Math.max(r, g, b);
			const min = Math.min(r, g, b);
			let h;
			const v = max;

			const d = max - min;
			const s = max == 0 ? 0 : d / max;

			if (max == min) {
				h = 0; // achromatic
			} else {
				switch (max) {
					case r:
						h = (g - b) / d + (g < b ? 6 : 0);
						break;
					case g:
						h = (b - r) / d + 2;
						break;
					case b:
						h = (r - g) / d + 4;
						break;
				}

				h /= 6;
			}

			return { a, h, s, v };
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
			const h = Interpolation.Utils.Linear(ahsv1.h, ahsv2.h, t);
			const s = Interpolation.Utils.Linear(ahsv1.s, ahsv2.s, t);
			const v = Interpolation.Utils.Linear(ahsv1.v, ahsv2.v, t);
			const a = Interpolation.Utils.Linear(ahsv1.a, ahsv2.a, t); // alpha can't be done with hsv
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
