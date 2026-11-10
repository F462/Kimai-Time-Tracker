import {configureStore, createListenerMiddleware} from '@reduxjs/toolkit';
import EncryptedStorage from 'react-native-encrypted-storage';

import {api} from 'src/features/account/utils/ApiClient';
import type {
	AppDispatch,
	AppStartListening,
} from 'src/features/data/context/store';
import {internetReachabilityChanged} from 'src/features/network/context/networkSlice';
import {synchronizationReducer} from 'src/features/synchronization/context/synchronizationSlice';
import {timesheetSyncFailed} from 'src/features/synchronization/context/synchronizationSlice';
import {startSynchronizationListeners} from 'src/features/synchronization/middleware/synchronizationListeners';
import {timesheetEdited} from 'src/features/timesheets/context/timesheetActions';
import {timesheetsReducer} from 'src/features/timesheets/context/timesheetsSlice';
import {userCreated, usersReducer} from 'src/features/users/context/usersSlice';
import {User} from 'src/features/users/types';

jest.mock('src/features/account/utils/ApiClient', () => ({
	api: {
		get: jest.fn(),
		post: jest.fn(),
		patch: jest.fn(),
		delete: jest.fn(),
		isConfigured: jest.fn(),
	},
	ApiClient: {getInstance: jest.fn()},
}));

jest.mock('react-native-encrypted-storage', () => ({
	__esModule: true,
	default: {
		getItem: jest.fn(),
		setItem: jest.fn(),
		removeItem: jest.fn(),
	},
}));

const makeUser = (id: number): User => ({
	id,
	username: 'alex',
	email: 'alex@example.com',
	language: 'en',
	locale: 'en_US',
	timezone: 'Europe/Berlin',
	enabled: true,
	roles: ['ROLE_USER'],
	teams: [],
	memberships: [],
	preferences: [],
});

const configureTestStore = (
	listenerMiddleware: ReturnType<typeof createListenerMiddleware>,
) =>
	configureStore({
		reducer: {
			users: usersReducer,
			timesheets: timesheetsReducer,
			synchronization: synchronizationReducer,
		},
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().prepend(listenerMiddleware.middleware),
	});

type TestStore = Omit<ReturnType<typeof configureTestStore>, 'dispatch'> & {
	dispatch: AppDispatch;
};

describe('synchronization reconnect listener', () => {
	it('retries failed timesheets and pending local users', async () => {
		jest.clearAllMocks();
		(api.isConfigured as jest.Mock).mockReturnValue(true);
		(api.get as jest.Mock).mockResolvedValue([]);
		(api.post as jest.Mock).mockImplementation((path: string) =>
			Promise.resolve(path === 'api/timesheets' ? {id: 42} : makeUser(42)),
		);
		(EncryptedStorage.getItem as jest.Mock).mockResolvedValue('local-password');
		(EncryptedStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

		const listenerMiddleware = createListenerMiddleware();
		const store = configureTestStore(listenerMiddleware) as TestStore;
		store.dispatch(
			timesheetEdited({
				id: 'local-timesheet',
				begin: '2026-03-01T08:00:00',
				project: 1,
				activity: 1,
			}),
		);
		store.dispatch(
			timesheetSyncFailed({id: 'local-timesheet', errorMessage: 'offline'}),
		);
		store.dispatch(userCreated(makeUser(-1)));
		startSynchronizationListeners(
			listenerMiddleware.startListening as AppStartListening,
		);

		store.dispatch(internetReachabilityChanged(true));
		await new Promise<void>((resolve) => setTimeout(resolve, 0));

		expect(api.post).toHaveBeenCalledWith(
			'api/timesheets',
			expect.objectContaining({project: 1, activity: 1}),
		);
		expect(api.post).toHaveBeenCalledWith(
			'api/users',
			expect.objectContaining({username: 'alex'}),
		);
		expect(EncryptedStorage.getItem).toHaveBeenCalledWith(
			'pending-user-password--1',
		);

		listenerMiddleware.clearListeners();
	});
});
