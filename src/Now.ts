/**
 * Polyfilled function to get the current time in miliseconds.
 * It tries to use `process.hrtime()`, `performance.now()`, `Date.now()` or `new Date().getTime()` in that order.
 */
export let NOW: () => number;

// Include a performance.now polyfill.
// In node.js, use process.hrtime.

if (typeof self == "undefined" && typeof process !== "undefined" && process.hrtime) {
	NOW = function (): number {
		const time = process.hrtime();

		// Convert [seconds, nanoseconds] to milliseconds.
		return time[0] * 1000 + time[1] / 1000000;
	};
}
// In a browser, use self.performance.now if it is available.
else if (typeof self !== "undefined" && self.performance !== undefined && self.performance.now !== undefined) {
	// This must be bound, because directly assigning this function
	// leads to an invocation exception in Chrome.
	NOW = self.performance.now.bind(self.performance);
}
// Use Date.now if it is available.
else if (Date.now !== undefined) {
	NOW = Date.now;
}
// Otherwise, use 'new Date().getTime()'.
else {
	NOW = function (): number {
		return new Date().getTime();
	};
}
