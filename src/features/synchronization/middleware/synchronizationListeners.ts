import {ListenerEffectAPI, isAnyOf} from '@reduxjs/toolkit';
import axios, {AxiosResponse} from 'axios';
import path from 'path';

import {
	AppDispatch,
	AppStartListening,
	RootState
} from 'src/features/data/context/store';
import {
	newTimesheetStarted,
	timesheetStopped
} from '../../activeTimesheet/context/activeTimesheetSlice';
import {
	selectIsTimesheetKnownToServer,
	selectRemoteTimesheetId,
	selectUnsyncedTimesheets
} from 'src/features/timesheets/context/timesheetsSelectors';
import {TimesheetFromApi} from 'src/features/timesheets/types';
import {internetReachabilityChanged} from 'src/features/network/context/networkSlice';
import {selectIsInternetReachable} from 'src/features/network/context/networkSelector';
import {selectServerUrl} from 'src/features/account/context/accountSelectors';
import {timesheetSynced} from 'src/features/timesheets/context/timesheetsSlice';
import {userLoggedIn} from 'src/features/account/context/accountActions';

const SYNC_INTERVAL_IN_MILLISECONDS = 3000;
let syncInterval: ReturnType<typeof setInterval> | undefined;

async function sync(listenerApi: ListenerEffectAPI<RootState, AppDispatch>) {
	const serverUrl = selectServerUrl(listenerApi.getState());

	if (serverUrl === undefined) {
		return;
	}

	const timesheetsToSync = selectUnsyncedTimesheets(listenerApi.getState());

	if (Object.keys(timesheetsToSync).length === 0) {
		return;
	}

	for (const [timesheetId, timesheet] of Object.entries(timesheetsToSync)) {
		try {
			let response: AxiosResponse<TimesheetFromApi>;
			if (selectIsTimesheetKnownToServer(timesheetId)(listenerApi.getState())) {
				const remoteId = selectRemoteTimesheetId(timesheetId)(
					listenerApi.getState()
				);
				response = await axios.patch(
					path.join(serverUrl, 'api/timesheets', remoteId.toString()),
					{
						begin: timesheet.begin,
						end: timesheet.end,
						project: timesheet.project,
						activity: timesheet.activity
					}
				);
			} else {
				response = await axios.post(path.join(serverUrl, 'api/timesheets'), {
					begin: timesheet.begin,
					end: timesheet.end,
					project: timesheet.project,
					activity: timesheet.activity
				});
			}

			listenerApi.dispatch(
				timesheetSynced({
					localId: timesheetId,
					remoteId: response.data.id
				})
			);
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
