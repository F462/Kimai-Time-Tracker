import {AccountScreen} from 'src/features/account/components/AccountScreen';
import {CustomersScreen} from '../customers/components/CustomersScreen';
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
	}
];
