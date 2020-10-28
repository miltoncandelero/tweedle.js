/**
 * Polyfilled function to get the current time in miliseconds.
 * It tries to use `process.hrtime()`, `performance.now()`, `Date.now()` or `new Date().getTime()` in that order.
 */
export declare let NOW: () => number;
