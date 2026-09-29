import dayjs from 'dayjs';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';

import {useStyle} from 'src/features/theming/utils/useStyle';
import {
	formatSignedDurationInSeconds,
	MonthDayDetail,
	MonthDetail,
} from '../utils/overviewUtils';

const DAY_COLUMNS = 7;

// Localized short weekday names for a row ordered Monday to Sunday. `2021-01-04`
// is a Monday, so adding 0..6 days yields Mon, Tue, …, Sun.
const WEEKDAY_HEADERS = Array.from({length: DAY_COLUMNS}, (_, index) =>
	dayjs('2021-01-04').add(index, 'day').format('dd'),
);

const styles = StyleSheet.create({
	container: {
		borderRadius: 16,
		padding: 16,
		gap: 12,
	},
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 16,
	},
	dayGrid: {
		gap: 2,
	},
	dayRow: {
		flexDirection: 'row',
	},
	dayCell: {
		width: `${100 / DAY_COLUMNS}%`,
		alignItems: 'center',
		paddingVertical: 6,
		gap: 2,
	},
	weekdayHeaderCell: {
		width: `${100 / DAY_COLUMNS}%`,
		alignItems: 'center',
		paddingBottom: 4,
	},
	dayNumber: {
		fontSize: 10,
		lineHeight: 12,
	},
	dayDelta: {
		fontSize: 11,
		lineHeight: 14,
		fontVariant: ['tabular-nums'],
	},
});

type MonthDetailCardProps = {
	detail: MonthDetail;
};

const getDeltaColor = (
	deltaSeconds: number,
	positive: string,
	negative: string,
	neutral: string,
): string => {
	if (deltaSeconds > 0) {
		return positive;
	}
	if (deltaSeconds < 0) {
		return negative;
	}
	return neutral;
};

const DayCell = ({
	day,
	positiveColor,
	negativeColor,
	neutralColor,
}: {
	day: MonthDayDetail;
	positiveColor: string;
	negativeColor: string;
	neutralColor: string;
}) => {
	const showPlaceholder = !day.hasData && !day.isWorkingDay;
	const color = showPlaceholder
		? neutralColor
		: getDeltaColor(
				day.deltaSeconds,
				positiveColor,
				negativeColor,
				neutralColor,
			);

	return (
		<View style={styles.dayCell}>
			<Text
				variant="labelSmall"
				style={[styles.dayNumber, {color: neutralColor}]}>
				{String(day.dayOfMonth).padStart(2, '0')}
			</Text>
			<Text
				variant="labelSmall"
				style={[styles.dayDelta, {color: day.isFuture ? neutralColor : color}]}>
				{showPlaceholder || day.isFuture
					? '-'
					: formatSignedDurationInSeconds(day.deltaSeconds)}
			</Text>
		</View>
	);
};

export const MonthDetailCard = ({detail}: MonthDetailCardProps) => {
	const theme = useTheme();

	// The summary only accounts for days that are not in the future, so the
	// running total isn't dragged negative by the expected hours of the
	// month's remaining working days.
	const summaryDeltaSeconds = detail.days
		.filter((day) => !day.isFuture)
		.reduce((sum, day) => sum + day.deltaSeconds, 0);

	const isPositive = summaryDeltaSeconds >= 0;

	const dynamicStyles = useStyle(
		() => ({
			container: {
				backgroundColor: theme.colors.surfaceVariant,
			},
			totalPositive: {
				color: theme.colors.primary,
			},
			totalNegative: {
				color: theme.colors.error,
			},
			dayPositive: {
				color: theme.colors.primary,
			},
			dayNegative: {
				color: theme.colors.error,
			},
			neutral: {
				color: theme.colors.onSurfaceVariant,
			},
		}),
		[
			theme.colors.surfaceVariant,
			theme.colors.primary,
			theme.colors.error,
			theme.colors.onSurfaceVariant,
		],
	);

	const totalColor = isPositive
		? dynamicStyles.totalPositive.color
		: dynamicStyles.totalNegative.color;

	return (
		<View style={[styles.container, dynamicStyles.container]}>
			<View style={styles.headerRow}>
				<Text variant="titleMedium">{detail.label}</Text>
				{!detail.days[0]?.isFuture && (
					<Text variant="titleMedium" style={{color: totalColor}}>
						{formatSignedDurationInSeconds(summaryDeltaSeconds)}
					</Text>
				)}
			</View>

			<View style={styles.dayGrid}>
				<View style={styles.dayRow}>
					{WEEKDAY_HEADERS.map((header, index) => (
						<View key={index} style={styles.weekdayHeaderCell}>
							<Text variant="labelSmall" style={dynamicStyles.neutral}>
								{header}
							</Text>
						</View>
					))}
				</View>
				{detail.weeks.map((week, weekIndex) => (
					<View key={weekIndex} style={styles.dayRow}>
						{week.map((day, dayIndex) =>
							day === null ? (
								<View key={dayIndex} style={styles.dayCell} />
							) : (
								<DayCell
									key={dayIndex}
									day={day}
									positiveColor={dynamicStyles.dayPositive.color}
									negativeColor={dynamicStyles.dayNegative.color}
									neutralColor={dynamicStyles.neutral.color}
								/>
							),
						)}
					</View>
				))}
			</View>
		</View>
	);
};
