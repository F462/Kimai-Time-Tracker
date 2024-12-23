import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectTimesheetsState = (state: RootState) => state.timesheets;

export const selectTimesheetList = createSelector(
	[selectTimesheetsState],
	timesheets => Object.values(timesheets.timesheets)
);

export const selectActiveTimesheet = createSelector(
	[selectTimesheetsState],
	timesheets =>
		timesheets.activeTimesheet !== undefined
			? timesheets.timesheets[timesheets.activeTimesheet]
			: undefined
);
