import React from 'react';

import {Text} from 'react-native-paper';
import {View} from 'react-native';

import {Timesheet} from '../types';

export const TimesheetItem = ({timesheet}: {timesheet: Timesheet}) => {
	return (
		<View>
			<Text>{timesheet.end} - {timesheet.begin} ({Math.round((timesheet.duration ?? 0) / 3600 * 10) / 10}h)</Text>
		</View>
	);
};
