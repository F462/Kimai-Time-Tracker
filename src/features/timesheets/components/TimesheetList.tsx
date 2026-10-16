import React, {useCallback} from 'react';

import {useAppDispatch} from 'src/features/data/context/store';
import {DividedList} from 'src/ui/DividedList';
import {fetchTimesheets} from '../middleware/timesheetsThunks';
import {Timesheet} from '../types';
import {TimesheetItem} from './TimesheetItem';

export const TimesheetList = ({data}: {data: Array<Timesheet>}) => {
	const dispatch = useAppDispatch();
	const onRefresh = useCallback(() => dispatch(fetchTimesheets()), [dispatch]);

	return (
		<DividedList
			data={data}
			onRefresh={onRefresh}
			renderItem={({item}) => <TimesheetItem timesheet={item} />}
		/>
	);
};
