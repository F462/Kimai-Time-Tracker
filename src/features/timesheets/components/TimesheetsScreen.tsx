import {RouteProp, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {List} from 'react-native-paper';

import {Activity} from 'src/features/activities/types';
import {useAppSelector} from 'src/features/data/context/store';
import {ScreenParameters} from 'src/features/navigation/ScreenParameters';
import {Project} from 'src/features/projects/types';
import {BaseScreen} from 'src/ui/BaseScreen';
import {DateField} from 'src/ui/DateField';
import {ActivitySelector} from 'src/ui/Selectors/ActivitySelector';
import {ProjectSelector} from 'src/ui/Selectors/ProjectSelector';
import {
	filterTimesheetList,
	selectErroneousTimesheetList,
	selectTimesheetList,
	selectTimesheetListForDate,
} from '../context/timesheetsSelectors';
import {TimesheetList} from './TimesheetList';

const styles = StyleSheet.create({
	filters: {
		gap: 8,
		marginBottom: 8,
	},
	dateRange: {
		flexDirection: 'row',
		gap: 8,
	},
	dateField: {
		flex: 1,
	},
});

export const TimesheetsScreen = () => {
	const {t} = useTranslation();
	const route = useRoute<RouteProp<ScreenParameters>>();
	const [selectedProject, setSelectedProject] = useState<Project>();
	const [selectedActivity, setSelectedActivity] = useState<Activity>();
	const [fromDate, setFromDate] = useState<string | null>(null);
	const [toDate, setToDate] = useState<string | null>(null);
	const [filtersExpanded, setFiltersExpanded] = useState(false);
	const onlyShowNonDoneEntries = route.params?.onlyShowNonDoneEntries;
	const date = route.params?.date;
	const routeTimesheetList = useAppSelector((state) => {
		if (onlyShowNonDoneEntries) {
			return selectErroneousTimesheetList(state);
		}
		return date
			? selectTimesheetListForDate(state, date)
			: selectTimesheetList(state);
	});
	const timesheetList = filterTimesheetList(
		routeTimesheetList,
		selectedProject?.id,
		selectedActivity?.id,
		fromDate,
		toDate,
	);

	return (
		<BaseScreen>
			<List.Accordion
				title={t('filters')}
				expanded={filtersExpanded}
				onPress={() => setFiltersExpanded((expanded) => !expanded)}>
				<View style={styles.filters}>
					<ProjectSelector
						selectedProject={selectedProject}
						onSelectProject={setSelectedProject}
						label={t('filterProject')}
						emptyOptionLabel={t('filterAllProjects')}
					/>
					<ActivitySelector
						selectedActivity={selectedActivity}
						onSelectActivity={setSelectedActivity}
						label={t('filterActivity')}
						emptyOptionLabel={t('filterAllActivities')}
					/>
					<View style={styles.dateRange}>
						<View style={styles.dateField}>
							<DateField
								label={t('filterFromDate')}
								value={fromDate}
								onValueChange={setFromDate}
							/>
						</View>
						<View style={styles.dateField}>
							<DateField
								label={t('filterToDate')}
								value={toDate}
								onValueChange={setToDate}
							/>
						</View>
					</View>
				</View>
			</List.Accordion>
			<TimesheetList data={timesheetList} />
		</BaseScreen>
	);
};
