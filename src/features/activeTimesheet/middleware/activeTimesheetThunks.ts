import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {selectActiveTimesheetId} from '../context/activeTimesheetSelectors';
import {timesheetStopped} from '../context/activeTimesheetSlice';

export const stopActiveTimesheet = createAppAsyncThunk<void, void>(
	'timesheets/stopActiveTimesheet',
	async (_, {dispatch, getState}) => {
		const activeTimesheetId = selectActiveTimesheetId(getState());

		if (activeTimesheetId === undefined) {
			throw Error('no timesheet active');
		}

		dispatch(timesheetStopped(activeTimesheetId));
	}
);
