import {AppStartListening} from 'src/features/data/context/store';
import {axiosHeadersSet} from 'src/features/account/context/accountActions';
import {fetchActiveTimesheet} from './activeTimesheetThunks';

const fetchActiveTimesheetOnApiKeyReceived = (
	startListening: AppStartListening
) => {
	startListening({
		actionCreator: axiosHeadersSet,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(fetchActiveTimesheet());
		}
	});
};

export const startActiveTimesheetListeners = (
	startListening: AppStartListening
) => {
	fetchActiveTimesheetOnApiKeyReceived(startListening);
};
