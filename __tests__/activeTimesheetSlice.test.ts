import {configureStore} from '@reduxjs/toolkit';

import {
	activeTimesheetReducer,
	newTimesheetStarted,
	timesheetStopped,
} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {timesheetEdited} from 'src/features/timesheets/context/timesheetActions';
import {Timesheet} from 'src/features/timesheets/types';

const configureTestStore = () =>
	configureStore({reducer: {activeTimesheet: activeTimesheetReducer}});

const ongoingTimesheet = (id: string): Timesheet => ({
	id,
	begin: '2026-10-25T09:00:00.000Z',
	end: null,
});

const endedTimesheet = (id: string): Timesheet => ({
	id,
	begin: '2026-10-25T09:00:00.000Z',
	end: '2026-10-25T10:00:00.000Z',
});

describe('newTimesheetStarted', () => {
	it('sets the new timesheet as active', () => {
		const store = configureTestStore();

		store.dispatch(newTimesheetStarted(ongoingTimesheet('a')));

		expect(store.getState().activeTimesheet.activeTimesheetId).toBe('a');
	});
});

describe('timesheetStopped', () => {
	it('clears the active timesheet when it was the stopped one', () => {
		const store = configureTestStore();

		store.dispatch(newTimesheetStarted(ongoingTimesheet('a')));
		store.dispatch(timesheetStopped('a'));

		expect(store.getState().activeTimesheet.activeTimesheetId).toBeUndefined();
	});

	it('keeps the active timesheet when a different one was stopped', () => {
		const store = configureTestStore();

		store.dispatch(newTimesheetStarted(ongoingTimesheet('a')));
		store.dispatch(timesheetStopped('b'));

		expect(store.getState().activeTimesheet.activeTimesheetId).toBe('a');
	});
});

describe('timesheetEdited', () => {
	it('makes an edited ongoing timesheet the active one', () => {
		const store = configureTestStore();

		// An ended timesheet is edited to ongoing; the start/stop button must
		// now show that a timesheet is running.
		store.dispatch(timesheetEdited(ongoingTimesheet('a')));

		expect(store.getState().activeTimesheet.activeTimesheetId).toBe('a');
	});

	it('makes a newly edited ongoing timesheet replace the active one', () => {
		const store = configureTestStore();

		store.dispatch(newTimesheetStarted(ongoingTimesheet('a')));
		store.dispatch(timesheetEdited(ongoingTimesheet('b')));

		expect(store.getState().activeTimesheet.activeTimesheetId).toBe('b');
	});

	it('clears the active timesheet when it is edited to ended', () => {
		const store = configureTestStore();

		store.dispatch(newTimesheetStarted(ongoingTimesheet('a')));
		store.dispatch(timesheetEdited(endedTimesheet('a')));

		expect(store.getState().activeTimesheet.activeTimesheetId).toBeUndefined();
	});

	it('keeps the active timesheet when a different one is edited to ended', () => {
		const store = configureTestStore();

		store.dispatch(newTimesheetStarted(ongoingTimesheet('a')));
		store.dispatch(timesheetEdited(endedTimesheet('b')));

		expect(store.getState().activeTimesheet.activeTimesheetId).toBe('a');
	});
});
