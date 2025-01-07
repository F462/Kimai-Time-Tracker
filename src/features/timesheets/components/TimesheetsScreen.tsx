import React from 'react';

import {FlatList, View} from 'react-native';
import {Text} from 'react-native-paper';

import {Timesheet} from '../types';
import {selectTimesheetList} from '../context/timesheetsSelectors';
import {useAppSelector} from 'src/features/data/context/store';

const TimesheetItem = ({timesheet}: {timesheet: Timesheet}) => {
	return (
		<View>
			<Text>{timesheet.end} - {timesheet.begin} ({Math.round((timesheet.duration ?? 0) / 3600 * 10) / 10}h)</Text>
		</View>
	);
};

const TimesheetList = () => {
	const timesheetList = useAppSelector(selectTimesheetList);

	return <FlatList data={timesheetList} renderItem={({item}) => <TimesheetItem timesheet={item} />} />;
};

export const TimesheetsScreen = () => {
	return <View><TimesheetList /></View>;
};
