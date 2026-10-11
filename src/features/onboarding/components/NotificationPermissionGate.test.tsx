import {configureStore} from '@reduxjs/toolkit';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import React from 'react';
import {Platform} from 'react-native';
import type {NotificationSettings} from 'react-native-notify-kit';
import notifications, {AuthorizationStatus} from 'react-native-notify-kit';
import {Text} from 'react-native-paper';
import {Provider} from 'react-redux';

import {onboardingReducer} from 'src/features/onboarding/context/onboardingSlice';
import {NotificationPermissionGate} from './NotificationPermissionGate';

const getNotificationSettings = jest.mocked(
	notifications.getNotificationSettings,
);
const requestPermission = jest.mocked(notifications.requestPermission);

const makeSettings = (authorizationStatus: AuthorizationStatus) =>
	({authorizationStatus}) as NotificationSettings;

const renderGate = () => {
	const store = configureStore({reducer: {onboarding: onboardingReducer}});
	const result = render(
		<Provider store={store}>
			<NotificationPermissionGate>
				<Text>App content</Text>
			</NotificationPermissionGate>
		</Provider>,
	);
	return {...result, store};
};

beforeEach(() => {
	Object.defineProperty(Platform, 'OS', {configurable: true, value: 'android'});
	jest.clearAllMocks();
	getNotificationSettings.mockResolvedValue(
		makeSettings(AuthorizationStatus.NOT_DETERMINED),
	);
	requestPermission.mockResolvedValue(
		makeSettings(AuthorizationStatus.AUTHORIZED),
	);
});

test('requests permission from an explanatory screen on first launch', async () => {
	const {getByText, queryByText} = renderGate();

	await waitFor(() =>
		expect(getByText('onboarding.notificationsTitle')).toBeTruthy(),
	);
	expect(getByText('onboarding.allowNotifications')).toBeTruthy();
	expect(queryByText('onboarding.notificationsDenied')).toBeNull();

	fireEvent.press(getByText('onboarding.allowNotifications'));

	await waitFor(() => expect(getByText('App content')).toBeTruthy());
	expect(requestPermission).toHaveBeenCalledTimes(1);
});

test('offers system settings when notification permission was already denied', async () => {
	getNotificationSettings.mockResolvedValue(
		makeSettings(AuthorizationStatus.DENIED),
	);

	const {getByText} = renderGate();

	await waitFor(() =>
		expect(getByText('onboarding.notificationsDenied')).toBeTruthy(),
	);
	expect(getByText('onboarding.openNotificationSettings')).toBeTruthy();
	expect(Platform.OS).toBe('android');
});

test('continues without requesting permission and remembers the choice', async () => {
	const {getByText, store} = renderGate();

	await waitFor(() =>
		expect(getByText('onboarding.notificationsTitle')).toBeTruthy(),
	);
	fireEvent.press(getByText('onboarding.continueWithoutNotifications'));

	await waitFor(() => expect(getByText('App content')).toBeTruthy());
	expect(requestPermission).not.toHaveBeenCalled();
	expect(store.getState().onboarding.hasSkippedNotificationPermission).toBe(
		true,
	);
});
