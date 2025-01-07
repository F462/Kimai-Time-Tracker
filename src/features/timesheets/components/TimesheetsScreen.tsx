import React from 'react';

import {FlatList, View} from 'react-native';

import {TimesheetItem} from './TimesheetItem';
import {selectTimesheetList} from '../context/timesheetsSelectors';
import {useAppSelector} from 'src/features/data/context/store';

const TimesheetList = () => {
	const timesheetList = useAppSelector(selectTimesheetList);

	return <FlatList data={timesheetList} renderItem={({item}) => <TimesheetItem timesheet={item} />} />;
};

export const TimesheetsScreen = () => {
	return <View><TimesheetList /></View>;
};
