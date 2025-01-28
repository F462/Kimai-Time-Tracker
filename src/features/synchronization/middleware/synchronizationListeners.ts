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
import {internetReachabilityChanged} from 'src/features/network/context/networkSlice';
import {selectIsInternetReachable} from 'src/features/network/context/networkSelector';
import {selectServerUrl} from 'src/features/account/context/accountSelectors';
import {selectTimesheetsToSynchronize} from 'src/features/timesheets/context/timesheetsSelectors';
import {synchronizeTimesheet} from './synchronizationThunks';
import {userLoggedIn} from 'src/features/account/context/accountActions';

const SYNC_INTERVAL_IN_MILLISECONDS = 3000;
let syncInterval: ReturnType<typeof setInterval> | undefined;

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

const syncNewTimesheetsToServer = (startListening: AppStartListening) => {
	startListening({
		matcher: isAnyOf(userLoggedIn, internetReachabilityChanged),
		effect: async (_, listenerApi) => {
			if (selectIsInternetReachable(listenerApi.getState()) !== true) {
				if (syncInterval !== undefined) {
					clearInterval(syncInterval);
					syncInterval = undefined;
				}

				return;
			}

			if (syncInterval !== undefined) {
				return;
			}

			syncInterval = setInterval(() => {
				sync(listenerApi).catch(console.warn);
			}, SYNC_INTERVAL_IN_MILLISECONDS);
		}
	});
};

export const startSynchronizationListeners = (
	startListening: AppStartListening
) => {
	runSyncOnActions(startListening);
	syncNewTimesheetsToServer(startListening);
};
