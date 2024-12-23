
import React, {useState} from 'react';

import {Button, IconButton, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {PaperSelect} from 'react-native-paper-select';
import {useTranslation} from 'react-i18next';

import {fetchActiveTimesheet, startNewTimesheet} from '../middleware/timesheetsThunks';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {ListItem} from 'react-native-paper-select/lib/typescript/interface/paperSelect.interface';
import {Timesheet} from '../types';
import {parseSelectedId} from '../utils/functions';
import {selectActiveTimesheet} from '../context/timesheetsSelectors';
import {selectActivityList} from 'src/features/activities/context/activitiesSelectors';
import {selectProjects} from 'src/features/projects/context/projectsSelectors';

const styles = StyleSheet.create({
	mainContainer: {
		margin: 20,
		gap: 20
	},
	startButton: {
		alignSelf: 'center'
	}
});

const ActiveTimesheetContent = ({timesheet}: {timesheet: Timesheet}) => {
	return <Text>{timesheet.end} - {timesheet.begin} ({Math.round(timesheet.duration / 3600 * 10) / 10}h)</Text>;
};

type StartButtonProps = {
	project: number | undefined;
	activity: number | undefined;
}
const StartButton = ({project, activity}: StartButtonProps) => {
	const dispatch = useAppDispatch();

	return project !== undefined && activity !== undefined ? (<IconButton
		icon="play"
		style={styles.startButton}
		iconColor="green"
		size={200}
		onPress={() => {
			dispatch(startNewTimesheet({
				begin: new Date().toISOString(),
				project,
				activity
			})).catch(console.warn);
		}}
	/>) : null;
};

const NonActiveTimesheetContent = () => {
	const {t} = useTranslation();

	const projects = useAppSelector(selectProjects);
	const [project, setProject] = useState({
		value: '',
		list: Object.values(projects ?? {}).map((p) => ({_id: p.id.toString(), value: p.name})),
		selectedList: [] as Array<ListItem>,
		error: ''
	});
	const selectedProjectId = parseSelectedId(project.selectedList[0]);

	const activities = useAppSelector(selectActivityList);
	const [activity, setActivity] = useState({
		value: '',
		list: Object.values(activities ?? {}).map((a) => ({_id: a.id.toString(), value: a.name})),
		selectedList: [] as Array<ListItem>,
		error: ''
	});
	const selectedActivityId = parseSelectedId(activity.selectedList[0]);

	return (
		<View>
			<PaperSelect
				label={t('selectProject')}
				value={project.value}
				onSelection={(value) => {
					setProject({
						...project,
						value: value.text,
						selectedList: value.selectedList,
						error: ''
					});
				}}
				arrayList={[...project.list]}
				selectedArrayList={[...project.selectedList]}
				errorText={project.error}
				multiEnable={false}
				hideSearchBox={true}
				textInputMode="outlined"
			/>
			<PaperSelect
				label={t('selectActivity')}
				value={activity.value}
				onSelection={(value) => {
					setActivity({
						...activity,
						value: value.text,
						selectedList: value.selectedList,
						error: ''
					});
				}}
				arrayList={[...activity.list]}
				selectedArrayList={[...activity.selectedList]}
				errorText={activity.error}
				multiEnable={false}
				hideSearchBox={true}
				textInputMode="outlined"
			/>
			<StartButton project={selectedProjectId} activity={selectedActivityId} />
		</View>
	);
};

export const ActiveTimesheetScreen = () => {
	const dispatch = useAppDispatch();
	const {t} = useTranslation();

	const timesheet = useAppSelector(selectActiveTimesheet);

	return (
		<View style={styles.mainContainer}>
			<Button mode="contained" onPress={() => {
				dispatch(fetchActiveTimesheet()).catch(console.warn);
			}}>{t('refresh')}</Button>
			{timesheet !== undefined ? (
				<ActiveTimesheetContent timesheet={timesheet} />
			) : <NonActiveTimesheetContent />}
		</View>
	);
};
