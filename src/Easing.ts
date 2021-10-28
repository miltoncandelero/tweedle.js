/**
 * The type for a function that takes a number between 0 and 1 and returns another number between 0 and 1
 */
export type EasingFunction = (amount: number) => number;

/**
 * The Ease class provides a collection of easing functions.
 *
 * These functions take in a parameter between 0 and 1 as the ratio and give out a new ratio.
 *
 * These are [Robert Penner](http://www.robertpenner.com/easing_terms_of_use.html)'s optimized formulas.
 *
 * Need help picking one? [Check this out!](https://easings.net/)
 */
export const Easing = {
	Step: {
		None(amount: number): number {
			return amount < 0.5 ? 0 : 1;
		},
	},
	Linear: {
		None(amount: number): number {
			return amount;
		},
	},
	Quadratic: {
		In(amount: number): number {
			return amount * amount;
		},
		Out(amount: number): number {
			return amount * (2 - amount);
		},
		InOut(amount: number): number {
			if ((amount *= 2) < 1) {
				return 0.5 * amount * amount;
			}

			return -0.5 * (--amount * (amount - 2) - 1);
		},
	},
	Cubic: {
		In(amount: number): number {
			return amount * amount * amount;
		},
		Out(amount: number): number {
			return --amount * amount * amount + 1;
		},
		InOut(amount: number): number {
			if ((amount *= 2) < 1) {
				return 0.5 * amount * amount * amount;
			}

			return 0.5 * ((amount -= 2) * amount * amount + 2);
		},
	},
	Quartic: {
		In(amount: number): number {
			return amount * amount * amount * amount;
		},
		Out(amount: number): number {
			return 1 - --amount * amount * amount * amount;
		},
		InOut(amount: number): number {
			if ((amount *= 2) < 1) {
				return 0.5 * amount * amount * amount * amount;
			}

			return -0.5 * ((amount -= 2) * amount * amount * amount - 2);
		},
	},
	Quintic: {
		In(amount: number): number {
			return amount * amount * amount * amount * amount;
		},
		Out(amount: number): number {
			return --amount * amount * amount * amount * amount + 1;
		},
		InOut(amount: number): number {
			if ((amount *= 2) < 1) {
				return 0.5 * amount * amount * amount * amount * amount;
			}

			return 0.5 * ((amount -= 2) * amount * amount * amount * amount + 2);
		},
	},
	Sinusoidal: {
		In(amount: number): number {
			return 1 - Math.cos((amount * Math.PI) / 2);
		},
		Out(amount: number): number {
			return Math.sin((amount * Math.PI) / 2);
		},
		InOut(amount: number): number {
			return 0.5 * (1 - Math.cos(Math.PI * amount));
		},
	},
	Exponential: {
		In(amount: number): number {
			return amount == 0 ? 0 : Math.pow(1024, amount - 1);
		},
		Out(amount: number): number {
			return amount == 1 ? 1 : 1 - Math.pow(2, -10 * amount);
		},
		InOut(amount: number): number {
			if (amount == 0) {
				return 0;
			}

			if (amount == 1) {
				return 1;
			}

			if ((amount *= 2) < 1) {
				return 0.5 * Math.pow(1024, amount - 1);
			}

			return 0.5 * (-Math.pow(2, -10 * (amount - 1)) + 2);
		},
	},
	Circular: {
		In(amount: number): number {
			return 1 - Math.sqrt(1 - amount * amount);
		},
		Out(amount: number): number {
			return Math.sqrt(1 - --amount * amount);
		},
		InOut(amount: number): number {
			if ((amount *= 2) < 1) {
				return -0.5 * (Math.sqrt(1 - amount * amount) - 1);
			}

			return 0.5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1);
		},
	},
	Elastic: {
		In(amount: number): number {
			if (amount == 0) {
				return 0;
			}

			if (amount == 1) {
				return 1;
			}

			return -Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
		},
		Out(amount: number): number {
			if (amount == 0) {
				return 0;
			}

			if (amount == 1) {
				return 1;
			}

			return Math.pow(2, -10 * amount) * Math.sin((amount - 0.1) * 5 * Math.PI) + 1;
		},
		InOut(amount: number): number {
			if (amount == 0) {
				return 0;
			}

			if (amount == 1) {
				return 1;
			}

			amount *= 2;

			if (amount < 1) {
				return -0.5 * Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
			}

			return 0.5 * Math.pow(2, -10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI) + 1;
		},
	},
	Back: {
		In(amount: number): number {
			const s = 1.70158;

			return amount * amount * ((s + 1) * amount - s);
		},
		Out(amount: number): number {
			const s = 1.70158;

			return --amount * amount * ((s + 1) * amount + s) + 1;
		},
		InOut(amount: number): number {
			const s = 1.70158 * 1.525;

			if ((amount *= 2) < 1) {
				return 0.5 * (amount * amount * ((s + 1) * amount - s));
			}

			return 0.5 * ((amount -= 2) * amount * ((s + 1) * amount + s) + 2);
		},
	},
	Bounce: {
		In(amount: number): number {
			return 1 - Easing.Bounce.Out(1 - amount);
		},
		Out(amount: number): number {
			if (amount < 1 / 2.75) {
				return 7.5625 * amount * amount;
			} else if (amount < 2 / 2.75) {
				return 7.5625 * (amount -= 1.5 / 2.75) * amount + 0.75;
			} else if (amount < 2.5 / 2.75) {
				return 7.5625 * (amount -= 2.25 / 2.75) * amount + 0.9375;
			}

			return 7.5625 * (amount -= 2.625 / 2.75) * amount + 0.984375;
		},
		InOut(amount: number): number {
			if (amount < 0.5) {
				return Easing.Bounce.In(amount * 2) * 0.5;
			}

			return Easing.Bounce.Out(amount * 2 - 1) * 0.5 + 0.5;
		},
	},
};
