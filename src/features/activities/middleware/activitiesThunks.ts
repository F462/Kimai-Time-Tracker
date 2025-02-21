import {FileLogger} from 'react-native-file-logger';
import axios from 'axios';
import path from 'path';

import {Activity} from '../types';
import {activitiesReceived} from '../context/activitiesSlice';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {selectServerUrl} from 'src/features/account/context/accountSelectors';

export const fetchActivities = createAppAsyncThunk(
	'activities/fetchActivities',
	async (_, {dispatch, getState}) => {
		const serverUrl = selectServerUrl(getState());

		if (serverUrl === undefined) {
			throw Error('Server URL is undefined');
		}

		try {
			const response = await axios.get<Array<Activity>>(
				path.join(serverUrl, 'api/activities')
			);
			dispatch(activitiesReceived(response.data));
		} catch (error: any) {
			FileLogger.warn(`Got error on axios request: ${error.toString()}`);
		}
	}
);
