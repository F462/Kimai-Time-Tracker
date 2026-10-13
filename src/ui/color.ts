/**
 * Color conversion helpers for the {@link ColorPicker}.
 *
 * A customer's `color` field is stored as a hex string (e.g. `#e74c3c`). The
 * picker itself works in HSL space, which is more intuitive to tweak via
 * sliders, so these helpers bridge the two representations.
 */

export type Hsl = {
	/** Hue in degrees, 0 – 360. */
	h: number;
	/** Saturation in percent, 0 – 100. */
	s: number;
	/** Lightness in percent, 0 – 100. */
	l: number;
};

type Rgb = {
	r: number;
	g: number;
	b: number;
};

/** Expand a 3-digit shorthand hex (`#abc`) into its 6-digit form. */
function normalizeHex(hex: string): string {
	let value = hex.trim().replace(/^#/, '');
	if (value.length === 3) {
		value = value
			.split('')
			.map((channel) => channel + channel)
			.join('');
	}
	return value;
}

export function hexToRgb(hex: string): Rgb {
	const value = normalizeHex(hex);
	const parse = (index: number): number =>
		Number.parseInt(value.slice(index, index + 2), 16) || 0;
	return {r: parse(0), g: parse(2), b: parse(4)};
}

export function rgbToHex(r: number, g: number, b: number): string {
	const toHex = (channel: number): string =>
		Math.max(0, Math.min(255, Math.round(channel)))
			.toString(16)
			.padStart(2, '0');
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): Hsl {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;

	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const delta = max - min;
	const lightness = (max + min) / 2;

	let hue = 0;
	let saturation = 0;
	if (delta !== 0) {
		saturation = delta / (1 - Math.abs(2 * lightness - 1));
		if (max === rn) {
			hue = ((gn - bn) / delta) % 6;
		} else if (max === gn) {
			hue = (bn - rn) / delta + 2;
		} else {
			hue = (rn - gn) / delta + 4;
		}
		hue *= 60;
		if (hue < 0) {
			hue += 360;
		}
	}

	return {h: hue, s: saturation * 100, l: lightness * 100};
}

export function hslToRgb(h: number, s: number, l: number): Rgb {
	const saturation = s / 100;
	const lightness = l / 100;

	const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
	const sector = (((h % 360) + 360) % 360) / 60;
	const x = chroma * (1 - Math.abs((sector % 2) - 1));
	const m = lightness - chroma / 2;

	let r = 0;
	let g = 0;
	let b = 0;
	if (sector < 1) {
		r = chroma;
		g = x;
	} else if (sector < 2) {
		r = x;
		g = chroma;
	} else if (sector < 3) {
		g = chroma;
		b = x;
	} else if (sector < 4) {
		g = x;
		b = chroma;
	} else if (sector < 5) {
		r = x;
		b = chroma;
	} else {
		r = chroma;
		b = x;
	}

	return {
		r: (r + m) * 255,
		g: (g + m) * 255,
		b: (b + m) * 255,
	};
}

/** Convert a hex color into HSL for driving the picker sliders. */
export function hexToHsl(hex: string): Hsl {
	const {r, g, b} = hexToRgb(hex);
	return rgbToHsl(r, g, b);
}

/** Convert HSL (as produced by the sliders) back into a hex string. */
export function hslToHex(h: number, s: number, l: number): string {
	const {r, g, b} = hslToRgb(h, s, l);
	return rgbToHex(r, g, b);
}
