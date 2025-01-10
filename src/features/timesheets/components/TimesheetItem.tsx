import React, {useMemo} from 'react';

import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';

import {Timesheet} from '../types';

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		marginHorizontal: 10,
		marginVertical: 5
	},
	datetimeText: {
		flex: 1,
		textAlign: 'center'
	}
});

const useDisplayedDatetime = (timestamp: string | null | undefined) => useMemo(() => timestamp != null ? dayjs(timestamp).format('L LT') : undefined, [timestamp]);

export const TimesheetItem = ({timesheet}: {timesheet: Timesheet}) => {
	const {t} = useTranslation();

	const displayedDuration = useMemo(() => dayjs.duration(timesheet.duration ? timesheet.duration * 1000 : dayjs().diff(dayjs(timesheet.begin))).format('HH:mm'), [timesheet.begin, timesheet.duration]);
	const displayedTimeStart = useDisplayedDatetime(timesheet.begin);
	const displayedTimeEnd = useDisplayedDatetime(timesheet.end);

	return (
		<View style={styles.container}>
			<Text style={styles.datetimeText}>{displayedTimeStart}</Text>
			<Text> - </Text>
			<Text style={styles.datetimeText}>{displayedTimeEnd ?? t('now')}</Text>
			<View />
			<Text>({displayedDuration})</Text>
		</View>
	);
};
