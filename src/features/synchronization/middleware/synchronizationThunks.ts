import axios, {AxiosResponse} from 'axios';
import path from 'path';

import {Timesheet, TimesheetFromApi} from 'src/features/timesheets/types';
import {
	selectIsTimesheetKnownToServer,
	selectRemoteTimesheetId,
} from 'src/features/timesheets/context/timesheetsSelectors';
import {
	timesheetSyncFailed,
	timesheetSynced,
	timesheetSynchronizationStarted,
} from '../context/synchronizationSlice';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {fetchTimesheets} from 'src/features/timesheets/middleware/timesheetsThunks';
import {selectIsTimesheetSyncRunning} from '../context/synchronizationSelectors';
import {timesheetDeleted} from 'src/features/timesheets/context/timesheetsSlice';

const resyncTimesheetRequests: {[timesheetId: string]: boolean} = {};

export const deleteTimesheet = createAppAsyncThunk<
	void,
	{
		serverUrl: string;
		timesheet: Timesheet;
	}
>(
	'synchronization/deleteTimesheet',
	async ({serverUrl, timesheet}, {dispatch, getState}) => {
		try {
			if (selectIsTimesheetKnownToServer(timesheet.id)(getState())) {
				const remoteId = selectRemoteTimesheetId(timesheet.id)(getState());
				console.info(
					`Delete timesheet with ID ${timesheet.id} from server with remote ID ${remoteId}`,
				);

				await axios.delete(
					path.join(serverUrl, 'api/timesheets', remoteId.toString()),
				);
			}

			dispatch(timesheetDeleted(timesheet.id));
		} catch (error: any) {
			console.error(`Error while deleting sheet: ${error.toString()}`);
		}
	},
);

export const synchronizeTimesheet = createAppAsyncThunk<
	void,
	{
		serverUrl: string;
		timesheet: Timesheet;
	}
>(
	'synchronization/synchronizeTimesheet',
	async ({serverUrl, timesheet}, {dispatch, getState}) => {
		if (
			resyncTimesheetRequests[timesheet.id] !== true &&
			selectIsTimesheetSyncRunning(timesheet.id)(getState())
		) {
			resyncTimesheetRequests[timesheet.id] = true;
			return;
		}

		let response: AxiosResponse<TimesheetFromApi>;
		dispatch(timesheetSynchronizationStarted(timesheet.id));
		try {
			if (selectIsTimesheetKnownToServer(timesheet.id)(getState())) {
				const remoteId = selectRemoteTimesheetId(timesheet.id)(getState());
				console.info(
					`Timesheet ${timesheet.id} is already known to server with remote ID ${remoteId}`,
				);
				response = await axios.patch(
					path.join(serverUrl, 'api/timesheets', remoteId.toString()),
					{
						begin: timesheet.begin,
						end: timesheet.end,
						project: timesheet.project,
						activity: timesheet.activity,
					},
				);
			} else {
				console.info(
					`Timesheet ${timesheet.id} is not yet known to server, so POST a new one`,
				);
				response = await axios.post(path.join(serverUrl, 'api/timesheets'), {
					begin: timesheet.begin,
					end: timesheet.end,
					project: timesheet.project,
					activity: timesheet.activity,
				});
			}

			dispatch(
				timesheetSynced({
					localId: timesheet.id,
					remoteId: response.data.id,
				}),
			);

			await dispatch(fetchTimesheets());
		} catch (error: any) {
			console.error(`Error while syncing sheet: ${error.toString()}`);
			dispatch(timesheetSyncFailed(timesheet.id));
		} finally {
			if (resyncTimesheetRequests[timesheet.id] === true) {
				delete resyncTimesheetRequests[timesheet.id];
				dispatch(synchronizeTimesheet({serverUrl, timesheet})).catch(
					console.error,
				);
			}
		}
	},
);
