import React, {useMemo} from 'react';

import {StyleSheet, View} from 'react-native';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';

import {Icon} from 'react-native-paper';
import {ListItem} from 'src/ui/ListItem';
import {ListItemText} from 'src/ui/ListItemText';
import {SyncState} from 'src/features/synchronization/types';
import {Timesheet} from '../types';
import {selectSyncState} from 'src/features/synchronization/context/synchronizationSelectors';
import {useAppSelector} from 'src/features/data/context/store';
import {useTime} from 'src/features/utils/useTime';

const styles = StyleSheet.create({
	datetimeText: {
		flex: 1,
		textAlign: 'center'
	}
});

const useDisplayedDatetime = (timestamp: string | null | undefined) => useMemo(() => timestamp != null ? dayjs(timestamp).format('L LT') : undefined, [timestamp]);

const SynchronizationStateIcon = ({synchronizationState}: {synchronizationState?: SyncState}) => {
	const iconSource = (() => {
		switch (synchronizationState) {
		case SyncState.NOT_STARTED:
			return 'timer-sand';
		case SyncState.RUNNING:
			return 'sync';
		case SyncState.FAILED:
			return 'exclamation';
		case SyncState.DONE:
		case undefined:
			return 'check';
		}
	})();

	return <Icon source={iconSource} size={15} />;
};

export const TimesheetItem = ({timesheet}: {timesheet: Timesheet}) => {
	const {t} = useTranslation();

	const now = useTime(20_000);
	const synchronizationState = useAppSelector(selectSyncState(timesheet.id));

	const displayedDuration = useMemo(() => {
		const duration = (() => {
			if (timesheet.duration) {
				return timesheet.duration * 1000;
			}

			if (timesheet.begin && timesheet.end) {
				const calculatedTimesheetDuration =
					dayjs(timesheet.end).diff(dayjs(timesheet.begin));
				return calculatedTimesheetDuration;
			}

			return now.diff(dayjs(timesheet.begin));
		})();

		return dayjs.duration(duration).format('HH:mm');
	}, [now, timesheet.begin, timesheet.duration, timesheet.end]);

	const displayedTimeStart = useDisplayedDatetime(timesheet.begin);
	const displayedTimeEnd = useDisplayedDatetime(timesheet.end);

	return (
		<ListItem>
			<View>
				<SynchronizationStateIcon synchronizationState={synchronizationState} />
			</View>
			<ListItemText style={styles.datetimeText}>{displayedTimeStart}</ListItemText>
			<ListItemText> - </ListItemText>
			<ListItemText style={styles.datetimeText}>{displayedTimeEnd ?? t('now')}</ListItemText>
			<View />
			<ListItemText>({displayedDuration})</ListItemText>
		</ListItem>
	);
};
