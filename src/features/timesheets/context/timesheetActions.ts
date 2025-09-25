import {Timesheet} from '../types';
import {createAction} from '@reduxjs/toolkit';

export const timesheetEdited = createAction<Timesheet>(
	'timesheetSlice/timesheetEdited',
);
