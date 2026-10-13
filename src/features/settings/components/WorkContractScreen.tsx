import {Picker} from '@react-native-picker/picker';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {
	ActivityIndicator,
	Icon,
	IconButton,
	List,
	Text,
	useTheme,
} from 'react-native-paper';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {BaseScreen} from 'src/ui/BaseScreen';
import {
	selectHasWorkContractHoursSyncStatus,
	selectIsWorkContractHoursSyncInProgress,
	selectWorkContractHoursPerDay,
} from '../context/settingsSelectors';
import {workContractHoursPerDaySet} from '../context/settingsSlice';
import {abortWorkContractHoursSync} from '../middleware/settingsThunks';
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
	syncStatus: {
		minHeight: 48,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	syncStatusText: {
		marginLeft: 12,
		flex: 1,
	},
});

const HOURS_OPTIONS = [0, 4, 6, 8, 10, 12];

const WorkContractSyncStatus = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const hasSyncStatus = useAppSelector(selectHasWorkContractHoursSyncStatus);
	const isSyncInProgress = useAppSelector(
		selectIsWorkContractHoursSyncInProgress,
	);

	if (!hasSyncStatus) {
		return null;
	}

	return (
		<View style={styles.syncStatus} accessibilityRole="progressbar">
			{isSyncInProgress ? (
				<ActivityIndicator size="small" />
			) : (
				<Icon
					source="cloud-upload-outline"
					size={20}
					color={theme.colors.primary}
				/>
			)}
			<Text style={styles.syncStatusText}>
				{t(
					isSyncInProgress
						? 'workContractSyncInProgress'
						: 'workContractSyncPending',
				)}
			</Text>
			<IconButton
				icon="close"
				accessibilityLabel={t('abortWorkContractSync')}
				onPress={() => {
					dispatch(abortWorkContractHoursSync());
				}}
			/>
		</View>
	);
};

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
			<WorkContractSyncStatus />
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
