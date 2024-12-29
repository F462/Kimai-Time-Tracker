import axios from 'axios';
import path from 'path';

import {Timesheet} from '../types';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {selectServerUrl} from 'src/features/account/context/accountSelectors';
import {timesheetsReceived} from '../context/timesheetsSlice';

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
