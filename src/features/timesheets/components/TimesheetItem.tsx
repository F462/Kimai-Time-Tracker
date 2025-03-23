import React, {useMemo} from 'react';

import {ActivityIndicator, Icon} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {FileLogger} from 'react-native-file-logger';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {ListItem} from 'src/ui/ListItem';
import {ListItemText} from 'src/ui/ListItemText';
import {PressableOpacity} from 'src/ui/PressableOpacity';
import {SyncState} from 'src/features/synchronization/types';
import {Timesheet} from '../types';
import {selectActivityName} from 'src/features/activities/context/activitiesSelectors';
import {selectProjectName} from 'src/features/projects/context/projectsSelectors';
import {selectServerUrl} from 'src/features/account/context/accountSelectors';
import {selectSyncState} from 'src/features/synchronization/context/synchronizationSelectors';
import {synchronizeTimesheet} from 'src/features/synchronization/middleware/synchronizationThunks';
import {useTime} from 'src/features/utils/useTime';

const SYNC_STATE_ICON_SIZE = 15;

const styles = StyleSheet.create({
	datetimeText: {
		flex: 1,
		textAlign: 'center'
	},
	flex: {
		flex: 1
	},
	row: {
		flexDirection: 'row'
	},
	syncStateIconContainer: {
		alignSelf: 'center'
	},
	timesheetDetailsContainer: {
		justifyContent: 'space-around'
	}
});

const useDisplayedDatetime = (timestamp: string | null | undefined) =>
	useMemo(
		() => (timestamp != null ? dayjs(timestamp).format('L LT') : undefined),
		[timestamp]
	);

const SynchronizationStateIcon = ({
	synchronizationState
}: {
	synchronizationState?: SyncState;
}) => {
	const iconSource = (() => {
		switch (synchronizationState) {
			case SyncState.NOT_STARTED:
				return 'timer-sand';
			case SyncState.RUNNING:
				return 'sync';
			case SyncState.FAILED:
				return 'exclamation';
			case SyncState.DONE:
			case undefined:
				return 'check';
		}
	})();

	return <Icon source={iconSource} size={SYNC_STATE_ICON_SIZE} />;
};

type TimesheetItemProps = {
	timesheet: Timesheet;
};

const TimesheetSyncIndicator = ({timesheet}: TimesheetItemProps) => {
	const synchronizationState = useAppSelector(selectSyncState(timesheet.id));

	return (
		<View style={styles.syncStateIconContainer}>
			{synchronizationState === SyncState.RUNNING ? (
				<ActivityIndicator size={SYNC_STATE_ICON_SIZE} />
			) : (
				<SynchronizationStateIcon synchronizationState={synchronizationState} />
			)}
		</View>
	);
};

const TimesheetDurationDisplay = ({timesheet}: TimesheetItemProps) => {
	const now = useTime(20_000);

	const displayedDuration = useMemo(() => {
		const duration = (() => {
			if (timesheet.duration) {
				return timesheet.duration * 1000;
			}

			if (timesheet.begin && timesheet.end) {
				const calculatedTimesheetDuration = dayjs(timesheet.end).diff(
					dayjs(timesheet.begin)
				);
				return calculatedTimesheetDuration;
			}

			return now.diff(dayjs(timesheet.begin));
		})();

		return dayjs.duration(duration).format('HH:mm');
	}, [now, timesheet.begin, timesheet.duration, timesheet.end]);

	return <ListItemText>({displayedDuration})</ListItemText>;
};

const TimesheetTimeDisplay = ({timesheet}: TimesheetItemProps) => {
	const {t} = useTranslation();

	const displayedTimeStart = useDisplayedDatetime(timesheet.begin);
	const displayedTimeEnd = useDisplayedDatetime(timesheet.end);

	return (
		<ListItem>
			<ListItemText style={styles.datetimeText}>
				{displayedTimeStart}
			</ListItemText>
			<ListItemText> - </ListItemText>
			<ListItemText style={styles.datetimeText}>
				{displayedTimeEnd ?? t('now')}
			</ListItemText>
			<View />
			<TimesheetDurationDisplay timesheet={timesheet} />
		</ListItem>
	);
};

const TimesheetDetails = ({timesheet}: TimesheetItemProps) => {
	const displayedActivity = useAppSelector(
		selectActivityName(timesheet.activity)
	);
	const displayedProject = useAppSelector(selectProjectName(timesheet.project));

	return (
		<ListItem style={styles.timesheetDetailsContainer}>
			{displayedActivity && <ListItemText>{displayedActivity}</ListItemText>}
			{displayedProject && <ListItemText>{displayedProject}</ListItemText>}
		</ListItem>
	);
};

const useTimesheetPress = (timesheet: Timesheet) => {
	const dispatch = useAppDispatch();
	const serverUrl = useAppSelector(selectServerUrl);

	const synchronizationState = useAppSelector(selectSyncState(timesheet.id));

	switch (synchronizationState) {
		case SyncState.FAILED:
			return () => {
				if (serverUrl === undefined) {
					FileLogger.warn(
						`Server URL is not defined, cannot sync timesheet ${timesheet.id}`
					);
					return;
				}

				dispatch(synchronizeTimesheet({serverUrl, timesheet})).catch(
					FileLogger.error
				);
			};
		default:
			return undefined;
	}
};

export const TimesheetItem = ({timesheet}: TimesheetItemProps) => {
	const onItemPress = useTimesheetPress(timesheet);

	return (
		<PressableOpacity style={styles.row} onPress={onItemPress}>
			<TimesheetSyncIndicator timesheet={timesheet} />
			<View style={styles.flex}>
				<TimesheetTimeDisplay timesheet={timesheet} />
				<TimesheetDetails timesheet={timesheet} />
			</View>
		</PressableOpacity>
	);
};
