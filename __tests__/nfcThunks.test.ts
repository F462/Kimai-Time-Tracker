import {configureStore} from '@reduxjs/toolkit';

import {
	activeTimesheetReducer,
	newTimesheetStarted,
} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {
	activitiesReducer,
	activitySelected,
} from 'src/features/activities/context/activitiesSlice';
import {AppDispatch} from 'src/features/data/context/store';
import {
	nfcReducer,
	nfcScanningStarted,
	nfcTagUpdated,
} from 'src/features/nfc/context/nfcSlice';
import {
	nfcRegisterTag,
	nfcTagDetected,
} from 'src/features/nfc/middleware/nfcThunks';
import {
	projectSelected,
	projectsReducer,
} from 'src/features/projects/context/projectsSlice';
import {timesheetsReducer} from 'src/features/timesheets/context/timesheetsSlice';

const TAG_ID = '1234';

const configureTestStore = () =>
	configureStore({
		reducer: {
			activeTimesheet: activeTimesheetReducer,
			activities: activitiesReducer,
			nfc: nfcReducer,
			projects: projectsReducer,
			timesheets: timesheetsReducer,
		},
	});

type TestStore = Omit<ReturnType<typeof configureTestStore>, 'dispatch'> & {
	dispatch: AppDispatch;
};

const runningTimesheet = {
	id: 'running',
	begin: '2026-11-11T08:00:00.000Z',
	project: 1,
	activity: 2,
};

describe('nfcRegisterTag', () => {
	it('registers the tag with a default name and stops scanning', async () => {
		const store = configureTestStore() as TestStore;
		store.dispatch(nfcScanningStarted());

		await store.dispatch(nfcRegisterTag(TAG_ID));

		const {tags, isScanning} = store.getState().nfc;
		expect(isScanning).toBe(false);
		expect(Object.keys(tags)).toEqual([TAG_ID]);
		expect(tags[TAG_ID].name).toBe('NFC 1234');
	});
});

describe('nfcTagDetected', () => {
	it('registers the tag while scanning is active', async () => {
		const store = configureTestStore() as TestStore;
		store.dispatch(nfcScanningStarted());

		const result = await store.dispatch(nfcTagDetected(TAG_ID));

		expect(nfcTagDetected.fulfilled.match(result)).toBe(true);
		expect(store.getState().nfc.isScanning).toBe(false);
		expect(store.getState().nfc.tags[TAG_ID]).toBeDefined();
	});

	it('stops the running timesheet when one is active', async () => {
		const store = configureTestStore() as TestStore;

		await store.dispatch(nfcRegisterTag(TAG_ID));
		store.dispatch(newTimesheetStarted(runningTimesheet));

		const result = await store.dispatch(nfcTagDetected(TAG_ID));

		expect(nfcTagDetected.fulfilled.match(result)).toBe(true);
		expect(store.getState().activeTimesheet.activeTimesheetId).toBeUndefined();
		// The stopped timesheet gets an end timestamp.
		expect(store.getState().timesheets.timesheets.running.end).toEqual(
			expect.any(String),
		);
	});

	it("starts a timesheet with the tag's configured project and activity", async () => {
		const store = configureTestStore() as TestStore;

		await store.dispatch(nfcRegisterTag(TAG_ID));
		store.dispatch(nfcTagUpdated({id: TAG_ID, projectId: 7, activityId: 9}));

		const result = await store.dispatch(nfcTagDetected(TAG_ID));

		expect(nfcTagDetected.fulfilled.match(result)).toBe(true);

		const {activeTimesheetId} = store.getState().activeTimesheet;
		expect(activeTimesheetId).toEqual(expect.any(String));

		const timesheet =
			store.getState().timesheets.timesheets[activeTimesheetId as string];
		expect(timesheet.project).toBe(7);
		expect(timesheet.activity).toBe(9);
	});

	it('falls back to the selected project and activity when the tag has no configuration', async () => {
		const store = configureTestStore() as TestStore;

		await store.dispatch(nfcRegisterTag(TAG_ID));
		store.dispatch(projectSelected(7));
		store.dispatch(activitySelected(9));

		const result = await store.dispatch(nfcTagDetected(TAG_ID));

		expect(nfcTagDetected.fulfilled.match(result)).toBe(true);

		const {activeTimesheetId} = store.getState().activeTimesheet;
		const timesheet =
			store.getState().timesheets.timesheets[activeTimesheetId as string];
		expect(timesheet.project).toBe(7);
		expect(timesheet.activity).toBe(9);
	});

	it('rejects when no project or activity can be resolved', async () => {
		const store = configureTestStore() as TestStore;

		await store.dispatch(nfcRegisterTag(TAG_ID));

		const result = await store.dispatch(nfcTagDetected(TAG_ID));

		expect(nfcTagDetected.rejected.match(result)).toBe(true);
		expect(result.payload).toBe('nfc.startFailed');
		expect(store.getState().activeTimesheet.activeTimesheetId).toBeUndefined();
	});

	it('rejects when only a project can be resolved', async () => {
		const store = configureTestStore() as TestStore;

		await store.dispatch(nfcRegisterTag(TAG_ID));
		store.dispatch(projectSelected(7));

		const result = await store.dispatch(nfcTagDetected(TAG_ID));

		expect(nfcTagDetected.rejected.match(result)).toBe(true);
		expect(result.payload).toBe('nfc.startFailed');
	});

	it('stops the running timesheet even if project/activity are unselected', async () => {
		const store = configureTestStore() as TestStore;

		await store.dispatch(nfcRegisterTag(TAG_ID));
		store.dispatch(newTimesheetStarted(runningTimesheet));
		store.dispatch(projectSelected(undefined));
		store.dispatch(activitySelected(undefined));

		const result = await store.dispatch(nfcTagDetected(TAG_ID));

		expect(nfcTagDetected.fulfilled.match(result)).toBe(true);
		expect(store.getState().activeTimesheet.activeTimesheetId).toBeUndefined();
	});

	it('rejects when the scanned tag is not known', async () => {
		const store = configureTestStore() as TestStore;

		// Even with a running timesheet and a selected project/activity, an
		// unknown tag must not start or stop anything.
		store.dispatch(newTimesheetStarted(runningTimesheet));
		store.dispatch(projectSelected(7));
		store.dispatch(activitySelected(9));

		const result = await store.dispatch(nfcTagDetected(TAG_ID));

		expect(nfcTagDetected.rejected.match(result)).toBe(true);
		expect(result.payload).toBe('nfc.unknownTag');
		expect(store.getState().activeTimesheet.activeTimesheetId).toEqual(
			'running',
		);
	});
});
