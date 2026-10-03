import {AppStartListening} from 'src/features/data/context/store';
import {standardWorkingHoursPerDaySet} from 'src/features/settings/context/settingsSlice';
import {timesheetsUpdated} from 'src/features/timesheets/context/timesheetsSlice';
import {computeOverview} from './overviewThunks';

const recomputeOverviewOnTimesheetsUpdated = (
	startListening: AppStartListening,
) => {
	startListening({
		actionCreator: timesheetsUpdated,
		effect: async (_, listenerApi) => {
			// The heavy overtime calculation is done here, right after the
			// timesheets were fetched and written to the store, so screens
			// only have to display the pre-computed result.
			await listenerApi.dispatch(computeOverview());
		},
	});
};

const recomputeOverviewOnStandardWorkingHoursChanged = (
	startListening: AppStartListening,
) => {
	startListening({
		actionCreator: standardWorkingHoursPerDaySet,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(computeOverview());
		},
	});
};

export const startOverviewListeners = (startListening: AppStartListening) => {
	recomputeOverviewOnTimesheetsUpdated(startListening);
	recomputeOverviewOnStandardWorkingHoursChanged(startListening);
};
