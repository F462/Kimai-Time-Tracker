import {createSlice, isAnyOf, PayloadAction} from '@reduxjs/toolkit';

import {
	newTimesheetStarted,
	timesheetStopped,
} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {timesheetEdited} from 'src/features/timesheets/context/timesheetActions';
import {SynchronizationState, SyncState} from '../types';

const initialState: SynchronizationState = {
	timesheets: {},
	errors: {},
};

const synchronizationSlice = createSlice({
	name: 'synchronization',
	initialState,
	reducers: {
		timesheetSynchronizationStarted(state, {payload: id}) {
			state.timesheets[id] = SyncState.RUNNING;
			delete state.errors[id];
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
			delete state.errors[localId];
		},
		timesheetSyncFailed(
			state,
			{
				payload: {id, errorMessage},
			}: PayloadAction<{
				id: string;
				errorMessage?: string;
			}>,
		) {
			state.timesheets[id] = SyncState.FAILED;
			if (errorMessage !== undefined) {
				state.errors[id] = errorMessage;
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(timesheetStopped, (state, {payload: timesheetId}) => {
				if (state.timesheets[timesheetId] !== SyncState.RUNNING) {
					state.timesheets[timesheetId] = SyncState.NOT_STARTED;
					delete state.errors[timesheetId];
				}
			})
			.addMatcher(
				isAnyOf(newTimesheetStarted, timesheetEdited),
				(state, {payload: timesheet}) => {
					if (state.timesheets[timesheet.id] !== SyncState.RUNNING) {
						state.timesheets[timesheet.id] = SyncState.NOT_STARTED;
						delete state.errors[timesheet.id];
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
