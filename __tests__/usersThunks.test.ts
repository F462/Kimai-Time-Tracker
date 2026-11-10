import {configureStore} from '@reduxjs/toolkit';
import EncryptedStorage from 'react-native-encrypted-storage';

import {api} from 'src/features/account/utils/ApiClient';
import type {AppDispatch} from 'src/features/data/context/store';
import {
	usersReceived,
	usersReducer,
} from 'src/features/users/context/usersSlice';
import {
	createUser,
	fetchUsers,
	synchronizeLocalUsers,
	updateUser,
} from 'src/features/users/middleware/usersThunks';
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

const makeUser = (): User => ({
	id: 14,
	username: 'alex',
	email: 'alex@example.com',
	alias: 'Alex Example',
	language: 'en',
	locale: 'en_US',
	timezone: 'Europe/Berlin',
	enabled: true,
	roles: ['ROLE_USER'],
	teams: [],
	memberships: [],
	preferences: [],
});

const configureTestStore = () =>
	configureStore({reducer: {users: usersReducer}});

type TestStore = Omit<ReturnType<typeof configureTestStore>, 'dispatch'> & {
	dispatch: AppDispatch;
};

describe('user thunks', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(api.isConfigured as jest.Mock).mockReturnValue(true);
		(EncryptedStorage.getItem as jest.Mock).mockResolvedValue(null);
		(EncryptedStorage.setItem as jest.Mock).mockResolvedValue(undefined);
		(EncryptedStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
	});

	it('fetches full users and indexes them by id', async () => {
		const user = makeUser();
		(api.get as jest.Mock).mockResolvedValue([user]);
		const store = configureTestStore() as TestStore;

		await store.dispatch(fetchUsers());

		expect(api.get).toHaveBeenCalledWith('api/users?full=1');
		expect(store.getState().users.users[user.id]).toEqual(user);
	});

	it('creates and stores a user without keeping the submitted password', async () => {
		const user = makeUser();
		(api.post as jest.Mock).mockResolvedValue(user);
		const store = configureTestStore() as TestStore;
		const payload = {
			username: user.username,
			email: user.email,
			plainPassword: 'a-temporary-password',
			language: 'en',
			locale: 'en_US',
			timezone: 'Europe/Berlin',
			alias: user.alias ?? undefined,
			roles: ['ROLE_USER'],
			enabled: true,
		};

		await store.dispatch(createUser(payload));

		expect(api.post).toHaveBeenCalledWith('api/users', payload);
		expect(store.getState().users.users[user.id]).toEqual(user);
		expect(JSON.stringify(store.getState().users)).not.toContain(
			'a-temporary-password',
		);
	});

	it('creates a local user when no backend is configured', async () => {
		const store = configureTestStore() as TestStore;
		(api.isConfigured as jest.Mock).mockReturnValue(false);

		const user = await store
			.dispatch(
				createUser({
					username: 'offline-user',
					email: 'offline@example.com',
					plainPassword: 'local-password',
					language: 'en',
					locale: 'en_US',
					timezone: 'Europe/Berlin',
				}),
			)
			.unwrap();

		expect(api.post).not.toHaveBeenCalled();
		expect(user.id).toBeLessThan(0);
		expect(store.getState().users.users[user.id].username).toBe('offline-user');
		expect(JSON.stringify(store.getState().users)).not.toContain(
			'local-password',
		);
	});

	it('synchronizes a local user using its encrypted password', async () => {
		const store = configureTestStore() as TestStore;
		(api.isConfigured as jest.Mock).mockReturnValue(false);
		const localUser = await store
			.dispatch(
				createUser({
					username: 'offline-user',
					email: 'offline@example.com',
					plainPassword: 'local-password',
					language: 'en',
					locale: 'en_US',
					timezone: 'Europe/Berlin',
				}),
			)
			.unwrap();
		const syncedUser = {...makeUser(), id: 25, username: 'offline-user'};
		(api.isConfigured as jest.Mock).mockReturnValue(true);
		(EncryptedStorage.getItem as jest.Mock).mockResolvedValue('local-password');
		(api.post as jest.Mock).mockResolvedValue(syncedUser);

		await store.dispatch(synchronizeLocalUsers());

		expect(api.post).toHaveBeenCalledWith(
			'api/users',
			expect.objectContaining({plainPassword: 'local-password'}),
		);
		expect(store.getState().users.users[localUser.id]).toBeUndefined();
		expect(store.getState().users.users[syncedUser.id]).toEqual(syncedUser);
		expect(EncryptedStorage.removeItem).toHaveBeenCalled();
	});

	it('patches user fields and stores the updated user', async () => {
		const user = makeUser();
		(api.patch as jest.Mock).mockResolvedValue(user);
		(api.get as jest.Mock).mockResolvedValue({id: user.id + 1});
		const store = configureTestStore() as TestStore;
		store.dispatch(usersReceived([{...user, alias: 'Old name'}]));

		await store.dispatch(
			updateUser({id: user.id, alias: 'Alex Example', enabled: false}),
		);

		expect(api.patch).toHaveBeenCalledWith(`api/users/${user.id}`, {
			alias: 'Alex Example',
			enabled: false,
		});
		expect(store.getState().users.users[user.id]).toEqual(user);
	});

	it('omits enabled when patching the currently authenticated user', async () => {
		const user = makeUser();
		(api.get as jest.Mock).mockResolvedValue({id: user.id});
		(api.patch as jest.Mock).mockResolvedValue(user);
		const store = configureTestStore() as TestStore;

		await store.dispatch(
			updateUser({id: user.id, alias: user.alias ?? undefined, enabled: true}),
		);

		expect(api.patch).toHaveBeenCalledWith(`api/users/${user.id}`, {
			alias: user.alias,
		});
	});

	it('preserves a null color when patching a user without a selected color', async () => {
		const user = makeUser();
		(api.patch as jest.Mock).mockResolvedValue(user);
		const store = configureTestStore() as TestStore;

		await store.dispatch(updateUser({id: user.id, color: null}));

		expect(api.patch).toHaveBeenCalledWith(`api/users/${user.id}`, {
			color: null,
		});
	});

	it('updates a user locally and queues the change when offline', async () => {
		const user = makeUser();
		const store = configureTestStore() as TestStore;
		store.dispatch(usersReceived([user]));
		(api.isConfigured as jest.Mock).mockReturnValue(false);

		await store.dispatch(updateUser({id: user.id, alias: 'Offline edit'}));

		expect(api.patch).not.toHaveBeenCalled();
		expect(store.getState().users.users[user.id].alias).toBe('Offline edit');
		expect(store.getState().users.pendingUpdates[user.id].changes).toEqual({
			alias: 'Offline edit',
		});
	});

	it('synchronizes a queued user edit and clears its pending state', async () => {
		const user = makeUser();
		const store = configureTestStore() as TestStore;
		store.dispatch(usersReceived([user]));
		(api.isConfigured as jest.Mock).mockReturnValue(false);
		await store.dispatch(updateUser({id: user.id, alias: 'Offline edit'}));
		(api.isConfigured as jest.Mock).mockReturnValue(true);
		(api.get as jest.Mock).mockResolvedValue(user);
		(api.patch as jest.Mock).mockResolvedValue({
			...user,
			alias: 'Offline edit',
		});

		await store.dispatch(synchronizeLocalUsers());

		expect(api.patch).toHaveBeenCalledWith(`api/users/${user.id}`, {
			alias: 'Offline edit',
		});
		expect(store.getState().users.pendingUpdates[user.id]).toBeUndefined();
	});

	it('omits enabled when synchronizing a queued edit for the current user', async () => {
		const user = makeUser();
		const store = configureTestStore() as TestStore;
		store.dispatch(usersReceived([user]));
		(api.isConfigured as jest.Mock).mockReturnValue(false);
		await store.dispatch(
			updateUser({id: user.id, alias: 'Offline edit', enabled: false}),
		);
		(api.isConfigured as jest.Mock).mockReturnValue(true);
		(api.get as jest.Mock)
			.mockResolvedValueOnce(user)
			.mockResolvedValueOnce({id: user.id});
		(api.patch as jest.Mock).mockResolvedValue({
			...user,
			alias: 'Offline edit',
		});

		await store.dispatch(synchronizeLocalUsers());

		expect(api.patch).toHaveBeenCalledWith(`api/users/${user.id}`, {
			alias: 'Offline edit',
		});
	});

	it('discards queued fields that the server changed since the edit', async () => {
		const user = makeUser();
		const store = configureTestStore() as TestStore;
		store.dispatch(usersReceived([user]));
		(api.isConfigured as jest.Mock).mockReturnValue(false);
		await store.dispatch(updateUser({id: user.id, alias: 'Client alias'}));
		(api.isConfigured as jest.Mock).mockReturnValue(true);
		const serverUser = {...user, alias: 'Server alias'};
		(api.get as jest.Mock).mockResolvedValue(serverUser);

		await store.dispatch(synchronizeLocalUsers());

		expect(api.patch).not.toHaveBeenCalled();
		expect(store.getState().users.users[user.id].alias).toBe('Server alias');
		expect(store.getState().users.pendingUpdates[user.id]).toBeUndefined();
	});

	it('syncs non-conflicting fields and keeps server-changed fields', async () => {
		const user = makeUser();
		const store = configureTestStore() as TestStore;
		store.dispatch(usersReceived([user]));
		(api.isConfigured as jest.Mock).mockReturnValue(false);
		await store.dispatch(
			updateUser({id: user.id, alias: 'Client alias', title: 'Client title'}),
		);
		(api.isConfigured as jest.Mock).mockReturnValue(true);
		const serverUser = {...user, alias: 'Server alias'};
		(api.get as jest.Mock).mockResolvedValue(serverUser);
		(api.patch as jest.Mock).mockResolvedValue({
			...serverUser,
			title: 'Client title',
		});

		await store.dispatch(synchronizeLocalUsers());

		expect(api.patch).toHaveBeenCalledWith(`api/users/${user.id}`, {
			title: 'Client title',
		});
		expect(store.getState().users.users[user.id]).toMatchObject({
			alias: 'Server alias',
			title: 'Client title',
		});
	});

	it('assigns selected teams through the team membership endpoint', async () => {
		const user = makeUser();
		(api.post as jest.Mock)
			.mockResolvedValueOnce(user)
			.mockResolvedValueOnce({});
		(api.get as jest.Mock).mockResolvedValue([user]);
		const store = configureTestStore() as TestStore;

		await store.dispatch(
			createUser({
				username: user.username,
				email: user.email,
				plainPassword: 'a-temporary-password',
				language: 'en',
				locale: 'en_US',
				timezone: 'Europe/Berlin',
				teams: [3],
			}),
		);

		expect(api.post).toHaveBeenNthCalledWith(1, 'api/users', {
			username: user.username,
			email: user.email,
			plainPassword: 'a-temporary-password',
			language: 'en',
			locale: 'en_US',
			timezone: 'Europe/Berlin',
		});
		expect((api.post as jest.Mock).mock.calls[1][0]).toBe(
			'api/teams/3/members/14',
		);
		expect(api.get).toHaveBeenCalledWith('api/users?full=1');
	});
});
