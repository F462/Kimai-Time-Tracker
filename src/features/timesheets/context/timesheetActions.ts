import {createAction} from '@reduxjs/toolkit';

import {Timesheet} from '../types';

export const timesheetEdited = createAction<Timesheet>(
	'timesheetSlice/timesheetEdited',
);
