import {userLoggedIn} from 'src/features/account/context/accountActions';
import {AppStartListening} from 'src/features/data/context/store';
import {fetchActivities} from './activitiesThunks';

const fetchActivitiesOnUserLogin = (startListening: AppStartListening) => {
	startListening({
		actionCreator: userLoggedIn,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(fetchActivities());
		},
	});
};

export const startActivityListeners = (startListening: AppStartListening) => {
	fetchActivitiesOnUserLogin(startListening);
};
