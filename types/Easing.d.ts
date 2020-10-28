export declare type EasingFunction = (amount: number) => number;
/**
 * The Ease class provides a collection of easing functions.
 *
 * These functions take in a parameter between 0 and 1 as the ratio and give out a new ratio.
 *
 * These are [Robert Penner](http://www.robertpenner.com/easing_terms_of_use.html)'s optimized formulas.
 *
 * Need help picking one? [Check this out!](https://easings.net/)
 */
export declare const Easing: {
    Linear: {
        None(amount: number): number;
    };
    Quadratic: {
        In(amount: number): number;
        Out(amount: number): number;
        InOut(amount: number): number;
    };
    Cubic: {
        In(amount: number): number;
        Out(amount: number): number;
        InOut(amount: number): number;
    };
    Quartic: {
        In(amount: number): number;
        Out(amount: number): number;
        InOut(amount: number): number;
    };
    Quintic: {
        In(amount: number): number;
        Out(amount: number): number;
        InOut(amount: number): number;
    };
    Sinusoidal: {
        In(amount: number): number;
        Out(amount: number): number;
        InOut(amount: number): number;
    };
    Exponential: {
        In(amount: number): number;
        Out(amount: number): number;
        InOut(amount: number): number;
    };
    Circular: {
        In(amount: number): number;
        Out(amount: number): number;
        InOut(amount: number): number;
    };
    Elastic: {
        In(amount: number): number;
        Out(amount: number): number;
        InOut(amount: number): number;
    };
    Back: {
        In(amount: number): number;
        Out(amount: number): number;
        InOut(amount: number): number;
    };
    Bounce: {
        In(amount: number): number;
        Out(amount: number): number;
        InOut(amount: number): number;
    };
};
