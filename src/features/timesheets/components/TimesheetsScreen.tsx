import React from 'react';

import {StyleSheet, View} from 'react-native';

import {TimesheetList} from './TimesheetList';
import {selectTimesheetList} from '../context/timesheetsSelectors';
import {useAppSelector} from 'src/features/data/context/store';

const styles = StyleSheet.create({
	container: {
		margin: 10
	}
});

const TimesheetListWithAllTimesheets = () => {
	const timesheetList = useAppSelector(selectTimesheetList);

	return <TimesheetList data={timesheetList} />;
};

export const TimesheetsScreen = () => {
	return <View style={styles.container}><TimesheetListWithAllTimesheets /></View>;
};
