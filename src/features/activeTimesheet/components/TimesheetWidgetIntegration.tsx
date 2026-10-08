import dayjs from 'dayjs';
import {useEffect} from 'react';
import {NativeModules} from 'react-native';
import {useTheme} from 'react-native-paper';

import {useAppSelector} from 'src/features/data/context/store';
import {getWorkingHoursInSeconds} from 'src/features/overview/utils/overviewUtils';
import {
	selectActiveTimesheet,
	selectTimesheetListOfCurrentDay,
} from 'src/features/timesheets/context/timesheetsSelectors';

type WidgetBridge = {
	publishState: (state: {
		workedSeconds: number;
		active: boolean;
		activeBeginAt: number;
		snapshotAt: number;
		primaryContainer: string;
	}) => void;
};

const widgetBridge = NativeModules.WidgetBridge as WidgetBridge | undefined;

const toHexColor = (color: string) => {
	const rgb = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
	if (!rgb) {
		return color;
	}
	return `#${rgb
		.slice(1)
		.map((value) => Number(value).toString(16).padStart(2, '0'))
		.join('')}`;
};

export const TimesheetWidgetIntegration = () => {
	const theme = useTheme();
	const timesheets = useAppSelector(selectTimesheetListOfCurrentDay);
	const activeTimesheet = useAppSelector(selectActiveTimesheet);
	const workedSeconds = getWorkingHoursInSeconds(timesheets, dayjs());

	useEffect(() => {
		widgetBridge?.publishState({
			workedSeconds: Math.max(0, Math.floor(workedSeconds)),
			active: activeTimesheet !== undefined,
			activeBeginAt: activeTimesheet?.begin
				? dayjs(activeTimesheet.begin).valueOf()
				: 0,
			snapshotAt: Date.now(),
			primaryContainer: toHexColor(theme.colors.primaryContainer),
		});
	}, [workedSeconds, activeTimesheet, theme.colors.primaryContainer]);

	return null;
};
