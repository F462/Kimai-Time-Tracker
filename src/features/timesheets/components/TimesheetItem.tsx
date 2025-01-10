import React, {useMemo} from 'react';

import {Text} from 'react-native-paper';
import {View} from 'react-native';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';

import {Timesheet} from '../types';

export const TimesheetItem = ({timesheet}: {timesheet: Timesheet}) => {
	const {t} = useTranslation();

	const displayedDuration = useMemo(() => dayjs.duration(timesheet.duration ? timesheet.duration * 1000 : dayjs().diff(dayjs(timesheet.begin))).format('HH:mm'), [timesheet.begin, timesheet.duration]);

	return (
		<View>
			<Text>{timesheet.begin} - {timesheet.end ?? t('now')} ({displayedDuration})</Text>
		</View>
	);
};
