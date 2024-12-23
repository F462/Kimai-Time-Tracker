
import React from 'react';

import {Button, IconButton, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {fetchActiveTimesheet, startNewTimesheet} from '../middleware/timesheetsThunks';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {Timesheet} from '../types';
import {selectActiveTimesheet} from '../context/timesheetsSelectors';

const styles = StyleSheet.create({
	mainContainer: {
		margin: 20,
		gap: 20
	},
	startButton: {
		alignSelf: 'center'
	}
});

const ActiveTimesheetContent = ({timesheet}: {timesheet: Timesheet}) => {
	return <Text>{timesheet.end} - {timesheet.begin} ({Math.round(timesheet.duration / 3600 * 10) / 10}h)</Text>;
};

const StartButton = () => {
	const dispatch = useAppDispatch();

	return <IconButton
		icon="play"
		style={styles.startButton}
		iconColor="green"
		size={200}
		onPress={() => {
			dispatch(startNewTimesheet({
				begin: new Date().toISOString(),
				project: 1,
				activity: 1
			})).catch(console.warn);
		}}
	/>;
};

const NonActiveTimesheetContent = () => {
	return <StartButton />;
};

export const ActiveTimesheetScreen = () => {
	const dispatch = useAppDispatch();
	const {t} = useTranslation();

	const timesheet = useAppSelector(selectActiveTimesheet);

	return (
		<View style={styles.mainContainer}>
			<Button mode="contained" onPress={() => {
				dispatch(fetchActiveTimesheet()).catch(console.warn);
			}}>{t('refresh')}</Button>
			{timesheet !== undefined ? (
				<ActiveTimesheetContent timesheet={timesheet} />
			) : <NonActiveTimesheetContent />}
		</View>
	);
};
