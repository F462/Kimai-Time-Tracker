import dayjs from 'dayjs';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
	RefreshControl,
	ScrollView,
	StyleProp,
	StyleSheet,
	View,
	ViewStyle,
} from 'react-native';
import {Checkbox, IconButton, Text, useTheme} from 'react-native-paper';
import {v4 as uuidv4} from 'uuid';

import AppIcon from 'src/assets/icon.svg';
import {stopActiveTimesheet} from 'src/features/activeTimesheet/middleware/activeTimesheetThunks';
import {
	selectSelectedActivity,
	selectSelectedActivityId,
} from 'src/features/activities/context/activitiesSelectors';
import {activitySelected} from 'src/features/activities/context/activitiesSlice';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {
	selectSelectedProject,
	selectSelectedProjectId,
} from 'src/features/projects/context/projectsSelectors';
import {projectSelected} from 'src/features/projects/context/projectsSlice';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {TimesheetList} from 'src/features/timesheets/components/TimesheetList';
import {useWorkingHoursOfCurrentDayInSeconds} from 'src/features/timesheets/context/timesheetHooks';
import {
	selectActiveTimesheet,
	selectTimesheetListOfCurrentDay,
} from 'src/features/timesheets/context/timesheetsSelectors';
import {fetchTimesheets} from 'src/features/timesheets/middleware/timesheetsThunks';
import {DateTimePicker} from 'src/ui/DateTimePicker';
import {PressableOpacity} from 'src/ui/PressableOpacity';
import {ActivitySelector as ActivitySelectorComponent} from 'src/ui/Selectors/ActivitySelector';
import {ProjectSelector as ProjectSelectorComponent} from 'src/ui/Selectors/ProjectSelector';
import {
	selectCanTimesheetBeStarted,
	selectNextTimesheetStartDate,
} from '../context/activeTimesheetSelectors';
import {
	newTimesheetStarted,
	nextTimesheetStartDatetimeSet,
} from '../context/activeTimesheetSlice';

const styles = StyleSheet.create({
	mainContainer: {
		margin: 20,
		gap: 20,
	},
	startButton: {
		alignSelf: 'center',
		padding: 20,
	},
	dayWorkingHoursContainer: {
		flexDirection: 'row',
		padding: 10,
		borderRadius: 5,
	},
	dayWorkingHourLabelText: {
		flex: 3,
	},
	dayWorkingHourValueText: {
		flex: 1,
		textAlign: 'right',
	},
});

const StopButton = () => {
	const dispatch = useAppDispatch();
	const theme = useTheme();

	const handleStop = useCallback(() => {
		dispatch(stopActiveTimesheet()).catch(console.warn);
	}, [dispatch]);

	return (
		<IconButton
			icon="stop"
			style={styles.startButton}
			iconColor={theme.colors.primary}
			size={200}
			onPress={handleStop}
		/>
	);
};

const ActiveTimesheetContent = () => {
	return (
		<View>
			<StopButton />
		</View>
	);
};

const DatetimeSelector = () => {
	const dispatch = useAppDispatch();
	const {t} = useTranslation();
	const [useCurrentTime, setUseCurrentTime] = useState(true);

	useEffect(() => {
		dispatch(
			nextTimesheetStartDatetimeSet(
				useCurrentTime ? undefined : dayjs().unix(),
			),
		);
	}, [dispatch, useCurrentTime]);

	const toggleUseCurrentTime = useCallback(
		() => setUseCurrentTime((prev) => !prev),
		[],
	);

	const dateUnixTimestamp = useAppSelector(selectNextTimesheetStartDate);
	const handleDateTimePick = useCallback(
		(
			pickedDateTime: Parameters<
				React.ComponentProps<typeof DateTimePicker>['onDateTimePick']
			>[0],
		) => dispatch(nextTimesheetStartDatetimeSet(pickedDateTime.unix())),
		[dispatch],
	);

	return (
		<View>
			<Checkbox.Item
				label={t('useCurrentDateTime')}
				status={useCurrentTime ? 'checked' : 'unchecked'}
				onPress={toggleUseCurrentTime}
			/>
			{useCurrentTime === false ? (
				<DateTimePicker
					initialValue={dateUnixTimestamp}
					onDateTimePick={handleDateTimePick}
				/>
			) : null}
		</View>
	);
};

