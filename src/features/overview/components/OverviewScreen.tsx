import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
	RefreshControl,
	ScrollView,
	StyleProp,
	StyleSheet,
	View,
	ViewStyle,
} from 'react-native';
import {Text, useTheme} from 'react-native-paper';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {selectStandardWorkingHoursPerDay} from 'src/features/settings/context/settingsSelectors';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {fetchTimesheets} from 'src/features/timesheets/middleware/timesheetsThunks';
import {useMonthlyOverview} from '../context/overviewHooks';
import {formatSignedDurationInSeconds} from '../utils/overviewUtils';
import {MonthDetailCard} from './MonthDetailCard';

const REFRESH_INTERVAL_MS = 5000;

const styles = StyleSheet.create({
	container: {
		gap: 16,
	},
	refreshView: {
		flex: 1,
	},
	card: {
		borderRadius: 16,
		padding: 16,
		gap: 12,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 16,
	},
	footerText: {
		textAlign: 'center',
	},
});

type RefreshViewProps = React.PropsWithChildren<{
	style?: StyleProp<ViewStyle>;
}>;

const RefreshView = ({children, style}: RefreshViewProps) => {
	const dispatch = useAppDispatch();

	const [refreshing, setRefreshing] = useState(false);
	const onRefresh = useCallback(() => {
		setRefreshing(true);
		dispatch(fetchTimesheets())
			.then(() => setRefreshing(false))
			.catch(console.warn);
	}, [dispatch]);

	return (
		<ScrollView
			style={style}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}>
			{children}
		</ScrollView>
	);
};

export const OverviewScreen = () => {
	const {t} = useTranslation();
	const theme = useTheme();

	const monthlyOverview = useMonthlyOverview(REFRESH_INTERVAL_MS);
	const standardWorkingHoursPerDay = useAppSelector(
		selectStandardWorkingHoursPerDay,
	);

	const dynamicStyles = useStyle(
		() => ({
			footerText: {
				color: theme.colors.onSurfaceVariant,
			},
			sectionTitle: {
				color: theme.colors.onSurfaceVariant,
			},
			yearTotal: {
				backgroundColor: theme.colors.surfaceVariant,
			},
			yearTotalDeltaPositive: {
				color: theme.colors.primary,
			},
			yearTotalDeltaNegative: {
				color: theme.colors.error,
			},
		}),
		[
			theme.colors.onSurfaceVariant,
			theme.colors.surfaceVariant,
			theme.colors.primary,
			theme.colors.error,
		],
	);

	const yearIsPositive = monthlyOverview.yearDeltaInSeconds >= 0;

	return (
		<RefreshView style={styles.refreshView}>
			<View style={styles.container}>
				<View style={[styles.card, dynamicStyles.yearTotal]}>
					<View style={styles.row}>
						<Text variant="titleMedium">{t('total')}</Text>
						<Text
							variant="titleMedium"
							style={{
								color: yearIsPositive
									? dynamicStyles.yearTotalDeltaPositive.color
									: dynamicStyles.yearTotalDeltaNegative.color,
							}}>
							{formatSignedDurationInSeconds(
								monthlyOverview.yearDeltaInSeconds,
							)}
						</Text>
					</View>
				</View>

				<Text
					variant="bodySmall"
					style={[styles.footerText, dynamicStyles.footerText]}>
					{t('overtimeBasedOnWorkingHours', {
						hours: standardWorkingHoursPerDay,
					})}
				</Text>

				<Text variant="titleMedium" style={dynamicStyles.sectionTitle}>
					{t('monthlyBreakdown')}
				</Text>
				{monthlyOverview.months.map((month) => (
					<MonthDetailCard key={month.month} detail={month} />
				))}
			</View>
		</RefreshView>
	);
};
