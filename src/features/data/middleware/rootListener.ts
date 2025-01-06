import {AppStartListening} from '../context/store';
import {startAccountListeners} from 'src/features/account/middleware/accountListeners';
import {startActivityListeners} from 'src/features/activities/middleware/activitiesListener';
import {startCustomerListeners} from 'src/features/customers/middleware/customersListener';
import {startProjectListeners} from 'src/features/projects/middleware/projectsListener';
import {startSynchronizationListeners} from 'src/features/synchronization/middleware/synchronizationListeners';
import {startTimesheetsListeners} from 'src/features/timesheets/middleware/timesheetsListener';

export const startRootListener = (startListening: AppStartListening) => {
	startAccountListeners(startListening);
	startActivityListeners(startListening);
	startCustomerListeners(startListening);
	startProjectListeners(startListening);
	startSynchronizationListeners(startListening);
	startTimesheetsListeners(startListening);
};
