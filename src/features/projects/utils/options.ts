import type {SelectOption} from 'src/features/customers/utils/options';

/**
 * Budget types offered when creating or editing a project.
 *
 * Kimai only supports two values: `null` (the default "full" life-cycle budget)
 * and `month` (a monthly budget). Sending any other value is rejected by the API.
 */
export const BUDGET_TYPES: Array<SelectOption> = [
	{value: 'full', label: 'budgetType_full'},
	{value: 'month', label: 'budgetType_month'},
];

/** The internal sentinel used for "no monthly budget" (Kimai stores `null`). */
export const BUDGET_TYPE_FULL = 'full';

/**
 * Normalize a selected budget type to the value the API accepts.
 * The UI uses `full` as the "default" option, but the API expects `null`
 * (or an empty value) for the life-cycle budget.
 */
export const toApiBudgetType = (value: string | null): string | null =>
	value === 'month' ? 'month' : null;

/**
 * Convert an API budget type back to the option value used in the UI.
 */
export const fromApiBudgetType = (value: string | null | undefined): string =>
	value === 'month' ? 'month' : BUDGET_TYPE_FULL;

/**
 * Parse a duration string (e.g. `4:30`, `01:30`, `90`) into seconds, the
 * format the Kimai API stores `timeBudget` in. Returns `null` for empty input.
 */
export const parseTimeBudget = (
	value: string | null | undefined,
): number | null => {
	const trimmed = (value ?? '').trim();
	if (trimmed.length === 0) {
		return null;
	}

	const match = trimmed.match(/^(\d+):([0-5]?\d)$/);
	if (match) {
		return parseInt(match[1], 10) * 3600 + parseInt(match[2], 10) * 60;
	}

	if (/^\d+$/.test(trimmed)) {
		return parseInt(trimmed, 10) * 3600;
	}

	return null;
};

/**
 * Format a time budget (in seconds) as an `H:MM` duration string for display
 * and editing (e.g. `4:30`, `8:00`).
 */
export const formatTimeBudget = (
	seconds: number | null | undefined,
): string => {
	if (!seconds || seconds <= 0) {
		return '0:00';
	}

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.round((seconds % 3600) / 60);
	return `${hours}:${String(minutes).padStart(2, '0')}`;
};
