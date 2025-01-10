import React, {useCallback} from 'react';

import {Divider} from 'react-native-paper';
import {FlatList} from 'react-native';

import {Timesheet} from '../types';
import {TimesheetItem} from './TimesheetItem';

export const TimesheetList = ({data}: {data: Array<Timesheet>}) => {
	const dividerCallback = useCallback(() => <Divider />, []);

	return <FlatList data={data} renderItem={({item}) => <TimesheetItem timesheet={item} />} ItemSeparatorComponent={dividerCallback} />;
};
