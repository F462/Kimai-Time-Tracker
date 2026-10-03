import {createSelector} from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import {RootState} from 'src/features/data/context/store';
import {selectTimesheetList} from 'src/features/timesheets/context/timesheetsSelectors';

export const selectOverviewState = (state: RootState) => state.overview;

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
