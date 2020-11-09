/**
 * An function that takes creates a value by interpolating the elements of the array given.
 */
export declare type InterpolationFunction = (v: number[], k: number) => number;
/**
 * Object containing common interpolation functions.
 * These functions can be passed in the {@link Tween.interpolation} argument and **will only affect fields where you gave an array as target value**
 */
export declare const Interpolation: {
    /**
     * Geometric interpolation functions. Good for interpolating positions in space.
     */
    Geom: {
        /**
         * Linear interpolation is like drawing straight lines between the points.
         */
        Linear(v: number[], k: number): number;
        /**
         * A Bézier curve is defined by a set of control points P0 through Pn, where n is called its order.
         * The first and last control points are always the end points of the curve; however, the intermediate control points (if any) generally do not lie on the curve.
         *
         * https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Explicit_definition
         */
        Bezier(v: number[], k: number): number;
        QuadraticBezier(v: number[], k: number): number;
        CubicBezier(v: number[], k: number): number;
        /**
         * A Catmullrom spline is a curve where the original set of points is also used as control points.
         * Usually Catmullrom splines need two extra elements at the beginning and the end of the point set. This function contemplates that and doesn't need them.
         *
         * https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull%E2%80%93Rom_spline
         */
        CatmullRom(v: number[], k: number): number;
    };
    /**
     * Given the spinny nature of angles, sometimes it's better to go back to get to the right place earlier.
     * This functions help with that.
     */
    Angle: {
        /**
         * Normalizes angles between 0 and 2pi and then rotates the object in the shortest direction.
         */
        Radians(v: number[], k: number): number;
        /**
         * Normalizes angles between 0 and 360 and then rotates the object in the shortest direction.
         */
        Degrees(v: number[], k: number): number;
    };
    /**
     * Even if colors are numbers, interpolating them can be tricky.
     */
    Color: {
        /**
         * Interpolates the color by their channels Red, Green, and Blue.
         */
        RGB(v: number[], k: number): number;
        /**
         * Interpolates the color by their Hue, Saturation, and Value.
         */
        HSV(v: number[], k: number): number;
        /**
         * Interpolates the color by their Hue, Chroma, and Lightness.
         */
        HCL(v: number[], k: number): number;
    };
    /**
     * Helper functions used to calculate the different interpolations
     */
    Utils: {
        RGBsplit(color: number): ARGB;
        HSVsplit(color: number): AHSV;
        HSVJoin(color: AHSV): number;
        HCLSplit(color: number): AHCL;
        HCLJoin(HCL: AHCL): number;
        WrapLinear(value1: number, value2: number, t: number, maxValue: number): number;
        RGBLinear(color1: number, color2: number, t: number): number;
        HSVLinear(color1: number, color2: number, t: number): number;
        HCLLinear(color1: number, color2: number, t: number): number;
        Linear(p0: number, p1: number, t: number): number;
        Bernstein(n: number, i: number): number;
        Factorial: (n: number) => number;
        CatmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number;
    };
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
export {};
