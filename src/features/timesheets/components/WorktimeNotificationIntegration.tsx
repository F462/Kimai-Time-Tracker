import dayjs from 'dayjs';
import {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform} from 'react-native';
import notifications, {
	AndroidImportance,
	TriggerType,
} from 'react-native-notify-kit';

import {useAppSelector} from 'src/features/data/context/store';
import {
	getWorkContractHoursForDate,
	getWorkingHoursInSeconds,
} from 'src/features/overview/utils/overviewUtils';
import {selectWorkContractHoursPerDay} from 'src/features/settings/context/settingsSelectors';
import {
	selectActiveTimesheet,
	selectTimesheetListOfCurrentDay,
} from 'src/features/timesheets/context/timesheetsSelectors';

const NOTIFICATION_CHANNEL_ID = 'daily-working-hours';

export const DailyWorkingHoursNotificationIntegration = () => {
	const {t} = useTranslation();
	const timesheets = useAppSelector(selectTimesheetListOfCurrentDay);
	const activeTimesheet = useAppSelector(selectActiveTimesheet);
	const workContractHoursPerDay = useAppSelector(selectWorkContractHoursPerDay);
	const standardWorkingHoursToday = getWorkContractHoursForDate(
		workContractHoursPerDay,
		dayjs(),
	);
	const dailyWorkingHoursSeconds = standardWorkingHoursToday * 60 * 60;
	const workedSeconds = getWorkingHoursInSeconds(timesheets, dayjs());

	// True once this session has observed the working hours below the daily
	// threshold. The "work hours reached" notification must only be delivered
	// once, at the moment the threshold is crossed. If the app is opened and
	// the hours have already been reached (e.g. by an earlier session or an OS
	// trigger that fired while the app was closed), we must NOT re-show the
	// notification simply because the app was opened.
	const hasSeenUnderThresholdRef = useRef(false);

	useEffect(() => {
		let isCurrent = true;
		const notificationId = `${NOTIFICATION_CHANNEL_ID}-${dayjs().format('YYYY-MM-DD')}`;

		const updateNotification = async () => {
			if (dailyWorkingHoursSeconds <= 0) {
				await notifications.cancelTriggerNotification(notificationId);
				return;
			}

			if (activeTimesheet && workedSeconds < dailyWorkingHoursSeconds) {
				hasSeenUnderThresholdRef.current = true;
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
							hours: standardWorkingHoursToday,
						}),
						body: t('dailyWorkingHoursReachedBody', {
							hours: standardWorkingHoursToday,
						}),
						android: {
							channelId: NOTIFICATION_CHANNEL_ID,
							smallIcon: 'ic_launcher',
						},
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

			// Only deliver the notification when the threshold was actually crossed
			// during this session (i.e. we were under the daily hours earlier). If
			// the app was opened and the hours were already reached, this is false
			// and we skip the re-display.
			if (!hasSeenUnderThresholdRef.current) {
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
					hours: standardWorkingHoursToday,
				}),
				body: t('dailyWorkingHoursReachedBody', {
					hours: standardWorkingHoursToday,
				}),
				android: {
					channelId: NOTIFICATION_CHANNEL_ID,
					smallIcon: 'ic_launcher',
				},
			});
		};

		updateNotification().catch(console.warn);
		return () => {
			isCurrent = false;
		};
	}, [
		activeTimesheet,
		dailyWorkingHoursSeconds,
		standardWorkingHoursToday,
		t,
		workedSeconds,
	]);

	return null;
};
