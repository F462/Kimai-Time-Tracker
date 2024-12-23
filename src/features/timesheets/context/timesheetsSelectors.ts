import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectTimesheets = (state: RootState) => state.timesheets;

export const selectTimesheetList = createSelector(
	[selectTimesheets],
	timesheets => timesheets.timesheetList
);
