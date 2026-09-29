import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import {
	calculateOvertimeInSeconds,
	countWorkingDays,
	formatDurationInSeconds,
	getMonthDetail,
	getTimesheetDurationInSeconds,
	getWorkingHoursInSeconds,
} from 'src/features/overview/utils/overviewUtils';
import {Timesheet} from 'src/features/timesheets/types';

dayjs.extend(duration);

describe('overviewUtils', () => {
	describe('getTimesheetDurationInSeconds', () => {
		const now = dayjs('2026-09-29T12:00:00');

		it('returns the explicit duration when set', () => {
			const timesheet: Timesheet = {
				id: '1',
				begin: '2026-09-29T08:00:00',
				end: '2026-09-29T10:00:00',
				duration: 7200,
			};
			expect(getTimesheetDurationInSeconds(timesheet, now)).toBe(7200);
		});

		it('computes duration from begin and end when no duration set', () => {
			const timesheet: Timesheet = {
				id: '2',
				begin: '2026-09-29T08:00:00',
				end: '2026-09-29T10:30:00',
			};
			expect(getTimesheetDurationInSeconds(timesheet, now)).toBe(150 * 60);
		});

		it('computes duration against now for running timesheets', () => {
			const timesheet: Timesheet = {
				id: '3',
				begin: '2026-09-29T10:00:00',
			};
			expect(getTimesheetDurationInSeconds(timesheet, now)).toBe(2 * 3600);
		});

		it('returns 0 when no begin time is present', () => {
			const timesheet: Timesheet = {id: '4'};
			expect(getTimesheetDurationInSeconds(timesheet, now)).toBe(0);
		});
	});

	describe('getWorkingHoursInSeconds', () => {
		const now = dayjs('2026-09-29T12:00:00');

		it('sums up the durations of all timesheets', () => {
			const timesheets: Array<Timesheet> = [
				{id: '1', begin: 'b', end: 'e', duration: 3600},
				{id: '2', begin: '2026-09-29T08:00:00', end: '2026-09-29T10:00:00'},
			];
			expect(getWorkingHoursInSeconds(timesheets, now)).toBe(3600 + 7200);
		});

		it('returns 0 for an empty list', () => {
			expect(getWorkingHoursInSeconds([], now)).toBe(0);
		});
	});

	describe('countWorkingDays', () => {
		it('counts only weekdays (Monday to Friday)', () => {
			// 2026-09-28 is a Monday, 2026-10-02 is a Saturday
			const start = dayjs('2026-09-28');
			const end = dayjs('2026-10-02');
			expect(countWorkingDays(start, end)).toBe(5);
		});

		it('counts a single weekday', () => {
			const start = dayjs('2026-09-28'); // Monday
			const end = dayjs('2026-09-28');
			expect(countWorkingDays(start, end)).toBe(1);
		});

		it('counts zero for a weekend-only range', () => {
			const start = dayjs('2026-10-03'); // Saturday
			const end = dayjs('2026-10-04'); // Sunday
			expect(countWorkingDays(start, end)).toBe(0);
		});

		it('counts across month boundaries', () => {
			// 2026-09-28 (Mon) to 2026-10-09 (Fri) = 10 working days
			const start = dayjs('2026-09-28');
			const end = dayjs('2026-10-09');
			expect(countWorkingDays(start, end)).toBe(10);
		});
	});

	describe('calculateOvertimeInSeconds', () => {
		it('returns positive overtime when working more than expected', () => {
			// 5 days * 8h = 40h expected; worked 50h => +10h
			const totalSeconds = 50 * 3600;
			expect(calculateOvertimeInSeconds(totalSeconds, 5, 8)).toBe(10 * 3600);
		});

		it('returns negative overtime (deficit) when working less', () => {
			// 5 days * 8h = 40h expected; worked 30h => -10h
			const totalSeconds = 30 * 3600;
			expect(calculateOvertimeInSeconds(totalSeconds, 5, 8)).toBe(-10 * 3600);
		});

		it('returns 0 when working exactly the expected amount', () => {
			expect(calculateOvertimeInSeconds(40 * 3600, 5, 8)).toBe(0);
		});
	});

	describe('formatDurationInSeconds', () => {
		it('formats whole hours', () => {
			expect(formatDurationInSeconds(3600)).toBe('01:00');
		});

		it('formats hours and minutes', () => {
			expect(formatDurationInSeconds(80 * 60)).toBe('01:20');
		});

		it('handles negative values by using the absolute value', () => {
			expect(formatDurationInSeconds(-3600)).toBe('01:00');
		});

		it('does not wrap hours over 24 (dayjs.duration would modulo them)', () => {
			expect(formatDurationInSeconds(24 * 3600)).toBe('24:00');
			expect(formatDurationInSeconds(40 * 3600)).toBe('40:00');
			expect(formatDurationInSeconds(47.5 * 3600)).toBe('47:30');
			expect(formatDurationInSeconds(-60 * 3600)).toBe('60:00');
		});
	});

	describe('getMonthDetail weeks alignment', () => {
		const now = dayjs('2026-01-15T12:00:00');
		const month = dayjs('2026-01-01'); // January 2026, 31 days, the 1st is a Thursday

		it('lays out the days in rows of exactly seven entries (Monday to Sunday)', () => {
			const detail = getMonthDetail(month, [], now, 8);
			expect(detail.weeks.every((week) => week.length === 7)).toBe(true);
			// 31 days + 3 leading nulls = 34 cells -> padded to 35 (5 full weeks)
			expect(detail.weeks.length).toBe(5);
		});

		it('pads the leading cells so the 1st lands on the correct weekday', () => {
			const detail = getMonthDetail(month, [], now, 8);
			// Jan 1 2026 is a Thursday -> Mon, Tue, Wed are empty
			expect(detail.weeks[0].slice(0, 3)).toEqual([null, null, null]);
			expect(detail.weeks[0][3]?.dayOfMonth).toBe(1);
		});

		it('pads the trailing cells of the last week with null', () => {
			const detail = getMonthDetail(month, [], now, 8);
			const lastWeek = detail.weeks[detail.weeks.length - 1];
			// Jan 31 2026 is a Saturday -> the Sunday slot is empty
			expect(lastWeek[lastWeek.length - 1]).toBeNull();
		});

		it('keeps the day order intact across all weeks', () => {
			const detail = getMonthDetail(month, [], now, 8);
			const flattened = detail.weeks
				.flat()
				.filter((cell): cell is NonNullable<typeof cell> => cell !== null);
			expect(flattened.map((cell) => cell.dayOfMonth)).toEqual(
				Array.from({length: 31}, (_, index) => index + 1),
			);
		});
	});
});
