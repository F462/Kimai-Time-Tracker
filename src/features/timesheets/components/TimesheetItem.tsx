import dayjs from 'dayjs';
import React, {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Icon, Text, useTheme} from 'react-native-paper';

import {selectActivity} from 'src/features/activities/context/activitiesSelectors';
import {useAppSelector} from 'src/features/data/context/store';
import {selectProject} from 'src/features/projects/context/projectsSelectors';
import {
	selectSyncError,
	selectSyncState,
} from 'src/features/synchronization/context/synchronizationSelectors';
import {SyncState} from 'src/features/synchronization/types';
import {useResponsiveScale} from 'src/features/theming/utils/useResponsiveScale';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {useTime} from 'src/features/utils/useTime';
import {ColorIndicator} from 'src/ui/ColorIndicator';
import {ListItem} from 'src/ui/ListItem';
import {ListItemText} from 'src/ui/ListItemText';
import {PressableOpacity} from 'src/ui/PressableOpacity';
import {Timesheet} from '../types';
import {TimesheetItemContextMenu} from './TimesheetItemContextMenu';

const SYNC_STATE_ICON_SIZE = 15;
const COLOR_INDICATOR_SIZE = 18;

/**
 * Base (unscaled) metrics of the react-native-paper MD3 text variants used in
 * this file. They are multiplied by the responsive scale so the card looks
 * proportionally consistent across devices with different logical screen sizes.
 */
const TEXT_VARIANTS = {
	bodyMedium: {fontSize: 14, lineHeight: 20},
	titleSmall: {fontSize: 14, lineHeight: 20},
	labelSmall: {fontSize: 11, lineHeight: 16},
} as const;

const scaledTextStyle = (
	scale: number,
	variant: keyof typeof TEXT_VARIANTS,
): {fontSize: number; lineHeight: number} => ({
	fontSize: TEXT_VARIANTS[variant].fontSize * scale,
	lineHeight: TEXT_VARIANTS[variant].lineHeight * scale,
});

const styles = StyleSheet.create({
	card: {
		borderRadius: 14,
		borderWidth: 1,
		flexDirection: 'column',
		gap: 6,
		marginHorizontal: 12,
		marginVertical: 6,
		padding: 14,
	},
	cardRow: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 12,
	},
	syncErrorText: {
		paddingHorizontal: 2,
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
	size,
}: {
	synchronizationState?: SyncState;
	size: number;
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

	return <Icon color={color} source={iconSource} size={size} />;
};

type TimesheetItemProps = {
	timesheet: Timesheet;
	/** Responsive scale factor for the card's text, icons, and spacing. */
	scale: number;
};

const TimesheetSyncIndicator = ({timesheet, scale}: TimesheetItemProps) => {
	const synchronizationState = useAppSelector(selectSyncState(timesheet.id));
	const iconSize = SYNC_STATE_ICON_SIZE * scale;

	return (
		<View style={styles.syncStateIconContainer}>
			{synchronizationState === SyncState.RUNNING ? (
				<ActivityIndicator size={iconSize} />
			) : (
				<SynchronizationStateIcon
					synchronizationState={synchronizationState}
					size={iconSize}
				/>
			)}
		</View>
	);
};

const TimesheetDurationDisplay = ({timesheet, scale}: TimesheetItemProps) => {
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
		<Text
			variant="titleSmall"
			style={[styles.duration, scaledTextStyle(scale, 'titleSmall')]}>
			{displayedDuration}
		</Text>
	);
};

const TimesheetTimeDisplay = ({timesheet, scale}: TimesheetItemProps) => {
	const {t} = useTranslation();

	const displayedTimeStart = useDisplayedDatetime(timesheet.begin);
	const displayedTimeEnd = useDisplayedDatetime(timesheet.end);
	const textStyle = scaledTextStyle(scale, 'bodyMedium');

	return (
		<ListItem style={[styles.timeContainer, {gap: 4 * scale}]}>
			<ListItemText
				style={[styles.datetimeText, styles.startDatetimeText, textStyle]}>
				{displayedTimeStart}
			</ListItemText>
			<ListItemText style={textStyle}> - </ListItemText>
			<ListItemText style={[styles.datetimeText, textStyle]}>
				{displayedTimeEnd ?? t('now')}
			</ListItemText>
		</ListItem>
	);
};

const TimesheetDetails = ({timesheet, scale}: TimesheetItemProps) => {
	const activity = useAppSelector(selectActivity(timesheet.activity));
	const project = useAppSelector(selectProject(timesheet.project));
	const textStyle = scaledTextStyle(scale, 'bodyMedium');
	const indicatorSize = COLOR_INDICATOR_SIZE * scale;

	return (
		<ListItem
			style={[
				styles.timesheetDetailsContainer,
				{gap: 4 * scale, marginTop: 6 * scale},
			]}>
			{project?.name && (
				<View
					style={[
						styles.detailField,
						styles.projectDetailField,
						{gap: 5 * scale},
					]}>
					<ListItemText
						style={[styles.detailsText, styles.projectText, textStyle]}>
						{project.name}
					</ListItemText>
					<ColorIndicator color={project.color} size={indicatorSize} />
				</View>
			)}
			{project?.name && activity?.name && (
				<ListItemText style={textStyle}> · </ListItemText>
			)}
			{activity?.name && (
				<View style={[styles.detailField, {gap: 5 * scale}]}>
					<ColorIndicator color={activity.color} size={indicatorSize} />
					<ListItemText style={[styles.detailsText, textStyle]}>
						{activity.name}
					</ListItemText>
				</View>
			)}
		</ListItem>
	);
};

export const TimesheetItem = ({timesheet}: {timesheet: Timesheet}) => {
	const theme = useTheme();
	const scale = useResponsiveScale();
	const syncError = useAppSelector(selectSyncError(timesheet.id));

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
				borderRadius: 14 * scale,
				gap: 6 * scale,
				marginHorizontal: 12 * scale,
				marginVertical: 6 * scale,
				padding: 14 * scale,
			},
			cardRow: {
				gap: 12 * scale,
			},
			syncErrorText: {
				paddingHorizontal: 2 * scale,
			},
		}),
		[
			contextMenuVisible,
			scale,
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
				<View style={[styles.cardRow, dynamicStyles.cardRow]}>
					<TimesheetSyncIndicator timesheet={timesheet} scale={scale} />
					<View style={styles.flex}>
						<TimesheetTimeDisplay timesheet={timesheet} scale={scale} />
						<TimesheetDetails timesheet={timesheet} scale={scale} />
					</View>
					<TimesheetDurationDisplay timesheet={timesheet} scale={scale} />
				</View>
				{syncError != null && (
					<Text
						numberOfLines={2}
						variant="labelSmall"
						style={[
							styles.syncErrorText,
							dynamicStyles.syncErrorText,
							scaledTextStyle(scale, 'labelSmall'),
							{color: theme.colors.error},
						]}>
						{syncError}
					</Text>
				)}
			</PressableOpacity>
		</>
	);
};
