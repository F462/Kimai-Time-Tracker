import RNDateTimePicker, {
	DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {
	ActivityIndicator,
	Icon,
	IconButton,
	List,
	Text,
	TextInput,
	useTheme,
} from 'react-native-paper';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {BaseScreen} from 'src/ui/BaseScreen';
import {
	selectHasWorkContractHoursSyncStatus,
	selectIsWorkContractHoursSyncInProgress,
	selectIsWorkContractHoursSyncPending,
	selectWorkContractHoursPerDay,
} from '../context/settingsSelectors';
import {workContractHoursPerDaySet} from '../context/settingsSlice';
import {
	abortWorkContractHoursSync,
	synchronizeWorkContractHours,
} from '../middleware/settingsThunks';
import {WORK_DAYS, WorkDay} from '../types';

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	dayRow: {
		minHeight: 56,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		marginVertical: 4,
	},
	hoursInput: {
		width: 132,
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

const formatDuration = (hours: number) => {
	const totalMinutes = Math.round(hours * 60);
	const formattedHours = Math.floor(totalMinutes / 60)
		.toString()
		.padStart(2, '0');
	const formattedMinutes = (totalMinutes % 60).toString().padStart(2, '0');
	return `${formattedHours}:${formattedMinutes}`;
};

const parseDuration = (value: string) => {
	const match = /^(\d{1,2}):([0-5]\d)$/.exec(value.trim());
	if (!match) {
		return undefined;
	}

	const hours = Number(match[1]);
	const minutes = Number(match[2]);
	if (hours > 24 || (hours === 24 && minutes !== 0)) {
		return undefined;
	}

	return hours + minutes / 60;
};

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
	const hoursPerDay = useAppSelector(selectWorkContractHoursPerDay);
	const hours = hoursPerDay[day];
	const [text, setText] = React.useState(formatDuration(hours));
	const [showTimePicker, setShowTimePicker] = React.useState(false);
	const pickerValue = React.useMemo(() => {
		const totalMinutes = Math.round(hours * 60) % (24 * 60);
		return new Date(
			2000,
			0,
			1,
			Math.floor(totalMinutes / 60),
			totalMinutes % 60,
		);
	}, [hours]);
	const onTimeChange = React.useCallback(
		(event: DateTimePickerEvent, selectedTime?: Date) => {
			setShowTimePicker(false);
			if (event.type !== 'set' || !selectedTime) {
				return;
			}

			const selectedHours =
				selectedTime.getHours() + selectedTime.getMinutes() / 60;
			setText(formatDuration(selectedHours));
			dispatch(workContractHoursPerDaySet({day, hours: selectedHours}));
		},
		[day, dispatch],
	);
	const onEndEditing = React.useCallback(() => {
		const parsedHours = parseDuration(text);
		if (parsedHours === undefined) {
			setText(formatDuration(hours));
			return;
		}

		setText(formatDuration(parsedHours));
		dispatch(workContractHoursPerDaySet({day, hours: parsedHours}));
	}, [day, dispatch, hours, text]);
	React.useEffect(() => {
		setText(formatDuration(hours));
	}, [hours]);

	return (
		<>
			<TextInput
				style={styles.hoursInput}
				mode="outlined"
				label="HH:mm"
				value={text}
				keyboardType="numbers-and-punctuation"
				onChangeText={setText}
				onEndEditing={onEndEditing}
				accessibilityLabel={`${t(`weekdays.${day}`)} ${t('workingTimeTitle')}`}
				right={
					<TextInput.Icon
						icon="clock-outline"
						accessibilityLabel={t('workingTimeTitle')}
						onPress={() => setShowTimePicker(true)}
					/>
				}
			/>
			{showTimePicker && (
				<RNDateTimePicker
					value={pickerValue}
					mode="time"
					is24Hour
					onChange={onTimeChange}
				/>
			)}
		</>
	);
};

export const WorkContractScreen = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();
	const isSyncPending = useAppSelector(selectIsWorkContractHoursSyncPending);
	const [refreshing, setRefreshing] = React.useState(false);
	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		dispatch(
			synchronizeWorkContractHours({
				direction: isSyncPending ? 'push' : 'pull',
			}),
		).then(
			() => setRefreshing(false),
			() => setRefreshing(false),
		);
	}, [dispatch, isSyncPending]);

	return (
		<BaseScreen>
			<ScrollView
				style={styles.scrollView}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}>
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
			</ScrollView>
		</BaseScreen>
	);
};
