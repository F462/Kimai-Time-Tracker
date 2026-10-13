import {Picker} from '@react-native-picker/picker';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {List, Text, useTheme} from 'react-native-paper';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {BaseScreen} from 'src/ui/BaseScreen';
import {selectWorkContractHoursPerDay} from '../context/settingsSelectors';
import {workContractHoursPerDaySet} from '../context/settingsSlice';
import {WORK_DAYS, WorkDay} from '../types';

const styles = StyleSheet.create({
	picker: {
		width: 120,
	},
	dayRow: {
		minHeight: 56,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
	},
});

const HOURS_OPTIONS = [0, 4, 6, 8, 10, 12];

const WorkDayHoursSelection = ({day}: {day: WorkDay}) => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const hoursPerDay = useAppSelector(selectWorkContractHoursPerDay);
	const dynamicStyles = useStyle(
		() => ({picker: {color: theme.colors.onSurface}}),
		[theme.colors.onSurface],
	);

	return (
		<Picker
			style={[styles.picker, dynamicStyles.picker]}
			selectedValue={hoursPerDay[day]}
			selectionColor={theme.colors.primary}
			dropdownIconColor={dynamicStyles.picker.color}
			mode="dropdown"
			onValueChange={(hours: number) =>
				dispatch(workContractHoursPerDaySet({day, hours}))
			}>
			{HOURS_OPTIONS.map((hours) => (
				<Picker.Item
					key={hours}
					label={hours === 0 ? t('dayOff') : t('workingHoursOption', {hours})}
					value={hours}
				/>
			))}
		</Picker>
	);
};

export const WorkContractScreen = () => {
	const {t} = useTranslation();

	return (
		<BaseScreen>
			<List.Section>
				<List.Subheader>{t('workContractDescription')}</List.Subheader>
				{WORK_DAYS.map((day) => (
					<View key={day} style={styles.dayRow}>
						<Text variant="bodyLarge">{t(`weekdays.${day}`)}</Text>
						<WorkDayHoursSelection day={day} />
					</View>
				))}
			</List.Section>
		</BaseScreen>
	);
};
