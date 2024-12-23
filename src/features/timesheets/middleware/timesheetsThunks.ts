import axios from 'axios';
import path from 'path';

import {
	activeTimesheetReceived,
	timesheetsReceived
} from '../context/timesheetsSlice';
import {Timesheet} from '../types';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {selectServerUrl} from 'src/features/account/context/accountSelectors';

export const fetchTimesheets = createAppAsyncThunk(
	'timesheets/fetchTimesheets',
	async (_, {dispatch, getState}) => {
		const serverUrl = selectServerUrl(getState());

		if (serverUrl === undefined) {
			throw Error('Server URL is undefined');
		}

		try {
			const response = await axios.get<Array<Timesheet>>(
				path.join(serverUrl, 'api/timesheets')
			);
			dispatch(timesheetsReceived(response.data));
		} catch (error: any) {
			console.warn('Got error on axios request: ', error.toString());
		}
	}
);

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
