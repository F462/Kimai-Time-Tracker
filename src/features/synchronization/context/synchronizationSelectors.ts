import _ from 'lodash';
import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';
import {SyncState} from '../types';

const selectSynchronizationState = (state: RootState) => state.synchronization;

const selectTimesheetSynchronizationState = createSelector(
	[selectSynchronizationState],
	synchronizationState => synchronizationState.timesheets
);

export const selectTimesheetIdsToSynchronize = createSelector(
	[selectTimesheetSynchronizationState],
	timesheetSyncStates =>
		Object.keys(
			_.pickBy(timesheetSyncStates, timesheetSyncState =>
				[SyncState.NOT_STARTED, SyncState.FAILED].includes(timesheetSyncState)
			)
		)
);

export const selectAreAllTimesheetsInSync = createSelector(
	[selectTimesheetSynchronizationState],
	timesheetSyncStates =>
		_.some(
			timesheetSyncStates,
			timesheetSyncState => timesheetSyncState !== SyncState.DONE
		) === false
);

export const selectIsTimesheetSyncRunning = (timesheetIdToCheck: string) =>
	createSelector(
		[selectTimesheetSynchronizationState],
		timesheetSyncStates =>
			timesheetSyncStates[timesheetIdToCheck] === SyncState.RUNNING
	);
