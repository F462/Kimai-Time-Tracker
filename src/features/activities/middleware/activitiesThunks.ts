import {api} from 'src/features/account/utils/ApiClient';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {activitiesReceived, activityRemoved} from '../context/activitiesSlice';
import {Activity} from '../types';

export const fetchActivities = createAppAsyncThunk(
	'activities/fetchActivities',
	async (_, {dispatch}) => {
		try {
			const response = await api.get<Array<Activity>>('api/activities');
			dispatch(activitiesReceived(response));
		} catch (error: any) {
			console.warn(`Got error on fetch request: ${error.toString()}`);
		}
	},
);

export const removeActivity = createAppAsyncThunk<void, number>(
	'activities/removeActivity',
	async (activityId, {dispatch}) => {
		try {
			await api.delete(`api/activities/${activityId.toString()}`);
			dispatch(activityRemoved(activityId));
		} catch (error: any) {
			console.warn(`Got error on delete request: ${error.toString()}`);
		}
	},
);
