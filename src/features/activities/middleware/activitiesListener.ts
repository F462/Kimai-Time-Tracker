import {AppStartListening} from 'src/features/data/context/store';
import {axiosHeadersSet} from 'src/features/account/context/accountActions';
import {fetchActivities} from './activitiesThunks';

const fetchActivitiesOnApiKeyReceived = (startListening: AppStartListening) => {
	startListening({
		actionCreator: axiosHeadersSet,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(fetchActivities());
		}
	});
};

export const startActivityListeners = (startListening: AppStartListening) => {
	fetchActivitiesOnApiKeyReceived(startListening);
};
