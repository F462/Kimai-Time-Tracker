import axios from 'axios';
import path from 'path';

import {Timesheet} from 'src/features/timesheets/types';
import {activeTimesheetReceived} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {selectActiveTimesheetId} from '../context/activeTimesheetSelectors';
import {selectServerUrl} from 'src/features/account/context/accountSelectors';

export const fetchActiveTimesheet = createAppAsyncThunk(
	'timesheets/fetchActiveTimesheet',
	async (_, {dispatch, getState}) => {
		const serverUrl = selectServerUrl(getState());

		if (serverUrl === undefined) {
			throw Error('Server URL is undefined');
		}

		try {
			const response = await axios.get<Array<Timesheet>>(
				path.join(serverUrl, 'api/timesheets/active')
			);
			dispatch(activeTimesheetReceived(response.data[0]));
		} catch (error: any) {
			console.warn('Got error on axios request: ', error.toString());
		}
	}
);

export const startNewTimesheet = createAppAsyncThunk<
	void,
	{
		begin: string;
		project: number;
		activity: number;
	}
>('timesheets/startNewTimesheet', async (payload, {dispatch, getState}) => {
	const serverUrl = selectServerUrl(getState());

	if (serverUrl === undefined) {
		throw Error('Server URL is undefined');
	}

	try {
		await axios.post(path.join(serverUrl, 'api/timesheets'), payload);
		await dispatch(fetchActiveTimesheet());
	} catch (error: any) {
		console.warn('Got error on axios request: ', error.toString());
	}
});

export const stopActiveTimesheet = createAppAsyncThunk<void, void>(
	'timesheets/stopActiveTimesheet',
	async (_, {dispatch, getState}) => {
		const serverUrl = selectServerUrl(getState());

		if (serverUrl === undefined) {
			throw Error('Server URL is undefined');
		}

		const activeTimesheetId = selectActiveTimesheetId(getState());

		try {
			await axios.get(
				path.join(serverUrl, `api/timesheets/${activeTimesheetId}/stop`)
			);
			await dispatch(fetchActiveTimesheet());
		} catch (error: any) {
			console.warn('Got error on axios request: ', error.toString());
		}
	}
);
