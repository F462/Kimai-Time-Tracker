import {userLoggedIn} from 'src/features/account/context/accountActions';
import {AppStartListening} from 'src/features/data/context/store';
import {fetchTimesheets} from './timesheetsThunks';

const fetchTimesheetsOnUserLogin = (startListening: AppStartListening) => {
	startListening({
		actionCreator: userLoggedIn,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(fetchTimesheets());
		},
	});
};

export const startTimesheetsListeners = (startListening: AppStartListening) => {
	fetchTimesheetsOnUserLogin(startListening);
};
