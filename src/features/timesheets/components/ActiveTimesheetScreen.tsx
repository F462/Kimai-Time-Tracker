
import React, {useMemo} from 'react';

import {Button, IconButton, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {PaperSelect} from 'react-native-paper-select';
import {useTranslation} from 'react-i18next';

import {fetchActiveTimesheet, startNewTimesheet} from '../middleware/timesheetsThunks';
import {selectActivityList, selectSelectedActivity, selectSelectedActivityId} from 'src/features/activities/context/activitiesSelectors';
import {selectProjectList, selectSelectedProject, selectSelectedProjectId} from 'src/features/projects/context/projectsSelectors';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {Timesheet} from '../types';
import {activitySelected} from 'src/features/activities/context/activitiesSlice';
import {parseSelectedId} from '../utils/functions';
import {projectSelected} from 'src/features/projects/context/projectsSlice';
import {selectActiveTimesheet} from '../context/timesheetsSelectors';

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
		/>);
}

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

	return selectedProjectId !== undefined && selectedActivityId !== undefined ? (<IconButton
		icon="play"
		style={styles.startButton}
		iconColor="green"
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
			<ProjectSelector />
			<ActivitySelector />
			<StartButton />
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
