import dayjs from 'dayjs';

import {selectTimesheetListOfCurrentDay} from './timesheetsSelectors';
import {useAppSelector} from 'src/features/data/context/store';
import {useTime} from 'src/features/utils/useTime';

export const useWorkingHoursOfCurrentDayInSeconds = (
	updateInterval: number | undefined
) => {
	const timesheets = useAppSelector(selectTimesheetListOfCurrentDay);
	const now = useTime(updateInterval);

	return timesheets.reduce(
		(sum, timesheet) =>
			sum +
			(timesheet.duration
				? timesheet.duration
				: now.diff(dayjs(timesheet.begin)) / 1000),
		0
	);
};
