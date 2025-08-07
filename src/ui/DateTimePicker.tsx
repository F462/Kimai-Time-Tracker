import {DatePickerModal, TimePickerModal} from 'react-native-paper-dates';
import {StyleSheet, View} from 'react-native';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {TextInput} from 'react-native-paper';
import dayjs from 'dayjs';

import {isValidDate} from 'src/features/timesheets/utils/functions';
import {nextTimesheetStartDatetimeSet} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {useAppDispatch} from 'src/features/data/context/store';

const styles = StyleSheet.create({
	datetimePickerContainer: {
		flexDirection: 'row',
		marginVertical: 10,
		gap: 10,
	},
	datePicker: {
		flex: 2,
	},
	timePicker: {
		flex: 1,
	},
});

type DateTimePickerProps = {
	initialValue?: number;
};
export const DateTimePicker = ({initialValue}: DateTimePickerProps) => {
	const dispatch = useAppDispatch();
	const date = useMemo(
		() =>
			initialValue !== undefined
				? dayjs.unix(initialValue).toDate()
				: undefined,
		[initialValue],
	);

	const dayjsDate = useMemo(
		() => (date !== undefined ? dayjs(date) : undefined),
		[date],
	);

	const [datePickerVisible, setDatePickerVisible] = useState(false);
	const [timePickerVisible, setTimePickerVisible] = useState(false);

	const [dateTextInputValue, setDateTextInputValue] = useState<string>();
	const updateDateTextInput = useCallback(
		() => setDateTextInputValue(dayjsDate?.format('YYYY-MM-DD')),
		[dayjsDate],
	);
	useEffect(() => {
		updateDateTextInput();
	}, [dayjsDate, updateDateTextInput]);

	const [timeTextInputValue, setTimeTextInputValue] = useState<string>();
	const updateTimeTextInput = useCallback(
		() => setTimeTextInputValue(dayjsDate?.format('HH:mm')),
		[dayjsDate],
	);
	useEffect(() => {
		updateTimeTextInput();
	}, [dayjsDate, updateTimeTextInput]);

	return (
		<>
			<View style={styles.datetimePickerContainer}>
				<TextInput
					style={styles.datePicker}
					value={dateTextInputValue}
					onChangeText={(text) => setDateTextInputValue(text)}
					onEndEditing={(event) => {
						let newDate = dayjs(event.nativeEvent.text);
						newDate =
							dayjsDate === undefined
								? newDate
								: newDate.hour(dayjsDate.hour()).minute(dayjsDate.minute());

						if (isValidDate(newDate.toDate())) {
							dispatch(nextTimesheetStartDatetimeSet(newDate.unix()));
						} else {
							updateDateTextInput();
						}
					}}
					label={'YYYY-MM-DD'}
					right={
						<TextInput.Icon
							icon="calendar"
							onPress={() => setDatePickerVisible(true)}
						/>
					}
				/>
				<TextInput
					style={styles.timePicker}
					value={timeTextInputValue}
					onChangeText={(text) => setTimeTextInputValue(text)}
					onEndEditing={(event) => {
						let newDate = dayjs(event.nativeEvent.text, 'HH:mm');
						newDate =
							dayjsDate === undefined
								? newDate
								: newDate
										.year(dayjsDate.year())
										.month(dayjsDate.month())
										.day(dayjsDate.day());

						if (isValidDate(newDate.toDate())) {
							dispatch(nextTimesheetStartDatetimeSet(newDate.unix()));
						} else {
							updateDateTextInput();
						}
					}}
					label={'HH:MM'}
					right={
						<TextInput.Icon
							icon="clock"
							onPress={() => setTimePickerVisible(true)}
						/>
					}
				/>
			</View>
			<DatePickerModal
				locale="en"
				mode="single"
				visible={datePickerVisible}
				onDismiss={() => setDatePickerVisible(false)}
				date={date}
				onConfirm={(value) => {
					dispatch(nextTimesheetStartDatetimeSet(dayjs(value.date).unix()));
					setDatePickerVisible(false);
				}}
			/>
			<TimePickerModal
				visible={timePickerVisible}
				onDismiss={() => setTimePickerVisible(false)}
				onConfirm={(value) => {
					dispatch(
						nextTimesheetStartDatetimeSet(
							dayjsDate
								?.set('hour', value.hours)
								.set('minute', value.minutes)
								.unix(),
						),
					);
					setTimePickerVisible(false);
				}}
				hours={parseInt(dayjsDate?.format('HH') ?? '0', 10)}
				minutes={parseInt(dayjsDate?.format('mm') ?? '0', 10)}
			/>
		</>
	);
};
