import dayjs from 'dayjs';

import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {selectStandardWorkingHoursPerDay} from 'src/features/settings/context/settingsSelectors';
import {selectTimesheetListOfCurrentYear} from '../context/overviewSelectors';
import {overviewUpdated} from '../context/overviewSlice';
import {computeMonthlyOverview} from '../utils/overviewUtils';

/**
 * (Re)calculates the monthly overview from the timesheets currently in the
 * store and the configured standard working hours per day, and stores the
 * result so that screens only have to display it.
 *
 * The heavy per-day aggregation is performed here, outside of the render
 * cycle, whenever the timesheets change (see `overviewListener`) or when a
 * screen requests it (e.g. right after start-up before the first fetch).
 */
export const computeOverview = createAppAsyncThunk(
	'overview/computeOverview',
	(_, {getState, dispatch}) => {
		const now = dayjs();
		const yearTimesheets = selectTimesheetListOfCurrentYear(getState());
		const standardWorkingHoursPerDay =
			selectStandardWorkingHoursPerDay(getState());

		dispatch(
			overviewUpdated(
				computeMonthlyOverview(now, yearTimesheets, standardWorkingHoursPerDay),
			),
		);
	},
);
