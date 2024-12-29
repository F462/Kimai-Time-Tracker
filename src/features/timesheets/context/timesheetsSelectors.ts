import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';
import {selectActiveTimesheetId} from 'src/features/activeTimesheet/context/activeTimesheetSelectors';

const selectTimesheetsState = (state: RootState) => state.timesheets;

export const selectTimesheetList = createSelector(
	[selectTimesheetsState],
	timesheets => Object.values(timesheets.timesheets)
);

export const selectActiveTimesheet = createSelector(
	[selectTimesheetsState, selectActiveTimesheetId],
	(timesheets, activeTimesheetId) =>
		activeTimesheetId !== undefined
			? timesheets.timesheets[activeTimesheetId]
			: undefined
);
