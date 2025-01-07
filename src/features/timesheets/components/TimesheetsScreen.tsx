import React, {useMemo} from 'react';

import {FlatList, View} from 'react-native';
import {Text} from 'react-native-paper';
import dayjs from 'dayjs';

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
