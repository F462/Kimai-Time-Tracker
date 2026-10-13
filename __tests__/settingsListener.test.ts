import {configureStore, createListenerMiddleware} from '@reduxjs/toolkit';

import {api} from 'src/features/account/utils/ApiClient';
import type {
	AppDispatch,
	AppStartListening,
} from 'src/features/data/context/store';
import {
	internetReachabilityChanged,
	networkReducer,
} from 'src/features/network/context/networkSlice';
import {
	settingsReducer,
	workContractHoursPerDaySet,
} from 'src/features/settings/context/settingsSlice';
import {startSettingsListeners} from 'src/features/settings/middleware/settingsListener';

jest.mock('src/features/account/utils/ApiClient', () => ({
	api: {get: jest.fn(), patch: jest.fn()},
	ApiClient: {getInstance: jest.fn()},
}));

const configureTestStore = (
	listenerMiddleware: ReturnType<typeof createListenerMiddleware>,
) =>
	configureStore({
		reducer: {settings: settingsReducer, network: networkReducer},
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().prepend(listenerMiddleware.middleware),
	});

type TestStore = Omit<ReturnType<typeof configureTestStore>, 'dispatch'> & {
	dispatch: AppDispatch;
};

describe('settings synchronization listener', () => {
	it('retries pending hours when internet becomes reachable', async () => {
		const listenerMiddleware = createListenerMiddleware();
		startSettingsListeners(
			listenerMiddleware.startListening as AppStartListening,
		);
		const store = configureTestStore(listenerMiddleware) as TestStore;
		(api.get as jest.Mock)
			.mockRejectedValueOnce(new Error('offline'))
			.mockResolvedValueOnce({
				id: 42,
				preferences: [{name: 'work_monday', value: '28800'}],
			});
		(api.patch as jest.Mock).mockResolvedValue({});
		const logError = jest.spyOn(console, 'error').mockImplementation();

		store.dispatch(workContractHoursPerDaySet({day: 'monday', hours: 4}));
		await new Promise<void>((resolve) => setTimeout(resolve, 0));

		expect(store.getState().settings.workContractHoursSyncPending).toBe(true);

		store.dispatch(internetReachabilityChanged(true));
		await new Promise<void>((resolve) => setTimeout(resolve, 0));

		expect(api.patch).toHaveBeenCalledTimes(1);
		expect(store.getState().settings.workContractHoursSyncPending).toBe(false);

		listenerMiddleware.clearListeners();
		logError.mockRestore();
	});
});
