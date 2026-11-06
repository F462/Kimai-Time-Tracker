import {api} from 'src/features/account/utils/ApiClient';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {
	activitiesReceived,
	activityCreated,
	activityRemoved,
	activitySynced,
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

const createActivityBody = (payload: CreateActivityPayload) => {
	const body: Record<string, unknown> = {
		name: payload.name,
		visible: payload.visible ?? true,
		billable: payload.billable ?? true,
	};

	if (payload.number !== undefined && payload.number !== null) {
		body.number = payload.number;
	}

	if (payload.comment !== undefined && payload.comment !== null) {
		body.comment = payload.comment;
	}

	return body;
};

const createLocalActivity = (
	payload: CreateActivityPayload,
	activities: {[id: number]: Activity},
): Activity => {
	const localIds = Object.keys(activities)
		.map(Number)
		.filter((id) => Number.isInteger(id) && id < 0);
	const id = localIds.length > 0 ? Math.min(...localIds) - 1 : -1;

	return {
		id,
		name: payload.name,
		number: payload.number ?? null,
		comment: payload.comment ?? null,
		visible: payload.visible ?? true,
		billable: payload.billable ?? true,
		currency: '',
		metaFields: [],
		teams: [],
		color: null,
	};
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
		if (activityId < 0) {
			dispatch(activityRemoved(activityId));
			return;
		}

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
		if (activity.id < 0) {
			dispatch(activityUpdated(activity));
			return;
		}

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
>('activities/createActivity', async (payload, {dispatch, getState}) => {
	const saveLocally = () => {
		const activity = createLocalActivity(
			payload,
			getState().activities.activities,
		);
		dispatch(activityCreated(activity));
		return activity;
	};

	if (!api.isConfigured()) {
		return saveLocally();
	}

	try {
		const response = await api.post<Activity>(
			'api/activities',
			createActivityBody(payload),
		);
		dispatch(activityCreated(response));
		return response;
	} catch (error: any) {
		if (error?.status === undefined) {
			return saveLocally();
		}
		throw error;
	}
});

export const synchronizeLocalActivities = createAppAsyncThunk(
	'activities/synchronizeLocalActivities',
	async (_, {dispatch, getState}) => {
		if (!api.isConfigured()) {
			return;
		}

		const localActivities = Object.values(getState().activities.activities)
			.filter((activity) => activity.id < 0)
			.sort((first, second) => first.id - second.id);

		for (const activity of localActivities) {
			try {
				const response = await api.post<Activity>(
					'api/activities',
					createActivityBody(activity),
				);
				dispatch(activitySynced({localId: activity.id, activity: response}));
			} catch (error: any) {
				console.warn(
					`Could not synchronize local activity: ${error.toString()}`,
				);
			}
		}
	},
);
