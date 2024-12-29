import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectActiveTimesheetState = (state: RootState) => state.activeTimesheet;

export const selectActiveTimesheetId = createSelector(
	[selectActiveTimesheetState],
	activeTimesheetState => activeTimesheetState.activeTimesheetId
);

export const selectNextTimesheetStartDate = createSelector(
	[selectActiveTimesheetState],
	activeTimesheetState => activeTimesheetState.nextTimesheetStartDatetime
);
