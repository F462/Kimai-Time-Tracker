import React from 'react';

import {DividedList} from 'src/ui/DividedList';
import {Timesheet} from '../types';
import {TimesheetItem} from './TimesheetItem';

export const TimesheetList = ({data}: {data: Array<Timesheet>}) => {
	return <DividedList data={data} renderItem={({item}) => <TimesheetItem timesheet={item} />} />;
};
