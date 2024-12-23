import {AccountScreen} from 'src/features/account/components/AccountScreen';
import {CustomersScreen} from 'src/features/customers/components/CustomersScreen';
import {ProjectsScreen} from 'src/features/projects/components/ProjectsScreen';
import {ScreenParameters} from './ScreenParameters';

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
		name: 'Home',
		component: AccountScreen
	},
	{
		name: 'Customers',
		component: CustomersScreen
	},
	{
		name: 'Projects',
		component: ProjectsScreen
	}
];
