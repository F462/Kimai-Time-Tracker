import _ from 'lodash';
import {createSelector} from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import {
	selectTimesheetIdsToSynchronize,
	selectTimesheetSynchronizationState,
} from 'src/features/synchronization/context/synchronizationSelectors';
import {RootState} from 'src/features/data/context/store';
import {SyncState} from 'src/features/synchronization/types';
import {selectActiveTimesheetId} from 'src/features/activeTimesheet/context/activeTimesheetSelectors';

const selectTimesheetsState = (state: RootState) => state.timesheets;

const selectTimesheets = createSelector(
	[selectTimesheetsState],
	(timesheetState) => timesheetState.timesheets,
);

export const selectTimesheet = (timesheetId: string) =>
	createSelector([selectTimesheets], (timesheets) => timesheets[timesheetId]);

const selectTimesheetIdTable = createSelector(
	[selectTimesheetsState],
	(timesheetState) => timesheetState.timesheetIdTable,
);

export const selectTimesheetList = createSelector(
	[selectTimesheets],
	(timesheets) =>
		Object.values(timesheets).sort((a, b) => {
			const aTimestamp = dayjs(a.begin);
			const bTimestamp = dayjs(b.begin);
			return bTimestamp.unix() - aTimestamp.unix();
		}),
);

export const selectErroneousTimesheetList = createSelector(
	[selectTimesheetList, selectTimesheetSynchronizationState],
	(timesheets, timesheetSynchronizationState) =>
		timesheets.filter((timesheet) =>
			[SyncState.NOT_STARTED, SyncState.RUNNING, SyncState.FAILED].includes(
				timesheetSynchronizationState[timesheet.id],
			),
		),
);

export const selectOnlyLocalTimesheets = createSelector(
	[selectTimesheets, selectTimesheetIdTable],
	(timesheets, timesheetIdTable) =>
		_.omitBy(timesheets, (timesheet) => timesheet.id in timesheetIdTable),
);

export const selectTimesheetListOfCurrentDay = createSelector(
	[selectTimesheetList],
	(timesheets) => {
		return timesheets.filter(
			(timesheet) =>
				dayjs(timesheet.begin).unix() - dayjs().startOf('day').unix() > 0 &&
				dayjs(timesheet.begin).unix() - dayjs().endOf('day').unix() < 0,
		);
	},
);

export const selectActiveTimesheet = createSelector(
	[selectTimesheets, selectActiveTimesheetId],
	(timesheets, activeTimesheetId) =>
		activeTimesheetId !== undefined ? timesheets[activeTimesheetId] : undefined,
);

export const selectKnownRemoteTimesheetIds = createSelector(
	[selectTimesheetIdTable],
	(timesheetIdTable) => _.invert(timesheetIdTable),
);

export const selectIsTimesheetKnownToServer = (timesheetId: string) =>
	createSelector(
		[selectTimesheetIdTable],
		(timesheetIdTable) => timesheetId in timesheetIdTable,
	);

export const selectRemoteTimesheetId = (timesheetId: string) =>
	createSelector([selectTimesheetIdTable], (timesheetIdTable) => {
		const remoteId = timesheetIdTable[timesheetId];
		return remoteId;
	});

export const selectTimesheetsToSynchronize = createSelector(
	[selectTimesheets, selectTimesheetIdsToSynchronize],
	(timesheets, timesheetIdsToSynchronize) =>
		_.pick(timesheets, timesheetIdsToSynchronize),
);
