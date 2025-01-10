import React from 'react';

import {BaseScreen} from 'src/ui/BaseScreen';
import {TimesheetList} from './TimesheetList';
import {selectTimesheetList} from '../context/timesheetsSelectors';
import {useAppSelector} from 'src/features/data/context/store';

const TimesheetListWithAllTimesheets = () => {
	const timesheetList = useAppSelector(selectTimesheetList);

	return <TimesheetList data={timesheetList} />;
};

export const TimesheetsScreen = () => {
	return <BaseScreen><TimesheetListWithAllTimesheets /></BaseScreen>;
};
