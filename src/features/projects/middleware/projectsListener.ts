import {AppStartListening} from 'src/features/data/context/store';
import {axiosHeadersSet} from 'src/features/account/context/accountActions';
import {fetchProjects} from './projectsThunks';

const fetchProjectsOnApiKeyReceived = (startListening: AppStartListening) => {
	startListening({
		actionCreator: axiosHeadersSet,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(fetchProjects());
		}
	});
};

export const startProjectListeners = (startListening: AppStartListening) => {
	fetchProjectsOnApiKeyReceived(startListening);
};
