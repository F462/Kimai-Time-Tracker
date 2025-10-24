import {Theme} from 'react-native-calendars/src/types';
import {useTheme} from 'react-native-paper';

export const useCalendarTheme: () => Theme = () => {
	const theme = useTheme();

	return {
		backgroundColor: theme.colors.background, // app background
		calendarBackground: theme.colors.surface, // calendar card
		textSectionTitleColor: theme.colors.onSurfaceVariant, // month/day headers
		textSectionTitleDisabledColor: theme.colors.outline, // disabled headers
		selectedDayBackgroundColor: theme.colors.primary, // selected day
		selectedDayTextColor: theme.colors.onPrimary, // text on selected day
		todayTextColor: theme.colors.secondary, // highlight today
		dayTextColor: theme.colors.onSurface, // normal day text
		textDisabledColor: theme.colors.onSurfaceVariant, // disabled days
		dotColor: theme.colors.primary, // marking dots
		selectedDotColor: theme.colors.onPrimary,
		arrowColor: theme.colors.primary, // navigation arrows
		disabledArrowColor: theme.colors.onSurfaceVariant,
		monthTextColor: theme.colors.onSurface, // month name
		indicatorColor: theme.colors.primary, // loading indicator
		textDayFontFamily: 'System', // optional
		textMonthFontFamily: 'System',
		textDayHeaderFontFamily: 'System',
	};
};
