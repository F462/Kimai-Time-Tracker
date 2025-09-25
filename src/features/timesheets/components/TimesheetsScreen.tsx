import React from 'react';

import {
	selectErroneousTimesheetList,
	selectTimesheetList,
} from '../context/timesheetsSelectors';
import {BaseScreen} from 'src/ui/BaseScreen';
import {RouteProp} from '@react-navigation/native';
import {ScreenParameters} from 'src/features/navigation/ScreenParameters';
import {TimesheetList} from './TimesheetList';
import {useAppSelector} from 'src/features/data/context/store';

const TimesheetListWithAllTimesheets = () => {
	const timesheetList = useAppSelector(selectTimesheetList);

	return <TimesheetList data={timesheetList} />;
};

const TimesheetListWithErroneousTimesheets = () => {
	const timesheetList = useAppSelector(selectErroneousTimesheetList);

	return <TimesheetList data={timesheetList} />;
};

type TimesheetsScreenProps = {
	route: RouteProp<ScreenParameters, 'Timesheets'>;
};

export const TimesheetsScreen = ({route}: TimesheetsScreenProps) => {
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
