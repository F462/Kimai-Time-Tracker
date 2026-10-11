import dayjs from 'dayjs';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform} from 'react-native';
import notifications, {
	AndroidImportance,
	TriggerType,
} from 'react-native-notify-kit';

import {useAppSelector} from 'src/features/data/context/store';
import {getWorkingHoursInSeconds} from 'src/features/overview/utils/overviewUtils';
import {selectStandardWorkingHoursPerDay} from 'src/features/settings/context/settingsSelectors';
import {
	selectActiveTimesheet,
	selectTimesheetListOfCurrentDay,
} from 'src/features/timesheets/context/timesheetsSelectors';

const NOTIFICATION_CHANNEL_ID = 'daily-working-hours';

export const DailyWorkingHoursNotificationIntegration = () => {
	const {t} = useTranslation();
	const timesheets = useAppSelector(selectTimesheetListOfCurrentDay);
	const activeTimesheet = useAppSelector(selectActiveTimesheet);
	const standardWorkingHoursPerDay = useAppSelector(
		selectStandardWorkingHoursPerDay,
	);
	const dailyWorkingHoursSeconds = standardWorkingHoursPerDay * 60 * 60;
	const workedSeconds = getWorkingHoursInSeconds(timesheets, dayjs());

	useEffect(() => {
		let isCurrent = true;
		const notificationId = `${NOTIFICATION_CHANNEL_ID}-${dayjs().format('YYYY-MM-DD')}`;

		const updateNotification = async () => {
			if (activeTimesheet && workedSeconds < dailyWorkingHoursSeconds) {
				const triggerTimestamp =
					Date.now() + (dailyWorkingHoursSeconds - workedSeconds) * 1000;
				if (dayjs(triggerTimestamp).isAfter(dayjs().endOf('day'))) {
					await notifications.cancelTriggerNotification(notificationId);
					return;
				}

				if (Platform.OS === 'ios') {
					await notifications.requestPermission();
				}
				if (!isCurrent) {
					return;
				}
				await notifications.createChannel({
					id: NOTIFICATION_CHANNEL_ID,
					name: t('dailyWorkingHoursChannel'),
					importance: AndroidImportance.DEFAULT,
				});
				if (!isCurrent) {
					return;
				}

				await notifications.cancelTriggerNotification(notificationId);
				if (!isCurrent) {
					return;
				}
				await notifications.createTriggerNotification(
					{
						id: notificationId,
						title: t('dailyWorkingHoursReachedTitle', {
							hours: standardWorkingHoursPerDay,
						}),
						body: t('dailyWorkingHoursReachedBody', {
							hours: standardWorkingHoursPerDay,
						}),
						android: {channelId: NOTIFICATION_CHANNEL_ID},
					},
					{
						type: TriggerType.TIMESTAMP,
						timestamp: triggerTimestamp,
					},
				);
				return;
			}

			await notifications.cancelTriggerNotification(notificationId);
			if (!isCurrent || workedSeconds < dailyWorkingHoursSeconds) {
				return;
			}

			const displayedNotifications =
				await notifications.getDisplayedNotifications();
			if (
				!isCurrent ||
				displayedNotifications.some(
					({notification}) => notification.id === notificationId,
				)
			) {
				return;
			}

			if (Platform.OS === 'ios') {
				await notifications.requestPermission();
			}
			if (!isCurrent) {
				return;
			}
			await notifications.createChannel({
				id: NOTIFICATION_CHANNEL_ID,
				name: t('dailyWorkingHoursChannel'),
				importance: AndroidImportance.DEFAULT,
			});
			if (!isCurrent) {
				return;
			}
			await notifications.displayNotification({
				id: notificationId,
				title: t('dailyWorkingHoursReachedTitle', {
					hours: standardWorkingHoursPerDay,
				}),
				body: t('dailyWorkingHoursReachedBody', {
					hours: standardWorkingHoursPerDay,
				}),
				android: {channelId: NOTIFICATION_CHANNEL_ID},
			});
		};

		updateNotification().catch(console.warn);
		return () => {
			isCurrent = false;
		};
	}, [
		activeTimesheet,
		dailyWorkingHoursSeconds,
		standardWorkingHoursPerDay,
		t,
		workedSeconds,
	]);

	return null;
};
