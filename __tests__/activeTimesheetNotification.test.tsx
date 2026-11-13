import {configureStore} from '@reduxjs/toolkit';
import {render, waitFor} from '@testing-library/react-native';
import dayjs from 'dayjs';
import React from 'react';
import notifications from 'react-native-notify-kit';
import {Provider} from 'react-redux';

import {ActiveTimesheetNotificationIntegration} from 'src/features/activeTimesheet/components/ActiveTimesheetNotificationIntegration';
import {
	activeTimesheetReducer,
	newTimesheetStarted,
	timesheetStopped,
} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {
	activitiesReducer,
	activityCreated,
} from 'src/features/activities/context/activitiesSlice';
import {
	projectCreated,
	projectsReducer,
} from 'src/features/projects/context/projectsSlice';
import {
	activeTimesheetNotificationEnabledSet,
	settingsReducer,
} from 'src/features/settings/context/settingsSlice';
import {timesheetsReducer} from 'src/features/timesheets/context/timesheetsSlice';

const getDisplayNotification = jest.mocked(notifications.displayNotification);
const getCancelNotification = jest.mocked(notifications.cancelNotification);

const makeStore = () =>
	configureStore({
		reducer: {
			activeTimesheet: activeTimesheetReducer,
			timesheets: timesheetsReducer,
			settings: settingsReducer,
			projects: projectsReducer,
			activities: activitiesReducer,
		},
	});

const startTimesheet = (
	store: ReturnType<typeof makeStore>,
	begin = dayjs().toISOString(),
) =>
	store.dispatch(
		newTimesheetStarted({
			id: 'ts-1',
			project: 1,
			activity: 2,
			begin,
		}),
	);

const expectDisplayed = (extra: Record<string, unknown> = {}) =>
	expect(getDisplayNotification).toHaveBeenCalledWith(
		expect.objectContaining({
			id: 'active-timesheet-running',
			...extra,
		}),
	);

describe('ActiveTimesheetNotificationIntegration', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('displays a notification while a timesheet is running', async () => {
		const store = makeStore();
		startTimesheet(store);

		render(
			<Provider store={store}>
				<ActiveTimesheetNotificationIntegration />
			</Provider>,
		);

		await waitFor(() => {
			expectDisplayed();
		});
	});

	it('does not display a notification when no timesheet is running', async () => {
		const store = makeStore();

		render(
			<Provider store={store}>
				<ActiveTimesheetNotificationIntegration />
			</Provider>,
		);

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(getDisplayNotification).not.toHaveBeenCalled();
	});

	it('uses the activity and project names as the title when available', async () => {
		const store = makeStore();
		store.dispatch(
			activityCreated({
				id: 2,
				name: 'Development',
				number: null,
				comment: null,
				visible: true,
				billable: true,
				currency: 'EUR',
				metaFields: [],
				teams: [],
				color: null,
				project: 1,
			}),
		);
		store.dispatch(
			projectCreated({
				id: 1,
				name: 'Website',
				parentTitle: 'Customer',
				customer: 3,
				start: null,
				end: null,
				lockedUntil: null,
				comment: null,
				visible: true,
				billable: true,
				globalActivities: false,
				number: '1',
				color: null,
				metaFields: [],
				teams: [],
			}),
		);
		startTimesheet(store);

		render(
			<Provider store={store}>
				<ActiveTimesheetNotificationIntegration />
			</Provider>,
		);

		await waitFor(() => {
			expectDisplayed({title: 'Development · Website'});
		});
	});

	it('cancels the notification once the timesheet has been stopped', async () => {
		const store = makeStore();
		startTimesheet(store);

		const {unmount} = render(
			<Provider store={store}>
				<ActiveTimesheetNotificationIntegration />
			</Provider>,
		);

		await waitFor(() => {
			expectDisplayed();
		});

		jest.clearAllMocks();
		store.dispatch(timesheetStopped('ts-1'));

		await waitFor(() => {
			expect(getCancelNotification).toHaveBeenCalledWith(
				'active-timesheet-running',
			);
		});

		unmount();
	});

	it('does not show a notification when the feature is disabled', async () => {
		const store = makeStore();
		store.dispatch(activeTimesheetNotificationEnabledSet(false));
		startTimesheet(store);

		render(
			<Provider store={store}>
				<ActiveTimesheetNotificationIntegration />
			</Provider>,
		);

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(getDisplayNotification).not.toHaveBeenCalled();
		expect(getCancelNotification).toHaveBeenCalledWith(
			'active-timesheet-running',
		);
	});
});
