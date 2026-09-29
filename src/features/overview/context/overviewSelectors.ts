import {createSelector} from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import {selectTimesheetList} from 'src/features/timesheets/context/timesheetsSelectors';

export const selectTimesheetListOfCurrentMonth = createSelector(
	[selectTimesheetList],
	(timesheets) => {
		const now = dayjs();

		return timesheets.filter(
			(timesheet) =>
				timesheet.begin !== undefined &&
				dayjs(timesheet.begin).isSame(now, 'month'),
		);
	},
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
