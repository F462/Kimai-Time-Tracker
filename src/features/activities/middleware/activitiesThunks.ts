import {api} from 'src/features/account/utils/ApiClient';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {
	activitiesReceived,
	activityCreated,
	activityRemoved,
	activityUpdated,
} from '../context/activitiesSlice';
import {Activity} from '../types';

export type CreateActivityPayload = {
	name: string;
	number?: string | null;
	comment?: string | null;
	visible?: boolean;
	billable?: boolean;
};

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

export const updateActivity = createAppAsyncThunk(
	'activities/updateActivity',
	async (activity: Activity, {dispatch}) => {
		try {
			const response = await api.patch<Activity>(
				`api/activities/${activity.id.toString()}`,
				{
					name: activity.name,
					number: activity.number,
					comment: activity.comment,
					visible: activity.visible,
					billable: activity.billable,
				},
			);
			dispatch(activityUpdated(response));
		} catch (error: any) {
			console.warn(`Got error on update request: ${error.toString()}`);
		}
	},
);

export const createActivity = createAppAsyncThunk<
	Activity,
	CreateActivityPayload
>('activities/createActivity', async (payload, {dispatch}) => {
	const body: Record<string, unknown> = {
		name: payload.name,
	};

	if (payload.number !== undefined && payload.number !== null) {
		body.number = payload.number;
	}

	if (payload.comment !== undefined && payload.comment !== null) {
		body.comment = payload.comment;
	}

	body.visible = payload.visible ?? true;
	body.billable = payload.billable ?? true;

	const response = await api.post<Activity>('api/activities', body);

	dispatch(activityCreated(response));

	return response;
});
