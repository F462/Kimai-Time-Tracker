
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Checkbox, IconButton, Text, TextInput, useTheme} from 'react-native-paper';
import {DatePickerModal, TimePickerModal} from 'react-native-paper-dates';
import {RefreshControl, ScrollView, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {PaperSelect} from 'react-native-paper-select';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';
import {v4 as uuidv4} from 'uuid';

import {isValidDate, parseSelectedId} from 'src/features/timesheets/utils/functions';
import {newTimesheetStarted, nextTimesheetStartDatetimeSet} from '../context/activeTimesheetSlice';
import {selectActiveTimesheet, selectWorkingHoursOfCurrentDayInSeconds} from 'src/features/timesheets/context/timesheetsSelectors';
import {selectActivityList, selectSelectedActivity, selectSelectedActivityId} from 'src/features/activities/context/activitiesSelectors';
import {selectProjectList, selectSelectedProject, selectSelectedProjectId} from 'src/features/projects/context/projectsSelectors';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {Timesheet} from 'src/features/timesheets/types';
import {activitySelected} from 'src/features/activities/context/activitiesSlice';
import {fetchTimesheets} from 'src/features/timesheets/middleware/timesheetsThunks';
import {projectSelected} from 'src/features/projects/context/projectsSlice';
import {selectNextTimesheetStartDate} from '../context/activeTimesheetSelectors';
import {stopActiveTimesheet} from 'src/features/activeTimesheet/middleware/activeTimesheetThunks';

const styles = StyleSheet.create({
	mainContainer: {
		margin: 20,
		gap: 20
	},
	startButton: {
		alignSelf: 'center'
	},
	datetimePickerContainer: {
		flexDirection: 'row',
		marginVertical: 10,
		gap: 10
	},
	datePicker: {
		flex: 2
	},
	timePicker: {
		flex: 1
	}
});

const StopButton = () => {
	const dispatch = useAppDispatch();
	const theme = useTheme();

	return <IconButton
		icon="stop"
		style={styles.startButton}
		iconColor={theme.colors.primary}
		size={200}
		onPress={() => {
			dispatch(stopActiveTimesheet()).catch(console.warn);
		}}
	/>;
};

const ActiveTimesheetContent = ({timesheet}: {timesheet: Timesheet}) => {
	const timesheetBegin = useMemo(() => dayjs(timesheet.begin), [timesheet.begin]);
	const beginUiDisplay = useMemo(() => timesheetBegin.format('YYYY-MM-DD HH:mm'), [timesheetBegin]);
	const activeTimesheetDuration = dayjs().diff(timesheetBegin) / 1000;

	return (
		<View>
			<Text>{beginUiDisplay} ({Math.round(activeTimesheetDuration / 3600 * 10) / 10}h)</Text>
			<StopButton />
		</View>
	);
};

type SelectorProps<T extends {id: number; name: string;}> = {
	elements: Array<T>;
	selectedElement: T | undefined;
	label: string;
	onSelection: React.ComponentProps<typeof PaperSelect>['onSelection']
};
function Selector<T extends {id: number; name: string;}> ({
	elements,
	selectedElement,
	label,
	onSelection
}: SelectorProps<T>) {
	const elementList = useMemo(() => {
		return Object.values(elements ?? {}).map((item) => ({_id: item.id.toString(), value: item.name}));
	}, [elements]);

	return (
		<PaperSelect
			label={label}
			value={selectedElement?.name ?? ''}
			onSelection={onSelection}
			arrayList={elementList}
			selectedArrayList={[{_id: selectedElement?.id.toString() ?? '', value: selectedElement?.name ?? ''}]}
			multiEnable={false}
			hideSearchBox={true}
			textInputMode="outlined"
		/>
	);
}

const DatetimeSelector = () => {
	const dispatch = useAppDispatch();
	const {t} = useTranslation();
	const [useCurrentTime, setUseCurrentTime] = useState(true);

	const dateUnixTimestamp = useAppSelector(selectNextTimesheetStartDate);
	const date = useMemo(() => dateUnixTimestamp !== undefined ? dayjs.unix(dateUnixTimestamp).toDate() : undefined, [dateUnixTimestamp]);
	const dayjsDate = useMemo(() => date !== undefined ? dayjs(date) : undefined, [date]);

	const [datePickerVisible, setDatePickerVisible] = useState(false);
	const [timePickerVisible, setTimePickerVisible] = useState(false);

	const [dateTextInputValue, setDateTextInputValue] = useState<string>();
	const updateDateTextInput = useCallback(() => setDateTextInputValue(dayjsDate?.format('YYYY-MM-DD')), [dayjsDate]);
	useEffect(() => {
		updateDateTextInput();
	}, [dayjsDate, updateDateTextInput]);
	const [timeTextInputValue, setTimeTextInputValue] = useState<string>();
	const updateTimeTextInput = useCallback(() => setTimeTextInputValue(dayjsDate?.format('HH:mm')), [dayjsDate]);
	useEffect(() => {
		updateTimeTextInput();
	}, [dayjsDate, updateTimeTextInput]);

	useEffect(() => {
		dispatch(nextTimesheetStartDatetimeSet(useCurrentTime ? undefined : dayjs().unix()));
	}, [dispatch, useCurrentTime]);

	return (
		<View>
			<Checkbox.Item label={t('useCurrentDateTime')} status={useCurrentTime ? 'checked' : 'unchecked'} onPress={() => setUseCurrentTime(!useCurrentTime)} />
			{useCurrentTime === false ? (
				<View style={styles.datetimePickerContainer}>
					<TextInput style={styles.datePicker} value={dateTextInputValue} onChangeText={(text) => setDateTextInputValue(text)} onEndEditing={(event) => {
						let newDate = dayjs(event.nativeEvent.text);
						newDate = (dayjsDate === undefined ? newDate : newDate.hour(dayjsDate.hour()).minute(dayjsDate.minute()));

						if (isValidDate(newDate.toDate())) {
							dispatch(nextTimesheetStartDatetimeSet(newDate.unix()));
						} else {
							updateDateTextInput();
						}
					}} label={'YYYY-MM-DD'} right={<TextInput.Icon icon="calendar" onPress={() => setDatePickerVisible(true)} />} />
					<TextInput style={styles.timePicker} value={timeTextInputValue} onChangeText={(text) => setTimeTextInputValue(text)} onEndEditing={(event) => {
						let newDate = dayjs(event.nativeEvent.text);
						newDate = (dayjsDate === undefined ? newDate : newDate.year(dayjsDate.year()).month(dayjsDate.month()).day(dayjsDate.day()));

						if (isValidDate(newDate.toDate())) {
							dispatch(nextTimesheetStartDatetimeSet(newDate.unix()));
						} else {
							updateDateTextInput();
						}
					}} label={'HH:MM'} right={<TextInput.Icon icon="clock" onPress={() => setTimePickerVisible(true)} />} />
				</View>
			) : null}
			<TimePickerModal
				visible={timePickerVisible}
				onDismiss={() => setTimePickerVisible(false)}
				onConfirm={(value) => {
					dispatch(nextTimesheetStartDatetimeSet(dayjsDate?.set('hour', value.hours).set('minute', value.minutes).unix()));
					setTimePickerVisible(false);
				}}
				hours={parseInt(dayjsDate?.format('HH') ?? '0', 10)}
				minutes={parseInt(dayjsDate?.format('mm') ?? '0', 10)}
			/>
			<DatePickerModal
				locale="en"
				mode="single"
				visible={datePickerVisible}
				onDismiss={() => setDatePickerVisible(false)}
				date={date}
				onConfirm={(value) => {
					dispatch(nextTimesheetStartDatetimeSet(dayjs(value.date).unix()));
					setDatePickerVisible(false);
				}}
			/>
		</View>
	);
};

const ActivitySelector = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();

	const activities = useAppSelector(selectActivityList); ;
	const selectedActivity = useAppSelector(selectSelectedActivity);

	return <Selector elements={activities} selectedElement={selectedActivity} label={t('selectActivity')} onSelection={(value) => {
		dispatch(activitySelected(parseSelectedId(value.selectedList[0])));
	}}/>;
};

