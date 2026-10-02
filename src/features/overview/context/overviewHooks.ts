import {useMemo} from 'react';

import {useAppSelector} from 'src/features/data/context/store';
import {selectStandardWorkingHoursPerDay} from 'src/features/settings/context/settingsSelectors';
import {useTime} from 'src/features/utils/useTime';
import {
	calculateOvertimeInSeconds,
	countWorkingDays,
	getWorkingHoursInSeconds,
	getYearMonthDetails,
	MonthDetail,
} from '../utils/overviewUtils';
import {
	selectTimesheetListOfCurrentMonth,
	selectTimesheetListOfCurrentYear,
} from './overviewSelectors';

export type OverviewData = {
	monthWorkingHoursInSeconds: number;
	yearWorkingHoursInSeconds: number;
	monthOvertimeInSeconds: number;
	yearOvertimeInSeconds: number;
	monthWorkingDays: number;
	yearWorkingDays: number;
};

/**
 * Aggregates the working hours and overtime of the current month and the
 * current year. Overtime is measured against the configured standard working
 * hours per day over the working days (Monday to Friday) that have passed
 * within each period so far.
 */
export const useOverview = (
	updateInterval: number | undefined,
): OverviewData => {
	const monthTimesheets = useAppSelector(selectTimesheetListOfCurrentMonth);
	const yearTimesheets = useAppSelector(selectTimesheetListOfCurrentYear);
	const standardWorkingHoursPerDay = useAppSelector(
		selectStandardWorkingHoursPerDay,
	);

	const now = useTime(updateInterval);

	const monthWorkingHoursInSeconds = getWorkingHoursInSeconds(
		monthTimesheets,
		now,
	);
	const yearWorkingHoursInSeconds = getWorkingHoursInSeconds(
		yearTimesheets,
		now,
	);

	const monthWorkingDays = countWorkingDays(now.startOf('month'), now);
	const yearWorkingDays = countWorkingDays(now.startOf('year'), now);

	const monthOvertimeInSeconds = calculateOvertimeInSeconds(
		monthWorkingHoursInSeconds,
		monthWorkingDays,
		standardWorkingHoursPerDay,
	);
	const yearOvertimeInSeconds = calculateOvertimeInSeconds(
		yearWorkingHoursInSeconds,
		yearWorkingDays,
		standardWorkingHoursPerDay,
	);

	return {
		monthWorkingHoursInSeconds,
		yearWorkingHoursInSeconds,
		monthOvertimeInSeconds,
		yearOvertimeInSeconds,
		monthWorkingDays,
		yearWorkingDays,
	};
};

export type MonthlyOverviewData = {
	months: Array<MonthDetail>;
	yearDeltaInSeconds: number;
	yearExpectedInSeconds: number;
	yearWorkedInSeconds: number;
};

/**
 * Aggregates a per-month, per-day breakdown of the working time of the
 * current year. For every month the worked time, the expected time (based on
 * the working days and the configured standard working hours per day), the
 * resulting delta, and the per-day deltas are provided.
 */
export const useMonthlyOverview = (
	updateInterval: number | undefined,
): MonthlyOverviewData => {
	const yearTimesheets = useAppSelector(selectTimesheetListOfCurrentYear);
	const standardWorkingHoursPerDay = useAppSelector(
		selectStandardWorkingHoursPerDay,
	);

	const now = useTime(updateInterval);

	return useMemo(() => {
		const months = getYearMonthDetails(
			now,
			yearTimesheets,
			now,
			standardWorkingHoursPerDay,
		);

		// Only count days up to today — future days would otherwise
		// subtract their expected hours (e.g. −8 h each) from the total.
		const pastDays = months.flatMap((month) =>
			month.days.filter((day) => !day.isFuture),
		);

		return {
			months,
			yearDeltaInSeconds: pastDays.reduce(
				(sum, day) => sum + day.deltaSeconds,
				0,
			),
			yearExpectedInSeconds: pastDays.reduce(
				(sum, day) => sum + day.expectedSeconds,
				0,
			),
			yearWorkedInSeconds: pastDays.reduce(
				(sum, day) => sum + day.workedSeconds,
				0,
			),
		};
	}, [yearTimesheets, standardWorkingHoursPerDay, now]);
};
