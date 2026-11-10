import {configureStore} from '@reduxjs/toolkit';

import {api} from 'src/features/account/utils/ApiClient';
import type {AppDispatch} from 'src/features/data/context/store';
import {
	usersReceived,
	usersReducer,
} from 'src/features/users/context/usersSlice';
import {
	createUser,
	fetchUsers,
	updateUser,
} from 'src/features/users/middleware/usersThunks';
import {User} from 'src/features/users/types';

jest.mock('src/features/account/utils/ApiClient', () => ({
	api: {
		get: jest.fn(),
		post: jest.fn(),
		patch: jest.fn(),
		isConfigured: jest.fn(),
	},
	ApiClient: {getInstance: jest.fn()},
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
			updateUser({id: user.id, alias: user.alias, enabled: true}),
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
