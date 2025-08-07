import RNDateTimePicker, {
	AndroidNativeProps,
	DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
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

	const [date, setDate] = useState<Date | undefined>(
		dayjs.unix(initialValue ?? Date.now() / 1000).toDate(),
	);

	const dayjsDate = useMemo(
		() => (date !== undefined ? dayjs(date) : undefined),
		[date],
	);

	const [mode, setMode] = useState<AndroidNativeProps['mode']>('date');
	const [show, setShow] = useState(false);

	const onChange = (
		_event: DateTimePickerEvent,
		selectedDate: Date | undefined,
	) => {
		const currentDate = selectedDate;
		setShow(false);
		setDate(currentDate);
	};

	const showMode = (currentMode: AndroidNativeProps['mode']) => {
		setShow(true);
		setMode(currentMode);
	};

	const showDatepicker = () => {
		showMode('date');
	};

	const showTimepicker = () => {
		showMode('time');
	};

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
					right={<TextInput.Icon icon="calendar" onPress={showDatepicker} />}
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
					right={<TextInput.Icon icon="clock" onPress={showTimepicker} />}
				/>
			</View>
			{show && (
				<RNDateTimePicker
					value={date ?? new Date()}
					mode={mode}
					is24Hour={true}
					onChange={onChange}
				/>
			)}
		</>
	);
};
