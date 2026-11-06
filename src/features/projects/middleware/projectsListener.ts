import {userLoggedIn} from 'src/features/account/context/accountActions';
import {synchronizeLocalCustomers} from 'src/features/customers/middleware/customersThunks';
import {AppStartListening} from 'src/features/data/context/store';
import {fetchProjects, synchronizeLocalProjects} from './projectsThunks';

const fetchProjectsOnUserLogin = (startListening: AppStartListening) => {
	startListening({
		actionCreator: userLoggedIn,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(fetchProjects());
		},
	});
};

const synchronizeProjectsAfterCustomers = (
	startListening: AppStartListening,
) => {
	startListening({
		actionCreator: synchronizeLocalCustomers.fulfilled,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(synchronizeLocalProjects());
		},
	});
};

export const startProjectListeners = (startListening: AppStartListening) => {
	fetchProjectsOnUserLogin(startListening);
	synchronizeProjectsAfterCustomers(startListening);
};
