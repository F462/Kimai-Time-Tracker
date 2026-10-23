import {RouteProp, useRoute} from '@react-navigation/native';
import React from 'react';

import {useAppSelector} from 'src/features/data/context/store';
import {ScreenParameters} from 'src/features/navigation/ScreenParameters';
import {BaseScreen} from 'src/ui/BaseScreen';
import {
	selectErroneousTimesheetList,
	selectTimesheetList,
	selectTimesheetListForDate,
} from '../context/timesheetsSelectors';
import {TimesheetList} from './TimesheetList';

export const TimesheetsScreen = () => {
	const route = useRoute<RouteProp<ScreenParameters>>();
	const onlyShowNonDoneEntries = route.params?.onlyShowNonDoneEntries;
	const date = route.params?.date;
	const timesheetList = useAppSelector((state) => {
		if (onlyShowNonDoneEntries) {
			return selectErroneousTimesheetList(state);
		}
		return date
			? selectTimesheetListForDate(state, date)
			: selectTimesheetList(state);
	});

	return (
		<BaseScreen>
			<TimesheetList data={timesheetList} />
		</BaseScreen>
	);
};
