import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectTimesheets = (state: RootState) => state.timesheets;

export const selectTimesheetList = createSelector(
	[selectTimesheets],
	timesheets => Object.values(timesheets.timesheets)
);

export const selectActiveTimesheet = createSelector(
	[selectTimesheets],
	timesheets =>
		timesheets.activeTimesheet !== undefined
			? timesheets.timesheets[timesheets.activeTimesheet]
			: undefined
);
