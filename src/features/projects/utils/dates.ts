/**
 * Date helpers for the project modal.
 *
 * The Kimai API expects date-only fields (`start`, `end`, `lockedUntil`,
 * `orderDate`) as `YYYY-MM-DD` strings. The native date picker works with
 * `Date` objects, so this module bridges the two and also provides a locale
 * aware display format for the text field.
 */
import dayjs from 'dayjs';
import {getLocales} from 'react-native-localize';

/** Coerce a `Date` object to a local `YYYY-MM-DD` string. */
export const toDateStr = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

/**
 * Parse an API date value into a `Date` (local time) for the date picker,
 * or `null` when empty / not parseable.
 */
export const fromDateStr = (value: string | null | undefined): Date | null => {
	if (!value) {
		return null;
	}

	const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (!match) {
		return null;
	}

	const year = parseInt(match[1], 10);
	const month = parseInt(match[2], 10) - 1;
	const day = parseInt(match[3], 10);
	const date = new Date(year, month, day);
	return isNaN(date.getTime()) ? null : date;
};

/**
 * Resolve the dayjs locale to use for display, falling back to `en`.
 */
const displayLocale = (): string => {
	try {
		const locale = getLocales()[0]?.languageCode ?? 'en';
		return locale;
	} catch {
		return 'en';
	}
};

/**
 * Format a `YYYY-MM-DD` string the way the user expects (e.g. `22.10.2026`
 * in a German locale). Returns an empty string when the value is empty.
 */
export const formatDateDisplay = (value: string | null | undefined): string => {
	if (!value) {
		return '';
	}

	const date = fromDateStr(value);
	if (date === null) {
		return value;
	}

	// `LL` is the locale-aware long date format (see the global dayjs setup
	// in features/localization/utils/dayjs.ts).
	return dayjs(date).locale(displayLocale()).format('LL');
};
