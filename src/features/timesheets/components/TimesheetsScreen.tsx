import React from 'react';

import {useRoute} from '@react-navigation/native';

import {
	selectErroneousTimesheetList,
	selectTimesheetList,
} from '../context/timesheetsSelectors';
import {BaseScreen} from 'src/ui/BaseScreen';
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

export const TimesheetsScreen = () => {
	const route = useRoute();
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
