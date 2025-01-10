import React, {useMemo} from 'react';

import {Text} from 'react-native-paper';
import {View} from 'react-native';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';

import {Timesheet} from '../types';

const useDisplayedDatetime = (timestamp: string | null | undefined) => useMemo(() => timestamp != null ? dayjs(timestamp).format('L LT') : undefined, [timestamp]);

export const TimesheetItem = ({timesheet}: {timesheet: Timesheet}) => {
	const {t} = useTranslation();

	const displayedDuration = useMemo(() => dayjs.duration(timesheet.duration ? timesheet.duration * 1000 : dayjs().diff(dayjs(timesheet.begin))).format('HH:mm'), [timesheet.begin, timesheet.duration]);
	const displayedTimeStart = useDisplayedDatetime(timesheet.begin);
	const displayedTimeEnd = useDisplayedDatetime(timesheet.end);

	return (
		<View>
			<Text>{displayedTimeStart} - {displayedTimeEnd ?? t('now')} ({displayedDuration})</Text>
		</View>
	);
};
