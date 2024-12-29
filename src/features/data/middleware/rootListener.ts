import {AppStartListening} from '../context/store';
import {startAccountListeners} from 'src/features/account/middleware/accountListeners';
import {startActiveTimesheetListeners} from 'src/features/activeTimesheet/middleware/activeTimesheetListeners';
import {startActivityListeners} from 'src/features/activities/middleware/activitiesListener';
import {startCustomerListeners} from 'src/features/customers/middleware/customersListener';
import {startProjectListeners} from 'src/features/projects/middleware/projectsListener';
import {startTimesheetsListeners} from 'src/features/timesheets/middleware/timesheetsListener';

export const startRootListener = (startListening: AppStartListening) => {
	startAccountListeners(startListening);
	startActiveTimesheetListeners(startListening);
	startActivityListeners(startListening);
	startCustomerListeners(startListening);
	startProjectListeners(startListening);
	startTimesheetsListeners(startListening);
};
