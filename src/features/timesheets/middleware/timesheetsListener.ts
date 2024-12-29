import {AppStartListening} from 'src/features/data/context/store';
import {axiosHeadersSet} from 'src/features/account/context/accountActions';
import {fetchTimesheets} from './timesheetsThunks';

const fetchTimesheetsOnApiKeyReceived = (startListening: AppStartListening) => {
	startListening({
		actionCreator: axiosHeadersSet,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(fetchTimesheets());
		}
	});
};

export const startTimesheetsListeners = (startListening: AppStartListening) => {
	fetchTimesheetsOnApiKeyReceived(startListening);
};
