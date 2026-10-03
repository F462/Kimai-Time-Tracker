import {configureStore} from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import {api} from 'src/features/account/utils/ApiClient';
import type {AppDispatch} from 'src/features/data/context/store';
import {synchronizationReducer} from 'src/features/synchronization/context/synchronizationSlice';
import {synchronizeTimesheet} from 'src/features/synchronization/middleware/synchronizationThunks';
import {timesheetEdited} from 'src/features/timesheets/context/timesheetActions';
import {
	timesheetsReducer,
	timesheetsUpdated,
} from 'src/features/timesheets/context/timesheetsSlice';
import {fetchTimesheets} from 'src/features/timesheets/middleware/timesheetsThunks';
import {Timesheet, TimesheetFromApi} from 'src/features/timesheets/types';

jest.mock('src/features/account/utils/ApiClient', () => ({
	api: {get: jest.fn(), post: jest.fn(), patch: jest.fn()},
	ApiClient: {getInstance: jest.fn()},
}));

const makeTimesheet = (id: number): TimesheetFromApi => ({
	id,
	activity: 1,
	project: 1,
	user: 1,
	tags: [],
	begin: '2026-03-01T08:00:00',
	end: '2026-03-01T10:00:00',
	duration: 7200,
	description: null,
	rate: 100,
	internalRate: 100,
	exported: false,
	billable: true,
	metaFields: [],
});

const makeTimesheets = (from: number, to: number): Array<TimesheetFromApi> =>
	Array.from({length: to - from + 1}, (_, index) =>
		makeTimesheet(from + index),
	);

const configureTestStore = () =>
	configureStore({
		reducer: {
			timesheets: timesheetsReducer,
			synchronization: synchronizationReducer,
		},
	});

type TestStore = Omit<ReturnType<typeof configureTestStore>, 'dispatch'> & {
	dispatch: AppDispatch;
};

const createTestStore = (): TestStore => configureTestStore() as TestStore;

