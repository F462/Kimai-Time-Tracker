import {configureStore} from '@reduxjs/toolkit';

import {api} from 'src/features/account/utils/ApiClient';
import {
	customerCreated,
	customersReducer,
	customerSynced,
} from 'src/features/customers/context/customersSlice';
import {Customer} from 'src/features/customers/types';
import type {AppDispatch} from 'src/features/data/context/store';
import {
	projectsReceived,
	projectsReducer,
} from 'src/features/projects/context/projectsSlice';
import {
	createProject,
	synchronizeLocalProjects,
} from 'src/features/projects/middleware/projectsThunks';
import {Project} from 'src/features/projects/types';
import {
	timesheetsReducer,
	timesheetsUpdated,
} from 'src/features/timesheets/context/timesheetsSlice';

jest.mock('src/features/account/utils/ApiClient', () => ({
	api: {
		get: jest.fn(),
		post: jest.fn(),
		patch: jest.fn(),
		delete: jest.fn(),
		isConfigured: jest.fn(),
	},
	ApiClient: {getInstance: jest.fn()},
}));

const makeProject = (): Project => ({
	parentTitle: 'Example customer',
	customer: 12,
	id: 31,
	name: 'Website refresh',
	start: null,
	end: null,
	lockedUntil: null,
	comment: 'Launch work',
	visible: true,
	billable: true,
	metaFields: [],
	teams: [],
	globalActivities: true,
	number: 'PR-31',
	color: null,
});

const configureTestStore = () =>
	configureStore({
		reducer: {
			customers: customersReducer,
			projects: projectsReducer,
			timesheets: timesheetsReducer,
		},
	});

type TestStore = Omit<ReturnType<typeof configureTestStore>, 'dispatch'> & {
	dispatch: AppDispatch;
};

describe('createProject', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(api.isConfigured as jest.Mock).mockReturnValue(true);
	});

	it('posts the project form and stores the returned project', async () => {
		const project = makeProject();
		(api.post as jest.Mock).mockResolvedValue(project);
		const store = configureTestStore() as TestStore;

		await store.dispatch(
			createProject({
				name: project.name,
				customer: project.customer,
				number: project.number,
				comment: project.comment,
			}),
		);

		expect(api.post).toHaveBeenCalledWith('api/projects', {
			name: project.name,
			customer: project.customer,
			number: project.number,
			comment: project.comment,
			visible: true,
			billable: true,
			globalActivities: true,
		});
		expect(store.getState().projects.projects[project.id]).toEqual(project);
	});

	it('creates projects locally and synchronizes them with updated references', async () => {
		const store = configureTestStore() as TestStore;
		const localCustomer: Customer = {
			id: -4,
			name: 'Offline customer',
			number: '',
			comment: null,
			country: 'US',
			language: 'en',
			currency: 'USD',
			visible: true,
			billable: true,
			metaFields: [],
			teams: [],
			color: null,
		};
		store.dispatch(customerCreated(localCustomer));
		(api.isConfigured as jest.Mock).mockReturnValue(false);

		const localResult = await store.dispatch(
			createProject({
				name: 'Offline project',
				customer: -4,
			}),
		);
		if (!createProject.fulfilled.match(localResult)) {
			throw new Error('Expected the project to be created locally');
		}
		store.dispatch(projectsReceived([makeProject()]));
		expect(store.getState().projects.projects[-1]).toBeDefined();
		store.dispatch(
			timesheetsUpdated({
				timesheets: {
					localTimesheet: {
						id: 'localTimesheet',
						project: localResult.payload.id,
					},
				},
				newTimesheetsIdTable: {},
			}),
		);

		expect(api.post).not.toHaveBeenCalled();
		expect(localResult.payload).toMatchObject({
			id: -1,
			name: 'Offline project',
			customer: -4,
			parentTitle: 'Offline customer',
		});

		store.dispatch(
			customerSynced({
				localId: -4,
				customer: {...localCustomer, id: 22},
			}),
		);
		const syncedProject = {...makeProject(), id: 99, customer: 22};
		(api.isConfigured as jest.Mock).mockReturnValue(true);
		(api.post as jest.Mock).mockResolvedValue(syncedProject);
		await store.dispatch(synchronizeLocalProjects());

		expect(api.post).toHaveBeenCalledWith(
			'api/projects',
			expect.objectContaining({
				name: 'Offline project',
				customer: 22,
			}),
		);
		expect(store.getState().projects.projects[-1]).toBeUndefined();
		expect(store.getState().projects.projects[99]).toEqual(syncedProject);
		expect(store.getState().timesheets.timesheets.localTimesheet.project).toBe(
			99,
		);
	});
});
