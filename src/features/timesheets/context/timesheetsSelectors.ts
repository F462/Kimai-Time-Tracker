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
			? timesheets.timesheets[activeTimesheetId] ??
			  timesheets.offlineTimesheets[activeTimesheetId]
			: undefined
);

export const selectNextOfflineTimesheetId = createSelector(
	[selectTimesheetsState],
	timesheets => {
		const offlineIds = Object.keys(timesheets.offlineTimesheets).map(key =>
			parseInt(key, 10)
		);
		let nextId = offlineIds[offlineIds.length - 1];

		while (true) {
			nextId += 1;

			if (timesheets.offlineTimesheets[nextId] === undefined) {
				return nextId;
			}
		}
	}
);
