import {configureStore} from '@reduxjs/toolkit';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import React from 'react';
import {Provider as PaperProvider} from 'react-native-paper';
import {Provider} from 'react-redux';

import {api} from 'src/features/account/utils/ApiClient';
import type {AppDispatch} from 'src/features/data/context/store';
import {screens} from 'src/features/navigation/screens';
import {UsersScreen} from 'src/features/users/components/UsersScreen';
import {usersReducer} from 'src/features/users/context/usersSlice';
import {User} from 'src/features/users/types';

jest.mock('src/features/users/components/UserModal', () => {
	const ReactRuntime = require('react');
	const ReactNative = require('react-native');
	return {
		UserModal: ({visible}: {visible: boolean}) =>
			visible
				? ReactRuntime.createElement(ReactNative.View, {testID: 'user-modal'})
				: null,
	};
});

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

jest.mock('react-native-localize', () => ({
	findBestLanguageTag: jest.fn(),
	getLocales: () => [{languageTag: 'en-US'}],
}));

const user: User = {
	id: 14,
	username: 'alex',
	email: 'alex@example.com',
	alias: 'Alex Example',
	enabled: true,
};

const makeStore = () => configureStore({reducer: {users: usersReducer}});
type TestStore = Omit<ReturnType<typeof makeStore>, 'dispatch'> & {
	dispatch: AppDispatch;
};

describe('UsersScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(api.get as jest.Mock).mockResolvedValue([user]);
	});

	it('is registered as a drawer screen', () => {
		expect(screens).toContainEqual(
			expect.objectContaining({name: 'Users', component: UsersScreen}),
		);
	});

	it('loads and displays users and opens the create-user modal', async () => {
		const store = makeStore() as TestStore;
		const view = render(
			<Provider store={store}>
				<PaperProvider>
					<UsersScreen />
				</PaperProvider>
			</Provider>,
		);

		await waitFor(() => expect(view.getByText('Alex Example')).toBeTruthy());
		expect(view.getByText('alex@example.com')).toBeTruthy();
		expect(api.get).toHaveBeenCalledWith('api/users?full=1');

		fireEvent.press(view.getByText('addUser'));
		expect(view.getByTestId('user-modal')).toBeTruthy();
	});
});
