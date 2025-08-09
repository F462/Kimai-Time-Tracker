import React, {useEffect, useState} from 'react';

import {Checkbox, IconButton, Text, useTheme} from 'react-native-paper';
import {
	RefreshControl,
	ScrollView,
	StyleProp,
	StyleSheet,
	View,
	ViewStyle,
} from 'react-native';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';
import {v4 as uuidv4} from 'uuid';

import {
	newTimesheetStarted,
	nextTimesheetStartDatetimeSet,
} from '../context/activeTimesheetSlice';
import {
	selectActiveTimesheet,
	selectTimesheetListOfCurrentDay,
} from 'src/features/timesheets/context/timesheetsSelectors';
import {
	selectCanTimesheetBeStarted,
	selectNextTimesheetStartDate,
} from '../context/activeTimesheetSelectors';
import {
	selectSelectedActivity,
	selectSelectedActivityId,
} from 'src/features/activities/context/activitiesSelectors';
import {
	selectSelectedProject,
	selectSelectedProjectId,
} from 'src/features/projects/context/projectsSelectors';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {ActivitySelector as ActivitySelectorComponent} from 'src/ui/Selectors/ActivitySelector';
import {DateTimePicker} from 'src/ui/DateTimePicker';
import {PressableOpacity} from 'src/ui/PressableOpacity';
import {ProjectSelector as ProjectSelectorComponent} from 'src/ui/Selectors/ProjectSelector';
import {TimesheetList} from 'src/features/timesheets/components/TimesheetList';
import {activitySelected} from 'src/features/activities/context/activitiesSlice';
import {fetchTimesheets} from 'src/features/timesheets/middleware/timesheetsThunks';
import {parseSelectedId} from 'src/features/timesheets/utils/functions';
import {projectSelected} from 'src/features/projects/context/projectsSlice';
import {stopActiveTimesheet} from 'src/features/activeTimesheet/middleware/activeTimesheetThunks';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {useWorkingHoursOfCurrentDayInSeconds} from 'src/features/timesheets/context/timesheetHooks';

import AppIcon from 'src/assets/icon.svg';

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

	return (
		<IconButton
			icon="stop"
			style={styles.startButton}
			iconColor={theme.colors.primary}
			size={200}
			onPress={() => {
				dispatch(stopActiveTimesheet()).catch(console.warn);
			}}
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

	const dateUnixTimestamp = useAppSelector(selectNextTimesheetStartDate);

	return (
		<View>
			<Checkbox.Item
				label={t('useCurrentDateTime')}
				status={useCurrentTime ? 'checked' : 'unchecked'}
				onPress={() => setUseCurrentTime(!useCurrentTime)}
			/>
			{useCurrentTime === false ? (
				<DateTimePicker initialValue={dateUnixTimestamp} />
			) : null}
		</View>
	);
};

const ActivitySelector = () => {
	const dispatch = useAppDispatch();

	const selectedActivity = useAppSelector(selectSelectedActivity);

	return (
		<ActivitySelectorComponent
			selectedActivity={selectedActivity}
			onSelectActivity={(value) => {
				dispatch(activitySelected(parseSelectedId(value.selectedList[0])));
			}}
		/>
	);
};

const ProjectSelector = () => {
	const dispatch = useAppDispatch();

	const selectedProject = useAppSelector(selectSelectedProject);

	return (
		<ProjectSelectorComponent
			selectedProject={selectedProject}
			onSelectProject={(value) =>
				dispatch(projectSelected(parseSelectedId(value.selectedList[0])))
			}
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

	return canTimesheetBeStarted ? (
		<PressableOpacity
			style={styles.startButton}
			onPress={() => {
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
			}}>
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
