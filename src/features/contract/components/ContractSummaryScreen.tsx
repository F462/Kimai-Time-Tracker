import {Calendar} from 'react-native-calendars';
import React from 'react';

import {BaseScreen} from 'src/ui/BaseScreen';
import {useCalendarTheme} from 'src/features/utils/useCalendarTheme';

export const ContractSummaryScreen = () => {
	const calendarTheme = useCalendarTheme();
	return (
		<BaseScreen>
			<Calendar
				theme={calendarTheme}
				// Do not show days of other months in month page. Default = false
				hideExtraDays={true}
				// If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday
				firstDay={1}
				showWeekNumbers={true}
			/>
		</BaseScreen>
	);
};
