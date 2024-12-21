import {AuthorizationScreen} from '../authorization/components/AuthorizationScreen';
import {ScreenParameters} from './ScreenParameters';

export const screens: Array<{
	name: keyof ScreenParameters;
	component: React.FC<any>;
	options?: any;
}> = [
	{
		name: 'Authorization',
		component: AuthorizationScreen,
	},
	{
		name: 'Home',
		component: AuthorizationScreen,
	},
];
