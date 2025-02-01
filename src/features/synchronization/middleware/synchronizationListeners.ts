import {ListenerEffectAPI, isAnyOf} from '@reduxjs/toolkit';

import {
	AppDispatch,
	AppStartListening,
	RootState
} from 'src/features/data/context/store';
import {
	newTimesheetStarted,
	timesheetStopped
} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {selectServerUrl} from 'src/features/account/context/accountSelectors';
import {selectTimesheetsToSynchronize} from 'src/features/timesheets/context/timesheetsSelectors';
import {synchronizeTimesheet} from './synchronizationThunks';

async function sync(listenerApi: ListenerEffectAPI<RootState, AppDispatch>) {
	const serverUrl = selectServerUrl(listenerApi.getState());

	if (serverUrl === undefined) {
		return;
	}

	const timesheetsToSynchronize = selectTimesheetsToSynchronize(
		listenerApi.getState()
	);

	if (Object.keys(timesheetsToSynchronize).length === 0) {
		return;
	}

	for (const timesheet of Object.values(timesheetsToSynchronize)) {
		try {
			await listenerApi.dispatch(synchronizeTimesheet({serverUrl, timesheet}));
		} catch (error: any) {
			console.warn('Got error on axios request: ', error.toString());
		}
	}
}

const runSyncOnActions = (startListening: AppStartListening) => {
	startListening({
		matcher: isAnyOf(newTimesheetStarted, timesheetStopped),
		effect: async (_, listenerApi) => {
			sync(listenerApi).catch(console.error);
		}
	});
};

export const startSynchronizationListeners = (
	startListening: AppStartListening
) => {
	runSyncOnActions(startListening);
};
