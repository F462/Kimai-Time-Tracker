import {configureStore} from '@reduxjs/toolkit';

import {api} from 'src/features/account/utils/ApiClient';
import type {AppDispatch} from 'src/features/data/context/store';
import {
	settingsReducer,
	workContractHoursPerDaySet,
} from 'src/features/settings/context/settingsSlice';
import {synchronizeWorkContractHours} from 'src/features/settings/middleware/settingsThunks';
import {WorkContractHours} from 'src/features/settings/types';

jest.mock('src/features/account/utils/ApiClient', () => ({
	api: {get: jest.fn(), patch: jest.fn()},
	ApiClient: {getInstance: jest.fn()},
}));

const serverHours: WorkContractHours = {
	monday: 8,
	tuesday: 8,
	wednesday: 8,
	thursday: 4,
	friday: 8,
	saturday: 0,
	sunday: 0,
};

const configureTestStore = () =>
	configureStore({reducer: {settings: settingsReducer}});

type TestStore = Omit<ReturnType<typeof configureTestStore>, 'dispatch'> & {
	dispatch: AppDispatch;
};

describe('work-contract hours synchronization', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('loads configured server hours from the current user', async () => {
		(api.get as jest.Mock).mockResolvedValue({
			id: 42,
			preferences: [
				{name: 'work_monday', value: '28800'},
				{name: 'work_tuesday', value: '28800'},
				{name: 'work_wednesday', value: '28800'},
				{name: 'work_thursday', value: '14400'},
				{name: 'work_friday', value: '28800'},
			],
		});
		const store = configureTestStore() as TestStore;

		await store.dispatch(synchronizeWorkContractHours({direction: 'pull'}));

		expect(api.get).toHaveBeenCalledWith('api/users/me');
		expect(store.getState().settings.workContractHoursPerDay).toEqual(
			serverHours,
		);
		expect(api.patch).not.toHaveBeenCalled();
	});

	it('updates the configured server preference after a local change', async () => {
		(api.get as jest.Mock).mockResolvedValue({
			id: 42,
			preferences: [
				{name: 'work_monday', value: '28800'},
				{name: 'work_thursday', value: '14400'},
			],
		});
		const store = configureTestStore() as TestStore;
		store.dispatch(workContractHoursPerDaySet({day: 'monday', hours: 4}));
		const expectedHours = store.getState().settings.workContractHoursPerDay;

		await store.dispatch(synchronizeWorkContractHours({direction: 'push'}));

		expect(api.patch).toHaveBeenCalledWith('api/users/42/preferences', [
			{
				name: 'work_monday',
				value: String(expectedHours.monday * 3600),
			},
			{
				name: 'work_thursday',
				value: String(expectedHours.thursday * 3600),
			},
		]);
		expect(store.getState().settings.workContractHoursSyncPending).toBe(false);
	});

	it('keeps local changes pending after a failed request and clears them on retry', async () => {
		(api.get as jest.Mock)
			.mockRejectedValueOnce(new Error('offline'))
			.mockResolvedValueOnce({
				id: 42,
				preferences: [{name: 'work_monday', value: '28800'}],
			});
		(api.patch as jest.Mock).mockResolvedValue({});
		const store = configureTestStore() as TestStore;
		store.dispatch(workContractHoursPerDaySet({day: 'monday', hours: 4}));
		const logError = jest.spyOn(console, 'error').mockImplementation();

		await store.dispatch(synchronizeWorkContractHours({direction: 'push'}));

		expect(store.getState().settings.workContractHoursSyncPending).toBe(true);

		await store.dispatch(synchronizeWorkContractHours({direction: 'push'}));

		expect(api.patch).toHaveBeenCalledTimes(1);
		expect(store.getState().settings.workContractHoursSyncPending).toBe(false);
		logError.mockRestore();
	});

	it('does not overwrite a pending local schedule with a server pull', async () => {
		(api.get as jest.Mock).mockResolvedValue({
			id: 42,
			preferences: [{name: 'work_monday', value: '28800'}],
		});
		const store = configureTestStore() as TestStore;
		store.dispatch(workContractHoursPerDaySet({day: 'monday', hours: 4}));
		const localHours = store.getState().settings.workContractHoursPerDay;

		await store.dispatch(synchronizeWorkContractHours({direction: 'pull'}));

		expect(store.getState().settings.workContractHoursPerDay).toEqual(
			localHours,
		);
		expect(api.get).not.toHaveBeenCalled();
	});

	it('does not attempt to create a preference absent from the server', async () => {
		(api.get as jest.Mock).mockResolvedValue({
			id: 42,
			preferences: [{name: 'hourly_rate', value: '0'}],
		});
		const store = configureTestStore() as TestStore;

		await store.dispatch(synchronizeWorkContractHours({direction: 'push'}));

		expect(api.patch).not.toHaveBeenCalled();
	});
});
