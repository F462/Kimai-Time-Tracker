import React, {useMemo} from 'react';

import {FlatList, View} from 'react-native';
import dayjs from 'dayjs';

import {TimesheetItem} from './TimesheetItem';
import {selectTimesheetList} from '../context/timesheetsSelectors';
import {useAppSelector} from 'src/features/data/context/store';

const TimesheetList = () => {
	const timesheetList = useAppSelector(selectTimesheetList);
	const sortedTimesheetList = useMemo(() => timesheetList.sort((a, b) => {
		const aTimestamp = dayjs(a.begin);
		const bTimestamp = dayjs(b.begin);
		return bTimestamp.unix() - aTimestamp.unix();
	}), [timesheetList]);

	return <FlatList data={sortedTimesheetList} renderItem={({item}) => <TimesheetItem timesheet={item} />} />;
};

export const TimesheetsScreen = () => {
	return <View><TimesheetList /></View>;
};
