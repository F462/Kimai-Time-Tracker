import {PayloadAction, createSlice, isAnyOf} from '@reduxjs/toolkit';

import {SyncState, SynchronizationState} from '../types';
import {
	newTimesheetStarted,
	timesheetStopped,
} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {timesheetEdited} from 'src/features/timesheets/context/timesheetsSlice';

const initialState: SynchronizationState = {
	timesheets: {},
};

const synchronizationSlice = createSlice({
	name: 'synchronization',
	initialState,
	reducers: {
		timesheetSynchronizationStarted(state, {payload: id}) {
			state.timesheets[id] = SyncState.RUNNING;
		},
		timesheetSynced: (
			state,
			{
				payload: {localId},
			}: PayloadAction<{
				localId: string;
				remoteId: number;
			}>,
		) => {
			state.timesheets[localId] = SyncState.DONE;
		},
		timesheetSyncFailed(state, {payload: id}) {
			state.timesheets[id] = SyncState.FAILED;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(timesheetStopped, (state, {payload: timesheetId}) => {
				if (state.timesheets[timesheetId] !== SyncState.RUNNING) {
					state.timesheets[timesheetId] = SyncState.NOT_STARTED;
				}
			})
			.addMatcher(
				isAnyOf(newTimesheetStarted, timesheetEdited),
				(state, {payload: timesheet}) => {
					if (state.timesheets[timesheet.id] !== SyncState.RUNNING) {
						state.timesheets[timesheet.id] = SyncState.NOT_STARTED;
					}
				},
			);
	},
});

export const {
	timesheetSynchronizationStarted,
	timesheetSynced,
	timesheetSyncFailed,
} = synchronizationSlice.actions;
export const synchronizationReducer = synchronizationSlice.reducer;
