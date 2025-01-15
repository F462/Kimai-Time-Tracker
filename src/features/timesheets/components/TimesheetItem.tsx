import React, {useMemo} from 'react';

import {StyleSheet, View} from 'react-native';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';

import {ListItem} from 'src/ui/ListItem';
import {ListItemText} from 'src/ui/ListItemText';
import {Timesheet} from '../types';
import {useTime} from 'src/features/utils/useTime';

const styles = StyleSheet.create({
	datetimeText: {
		flex: 1,
		textAlign: 'center'
	}
});

const useDisplayedDatetime = (timestamp: string | null | undefined) => useMemo(() => timestamp != null ? dayjs(timestamp).format('L LT') : undefined, [timestamp]);

export const TimesheetItem = ({timesheet}: {timesheet: Timesheet}) => {
	const {t} = useTranslation();

	const now = useTime(20_000);

	const displayedDuration = useMemo(() => dayjs.duration(timesheet.duration ? timesheet.duration * 1000 : now.diff(dayjs(timesheet.begin))).format('HH:mm'), [now, timesheet.begin, timesheet.duration]);
	const displayedTimeStart = useDisplayedDatetime(timesheet.begin);
	const displayedTimeEnd = useDisplayedDatetime(timesheet.end);

	return (
		<ListItem>
			<ListItemText style={styles.datetimeText}>{displayedTimeStart}</ListItemText>
			<ListItemText> - </ListItemText>
			<ListItemText style={styles.datetimeText}>{displayedTimeEnd ?? t('now')}</ListItemText>
			<View />
			<ListItemText>({displayedDuration})</ListItemText>
		</ListItem>
	);
};