const ProjectSelector = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();

	const projects = useAppSelector(selectProjectList);
	const selectedProject = useAppSelector(selectSelectedProject);

	return <Selector elements={projects} selectedElement={selectedProject} label={t('selectProject')} onSelection={(value) => {
		dispatch(projectSelected(parseSelectedId(value.selectedList[0])));
	}}/>;
};

const StartButton = () => {
	const dispatch = useAppDispatch();
	const selectedProjectId = useAppSelector(selectSelectedProjectId);
	const selectedActivityId = useAppSelector(selectSelectedActivityId);
	const theme = useTheme();
	const nextTimesheetStartDatetime = useAppSelector(selectNextTimesheetStartDate);

	return selectedProjectId !== undefined && selectedActivityId !== undefined ? (<IconButton
		icon="play"
		style={styles.startButton}
		iconColor={theme.colors.primary}
		size={200}
		onPress={() => {
			dispatch(newTimesheetStarted({
				id: uuidv4(),
				begin: (nextTimesheetStartDatetime ? dayjs.unix(nextTimesheetStartDatetime) : new Date()).toISOString(),
				project: selectedProjectId,
				activity: selectedActivityId
			}));
		}}
	/>) : null;
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
	style: StyleProp<ViewStyle>
}>;
const RefreshView = ({children, style}: RefreshViewProps) => {
	const dispatch = useAppDispatch();

	const [refreshing, setRefreshing] = React.useState(false);
	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		dispatch(fetchTimesheets()).then(() => setRefreshing(false)).catch(console.warn);
	}, [dispatch]);

	return (
		<ScrollView style={style} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
			{children}
		</ScrollView>
	);
};

const DayWorkingHours = () => {
	const {t} = useTranslation();
	const workingHoursOfCurrentDayInSeconds = useAppSelector(selectWorkingHoursOfCurrentDayInSeconds);
	const displayedWorkingHours = dayjs.duration(workingHoursOfCurrentDayInSeconds * 1000).format('HH:mm');

	return (
		<View>
			<Text>{t('workingTimeToday', {workingTime: displayedWorkingHours})}</Text>
		</View>
	);
};

export const ActiveTimesheetScreen = () => {
	const timesheet = useAppSelector(selectActiveTimesheet);

	return (
		<RefreshView style={styles.mainContainer}>
			<DayWorkingHours />
			{timesheet !== undefined ? (
				<ActiveTimesheetContent timesheet={timesheet} />
			) : <NonActiveTimesheetContent />}
		</RefreshView>
	);
};
