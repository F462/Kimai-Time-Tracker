import {AccountScreen} from 'src/features/account/components/AccountScreen';
import {ActiveTimesheetScreen} from 'src/features/timesheets/components/ActiveTimesheetScreen';
import {ActivitiesScreen} from 'src/features/activities/components/ActivitiesScreen';
import {CustomersScreen} from 'src/features/customers/components/CustomersScreen';
import {ProjectsScreen} from 'src/features/projects/components/ProjectsScreen';
import {ScreenParameters} from './ScreenParameters';
import {TimesheetsScreen} from 'src/features/timesheets/components/TimesheetsScreen';

export const screens: Array<{
	name: keyof ScreenParameters;
	component: React.FC<any>;
	options?: any;
}> = [
	{
		name: 'Account',
		component: AccountScreen
	},
	{
		name: 'ActiveTimesheet',
		component: ActiveTimesheetScreen
	},
	{
		name: 'Activities',
		component: ActivitiesScreen
	},
	{
		name: 'Customers',
		component: CustomersScreen
	},
	{
		name: 'Projects',
		component: ProjectsScreen
	},
	{
		name: 'Timesheets',
		component: TimesheetsScreen
	}
];