const ActivitySelector = () => {
	const dispatch = useAppDispatch();

	const selectedActivity = useAppSelector(selectSelectedActivity);

	const handleSelectActivity = useCallback(
		(
			activity: Parameters<
				React.ComponentProps<
					typeof ActivitySelectorComponent
				>['onSelectActivity']
			>[0],
		) => {
			dispatch(activitySelected(activity?.id));
		},
		[dispatch],
	);

	return (
		<ActivitySelectorComponent
			selectedActivity={selectedActivity}
			onSelectActivity={handleSelectActivity}
		/>
	);
};

const ProjectSelector = () => {
	const dispatch = useAppDispatch();

	const selectedProject = useAppSelector(selectSelectedProject);

	const handleSelectProject = useCallback(
		(
			project: Parameters<
				React.ComponentProps<typeof ProjectSelectorComponent>['onSelectProject']
			>[0],
		) => dispatch(projectSelected(project?.id)),
		[dispatch],
	);

	return (
		<ProjectSelectorComponent
			selectedProject={selectedProject}
			onSelectProject={handleSelectProject}
		/>
	);
};

const StartButton = () => {
	const dispatch = useAppDispatch();
	const canTimesheetBeStarted = useAppSelector(selectCanTimesheetBeStarted);
	const selectedProjectId = useAppSelector(selectSelectedProjectId);
	const selectedActivityId = useAppSelector(selectSelectedActivityId);
	const nextTimesheetStartDatetime = useAppSelector(
		selectNextTimesheetStartDate,
	);

	const iconSize = 200;

	const handleStart = useCallback(() => {
		dispatch(
			newTimesheetStarted({
				id: uuidv4(),
				begin: (nextTimesheetStartDatetime
					? dayjs.unix(nextTimesheetStartDatetime)
					: new Date()
				).toISOString(),
				project: selectedProjectId,
				activity: selectedActivityId,
			}),
		);
	}, [
		dispatch,
		nextTimesheetStartDatetime,
		selectedProjectId,
		selectedActivityId,
	]);

	return canTimesheetBeStarted ? (
		<PressableOpacity style={styles.startButton} onPress={handleStart}>
			<AppIcon width={iconSize} height={iconSize} />
		</PressableOpacity>
	) : null;
};

const NonActiveTimesheetContent = () => {
	return (
		<View>
			<DatetimeSelector />
			<ProjectSelector />
			<ActivitySelector />
			<StartButton />
		</View>
	);
};

type RefreshViewProps = React.PropsWithChildren<{
	style?: StyleProp<ViewStyle>;
}>;
const RefreshView = ({children, style}: RefreshViewProps) => {
	const dispatch = useAppDispatch();

	const [refreshing, setRefreshing] = React.useState(false);
	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		dispatch(fetchTimesheets())
			.then(() => setRefreshing(false))
			.catch(console.warn);
	}, [dispatch]);

	return (
		<ScrollView
			style={style}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}>
			{children}
		</ScrollView>
	);
};

const DayWorkingHours = () => {
	const {t} = useTranslation();
	const theme = useTheme();

	const workingHoursOfCurrentDayInSeconds =
		useWorkingHoursOfCurrentDayInSeconds(5000);

	const displayedWorkingHours = dayjs
		.duration(workingHoursOfCurrentDayInSeconds * 1000)
		.format('HH:mm');

	const dynamicStyles = useStyle(
		() => ({
			dayWorkingHoursContainer: {
				backgroundColor: theme.colors.primaryContainer,
			},
			textOnContainer: {
				color: theme.colors.onPrimaryContainer,
			},
		}),
		[theme.colors.onPrimaryContainer, theme.colors.primaryContainer],
	);

	return (
		<View
			style={[
				styles.dayWorkingHoursContainer,
				dynamicStyles.dayWorkingHoursContainer,
			]}>
			<Text
				variant="titleMedium"
				style={[styles.dayWorkingHourLabelText, dynamicStyles.textOnContainer]}>
				{t('workingTimeToday')}
			</Text>
			<Text
				variant="titleMedium"
				style={[styles.dayWorkingHourValueText, dynamicStyles.textOnContainer]}>
				{displayedWorkingHours}
			</Text>
		</View>
	);
};

const TimesheetListOfCurrentDay = () => {
	const timesheetList = useAppSelector(selectTimesheetListOfCurrentDay);

	return <TimesheetList data={timesheetList} />;
};

export const ActiveTimesheetScreen = () => {
	const timesheet = useAppSelector(selectActiveTimesheet);

	return (
		<View style={styles.mainContainer}>
			<RefreshView>
				<DayWorkingHours />
				{timesheet !== undefined ? (
					<ActiveTimesheetContent />
				) : (
					<NonActiveTimesheetContent />
				)}
			</RefreshView>
			<TimesheetListOfCurrentDay />
		</View>
	);
};
