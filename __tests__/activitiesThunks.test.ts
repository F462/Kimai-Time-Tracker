import {configureStore} from '@reduxjs/toolkit';

import {api} from 'src/features/account/utils/ApiClient';
import {
	activitiesReceived,
	activitiesReducer,
	activityCreated,
} from 'src/features/activities/context/activitiesSlice';
import {
	createActivity,
	removeActivity,
	synchronizeLocalActivities,
	updateActivity,
} from 'src/features/activities/middleware/activitiesThunks';
import {Activity} from 'src/features/activities/types';
import type {AppDispatch} from 'src/features/data/context/store';
import {
	timesheetsReducer,
	timesheetsUpdated,
} from 'src/features/timesheets/context/timesheetsSlice';

jest.mock('src/features/account/utils/ApiClient', () => ({
	api: {
		isConfigured: jest.fn(),
		post: jest.fn(),
		patch: jest.fn(),
		delete: jest.fn(),
	},
	ApiClient: {getInstance: jest.fn()},
}));

const configureTestStore = () =>
	configureStore({
		reducer: {
			activities: activitiesReducer,
			timesheets: timesheetsReducer,
		},
	});

type TestStore = Omit<ReturnType<typeof configureTestStore>, 'dispatch'> & {
	dispatch: AppDispatch;
};

const makeActivity = (id: number, name: string): Activity => ({
	id,
	name,
	number: null,
	comment: null,
	visible: true,
	billable: true,
	currency: '',
	metaFields: [],
	teams: [],
	color: null,
});

describe('createActivity', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(api.isConfigured as jest.Mock).mockReturnValue(false);
	});

	it('creates and stores a local activity when the API is not configured', async () => {
		const store = configureTestStore() as TestStore;

		const result = await store.dispatch(
			createActivity({name: 'Local activity'}),
		);

		expect(createActivity.fulfilled.match(result)).toBe(true);
		expect(result.payload).toMatchObject({id: -1, name: 'Local activity'});
		expect(store.getState().activities.activities[-1]).toEqual(result.payload);
		expect(api.post).not.toHaveBeenCalled();
	});

	it('falls back to a local activity when the request fails offline', async () => {
		(api.isConfigured as jest.Mock).mockReturnValue(true);
		(api.post as jest.Mock).mockRejectedValue(
			new TypeError('Network request failed'),
		);
		const store = configureTestStore() as TestStore;

		const result = await store.dispatch(
			createActivity({name: 'Offline activity'}),
		);

		expect(createActivity.fulfilled.match(result)).toBe(true);
		expect(result.payload).toMatchObject({id: -1, name: 'Offline activity'});
		expect(store.getState().activities.activities[-1]).toEqual(result.payload);
	});

	it('keeps unsynced local activities when server activities are received', () => {
		const store = configureTestStore() as TestStore;
		const localActivity = makeActivity(-1, 'Local activity');

		store.dispatch(activityCreated(localActivity));
		store.dispatch(activitiesReceived([makeActivity(3, 'Server activity')]));

		expect(store.getState().activities.activities[-1]).toEqual(localActivity);
		expect(store.getState().activities.activities[3].name).toBe(
			'Server activity',
		);
	});

	it('edits and removes local activities without contacting the API', async () => {
		const store = configureTestStore() as TestStore;
		const localActivity = makeActivity(-1, 'Local activity');
		const editedActivity = {...localActivity, name: 'Updated locally'};

		store.dispatch(activityCreated(localActivity));
		await store.dispatch(updateActivity(editedActivity));
		expect(store.getState().activities.activities[-1]).toEqual(editedActivity);

		await store.dispatch(removeActivity(-1));
		expect(store.getState().activities.activities[-1]).toBeUndefined();
		expect(api.patch).not.toHaveBeenCalled();
		expect(api.delete).not.toHaveBeenCalled();
	});

	it('synchronizes local activities and remaps timesheet references', async () => {
		(api.isConfigured as jest.Mock).mockReturnValue(true);
		const store = configureTestStore() as TestStore;
		const localActivity = makeActivity(-1, 'Local activity');
		const remoteActivity = makeActivity(17, 'Local activity');

		store.dispatch(activityCreated(localActivity));
		store.dispatch(
			timesheetsUpdated({
				timesheets: {
					localTimesheet: {id: 'localTimesheet', activity: -1},
				},
				newTimesheetsIdTable: {},
			}),
		);
		(api.post as jest.Mock).mockResolvedValue(remoteActivity);

		await store.dispatch(synchronizeLocalActivities());

		expect(api.post).toHaveBeenCalledWith('api/activities', {
			name: 'Local activity',
			visible: true,
			billable: true,
		});
		expect(store.getState().activities.activities[-1]).toBeUndefined();
		expect(store.getState().activities.activities[17]).toEqual(remoteActivity);
		expect(store.getState().timesheets.timesheets.localTimesheet.activity).toBe(
			17,
		);
	});
});
