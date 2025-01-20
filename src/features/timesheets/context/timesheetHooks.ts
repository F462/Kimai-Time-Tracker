import dayjs from 'dayjs';

import {selectTimesheetListOfCurrentDay} from './timesheetsSelectors';
import {useAppSelector} from 'src/features/data/context/store';
import {useTime} from 'src/features/utils/useTime';

export const useWorkingHoursOfCurrentDayInSeconds = (
	updateInterval: number | undefined
) => {
	const timesheets = useAppSelector(selectTimesheetListOfCurrentDay);
	const now = useTime(updateInterval);

	return timesheets.reduce((sum, timesheet) => {
		const duration = (() => {
			if (timesheet.duration) {
				return timesheet.duration;
			}

			if (timesheet.begin && timesheet.end) {
				const calculatedTimesheetDuration =
					dayjs(timesheet.end).diff(dayjs(timesheet.begin)) / 1000;
				return calculatedTimesheetDuration;
			}
		})();

		return sum + (duration ?? now.diff(dayjs(timesheet.begin)) / 1000);
	}, 0);
};
