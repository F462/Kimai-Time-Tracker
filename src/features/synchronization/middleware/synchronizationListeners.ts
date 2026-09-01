import {ListenerEffectAPI} from '@reduxjs/toolkit';
import {REHYDRATE} from 'redux-persist';

import {
	AppDispatch,
	AppStartListening,
	RootState,
} from 'src/features/data/context/store';
import {
	newTimesheetStarted,
	timesheetStopped,
} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {
	selectTimesheet,
	selectTimesheetsToSynchronize,
} from 'src/features/timesheets/context/timesheetsSelectors';
import {Timesheet} from 'src/features/timesheets/types';
import {selectIsTimesheetSyncNeeded} from '../context/synchronizationSelectors';
import {synchronizeTimesheet} from './synchronizationThunks';
import {timesheetEdited} from 'src/features/timesheets/context/timesheetActions';

const syncTimesheet = async (
	listenerApi: ListenerEffectAPI<RootState, AppDispatch>,
	timesheet: Timesheet,
) => {
	await listenerApi.dispatch(synchronizeTimesheet({timesheet}));
};

const runSyncOnAppStart = (startListening: AppStartListening) => {
	startListening({
		type: REHYDRATE,
		effect: async (_action, listenerApi) => {
			const timesheetsToSynchronize = selectTimesheetsToSynchronize(
				listenerApi.getState(),
			);

			for (const timesheetToSynchronize of Object.values(
				timesheetsToSynchronize,
			)) {
				if (
					selectIsTimesheetSyncNeeded(timesheetToSynchronize.id)(
						listenerApi.getState(),
					)
				) {
					await syncTimesheet(listenerApi, timesheetToSynchronize);
				}
			}
		},
	});
};

const runSyncOnTimesheetStarted = (startListening: AppStartListening) => {
	startListening({
		actionCreator: newTimesheetStarted,
		effect: async ({payload: timesheet}, listenerApi) => {
			await syncTimesheet(listenerApi, timesheet);
		},
	});
};

const runSyncOnTimesheetEdited = (startListening: AppStartListening) => {
	startListening({
		actionCreator: timesheetEdited,
		effect: async ({payload: timesheet}, listenerApi) => {
			await syncTimesheet(listenerApi, timesheet);
		},
	});
};

const runSyncOnTimesheetStopped = (startListening: AppStartListening) => {
	startListening({
		actionCreator: timesheetStopped,
		effect: async ({payload: timesheetId}, listenerApi) => {
			const timesheet = selectTimesheet(timesheetId)(listenerApi.getState());

			await syncTimesheet(listenerApi, timesheet);
		},
	});
};

export const startSynchronizationListeners = (
	startListening: AppStartListening,
) => {
	runSyncOnAppStart(startListening);
	runSyncOnTimesheetStarted(startListening);
	runSyncOnTimesheetEdited(startListening);
	runSyncOnTimesheetStopped(startListening);
};
