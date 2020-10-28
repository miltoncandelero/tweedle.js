/**
 *
 */
export declare type InterpolationFunction = (v: number[], k: number) => number;
/**
 *
 */
export declare const Interpolation: {
    Linear(v: number[], k: number): number;
    Bezier(v: number[], k: number): number;
    CatmullRom(v: number[], k: number): number;
    Color(v: number[], k: number): number;
    Utils: {
        Color(color1: number, color2: number, t: number): number;
        Linear(p0: number, p1: number, t: number): number;
        Bernstein(n: number, i: number): number;
        Factorial: (n: number) => number;
        CatmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number;
    };
};
