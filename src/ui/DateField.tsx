import RNDateTimePicker, {
	DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {useCallback, useMemo, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Text, TextInput, useTheme} from 'react-native-paper';

import {
	formatDateDisplay,
	fromDateStr,
	toDateStr,
} from 'src/features/projects/utils/dates';

const styles = StyleSheet.create({
	field: {
		marginVertical: 6,
	},
	description: {
		marginTop: 4,
		marginHorizontal: 4,
	},
});

type DateFieldProps = {
	/** The selected date as a `YYYY-MM-DD` string, or `null` when unset. */
	value: string | null;
	label: string;
	/** Optional placeholder shown when no date is selected. */
	placeholder?: string;
	/** Optional helper text shown under the field. */
	description?: string;
	onValueChange: (value: string | null) => void;
};

/**
 * A date-only picker field adapted for mobile. Shows the selected date in the
 * user's locale, offers a calendar icon to open the native date picker and an
 * "x" button to clear the value.
 */
export const DateField = ({
	value,
	label,
	placeholder,
	description,
	onValueChange,
}: DateFieldProps) => {
	const theme = useTheme();
	const [show, setShow] = useState(false);

	const pickerDate = useMemo(() => fromDateStr(value) ?? new Date(), [value]);

	const onChange = useCallback(
		(event: DateTimePickerEvent, selectedDate?: Date) => {
			setShow(false);

			if (event.type !== 'set' || selectedDate === undefined) {
				return;
			}

			onValueChange(toDateStr(selectedDate));
		},
		[onValueChange],
	);

	const hasValue = value !== null && value !== undefined;

	return (
		<>
			<TextInput
				label={label}
				mode="outlined"
				value={formatDateDisplay(value)}
				placeholder={placeholder ?? 'DD.MM.YYYY'}
				style={styles.field}
				left={
					hasValue ? (
						<TextInput.Icon
							icon="close-circle"
							color={theme.colors.onSurfaceVariant}
							accessibilityLabel={label}
							onPress={() => onValueChange(null)}
						/>
					) : undefined
				}
				right={
					<TextInput.Icon
						icon="calendar"
						accessibilityLabel={label}
						onPress={() => setShow(true)}
					/>
				}
			/>
			{description ? (
				<Text variant="bodySmall" style={styles.description}>
					{description}
				</Text>
			) : null}
			{show && (
				<RNDateTimePicker
					value={pickerDate}
					mode="date"
					is24Hour
					onChange={onChange}
				/>
			)}
		</>
	);
};
