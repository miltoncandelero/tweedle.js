import { type EasingFunction, Easing } from "./Easing";
import { type InterpolationFunction, Interpolation } from "./Interpolation";

export interface IDefaultValues {
	safetyCheckFunction: (target: unknown) => boolean;
	easingFunction: EasingFunction;
	yoyoEasingFunction: EasingFunction | undefined;
	interpolationFunction: InterpolationFunction;
}

/**
 * Default values used **during tween creation**.
 * Allows to change the default values for all tweens.
 */
export const DEFAULTS: IDefaultValues = {
	safetyCheckFunction: () => true,
	easingFunction: Easing.Linear.None,
	yoyoEasingFunction: undefined,
	interpolationFunction: Interpolation.Geom.Linear,
};
