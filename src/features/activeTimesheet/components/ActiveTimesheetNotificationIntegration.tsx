import dayjs from 'dayjs';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform} from 'react-native';
import notifications, {AndroidImportance} from 'react-native-notify-kit';

import {selectActivityName} from 'src/features/activities/context/activitiesSelectors';
import {useAppSelector} from 'src/features/data/context/store';
import {
	formatDurationInSeconds,
	getTimesheetDurationInSeconds,
	getWorkingHoursInSeconds,
} from 'src/features/overview/utils/overviewUtils';
import {selectProjectName} from 'src/features/projects/context/projectsSelectors';
import {selectIsActiveTimesheetNotificationEnabled} from 'src/features/settings/context/settingsSelectors';
import {
	selectActiveTimesheet,
	selectTimesheetListOfCurrentDay,
} from 'src/features/timesheets/context/timesheetsSelectors';

const NOTIFICATION_CHANNEL_ID = 'active-timesheet';
const NOTIFICATION_ID = 'active-timesheet-running';

// The durations in the notification body are shown with minute granularity, so
// there is no point updating more often than every half minute.
const UPDATE_INTERVAL_MS = 30 * 1000;

/**
 * Keeps a persistent system-tray notification visible while a timesheet is
 * running. The notification shows the duration of the current timesheet as
 * well as the overall time of the current workday, and is refreshed regularly
 * so the durations stay up to date.
 *
 * The notification is only updated while the app is running (JavaScript is
 * suspended in the background); the last shown value is kept until the
 * timesheet stops, at which point the notification is removed.
 */
export const ActiveTimesheetNotificationIntegration = () => {
	const {t} = useTranslation();
	const activeTimesheet = useAppSelector(selectActiveTimesheet);
	const timesheets = useAppSelector(selectTimesheetListOfCurrentDay);
	const isEnabled = useAppSelector(selectIsActiveTimesheetNotificationEnabled);
	const projectName = useAppSelector(
		selectProjectName(activeTimesheet?.project),
	);
	const activityName = useAppSelector(
		selectActivityName(activeTimesheet?.activity),
	);

	useEffect(() => {
		if (!isEnabled || activeTimesheet === undefined) {
			notifications.cancelNotification(NOTIFICATION_ID).catch(console.warn);
			return;
		}

		// Captured so the closure knows the timesheet is defined.
		const runningTimesheet = activeTimesheet;

		const display = async () => {
			if (Platform.OS === 'ios') {
				await notifications.requestPermission();
			}

			await notifications.createChannel({
				id: NOTIFICATION_CHANNEL_ID,
				name: t('activeTimesheetChannel'),
				importance: AndroidImportance.DEFAULT,
			});

			const now = dayjs();
			const currentSeconds = getTimesheetDurationInSeconds(
				runningTimesheet,
				now,
			);
			const totalSeconds = getWorkingHoursInSeconds(timesheets, now);

			const title =
				[activityName, projectName]
					.filter((name) => name !== undefined && name !== '')
					.join(' · ') || t('activeTimesheetNotificationTitle');

			await notifications.displayNotification({
				id: NOTIFICATION_ID,
				title,
				body: t('activeTimesheetNotificationBody', {
					current: formatDurationInSeconds(currentSeconds),
					total: formatDurationInSeconds(totalSeconds),
				}),
				android: {
					channelId: NOTIFICATION_CHANNEL_ID,
					// Must be an alpha-only monochrome icon: Android derives the
					// notification icon from the alpha channel and would render
					// the adaptive app icon (ic_launcher) as a solid circle.
					smallIcon: 'ic_notification',
				},
			});
		};

		display().catch(console.warn);
		const interval = setInterval(() => {
			display().catch(console.warn);
		}, UPDATE_INTERVAL_MS);

		return () => {
			clearInterval(interval);
			notifications.cancelNotification(NOTIFICATION_ID).catch(console.warn);
		};
	}, [activeTimesheet, activityName, isEnabled, projectName, t, timesheets]);

	return null;
};
