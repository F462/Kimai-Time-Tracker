import {AboutScreen} from 'src/features/about/components/AboutScreen';
import {AccountScreen} from 'src/features/account/components/AccountScreen';
import {ActiveTimesheetScreen} from 'src/features/activeTimesheet/components/ActiveTimesheetScreen';
import {ActivitiesScreen} from 'src/features/activities/components/ActivitiesScreen';
import {CustomersScreen} from 'src/features/customers/components/CustomersScreen';
import {ProjectsScreen} from 'src/features/projects/components/ProjectsScreen';
import {ScreenParameters} from './ScreenParameters';
import {TimesheetsScreen} from 'src/features/timesheets/components/TimesheetsScreen';
import {createDrawerIconFunction} from './components/DrawerItemIcon';

export const screens: Array<{
	name: keyof ScreenParameters;
	component: React.FC<any>;
	options?: any;
}> = [
	{
		name: 'About',
		component: AboutScreen,
		options: {
			drawerIcon: createDrawerIconFunction('information-variant'),
		},
	},
	{
		name: 'Account',
		component: AccountScreen,
		options: {
			drawerIcon: createDrawerIconFunction('account-outline'),
		},
	},
	{
		name: 'ActiveTimesheet',
		component: ActiveTimesheetScreen,
		options: {
			drawerIcon: createDrawerIconFunction('progress-clock'),
		},
	},
	{
		name: 'Activities',
		component: ActivitiesScreen,
		options: {
			drawerIcon: createDrawerIconFunction('run'),
		},
	},
	{
		name: 'Customers',
		component: CustomersScreen,
		options: {
			drawerIcon: createDrawerIconFunction('face-agent'),
		},
	},
	{
		name: 'Projects',
		component: ProjectsScreen,
		options: {
			drawerIcon: createDrawerIconFunction('hammer'),
		},
	},
	{
		name: 'Timesheets',
		component: TimesheetsScreen,
		options: {
			drawerIcon: createDrawerIconFunction('calendar-clock'),
		},
	},
];
