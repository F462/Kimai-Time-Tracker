import _ from 'lodash';
import {createSelector} from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import {RootState} from 'src/features/data/context/store';
import {selectActiveTimesheetId} from 'src/features/activeTimesheet/context/activeTimesheetSelectors';

const selectTimesheetsState = (state: RootState) => state.timesheets;

const selectTimesheets = createSelector(
	[selectTimesheetsState],
	timesheetState => timesheetState.timesheets
);

const selectTimesheetIdTable = createSelector(
	[selectTimesheetsState],
	timesheetState => timesheetState.timesheetIdTable
);

export const selectTimesheetList = createSelector(
	[selectTimesheets],
	timesheets => Object.values(timesheets)
);

export const selectTimesheetListOfCurrentDay = createSelector(
	[selectTimesheetList],
	timesheets => {
		return timesheets.filter(
			timesheet =>
				dayjs(timesheet.begin).unix() - dayjs().startOf('day').unix() > 0
		);
	}
);

export const selectWorkingHoursOfCurrentDayInSeconds = createSelector(
	[selectTimesheetListOfCurrentDay],
	timesheets =>
		timesheets.reduce((sum, timesheet) => sum + (timesheet.duration ?? 0), 0)
);

export const selectActiveTimesheet = createSelector(
	[selectTimesheets, selectActiveTimesheetId],
	(timesheets, activeTimesheetId) =>
		activeTimesheetId !== undefined ? timesheets[activeTimesheetId] : undefined
);

export const selectUnsyncedTimesheets = createSelector(
	[selectTimesheets],
	timesheets => _.pickBy(timesheets, timesheet => !timesheet.isSynced)
);

export const selectIsTimesheetKnownToServer = (timesheetId: string) =>
	createSelector(
		[selectTimesheetIdTable],
		timesheetIdTable => timesheetId in timesheetIdTable
	);

export const selectRemoteTimesheetId = (timesheetId: string) =>
	createSelector([selectTimesheetIdTable], timesheetIdTable => {
		const remoteId = timesheetIdTable[timesheetId];
		return remoteId;
	});
