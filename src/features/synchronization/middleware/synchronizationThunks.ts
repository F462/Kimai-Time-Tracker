import axios, {AxiosResponse} from 'axios';
import path from 'path';

import {Timesheet, TimesheetFromApi} from 'src/features/timesheets/types';
import {
	selectIsTimesheetKnownToServer,
	selectRemoteTimesheetId
} from 'src/features/timesheets/context/timesheetsSelectors';
import {
	timesheetSynced,
	timesheetSynchronizationStarted
} from '../context/synchronizationSlice';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';

export const synchronizeTimesheet = createAppAsyncThunk<
	void,
	{
		serverUrl: string;
		timesheet: Timesheet;
	}
>(
	'synchronization/synchronizeTimesheet',
	async ({serverUrl, timesheet}, {dispatch, getState}) => {
		let response: AxiosResponse<TimesheetFromApi>;
		dispatch(timesheetSynchronizationStarted(timesheet.id));
		if (selectIsTimesheetKnownToServer(timesheet.id)(getState())) {
			const remoteId = selectRemoteTimesheetId(timesheet.id)(getState());
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

		dispatch(
			timesheetSynced({
				localId: timesheet.id,
				remoteId: response.data.id
			})
		);
	}
);
