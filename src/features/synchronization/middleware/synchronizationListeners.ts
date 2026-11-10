import {ListenerEffectAPI} from '@reduxjs/toolkit';
import {REHYDRATE} from 'redux-persist';

import {
	newTimesheetStarted,
	timesheetStopped,
} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {
	AppDispatch,
	AppStartListening,
	RootState,
} from 'src/features/data/context/store';
import {internetReachabilityChanged} from 'src/features/network/context/networkSlice';
import {timesheetEdited} from 'src/features/timesheets/context/timesheetActions';
import {
	selectTimesheet,
	selectTimesheetsToSynchronize,
} from 'src/features/timesheets/context/timesheetsSelectors';
import {Timesheet} from 'src/features/timesheets/types';
import {selectHasUnsynchronizedUsers} from 'src/features/users/context/usersSelectors';
import {synchronizeLocalUsers} from 'src/features/users/middleware/usersThunks';
import {selectIsTimesheetSyncNeeded} from '../context/synchronizationSelectors';
import {synchronizeTimesheet} from './synchronizationThunks';

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

const runSyncOnReconnect = (startListening: AppStartListening) => {
	startListening({
		actionCreator: internetReachabilityChanged,
		effect: async ({payload: isInternetReachable}, listenerApi) => {
			if (isInternetReachable !== true) {
				return;
			}

			const timesheetsToSynchronize = selectTimesheetsToSynchronize(
				listenerApi.getState(),
			);
			for (const timesheet of Object.values(timesheetsToSynchronize)) {
				if (selectIsTimesheetSyncNeeded(timesheet.id)(listenerApi.getState())) {
					await syncTimesheet(listenerApi, timesheet);
				}
			}

			if (selectHasUnsynchronizedUsers(listenerApi.getState())) {
				await listenerApi.dispatch(synchronizeLocalUsers());
			}
		},
	});
};

export const startSynchronizationListeners = (
	startListening: AppStartListening,
) => {
	runSyncOnAppStart(startListening);
	runSyncOnReconnect(startListening);
	runSyncOnTimesheetStarted(startListening);
	runSyncOnTimesheetEdited(startListening);
	runSyncOnTimesheetStopped(startListening);
};
