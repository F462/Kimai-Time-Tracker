import RNDateTimePicker, {
	AndroidNativeProps,
	DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {TextInput} from 'react-native-paper';

import {isValidDate} from 'src/features/timesheets/utils/functions';

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
	onDateTimePick: (pickedDate: dayjs.Dayjs) => void;
};
export const DateTimePicker = ({
	initialValue,
	onDateTimePick,
}: DateTimePickerProps) => {
	const [date, setDate] = useState<Date | undefined>(
		dayjs.unix(initialValue ?? Date.now() / 1000).toDate(),
	);

	const dayjsDate = useMemo(
		() => (date !== undefined ? dayjs(date) : undefined),
		[date],
	);

	const [mode, setMode] = useState<AndroidNativeProps['mode']>('date');
	const [show, setShow] = useState(false);

	const onChange = useCallback(
		(_event: DateTimePickerEvent, selectedDate: Date | undefined) => {
			const currentDate = selectedDate;
			setShow(false);
			setDate(currentDate);
			onDateTimePick(dayjs(currentDate));
		},
		[onDateTimePick],
	);

	const showMode = useCallback((currentMode: AndroidNativeProps['mode']) => {
		setShow(true);
		setMode(currentMode);
	}, []);

	const showDatepicker = useCallback(() => {
		showMode('date');
	}, [showMode]);

	const showTimepicker = useCallback(() => {
		showMode('time');
	}, [showMode]);

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

	const handleDateChangeText = useCallback(
		(text: string) => setDateTextInputValue(text),
		[],
	);

	const handleDateEndEditing = useCallback(
		(event: {nativeEvent: {text: string}}) => {
			let newDate = dayjs(event.nativeEvent.text);
			newDate =
				dayjsDate === undefined
					? newDate
					: newDate.hour(dayjsDate.hour()).minute(dayjsDate.minute());

			if (isValidDate(newDate.toDate())) {
				onDateTimePick(newDate);
			} else {
				updateDateTextInput();
			}
		},
		[dayjsDate, onDateTimePick, updateDateTextInput],
	);

	const handleTimeChangeText = useCallback(
		(text: string) => setTimeTextInputValue(text),
		[],
	);

	const handleTimeEndEditing = useCallback(
		(event: {nativeEvent: {text: string}}) => {
			let newDate = dayjs(event.nativeEvent.text, 'HH:mm');
			newDate =
				dayjsDate === undefined
					? newDate
					: newDate
							.year(dayjsDate.year())
							.month(dayjsDate.month())
							.day(dayjsDate.day());

			if (isValidDate(newDate.toDate())) {
				onDateTimePick(newDate);
			} else {
				updateDateTextInput();
			}
		},
		[dayjsDate, onDateTimePick, updateDateTextInput],
	);

	const dateIcon = useMemo(
		() => <TextInput.Icon icon="calendar" onPress={showDatepicker} />,
		[showDatepicker],
	);

	const timeIcon = useMemo(
		() => <TextInput.Icon icon="clock" onPress={showTimepicker} />,
		[showTimepicker],
	);

	return (
		<>
			<View style={styles.datetimePickerContainer}>
				<TextInput
					style={styles.datePicker}
					value={dateTextInputValue}
					onChangeText={handleDateChangeText}
					onEndEditing={handleDateEndEditing}
					label={'YYYY-MM-DD'}
					right={dateIcon}
				/>
				<TextInput
					style={styles.timePicker}
					value={timeTextInputValue}
					onChangeText={handleTimeChangeText}
					onEndEditing={handleTimeEndEditing}
					label={'HH:MM'}
					right={timeIcon}
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
