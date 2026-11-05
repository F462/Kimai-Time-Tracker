import {useWindowDimensions} from 'react-native';

/**
 * The logical window width (in dp) at which the design is intended to look
 * correct. Content is scaled proportionally to this reference so that layouts
 * look consistent on devices with different logical screen sizes.
 */
const DESIGN_WIDTH = 400;

/**
 * Keep the scale within a sane range so content never looks comically small or
 * large on unusual screens (e.g. very narrow phones or large tablets).
 */
const MIN_SCALE = 0.85;
const MAX_SCALE = 1.15;

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

/**
 * Returns a scale factor derived from the current logical window width.
 *
 * React Native's `dp`/`sp` units are density-independent: the same value is
 * always the same *physical* size on every device. On a device whose logical
 * screen is narrower (a higher pixel density at a similar physical size), that
 * identical physical content therefore occupies a larger share of the screen
 * and looks "huge". This hook derives a multiplier from the logical window
 * width so fixed-size layouts can be scaled to look proportionally consistent
 * across devices, e.g.:
 *
 * ```tsx
 * const scale = useResponsiveScale();
 * const fontSize = 14 * scale;
 * const padding = 16 * scale;
 * ```
 */
export const useResponsiveScale = () => {
	const {width} = useWindowDimensions();

	return clamp(width / DESIGN_WIDTH, MIN_SCALE, MAX_SCALE);
};
