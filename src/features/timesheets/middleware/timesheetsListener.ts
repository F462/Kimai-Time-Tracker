import {fetchActiveTimesheet, fetchTimesheets} from './timesheetsThunks';
import {AppStartListening} from 'src/features/data/context/store';
import {axiosHeadersSet} from 'src/features/account/context/accountActions';

const fetchTimesheetsOnApiKeyReceived = (startListening: AppStartListening) => {
	startListening({
		actionCreator: axiosHeadersSet,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(fetchTimesheets());
			await listenerApi.dispatch(fetchActiveTimesheet());
		}
	});
};

export const startTimesheetListeners = (startListening: AppStartListening) => {
	fetchTimesheetsOnApiKeyReceived(startListening);
};
