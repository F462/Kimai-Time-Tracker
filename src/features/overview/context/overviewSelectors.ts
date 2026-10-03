import {createSelector} from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import {RootState} from 'src/features/data/context/store';
import {selectTimesheetList} from 'src/features/timesheets/context/timesheetsSelectors';

const selectOverviewState = (state: RootState) => state.overview;

/**
 * The monthly overview as pre-computed by `computeOverview` (triggered when
 * the timesheets are fetched), or `null` until it has been calculated.
 */
export const selectMonthlyOverview = createSelector(
	[selectOverviewState],
	(overview) => overview,
);

export const selectTimesheetListOfCurrentYear = createSelector(
	[selectTimesheetList],
	(timesheets) => {
		const now = dayjs();

		return timesheets.filter(
			(timesheet) =>
				timesheet.begin !== undefined &&
				dayjs(timesheet.begin).isSame(now, 'year'),
		);
	},
);
