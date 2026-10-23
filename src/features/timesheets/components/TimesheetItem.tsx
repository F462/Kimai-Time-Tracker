import dayjs from 'dayjs';
import React, {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Icon, Text, useTheme} from 'react-native-paper';

import {selectActivity} from 'src/features/activities/context/activitiesSelectors';
import {useAppSelector} from 'src/features/data/context/store';
import {selectProject} from 'src/features/projects/context/projectsSelectors';
import {selectSyncState} from 'src/features/synchronization/context/synchronizationSelectors';
import {SyncState} from 'src/features/synchronization/types';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {useTime} from 'src/features/utils/useTime';
import {ColorIndicator} from 'src/ui/ColorIndicator';
import {ListItem} from 'src/ui/ListItem';
import {ListItemText} from 'src/ui/ListItemText';
import {PressableOpacity} from 'src/ui/PressableOpacity';
import {Timesheet} from '../types';
import {TimesheetItemContextMenu} from './TimesheetItemContextMenu';

const SYNC_STATE_ICON_SIZE = 15;

const styles = StyleSheet.create({
	card: {
		alignItems: 'center',
		borderRadius: 14,
		borderWidth: 1,
		flexDirection: 'row',
		gap: 12,
		marginHorizontal: 12,
		marginVertical: 6,
		padding: 14,
	},
	detailsText: {
		flexShrink: 1,
		fontWeight: '500',
	},
	detailField: {
		alignItems: 'center',
		flex: 1,
		flexDirection: 'row',
		gap: 5,
	},
	projectDetailField: {
		justifyContent: 'flex-end',
	},
	projectText: {
		textAlign: 'right',
	},
	datetimeText: {
		flex: 1,
		fontVariant: ['tabular-nums'],
	},
	startDatetimeText: {
		textAlign: 'right',
	},
	flex: {
		flex: 1,
	},
	syncStateIconContainer: {
		alignSelf: 'center',
	},
	timesheetDetailsContainer: {
		flex: 1,
		alignItems: 'center',
		gap: 4,
		marginHorizontal: 0,
		marginVertical: 0,
		marginTop: 6,
	},
	timeContainer: {
		alignItems: 'baseline',
		flex: 0,
		flexDirection: 'row',
		gap: 4,
		marginHorizontal: 0,
		marginVertical: 0,
	},
	duration: {
		textAlignVertical: 'center',
		fontVariant: ['tabular-nums'],
		fontWeight: '700',
	},
});

const useDisplayedDatetime = (timestamp: string | null | undefined) =>
	useMemo(
		() => (timestamp != null ? dayjs(timestamp).format('L LT') : undefined),
		[timestamp],
	);

const SynchronizationStateIcon = ({
	synchronizationState,
}: {
	synchronizationState?: SyncState;
}) => {
	const theme = useTheme();
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

	const color = (() => {
		switch (synchronizationState) {
			case SyncState.FAILED:
				return theme.colors.error;
			case SyncState.DONE:
				return theme.colors.primary;
			default:
				return theme.colors.onSurfaceVariant;
		}
	})();

	return <Icon color={color} source={iconSource} size={SYNC_STATE_ICON_SIZE} />;
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
					dayjs(timesheet.begin),
				);
				return calculatedTimesheetDuration;
			}

			return now.diff(dayjs(timesheet.begin));
		})();

		return dayjs.duration(duration).format('HH:mm');
	}, [now, timesheet.begin, timesheet.duration, timesheet.end]);

	return (
		<Text variant="titleSmall" style={styles.duration}>
			{displayedDuration}
		</Text>
	);
};

const TimesheetTimeDisplay = ({timesheet}: TimesheetItemProps) => {
	const {t} = useTranslation();

	const displayedTimeStart = useDisplayedDatetime(timesheet.begin);
	const displayedTimeEnd = useDisplayedDatetime(timesheet.end);

	return (
		<ListItem style={styles.timeContainer}>
			<ListItemText style={[styles.datetimeText, styles.startDatetimeText]}>
				{displayedTimeStart}
			</ListItemText>
			<ListItemText> - </ListItemText>
			<ListItemText style={styles.datetimeText}>
				{displayedTimeEnd ?? t('now')}
			</ListItemText>
		</ListItem>
	);
};

const TimesheetDetails = ({timesheet}: TimesheetItemProps) => {
	const activity = useAppSelector(selectActivity(timesheet.activity));
	const project = useAppSelector(selectProject(timesheet.project));

	return (
		<ListItem style={styles.timesheetDetailsContainer}>
			{project?.name && (
				<View style={[styles.detailField, styles.projectDetailField]}>
					<ListItemText style={[styles.detailsText, styles.projectText]}>
						{project.name}
					</ListItemText>
					<ColorIndicator color={project.color} />
				</View>
			)}
			{project?.name && activity?.name && <ListItemText> · </ListItemText>}
			{activity?.name && (
				<View style={styles.detailField}>
					<ColorIndicator color={activity.color} />
					<ListItemText style={styles.detailsText}>
						{activity.name}
					</ListItemText>
				</View>
			)}
		</ListItem>
	);
};

export const TimesheetItem = ({timesheet}: TimesheetItemProps) => {
	const theme = useTheme();

	const [contextMenuVisible, setContextMenuVisible] = useState(false);
	const onItemPress = useCallback(() => {
		setContextMenuVisible(true);
	}, []);
	const hideContextMenu = useCallback(() => setContextMenuVisible(false), []);

	const dynamicStyles = useStyle(
		() => ({
			card: {
				backgroundColor: theme.colors.surface,
				borderColor: contextMenuVisible
					? theme.colors.primary
					: theme.colors.outlineVariant,
			},
		}),
		[
			contextMenuVisible,
			theme.colors.primary,
			theme.colors.outlineVariant,
			theme.colors.surface,
		],
	);

	return (
		<>
			<TimesheetItemContextMenu
				timesheet={timesheet}
				visible={contextMenuVisible}
				onHideMenu={hideContextMenu}
			/>
			<PressableOpacity
				style={[styles.card, dynamicStyles.card]}
				onPress={onItemPress}>
				<TimesheetSyncIndicator timesheet={timesheet} />
				<View style={styles.flex}>
					<TimesheetTimeDisplay timesheet={timesheet} />
					<TimesheetDetails timesheet={timesheet} />
				</View>
				<TimesheetDurationDisplay timesheet={timesheet} />
			</PressableOpacity>
		</>
	);
};
