import {userLoggedIn} from 'src/features/account/context/accountActions';
import {AppStartListening} from 'src/features/data/context/store';
import {fetchProjects} from './projectsThunks';

const fetchProjectsOnUserLogin = (startListening: AppStartListening) => {
	startListening({
		actionCreator: userLoggedIn,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(fetchProjects());
		},
	});
};

export const startProjectListeners = (startListening: AppStartListening) => {
	fetchProjectsOnUserLogin(startListening);
};
