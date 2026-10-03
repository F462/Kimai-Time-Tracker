import {configureStore} from '@reduxjs/toolkit';

import {api} from 'src/features/account/utils/ApiClient';
import type {AppDispatch} from 'src/features/data/context/store';
import {projectsReducer} from 'src/features/projects/context/projectsSlice';
import {createProject} from 'src/features/projects/middleware/projectsThunks';
import {Project} from 'src/features/projects/types';

jest.mock('src/features/account/utils/ApiClient', () => ({
	api: {get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn()},
	ApiClient: {getInstance: jest.fn()},
}));

const makeProject = (): Project => ({
	parentTitle: 'Example customer',
	customer: 12,
	id: 31,
	name: 'Website refresh',
	start: null,
	end: null,
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
	configureStore({reducer: {projects: projectsReducer}});

type TestStore = Omit<ReturnType<typeof configureTestStore>, 'dispatch'> & {
	dispatch: AppDispatch;
};

describe('createProject', () => {
	beforeEach(() => {
		jest.clearAllMocks();
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
		});
		expect(store.getState().projects.projects[project.id]).toEqual(project);
	});
});
