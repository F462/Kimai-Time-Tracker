import dayjs from 'dayjs';

import {Timesheet} from 'src/features/timesheets/types';

/**
 * Returns the duration of a single timesheet in seconds.
 * Falls back to the difference between `begin` and `end` when no explicit
 * `duration` is set. For still-running timesheets (no `end` yet) the duration
 * is computed against `now`.
 */
export const getTimesheetDurationInSeconds = (
	timesheet: Timesheet,
	now: dayjs.Dayjs,
): number => {
	if (timesheet.duration) {
		return timesheet.duration;
	}

	if (timesheet.begin && timesheet.end) {
		return dayjs(timesheet.end).diff(dayjs(timesheet.begin)) / 1000;
	}

	if (timesheet.begin) {
		return Math.max(0, now.diff(dayjs(timesheet.begin)) / 1000);
	}

	return 0;
};

/**
 * Sums up the durations of the given timesheets in seconds.
 */
export const getWorkingHoursInSeconds = (
	timesheets: Array<Timesheet>,
	now: dayjs.Dayjs,
): number =>
	timesheets.reduce(
		(sum, timesheet) => sum + getTimesheetDurationInSeconds(timesheet, now),
		0,
	);

/**
 * Counts the number of working days (Monday to Friday, inclusive) between
 * `start` and `end`.
 */
export const countWorkingDays = (
	start: dayjs.Dayjs,
	end: dayjs.Dayjs,
): number => {
	let count = 0;
	let cursor = start.startOf('day');
	const lastDay = end.startOf('day');

	while (cursor.isSame(lastDay) || cursor.isBefore(lastDay, 'day')) {
		const dayOfWeek = cursor.day();
		if (dayOfWeek >= 1 && dayOfWeek <= 5) {
			count += 1;
		}
		cursor = cursor.add(1, 'day');
	}

	return count;
};

/**
 * Calculates the overtime (or deficit when negative) in seconds for a period.
 * Overtime = actually worked time - expected working time.
 * The expected working time is derived from the number of working days and the
 * configured standard working hours per day.
 */
export const calculateOvertimeInSeconds = (
	totalWorkingSeconds: number,
	workingDays: number,
	standardWorkingHoursPerDay: number,
): number => {
	const expectedSeconds = workingDays * standardWorkingHoursPerDay * 3600;
	return totalWorkingSeconds - expectedSeconds;
};

/**
 * Formats a duration given in seconds as a clock-time string (`HH:mm`),
 * matching the formatting used elsewhere in the app. Negative values are
 * formatted using their absolute value.
 *
 * Note: `dayjs.duration(...).format('HH:mm')` is not used here because it
 * wraps the hours modulo 24 (e.g. 40h renders as `16:00`), so the hours are
 * computed manually to support durations of more than 24 hours.
 */
export const formatDurationInSeconds = (seconds: number): string => {
	const totalMinutes = Math.round(Math.abs(seconds) / 60);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return (
		String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0')
	);
};

/**
 * Formats a duration given in seconds as a signed clock-time string, prefixed
 * with `+` or `-` to indicate a surplus or a deficit. Zero is formatted as
 * `+0:00`.
 */
export const formatSignedDurationInSeconds = (seconds: number): string =>
	`${seconds < 0 ? '-' : '+'}${formatDurationInSeconds(seconds)}`;

/**
 * Returns whether the given date is a working day (Monday to Friday,
 * inclusive). Weekends are not working days.
 */
export const isWorkingDay = (date: dayjs.Dayjs): boolean => {
	const dayOfWeek = date.day();
	return dayOfWeek >= 1 && dayOfWeek <= 5;
};

export type MonthDayDetail = {
	dayOfMonth: number;
	workedSeconds: number;
	expectedSeconds: number;
	deltaSeconds: number;
	isWorkingDay: boolean;
	hasData: boolean;
	isFuture: boolean;
};

export type MonthDetail = {
	month: number;
	label: string;
	workedSeconds: number;
	expectedSeconds: number;
	deltaSeconds: number;
	workingDays: number;
	days: Array<MonthDayDetail>;
	/**
	 * The days laid out in calendar weeks, each row holding exactly seven
	 * entries from Monday to Sunday. Cells outside of the month are `null`
	 * (used to pad the first and the last week so every row aligns to a week).
	 */
	weeks: Array<Array<MonthDayDetail | null>>;
};

/**
 * Computes the per-day detail for a single month. Each day's delta is the
 * worked time on that day minus the expected time (the configured standard
 * working hours on working days, zero on weekends). The per-day deltas sum up
 * to the month's total delta.
 */
export const getMonthDetail = (
	month: dayjs.Dayjs,
	timesheets: Array<Timesheet>,
	now: dayjs.Dayjs,
	standardWorkingHoursPerDay: number,
): MonthDetail => {
	const daysInMonth = month.daysInMonth();
	const days: Array<MonthDayDetail> = [];

	let workedSeconds = 0;
	let expectedSeconds = 0;
	let workingDays = 0;

	for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth++) {
		const day = month.date(dayOfMonth);
		const working = isWorkingDay(day);
		const expected = working ? standardWorkingHoursPerDay * 3600 : 0;
		const worked = timesheets.reduce(
			(sum, timesheet) =>
				timesheet.begin !== undefined &&
				dayjs(timesheet.begin).isSame(day, 'day')
					? sum + getTimesheetDurationInSeconds(timesheet, now)
					: sum,
			0,
		);

		workedSeconds += worked;
		expectedSeconds += expected;
		if (working) {
			workingDays += 1;
		}

		days.push({
			dayOfMonth,
			workedSeconds: worked,
			expectedSeconds: expected,
			deltaSeconds: worked - expected,
			isWorkingDay: working,
			hasData: worked > 0,
			isFuture: day.isAfter(now, 'day'),
		});
	}

	// Lay the days out in calendar weeks (Monday to Sunday). Pad the leading
	// and trailing cells with `null` so that every row holds exactly seven
	// entries aligned to a week.
	const firstDayOfWeek = month.startOf('month').day();
	const leadingEmptyCells = (firstDayOfWeek + 6) % 7;
	const cells: Array<MonthDayDetail | null> = [
		...Array<null>(leadingEmptyCells).fill(null),
		...days,
	];
	while (cells.length % 7 !== 0) {
		cells.push(null);
	}

	const weeks: Array<Array<MonthDayDetail | null>> = [];
	for (let index = 0; index < cells.length; index += 7) {
		weeks.push(cells.slice(index, index + 7));
	}

	return {
		month: month.month(),
		label: month.format('MMMM'),
		workedSeconds,
		expectedSeconds,
		deltaSeconds: workedSeconds - expectedSeconds,
		workingDays,
		days,
		weeks,
	};
};

/**
 * Computes the per-day detail for all twelve months of the given year.
 */
export const getYearMonthDetails = (
	year: dayjs.Dayjs,
	timesheets: Array<Timesheet>,
	now: dayjs.Dayjs,
	standardWorkingHoursPerDay: number,
): Array<MonthDetail> => {
	const months: Array<MonthDetail> = [];

	for (let month = 0; month < 12; month++) {
		months.push(
			getMonthDetail(
				year.month(month),
				timesheets,
				now,
				standardWorkingHoursPerDay,
			),
		);
	}

	return months;
};
