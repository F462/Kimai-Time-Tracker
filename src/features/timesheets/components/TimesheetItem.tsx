import React, {useMemo} from 'react';

import {Text} from 'react-native-paper';
import {View} from 'react-native';
import dayjs from 'dayjs';

import {Timesheet} from '../types';

export const TimesheetItem = ({timesheet}: {timesheet: Timesheet}) => {
	const duration = useMemo(() => dayjs.duration((timesheet.duration ?? 0) * 1000).format('HH:mm'), [timesheet.duration]);

	return (
		<View>
			<Text>{timesheet.begin} - {timesheet.end} ({duration})</Text>
		</View>
	);
};
