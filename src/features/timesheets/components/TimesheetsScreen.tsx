import {RouteProp, useRoute} from '@react-navigation/native';
import React from 'react';

import {useAppSelector} from 'src/features/data/context/store';
import {ScreenParameters} from 'src/features/navigation/ScreenParameters';
import {BaseScreen} from 'src/ui/BaseScreen';
import {
	selectErroneousTimesheetList,
	selectTimesheetList,
} from '../context/timesheetsSelectors';
import {TimesheetList} from './TimesheetList';

const TimesheetListWithAllTimesheets = () => {
	const timesheetList = useAppSelector(selectTimesheetList);

	return <TimesheetList data={timesheetList} />;
};

const TimesheetListWithErroneousTimesheets = () => {
	const timesheetList = useAppSelector(selectErroneousTimesheetList);

	return <TimesheetList data={timesheetList} />;
};

export const TimesheetsScreen = () => {
	const route = useRoute<RouteProp<ScreenParameters>>();
	const onlyShowNonDoneEntries = route.params?.onlyShowNonDoneEntries;

	return (
		<BaseScreen>
			{onlyShowNonDoneEntries ? (
				<TimesheetListWithErroneousTimesheets />
			) : (
				<TimesheetListWithAllTimesheets />
			)}
		</BaseScreen>
	);
};