describe('fetchTimesheets', () => {
	let store: TestStore;

	const localTimesheetCount = () =>
		Object.keys(store.getState().timesheets.timesheets).length;

	beforeEach(() => {
		jest.clearAllMocks();
		(api.get as jest.Mock).mockResolvedValue([]);
		store = createTestStore();
	});

	it('requests the full current year with pagination enabled', async () => {
		await store.dispatch(fetchTimesheets());

		const year = dayjs().year();
		const requestedUrl = (api.get as jest.Mock).mock.calls[0][0] as string;

		expect(requestedUrl).toContain(`begin=${year}-01-01`);
		expect(requestedUrl).toContain(`end=${year}-12-31`);
		expect(requestedUrl).toContain('size=500');
		expect(requestedUrl).toContain('page=1');
		expect(requestedUrl).toContain('orderBy=begin');
		expect(requestedUrl).toContain('order=ASC');
	});

	it('fetches a single page when all entries fit into one page', async () => {
		(api.get as jest.Mock).mockResolvedValueOnce(makeTimesheets(1, 3));

		await store.dispatch(fetchTimesheets());

		expect(api.get).toHaveBeenCalledTimes(1);
		expect(localTimesheetCount()).toBe(3);
	});

	it('follows the pagination until a short page is received', async () => {
		(api.get as jest.Mock)
			.mockResolvedValueOnce(makeTimesheets(1, 500))
			.mockResolvedValueOnce(makeTimesheets(501, 700));

		await store.dispatch(fetchTimesheets());

		expect(api.get).toHaveBeenCalledTimes(2);
		expect(localTimesheetCount()).toBe(700);

		const pagesRequested = (api.get as jest.Mock).mock.calls.map(
			(call) => call[0],
		);
		expect(pagesRequested[0]).toContain('page=1');
		expect(pagesRequested[1]).toContain('page=2');
	});

	it('stops paginating when the API reports a missing page (404)', async () => {
		(api.get as jest.Mock)
			.mockResolvedValueOnce(makeTimesheets(1, 500))
			.mockRejectedValueOnce(
				Object.assign(new Error('HTTP 404: Not Found'), {status: 404}),
			);

		await store.dispatch(fetchTimesheets());

		expect(api.get).toHaveBeenCalledTimes(2);
		expect(localTimesheetCount()).toBe(500);
	});

	it('keeps known remote id mappings and registers new ones', async () => {
		const localId = 'local-existing';
		const knownRemoteId = 42;

		store.dispatch(
			timesheetsUpdated({
				timesheets: {[localId]: {id: localId, begin: '2026-03-01T08:00:00'}},
				newTimesheetsIdTable: {[localId]: knownRemoteId},
			}),
		);

		(api.get as jest.Mock).mockResolvedValueOnce([
			makeTimesheet(knownRemoteId),
			makeTimesheet(999),
		]);

		await store.dispatch(fetchTimesheets());

		const {timesheets, timesheetIdTable} = store.getState().timesheets;

		// The remote id known from before reuses the existing local id
		expect(timesheets[localId]).toBeDefined();
		expect(timesheetIdTable[localId]).toBe(knownRemoteId);

		// The new remote id is registered under a fresh local id
		const newLocalIds = Object.keys(timesheetIdTable).filter(
			(id) => id !== localId,
		);
		expect(newLocalIds).toHaveLength(1);
		expect(timesheetIdTable[newLocalIds[0]]).toBe(999);
	});

	it('keeps unsynced local timesheets when merging the server data', async () => {
		const localId = 'local-unsynced';

		store.dispatch(
			timesheetsUpdated({
				timesheets: {[localId]: {id: localId, begin: '2026-03-01T08:00:00'}},
				newTimesheetsIdTable: {},
			}),
		);

		(api.get as jest.Mock).mockResolvedValueOnce([makeTimesheet(7)]);

		await store.dispatch(fetchTimesheets());

		const {timesheets, timesheetIdTable} = store.getState().timesheets;

		// The unsynced local timesheet survives the fetch
		expect(timesheets[localId]).toBeDefined();
		// ... and is not registered in the remote id table
		expect(timesheetIdTable[localId]).toBeUndefined();
		// The server timesheet was added on top
		expect(localTimesheetCount()).toBe(2);
	});

	it('retries sync with the latest local timesheet after a running sync is interrupted by an edit', async () => {
		const localId = 'local-edit-sync';
		const initialTimesheet: Timesheet = {
			id: localId,
			begin: '2026-03-01T08:00:00',
			end: '2026-03-01T09:00:00',
			project: 1,
			activity: 1,
		};
		const updatedTimesheet: Timesheet = {
			...initialTimesheet,
			end: '2026-03-01T10:00:00',
		};
		const firstResponse = makeTimesheet(42);
		let resolveRequest: ((value: TimesheetFromApi) => void) | undefined;

		store = createTestStore();
		store.dispatch(
			timesheetsUpdated({
				timesheets: {[localId]: initialTimesheet},
				newTimesheetsIdTable: {},
			}),
		);
		(api.post as jest.Mock).mockImplementation(
			() =>
				new Promise<TimesheetFromApi>((resolve) => {
					resolveRequest = resolve;
				}),
		);
		(api.patch as jest.Mock).mockResolvedValue(makeTimesheet(42));
		(api.get as jest.Mock).mockResolvedValueOnce([firstResponse]);

		const firstSync = store.dispatch(
			synchronizeTimesheet({timesheet: initialTimesheet}),
		);

		store.dispatch(timesheetEdited(updatedTimesheet));
		await store.dispatch(synchronizeTimesheet({timesheet: updatedTimesheet}));

		resolveRequest?.(firstResponse);
		await firstSync;

		await Promise.resolve();

		expect((api.patch as jest.Mock).mock.calls).toHaveLength(1);
		expect((api.patch as jest.Mock).mock.calls[0][1]).toMatchObject({
			end: updatedTimesheet.end,
		});
	});
});
