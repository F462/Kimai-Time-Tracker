import {Activity} from '../types';
import {activitiesReceived} from '../context/activitiesSlice';
import {api} from 'src/features/account/utils/ApiClient';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';

export const fetchActivities = createAppAsyncThunk(
	'activities/fetchActivities',
	async (_, {dispatch}) => {
		try {
			const response = await api.get<Array<Activity>>('api/activities');
			dispatch(activitiesReceived(response));
		} catch (error: any) {
			console.warn(`Got error on axios request: ${error.toString()}`);
		}
	},
);
