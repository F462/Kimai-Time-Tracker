import React, {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {Text} from 'react-native-paper';

import {BaseScreen} from 'src/ui/BaseScreen';
import {useCalendarTheme} from 'src/features/utils/useCalendarTheme';

const styles = StyleSheet.create({
	dayContainer: {
		padding: 10,
	},
	dayText: {
		alignSelf: 'flex-end',
	},
});

export const ContractSummaryScreen = () => {
	const calendarTheme = useCalendarTheme();

	const dayRenderer = useCallback(
		({
			date,
		}: React.ComponentProps<
			NonNullable<React.ComponentProps<typeof Calendar>['dayComponent']>
		>) => {
			return (
				<View style={styles.dayContainer}>
					<Text style={styles.dayText}>{date?.day}</Text>
					<Text style={styles.dayText}>+3</Text>
				</View>
			);
		},
		[],
	);

	return (
		<BaseScreen>
			<Calendar
				theme={calendarTheme}
				// Do not show days of other months in month page. Default = false
				hideExtraDays={true}
				// If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday
				firstDay={1}
				showWeekNumbers={true}
				dayComponent={dayRenderer}
			/>
		</BaseScreen>
	);
};
