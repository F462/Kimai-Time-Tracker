
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Checkbox, IconButton, Text, TextInput, useTheme} from 'react-native-paper';
import {DatePickerModal, TimePickerModal} from 'react-native-paper-dates';
import {RefreshControl, ScrollView, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {PaperSelect} from 'react-native-paper-select';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';

import {fetchActiveTimesheet, startNewTimesheet} from 'src/features/activeTimesheet/middleware/activeTimesheetThunks';
import {isValidDate, parseSelectedId} from 'src/features/timesheets/utils/functions';
import {selectActivityList, selectSelectedActivity, selectSelectedActivityId} from 'src/features/activities/context/activitiesSelectors';
import {selectProjectList, selectSelectedProject, selectSelectedProjectId} from 'src/features/projects/context/projectsSelectors';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {Timesheet} from 'src/features/timesheets/types';
import {activitySelected} from 'src/features/activities/context/activitiesSlice';
import {nextTimesheetStartDatetimeSet} from '../context/activeTimesheetSlice';
import {projectSelected} from 'src/features/projects/context/projectsSlice';
import {selectActiveTimesheet} from 'src/features/timesheets/context/timesheetsSelectors';
import {selectNextTimesheetStartDate} from '../context/activeTimesheetSelectors';

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

const ActiveTimesheetContent = ({timesheet}: {timesheet: Timesheet}) => {
	return <Text>{timesheet.end} - {timesheet.begin} ({Math.round(timesheet.duration / 3600 * 10) / 10}h)</Text>;
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
		if (useCurrentTime) {
			dispatch(nextTimesheetStartDatetimeSet(dayjs().unix()));
		}
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

	return selectedProjectId !== undefined && selectedActivityId !== undefined ? (<IconButton
		icon="play"
		style={styles.startButton}
		iconColor={theme.colors.primary}
		size={200}
		onPress={() => {
			dispatch(startNewTimesheet({
				begin: new Date().toISOString(),
				project: selectedProjectId,
				activity: selectedActivityId
			})).catch(console.warn);
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
		dispatch(fetchActiveTimesheet()).then(() => setRefreshing(false)).catch(console.warn);
	}, [dispatch]);

	return (
		<ScrollView style={style} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
			{children}
		</ScrollView>
	);
};

export const ActiveTimesheetScreen = () => {
	const timesheet = useAppSelector(selectActiveTimesheet);

	return (
		<RefreshView style={styles.mainContainer}>
			{timesheet !== undefined ? (
				<ActiveTimesheetContent timesheet={timesheet} />
			) : <NonActiveTimesheetContent />}
		</RefreshView>
	);
};
